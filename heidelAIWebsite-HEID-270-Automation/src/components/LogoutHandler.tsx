'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { clearStore } from '@/lib/indexedDB'; // We use clearStore now instead of clearKey

export function LogoutHandler() {
  const { userId } = useAuth();
  
  useEffect(() => {
    // If userId becomes null, the user has logged out.
    // We should wipe the local database to protect their privacy.
    if (!userId) {
      const wipeData = async () => {
        try {
          // console.log("User logged out. Wiping local data...");
          await Promise.all([
            clearStore('conversations'),
            clearStore('messages'),
            clearStore('integrations')
          ]);
          // console.log("Local data wiped.");
        } catch (e) {
          console.error("Failed to wipe local data:", e);
        }
      };
      
      wipeData();
    }
  }, [userId]);
  
  return null; // This component renders nothing
}