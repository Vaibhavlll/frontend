"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSignIn, useSignUp, useUser, useOrganization } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Suspense } from "react";

const PageContent = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const { organization } = useOrganization();
  const {
    isLoaded: isSignUpLoaded,
    signUp,
    setActive: setSignUpActive,
  } = useSignUp();
  const {
    isLoaded: isSignInLoaded,
    signIn,
    setActive: setSignInActive,
  } = useSignIn();

  const [activeTab, setActiveTab] = React.useState<"login" | "signup">("login");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [username, setUsername] = React.useState(""); // Add state

  const searchParams = useSearchParams();
  const token = searchParams.get("__clerk_ticket");
  const accountStatus = searchParams.get("__clerk_status");

  React.useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  // Clerk sign-in with ticket logic
  React.useEffect(() => {
    async function handleSignInWithTicket() {
      if (
        !signIn ||
        !setSignInActive ||
        !token ||
        organization ||
        accountStatus !== "sign_in"
      ) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const signInAttempt = await signIn.create({
          strategy: "ticket",
          ticket: token ?? undefined,
        });
        if (signInAttempt.status === "complete") {
          await setSignInActive({
            session: signInAttempt.createdSessionId,
          });
          if (signInAttempt.createdSessionId) {
            localStorage.setItem("sessionId", signInAttempt.createdSessionId);
          }
          setSuccess(true);
          router.push("/dashboard");
        } else {
          setError("Further steps required. Please check your email.");
          toast.error("Further steps required. Please check your email.");
          // console.log("SignIn incomplete:", signInAttempt);
        }
      } catch (err) {
        setError("Failed to accept invitation.");
        toast.error("Failed to accept invitation.");
        // console.log("SignIn error:", err);
      }
      setLoading(false);
    }
    handleSignInWithTicket();
  }, [signIn, setSignInActive, token, organization, accountStatus, router]);

  // Clerk sign-up with ticket logic
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }
    if (!isSignUpLoaded) return;
    setLoading(true);
    try {
      const signUpAttempt = await signUp.create({
        strategy: "ticket",
        ticket: token ?? undefined,
        firstName,
        lastName,
        password,
        username, // Pass username here
      });
      if (signUpAttempt.status === "complete") {
        await setSignUpActive({ session: signUpAttempt.createdSessionId });
        if (signUpAttempt.createdSessionId) {
          localStorage.setItem("sessionId", signUpAttempt.createdSessionId);
        }
        setSuccess(true);
        router.push("/dashboard");
      } else {
        setError("Further steps required. Please check your email.");
        toast.error("Further steps required. Please check your email.");
        // console.log("SignUp incomplete:", signUpAttempt);
        // console.log("Missing fields:", signUpAttempt.missingFields); // Log missing fields
      }
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        typeof (err as { status?: unknown }).status === "number" &&
        (err as { status: number }).status === 429
      ) {
        setError("Too many requests. Please wait and try again.");
        toast.error("Too many requests. Please wait and try again.");
      } else {
        setError("Sign up failed.");
        toast.error("Sign up failed.");
      }
      // console.log("SignUp error:", err);
    }
    setLoading(false);
  };

  // Standard login + ticket logic
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!isSignInLoaded) return;
    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: loginEmail,
        password: loginPassword,
      });
      if (signInAttempt.status === "complete") {
        if (!token) {
          throw new Error("No invitation token found.");
        }
        const ticketAttempt = await signIn.create({
          strategy: "ticket",
          ticket: token,
        });
        if (ticketAttempt.status === "complete") {
          await setSignInActive({ session: ticketAttempt.createdSessionId });
          if (ticketAttempt.createdSessionId) {
            localStorage.setItem("sessionId", ticketAttempt.createdSessionId);
          }
          setSuccess(true);
          router.push("/dashboard");
        } else {
          setError("Further steps required. Please check your email.");
          toast.error("Further steps required. Please check your email.");
          // console.log("Ticket incomplete:", ticketAttempt);
        }
      } else {
        setError("Login failed. Please check your credentials.");
        toast.error("Login failed. Please check your credentials.");
        // console.log("Login failed:", signInAttempt);
      }
    } catch (err) {
      setError("Sign in failed.");
      toast.error("Sign in failed.");
      // console.log("SignIn error:", err);
    }
    setLoading(false);
  };

  // No token found
  if (!token) {
    toast.error("No invitation token found.");
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-purple-100 text-center px-6">
        <Image
          src="/heidelai.png"
          alt="HeidelAI"
          width={70}
          height={70}
          className="mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Invitation Not Found
        </h1>
        <p className="text-gray-600 max-w-md mb-6">
          We couldn’t find an active invitation link. Please check your email
          for a valid invite or contact your admin.
        </p>
        <Link
          href="/"
          className="px-5 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  // Show loading while signing in with ticket
  if (accountStatus === "sign_in" && !organization) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-purple-100 text-center px-6">
        <Image
          src="/heidelai.png"
          alt="HeidelAI"
          width={70}
          height={70}
          className="mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Accepting Invitation...
        </h1>
        <p className="text-gray-600 max-w-md mb-6">
          Please wait while we sign you in and accept your invitation.
        </p>
      </div>
    );
  }

  // Show sign-up form if needed
  if (accountStatus === "sign_up" && !organization) {
    return (
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* LEFT SIDE – Branding / Features */}
        <div className="relative flex flex-col justify-center items-center bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-600 text-white p-16 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-indigo-400/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[100px] animate-pulse"></div>
          </div>
          <div className="relative z-10 text-center flex flex-col items-center">
            <Image
              src="/heidelai.png"
              alt="HeidelAI"
              width={120}
              height={120}
              className="mb-8 drop-shadow-xl"
            />
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Your AI Sales & Support Engine
            </h1>
            <p className="max-w-xl text-indigo-100 mb-12 leading-relaxed text-xl">
              From smart chatbots to automated lead insights, HeidelAI helps teams
              close more deals, support customers faster, and grow smarter — all
              powered by AI.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-4 max-w-2xl">
              <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
                <h3 className="font-semibold text-2xl mb-3">🤖 AI Recommendations</h3>
                <p className="text-lg text-indigo-100/90">
                  Boost conversions with personalized product suggestions.
                </p>
              </div>
              <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
                <h3 className="font-semibold text-2xl mb-3">💬 Smart Replies</h3>
                <p className="text-lg text-indigo-100/90">
                  AI-suggested responses that save you time.
                </p>
              </div>
              <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
                <h3 className="font-semibold text-2xl mb-3">📊 Lead Analysis</h3>
                <p className="text-lg text-indigo-100/90">
                  Automatically tag and prioritize potential leads.
                </p>
              </div>
              <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
                <h3 className="font-semibold text-2xl mb-3">⚙️ Integrations</h3>
                <p className="text-lg text-indigo-100/90">
                  Sync with WhatsApp, Instagram, Telegram & Shopify.
                </p>
              </div>
            </div>
            <p className="mt-16 text-xl text-indigo-100/80 italic font-light">
              &quot;Smarter conversations. Stronger sales. Simplified workflows&quot;
            </p>
          </div>
        </div>
        {/* RIGHT SIDE – Invitation Form */}
        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-white via-indigo-50 to-purple-100 p-12 relative min-h-screen w-full">
          <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Accept Your Invitation
              </h2>
              <p className="text-gray-500 text-lg">
                Join your HeidelAI workspace and get started instantly.
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleSignUpSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div id="clerk-captcha"></div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl text-xl font-semibold hover:bg-indigo-700 transition-all mt-6"
              >
                {loading ? "Creating..." : "Create Account & Accept Invitation"}
              </button>
            </form>
            {error && (
              <div className="mt-6 text-red-600 text-lg text-center font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-6 text-green-600 text-lg text-center font-medium">
                Success! Redirecting...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: Invitation accepted
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-purple-100 text-center px-6">
      <Image
        src="/heidelai.png"
        alt="HeidelAI"
        width={160} // Enlarged image
        height={160}
        className="mb-8 drop-shadow-2xl"
      />
      <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
        Organization invitation accepted!
      </h1>
      <p className="text-2xl text-gray-600 max-w-2xl mb-10">
        You have successfully accepted your invitation.<br />
        You can now access your workspace.
      </p>
      <Link
        href="/dashboard"
        className="px-10 py-5 rounded-full bg-indigo-600 text-white text-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={<div>Loading invitation...</div>}>
    <PageContent />
  </Suspense>
);

export default Page;
