'use client'

import { useEffect, useState } from 'react'
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { WebSocketProvider } from "@/lib/WebsocketContext";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import MobileBlockingOverlay from '@/components/dashboard/MobileBlockingOverlay';
import { useMediaQuery } from "@/components/hooks/useMediaQuery";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Set initial state
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const router = useRouter();
  const queryClient = new QueryClient();
  const { isSignedIn, isLoaded } = useUser();
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (!isLoaded) {
    // HeidelAI Logo Loader with Shine Effect
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-gray-100 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-[32rem] h-[32rem] bg-blue-300/20 rounded-full blur-3xl top-10 left-10 animate-pulse" />
          <div className="absolute w-[28rem] h-[28rem] bg-indigo-300/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse delay-200" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className=" p-20  text-center  z-10"
        >
          <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
            <Image
              src="/heidelai.png"
              alt="HeidelAI"
              width={260}
              height={260}
              loading={'eager'}
              className="mb-8 drop-shadow-2xl"
            />
            <motion.div
              className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
              initial={{ x: -128, opacity: 0.2 }}
              animate={{ x: 128, opacity: [0.2, 0.8, 0.2] }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
                ease: "easeInOut"
              }}
              style={{
                background:
                  "linear-gradient(120deg, transparent 60%, rgba(255,255,255,0.7) 80%, transparent 100%)"
              }}
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Checking your session...
          </h1>
          <p className="text-xl text-gray-600">
            Please wait while we verify your authentication status.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Enlarged Not signed in UI with HeidelAI Logo Loader with Shine Effect
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-[32rem] h-[32rem] bg-indigo-400/20 rounded-full blur-3xl top-10 left-10 animate-pulse" />
          <div className="absolute w-[28rem] h-[28rem] bg-blue-400/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse delay-200" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className=" text-center  z-10 max-w-2xl"
        >
          <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
            <Image
              src="/heidelai.png"
              alt="HeidelAI"
              width={260}
              height={260}
              className="mb-8 drop-shadow-2xl"
            />
            <motion.div
              className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
              initial={{ x: -128, opacity: 0.2 }}
              animate={{ x: 128, opacity: [0.2, 0.8, 0.2] }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
                ease: "easeInOut"
              }}
              style={{
                background:
                  "linear-gradient(120deg, transparent 60%, rgba(255,255,255,0.7) 80%, transparent 100%)"
              }}
            />
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            You’re not logged in
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Please log in to access your personalized dashboard and insights.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300"
          >
            Go to Login
          </button>
        </motion.div>

        <p className="text-gray-400 text-lg mt-10 z-10">
          HeidelAI • Secure Access Portal
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {isMobile ? (
        <MobileBlockingOverlay />
      ) : (
        <>
          {/* Offline Banner */}
          {!isOnline && (
            <div className="fixed top-0 left-0 w-full z-50 text-center text-red-600 border-[#fcb3b3] border-y bg-[#fff5f5] py-2 font-medium ">
              ⚠️ You are not connected to the internet. Messages are not syncing
            </div>
          )}

          {/* Content wrapper with padding to avoid overlap */}
          <div className={!isOnline ? 'pt-10' : ''}>
            <WebSocketProvider>
              <QueryClientProvider client={queryClient}>
                {children}
              </QueryClientProvider>
            </WebSocketProvider>
          </div>
        </>
      )}
    </div>
  )
}