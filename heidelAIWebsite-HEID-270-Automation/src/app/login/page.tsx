"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSignIn, useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";
import BackgroundGradient from "@/components/LandingPage/ui/BackgroundGradient";

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const { sessionId } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const justSignedIn = useRef(false);

  // Single useEffect for auto redirect logic
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      const storedSessionId = localStorage.getItem("sessionId");
      if (justSignedIn.current) {
        // Prevent double toast/redirect after sign-in
        justSignedIn.current = false;
        return;
      }
      if (storedSessionId && storedSessionId === sessionId) {
        toast.success("Already signed in!");
        router.push("/dashboard");
      } else if (sessionId) {
        localStorage.setItem("sessionId", sessionId);
        router.push("/dashboard");
      }
    }
  }, [isLoaded, isSignedIn, sessionId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoggingIn(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      const newSessionId = signInAttempt.createdSessionId || null;

      if (signInAttempt.status === "complete" && newSessionId) {
        await setActive({ session: newSessionId });
        localStorage.setItem("sessionId", newSessionId);
        toast.success("Signed in successfully!");
        justSignedIn.current = true; // Set flag to prevent double toast
        router.push("/dashboard");
      } else {
        localStorage.removeItem("sessionId");
        toast.error("Sign in not complete. Further steps required.");
      }
    } catch (err) {
      localStorage.removeItem("sessionId");
      const message =
        (typeof err === "object" &&
          err !== null &&
          "errors" in err &&
          Array.isArray((err).errors) &&
          (err).errors[0]?.message) ||
        "Invalid email or password.";
      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <BackgroundGradient className="min-h-screen text-white px-3 sm:px-4 md:px-6 py-6 sm:py-8 flex flex-col items-center justify-center">
      <div className=" w-[500px] xs:w-[380px] sm:w-[360px] md:w-[360px] lg:w-[440px] mx-auto bg-white/[0.75] backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3),0_10px_25px_-8px_rgba(99,102,241,0.2)] border border-white/40 relative overflow-hidden transition-all duration-300 hover:shadow-[0_25px_70px_-15px_rgba(59,130,246,0.4),0_15px_30px_-8px_rgba(99,102,241,0.25)]">
        {/* Subtle gradient overlay that matches background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/20 to-indigo-50/30 rounded-2xl sm:rounded-3xl pointer-events-none" />

        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-blue-400/20 blur-xl" />
        </div>

        {/* Content wrapper with relative positioning */}
        <div className="relative z-10">
          <h1 className="font-semibold text-2xl sm:text-3xl text-center text-neutral-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-center text-neutral-600 mb-6 sm:mb-8">
            Sign in to access your HeidelAI dashboard
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <LabelInputContainer>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </div>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-blue-200/50 rounded-[0.5rem] h-[44px] sm:h-[45px] bg-white/90 placeholder:text-neutral-400 text-neutral-800 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-100/50 transition-all pl-10"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="username"
                  required
                />
              </div>
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M12 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </div>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border border-blue-200/50 rounded-[0.5rem] h-[44px] sm:h-[45px] bg-white/90 placeholder:text-neutral-400 text-neutral-800 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-100/50 transition-all pl-10 pr-10"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                />
              </div>
              {/* Forgot password link */}
              <div className="text-right mt-2">
                <button
                  type="button"
                  className="text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
                  onClick={() => router.push("/forgot_password")}
                >
                  Forgot password?
                </button>
              </div>
            </LabelInputContainer>
            <button
              className={cn(
                "bg-gradient-to-br relative group/btn rounded-[0.5rem] from-neutral-800 to-neutral-900 block w-full text-white h-11 sm:h-12 font-medium shadow-lg hover:shadow-2xl hover:from-[#ff8c00] hover:via-[#ff5722] hover:to-[#ff1744] transition-all duration-1000 ease-out mt-6",
                { "opacity-50 cursor-not-allowed": isLoggingIn }
              )}
              type="submit"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Signing in..." : "Sign In →"}
              <BottomGradient />
            </button>

            {/* Need an account text */}
            <p className="text-center text-sm text-neutral-600 mt-6">
              Need an account?
            </p>

            {/* Don't have access section */}
            <p className="text-center text-sm text-neutral-600">
              Don&apos;t have access?{" "}
              <button
                type="button"
                className="text-neutral-800 font-medium hover:underline transition-colors"
                onClick={() => router.push("/contact")}
              >
                Contact your admin
              </button>
            </p>

          </form>
        </div>
      </div>

      {/* Secured by HeidelAI */}
      <p className="text-center text-sm text-neutral-600 mt-6">
        Secured by <span className="font-semibold bg-gradient-to-r from-[#ff8c00] to-[#ff1744] bg-clip-text text-transparent">HeidelAI</span>
      </p>
    </BackgroundGradient>
  );
}

const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-1000 ease-in-out opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-[#ff8c00] to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-1000 ease-in-out opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-[#ff1744] to-transparent" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>
    {children}
  </div>
);