"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Toaster, toast } from 'sonner';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);


const AdminSignup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [emailExists, setEmailExists] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  const { adminSignup, signIn } = useAuth();
  const router = useRouter();

  // Check if email already exists when email input changes
  useEffect(() => {
    const checkEmailExists = async () => {
      if (!email || email.length < 5 || !email.includes('@')) return;

      setEmailCheckLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('email')
          .eq('email', email)
          .single();

        setEmailExists(!!data);
      } catch (err) {
        console.error('Error checking email:', err);
      } finally {
        setEmailCheckLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      checkEmailExists();
    }, 500);

    return () => clearTimeout(debounce);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (emailExists) {
      setError('Email already exists. Please use a different email or verify your account.');
      return;
    }

    setLoading(true);

    try {
      const result = await adminSignup(email, password, firstName, lastName, companyName);
      if (result.success) router.push('/company-info');
      else setError(result.error || 'Failed to create account');
    } catch (err) {
      setError('Failed to create an account');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifyLoading(true);

    try {
      // First check if email exists in database
      const { data, error: dbError } = await supabase
        .from('users')
        .select('email')
        .eq('email', verifyEmail)
        .single();

      if (!data) {
        setVerifyError('Account not found. Please check your email or sign up.');
        setVerifyLoading(false);
        return;
      }

      // Proceed with sign in
      const result = await signIn(verifyEmail, verifyPassword);
      if (result.success) {
        // Show success toast before redirect
        toast.success('Verification successful!');
        setTimeout(() => router.push('/company-info'), 500);
      }
      else setVerifyError(result.error || 'Verification failed');
    } catch (err) {
      setVerifyError('Verification error occurred');
      console.error(err);
    } finally {
      setVerifyLoading(false);
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <div className="h-screen w-full bg-black">

      <motion.section
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeVariants}
        transition={{ duration: 0.3 }}
        className="h-full px-6 flex items-center justify-center"
      >
        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-black">
          <h2 className="font-semibold pb-6 text-xl text-center text-neutral-200">
            {showVerification ? "Verify Admin Account" : "Create Admin Account"}
          </h2>

          {!showVerification ? (
            <>
              <p className="text-center text-sm text-neutral-400 mb-6">
                Register as a company admin
              </p>

              {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form className="my-8" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <LabelInputContainer>
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border border-white/[0.1] rounded-[0.5rem] h-[45px] bg-zinc-800 placeholder:text-zinc-400 text-white"
                        placeholder="John"
                      />
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border border-white/[0.1] rounded-[0.5rem] h-[45px] bg-zinc-800 placeholder:text-zinc-400 text-white"
                        placeholder="Doe"
                      />
                    </LabelInputContainer>
                  </div>

                  <LabelInputContainer>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="border border-white/[0.1] rounded-[0.5rem] h-[45px] bg-zinc-800 placeholder:text-zinc-400 text-white"
                      placeholder="Acme Corp"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`border ${emailExists ? 'border-red-500' : 'border-white/[0.1]'} rounded-[0.5rem] h-[45px] bg-zinc-800 placeholder:text-zinc-400 text-white pr-10`}
                        placeholder="admin@company.com"
                      />
                      {emailCheckLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <LoadingSpinner small />
                        </div>
                      )}
                      {emailExists && !emailCheckLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {emailExists && (
                      <p className="text-red-400 text-xs mt-1">Email already exists. Please use a different email or verify your existing account.</p>
                    )}
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border border-white/[0.2] rounded-[0.5rem] h-[45px] bg-zinc-800 placeholder:text-zinc-400 text-white"
                      placeholder="••••••••"
                    />
                  </LabelInputContainer>
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <motion.button
                    className="bg-gradient-to-br relative group/btn rounded-[0.5rem] from-zinc-900 to-zinc-900 block bg-zinc-800 w-full text-white h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <LoadingSpinner />
                        <span className="ml-2">Creating account...</span>
                      </span>
                    ) : (
                      <>Create Account &rarr;</>
                    )}
                    <BottomGradient />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowVerification(true);
                      if (emailExists) {
                        setVerifyEmail(email);
                      }
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm text-center"
                  >
                    Already created an account? Verify here
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-neutral-400 mb-6">
                Verify your existing admin account
              </p>

              {verifyError && (
                <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
                  {verifyError}
                </div>
              )}

              <form className="my-8" onSubmit={handleVerification}>
                <div className="space-y-4">
                  <LabelInputContainer>
                    <Label htmlFor="verify-email">Email Address</Label>
                    <Input
                      id="verify-email"
                      type="email"
                      required
                      value={verifyEmail}
                      onChange={(e) => setVerifyEmail(e.target.value)}
                      className="border border-white/[0.1] rounded-[0.5rem] h-[45px] bg-zinc-800 placeholder:text-zinc-400 text-white"
                      placeholder="admin@company.com"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="verify-password">Password</Label>
                    <Input
                      id="verify-password"
                      type="password"
                      required
                      value={verifyPassword}
                      onChange={(e) => setVerifyPassword(e.target.value)}
                      className="border border-white/[0.2] rounded-[0.5rem] h-[45px] bg-zinc-800 placeholder:text-zinc-400 text-white"
                      placeholder="••••••••"
                    />
                  </LabelInputContainer>
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <motion.button
                    className="bg-gradient-to-br relative group/btn rounded-[0.5rem] from-zinc-900 to-zinc-900 block bg-zinc-800 w-full text-white h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={verifyLoading}
                  >
                    {verifyLoading ? (
                      <span className="flex items-center justify-center">
                        <LoadingSpinner />
                        <span className="ml-2">Verifying...</span>
                      </span>
                    ) : (
                      <>Verify Account &rarr;</>
                    )}
                    <BottomGradient />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setShowVerification(false)}
                    className="text-blue-400 hover:text-blue-300 text-sm text-center"
                  >
                    Back to sign up
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />
        </div>
      </motion.section>
    </div>
  );
};

const LoadingSpinner = ({ small }: { small?: boolean }) => (
  <svg className={`animate-spin ${small ? 'h-4 w-4' : 'h-5 w-5'} text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-300 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-300 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default AdminSignup;