"use client";

import React, { ChangeEvent, useState, useEffect, useRef } from 'react';
import { useSignUp, useUser, useClerk } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';
import { Input } from '@/components/sign-up/ui/Input';
import { OtpInput } from '@/components/sign-up/OtpInput';
import { Loader2, CheckCircle, ChevronRight, Eye, EyeClosed } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { PricingPlans } from '@/components/sign-up/PricingPlans';
import { PhoneNumberInput } from '@/components/sign-up/PhoneNumberInput';
import { load } from '@cashfreepayments/cashfree-js'; // Import Cashfree SDK
import { ScheduleCall } from '@/components/sign-up/ScheduleCall';
import Link from 'next/link';
import { PaymentStuck } from '@/components/sign-up/payment/PaymentStuck';
import { useRouter } from 'next/navigation';
import { BasicStep } from '@/components/sign-up/BasicStep';


export type Step = "BASIC" | "PASSWORD" | "OTP" | "PLAN" | "PHONE_NUMBER" | "SCHEDULE_CALL" | "PAYMENT" | "SUCCESS" | "FLOW_COMPLETED";
const NEXT_PUBLIC_API_URL = "https://api.heidelai.com"; 

export default function SignupFlow() {
  const router = useRouter();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const { setActive } = useClerk();
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();

  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  const [step, setStep] = useState<Step>("BASIC");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [resending, setResending] = useState(false);

  // Form States
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "", password: "", planId: "" });
  const [otpCode, setOtpCode] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cashfree = useRef<any>(null);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && step === "OTP") {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft, step]);

  useEffect(() => {
    setRootElement(document.getElementById("root") || document.body);

    const initializeSDK = async () => {
      cashfree.current = await load({
        mode: "sandbox" // Change to "production" when going live
      });
    };
    initializeSDK();
  }, []);

  // --- API Handlers ---

  const signUpWith = (strategy: OAuthStrategy) => {
    if (!isSignUpLoaded || !signUp) return;
    setGoogleLoading(true)
    return signUp.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sign-up/sso-callback',
      redirectUrlComplete: '/sign-up',
    })
      .catch((err) => {
        if (err instanceof Error) {
          console.error("Sign up error", err);
          toast.error(err.message);
          setGoogleLoading(false);
          return;
        }
        else {
          console.error("Sign up error", err);
          toast.error(err.errors ? err.errors[0].message : "An error occurred with Google Sign In");
          setGoogleLoading(false);
        }
      });
  }

  const handleResendOtp = async () => {
    if (!isSignUpLoaded || timeLeft > 0) return;

    setResending(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setTimeLeft(30); // Reset timer
      toast.success("Code resent successfully");
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error resending code", err);
        toast.error(err.message);
      } else {
        console.error("Error resending code", err);
        toast.error("An unknown error occurred while resending the code");
      }
    } finally {
      setResending(false);
    }
  }

  useEffect(() => {
    const initUser = async () => {
      if (isUserLoaded && isSignedIn && user && step === "BASIC") {
        console.log("User is signed in:", user);
        // User is authenticated via Clerk. Skip BASIC/PASSWORD/OTP
        // sync the user
        try {
          // Check if connected via Google
          const isGoogle = user.externalAccounts.some(acc => acc.verification?.strategy === "oauth_google" && acc.verification?.status === "verified");
          const provider = isGoogle ? 'google' : 'email';
          const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/signup/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              first_name: formData.firstName || user.firstName,
              last_name: formData.lastName || user.lastName,
              email: formData.email || user.primaryEmailAddress?.emailAddress,
              provider,
              clerk_signup_id: user.id,
              clerk_user_id: user.id
            })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || "Error initializing");

          // THE BACKEND DICTATES THE NEXT STEP
          setStep(data.next_step as Step);

        } catch (err) {
          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("An unknown error occurred");
          }
        } finally {
          setLoading(false);
        }
        // setStep("PLAN");
      }
    };

    initUser();
  }, [isUserLoaded, isSignedIn, user, step, formData, signUp]);

  

  const handlePasswordSubmit = async () => {
    if (!signUp) return;
    setLoading(true);

    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/signup/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ clerk_user_id: signUp.createdUserId })
      });

      await signUp.update({ password: formData.password });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);


      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      console.log('signup updated', signUp);

      setStep(data.next_step as Step);
    } catch (err) {
      console.log(err)
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (codeToVerify?: string | React.MouseEvent) => {
    const finalCode = typeof codeToVerify === 'string' ? codeToVerify : otpCode;

    if (!signUp || finalCode.length !== 6) return;
    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: finalCode,
      });

      console.log("completeSignUp", completeSignUp);

      if (completeSignUp.status === 'complete') {
        await setActive({
          session: completeSignUp.createdSessionId,
        });

        const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/signup/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ clerk_user_id: signUp.createdUserId })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);

        setStep(data.next_step as Step);
      } else {
        console.error("Verification invalid");
        toast.error("OTP verification failed. Please try again.");
      }

    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "") {
          toast.error("Something went wrong. Please try again later.")
        }
        else {
          toast.error(err.message);
        }
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    setFormData({ ...formData, planId });
    if (!signUp) return;
    if (planId === 'enterprise_monthly' || planId === 'enterprise_yearly') {
      planId = 'enterprise';
    }
    else if (planId === 'free_monthly' || planId === 'free_yearly') {
      planId = 'free';
    }
    setLoading(true);
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/signup/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan_id: planId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      if (data.org_id) {
        // Plan does not require payment
        console.log("Current User", user)
        // setActive({ organization: data.org_id });
        await user?.reload()
        await setActive({
          organization: data.org_id // The ID returned from your backend
        });
        console.log("Current User", user);
      }

      setStep(data.next_step as Step);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberSubmit = async () => {
    if (!signUp) return;
    setLoading(true);
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/signup/init-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone_number: formData.phoneNumber, plan_id: formData.planId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      if (!data.subscription_session_id) {
        throw new Error('Failed to create payment session');
      }

      // 2. Trigger the Cashfree Checkout
      const checkoutOptions = {
        subsSessionId: data.subscription_session_id,
        redirectTarget: "_self", // Opens inside a popup/modal
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cashfree.current.subscriptionsCheckout(checkoutOptions).then((result: any) => {
        if (result.error) {
          // Handle user closing the popup or payment failure
          toast.error("Payment failed or cancelled. Please try again.");
          setLoading(false);
          console.log("User closed payment popup or failed", result);
        }
        if (result.redirect) {
          // This will be called if payment is successful and redirect is happening
          console.log("Payment initiated");
        }
        if (result.paymentDetails) {
          // Payment success!
          console.log("Payment Success", result.paymentDetails);
          toast.success("Payment Successful!");

          setStep("SUCCESS"); // Or directly to SUCCESS
        }
      });

      setStep(data.next_step as Step);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Renders ---

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className={`fixed sm:w-fit w-full ${step === 'BASIC' || step === 'PASSWORD' || step === 'OTP' ? '' : 'hidden'} z-20 bg-white/80 backdrop-blur-sm flex h-10 items-center top-0 py-6 pl-4 sm:py-0 sm:pl-0 left-0 sm:top-8 sm:left-8`}>
        <Image src="/heidelai.png" alt="Logo" width={120} height={120} quality={100} loading='eager' className='max-h-8 max-w-8 sm:max-h-10 sm:max-w-10' />
        <h2 className='text-lg sm:text-xl font-semibold text-gray-900 ml-2'>HeidelAI</h2>
      </div>
      <div className="bg-white max-w-md w-full rounded-2xl p-8 transition-all">


        {/* STEP 1: BASIC */}
        {step === "BASIC" && (
          <BasicStep 
            formData={formData}
            setFormData={setFormData}
            setStep={setStep}
            loading={loading}
            googleLoading={googleLoading}
            signUp={signUp}
            isSignUpLoaded={isSignUpLoaded}
            setLoading={setLoading}
            setGoogleLoading={setGoogleLoading}
            signUpWith={signUpWith}
          />
        )}

        {/* STEP 2: PASSWORD */}
        {step === "PASSWORD" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h1 className=" text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12 sm:mb-16">Secure your account</h1>


            <Input
              label="Email"
              type="text"
              value={formData.email}
              readOnly
              spellCheck={false}
              className='text-gray-500'
            />

            {/* Wrapper to position the eye icon */}
            <div className="relative">
              <Input
                label="Password"
                // 1. Toggle type based on state
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordSubmit(); }}
                autoComplete='new-password'

              />

              {/* 3. The Eye Icon Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                // Position: 
                // top-[34px] accounts for the Label height (approx 24px) + Input padding top
                // right-3 pushes it inside the input box
                className="absolute bg-white right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
              >
                {showPassword ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeClosed className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              onClick={handlePasswordSubmit}
              disabled={loading || formData.password.length < 8}
              className="w-full mt-6 py-2.5 bg-black hover:bg-zinc-700 hover:cursor-pointer text-white rounded-lg font-medium transition-colors flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Create Password"}
            </button>
          </div>
        )}

        {/* STEP 3: OTP */}
        {step === "OTP" && (
          <div className="animate-in fade-in zoom-in-95 duration-500 text-center">

            <h1 className=" text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">Verify your email</h1>
            <p className="text-gray-500 mb-6">We sent a code to <span className="font-medium text-gray-900">{formData.email}</span></p>

            <OtpInput
              onClickEnter={handleOtpVerify}
              onComplete={(code: string) => setOtpCode(code)}
              loading={loading}
            />

            {/* --- Resend Section --- */}
            <div className="mb-6 text-sm">
              <p className="text-gray-500">
                Didn&apos;t receive the code?{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={timeLeft > 0 || resending}
                  className={`font-medium transition-colors ${timeLeft > 0 || resending
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-700 hover:text-blue-500 hover:underline cursor-pointer"
                    }`}
                >
                  {resending ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Sending...
                    </span>
                  ) : timeLeft > 0 ? (
                    `(${timeLeft}s)`
                  ) : (
                    "Resend Code"
                  )}
                </button>
              </p>
            </div>


          </div>
        )}

        {/* STEP 4: PLAN */}
        {step === "PLAN" && (
          <div className="animate-in flex flex-col items-center fade-in slide-in-from-bottom-8 duration-500">
            <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900 mb-6">Select your plan</h1>

            <div className='w-screen '>
              <PricingPlans onSelectPlan={handlePlanSelect} loading={loading} />

            </div>

          </div>
        )}

        {/* Step 5: PHONE_NUMBER if PLAN = growth_monthly | growth_yearly */}
        {step === "PHONE_NUMBER" && (
          <PhoneNumberInput
            formData={formData}
            setFormData={setFormData}
            handlePhoneNumberSubmit={handlePhoneNumberSubmit}
            loading={loading}
          />
        )}

        {/* STEP 5: PAYMENT (Placeholder) */}
        {step === "PAYMENT" && (
          <PaymentStuck setStep={setStep} />
        )}

        {step === "SCHEDULE_CALL" && (
          <ScheduleCall formData={formData} rootElement={rootElement} setStep={setStep} />
        )}

        {step === "SUCCESS" && (
          <div className="animate-in zoom-in duration-500 w-full flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-100 shadow-sm">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              You&apos;re all set 🎉
            </h1>
            <p className="text-gray-500 mb-8 max-w-sm">
              Your account is ready to go. Let’s get you started.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 bg-black hover:bg-zinc-800 text-white rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}