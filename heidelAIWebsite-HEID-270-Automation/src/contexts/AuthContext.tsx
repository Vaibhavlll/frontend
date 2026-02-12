"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { User as AppUser, Company } from '@/components/types/index';
import { createClient } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userDetails: AppUser | null;
  companyDetails: Company | null;
  loading: boolean;
  adminSignup: (email: string, password: string, firstName: string, lastName: string, companyName: string) => Promise<{ success: boolean; error?: string }>;
  agentSignup: (email: string, password: string, firstName: string, lastName: string, inviteToken: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  inviteTeamMembers: (emails: string[]) => Promise<{ success: boolean; error?: string }>;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<AppUser | null>(null);
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, company:companies(*)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setUserDetails(data as AppUser);
      setCompanyDetails(data.company as Company || null);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserDetails(null);
      setCompanyDetails(null);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session: newSession }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        await fetchUserDetails(newSession.user.id);
      } else {
        setUserDetails(null);
        setCompanyDetails(null);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUserDetails]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserDetails(session.user.id);
      } else {
        setUserDetails(null);
        setCompanyDetails(null);
      }
      
      // Handle token refresh events
      if (event === 'TOKEN_REFRESHED') {
        // console.log('Token refreshed');
      }
    });

    // Initial session check
    const initializeAuth = async () => {
      await refreshSession();
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession, fetchUserDetails]);

  const adminSignup = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      companyName: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        // console.log("Attempting signup for:", email);
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        // console.log("Auth response:", JSON.stringify(authData), authError);
        
        if (authError) {
          console.error("Detailed auth error:", authError);
          throw authError;
        }
      
        if (!authData.user) throw new Error('User creation failed');

        // Create company in a transaction
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({ name: companyName })
          .select()
          .single();

        if (companyError) throw companyError;

        // Create user profile
        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          company_id: companyData.id,
          role: 'admin',
        });

        if (userError) throw userError;

        await refreshSession();
        return { success: true };
      } catch (error) {
        console.error('Admin signup error:', error);
        return {
          success: false,
          error: error instanceof AuthError ? error.message : 'Registration failed',
        };
      }
    },
    [refreshSession]
  );

  const agentSignup = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      inviteToken: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        // Verify invite token
        const { data: inviteData, error: inviteError } = await supabase
          .from('invites')
          .select('company_id, expires_at')
          .eq('token', inviteToken)
          .single();

        if (inviteError) throw new Error('Invalid or expired invitation');
        if (new Date(inviteData.expires_at) < new Date()) {
          throw new Error('Invitation has expired');
        }

        // Create user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User creation failed');

        // Create agent profile
        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          company_id: inviteData.company_id,
          role: 'agent',
        });

        if (userError) throw userError;

        // Delete used invite
        await supabase.from('invites').delete().eq('token', inviteToken);

        await refreshSession();
        return { success: true };
      } catch (error) {
        console.error('Agent signup error:', error);
        return {
          success: false,
          error: error instanceof AuthError ? error.message : 'Registration failed',
        };
      }
    },
    [refreshSession]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        await refreshSession();
        return { success: true };
      } catch (error) {
        console.error('Sign in error:', error);
        return {
          success: false,
          error: error instanceof AuthError ? error.message : 'Authentication failed',
        };
      }
    },
    [refreshSession]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserDetails(null);
    setCompanyDetails(null);
  }, []);

  const inviteTeamMembers = useCallback(
    async (emails: string[]): Promise<{ success: boolean; error?: string }> => {
      try {
        if (!userDetails?.company_id) {
          throw new Error('Company not found');
        }
  
        const invites = emails.map(email => ({
          email,
          company_id: userDetails.company_id,
          token: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
        }));
  
        const { error } = await supabase.from('invites').insert(invites);
        if (error) throw error;
  
        return { success: true };
      } catch (error) {
        console.error('Invite error:', error);
        return {
          success: false,
          error: error instanceof AuthError ? error.message : 'Failed to send invites',
        };
      }
    },
    [userDetails]
  );

  const value = {
    session,
    user,
    userDetails,
    companyDetails,
    loading,
    adminSignup,
    agentSignup,
    signIn,
    signOut,
    refreshSession,
    inviteTeamMembers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}