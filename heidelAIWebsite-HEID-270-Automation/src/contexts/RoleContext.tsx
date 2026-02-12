"use client";
import { useUser, useOrganization } from '@clerk/nextjs'
import React, { createContext, useContext, useEffect } from 'react'

interface RoleContextType {
  isAdmin: boolean | null;       // null = loading
  role: string | null;
}


const RoleContext = createContext<RoleContextType>({
  isAdmin: null,
  role: null,
});

export function RoleProvider ({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization({ memberships: true });
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [role, setRole] = React.useState<string | null>(null);

  useEffect(() => {
     async function checkRole() {
      if (!userLoaded || !orgLoaded || !organization || !user) return;

      const memberships = await organization.getMemberships();
      const membership = memberships.data.find(
        (m) => m.publicUserData?.userId === user.id
      );

      const r = membership?.role ?? null;
      setRole(r);
      setIsAdmin(r === "admin" || r === "org:admin");
    }

    checkRole();
  }, [userLoaded, orgLoaded, organization, user]);

  return (
    <RoleContext.Provider value={{ isAdmin, role }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext);
}

