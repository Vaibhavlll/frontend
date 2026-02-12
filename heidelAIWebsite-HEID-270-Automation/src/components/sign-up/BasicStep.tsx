import {Loader2} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {ChangeEvent, useState} from "react";
import {Input} from "@/components/sign-up/ui/Input";
import { Step } from "@/app/sign-up/page";
import { SignUpResource } from "@clerk/types";
import { toast } from "sonner";

const NEXT_PUBLIC_API_URL = "https://api.heidelai.com";

interface BasicStepProps {
    signUp?: SignUpResource;
    isSignUpLoaded: boolean;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    googleLoading: boolean;
    setGoogleLoading: (loading: boolean) => void;
    formData: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        password: string;
        planId: string;
    };
    setFormData: (data: { firstName: string; lastName: string; email: string; phoneNumber: string; password: string; planId: string }) => void;
    setStep: (step: Step) => void;
    signUpWith: (strategy: 'oauth_google') => void;
}

export const BasicStep = ({signUp, isSignUpLoaded, loading, setLoading, googleLoading, setGoogleLoading, formData, setFormData, setStep, signUpWith} : BasicStepProps) => {

    const handleBasicSubmit = async (provider: 'email' | 'google' = 'email') => {
        if (!isSignUpLoaded || !signUp) return;

        if (provider === 'google') {
        signUpWith('oauth_google');
        return;
        }

        setLoading(true);

        try {
        await signUp.create({
            firstName: formData.firstName,
            lastName: formData.lastName,
            emailAddress: formData.email,
        });

        console.log('created signUp', signUp);

        // Mock API Call
        const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/signup/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            provider,
            clerk_signup_id: signUp.id,
            clerk_user_id: signUp.createdUserId
            })
        });

        const data = await res.json();
        console.error("API RESPONSE", data);
        if (!res.ok) console.error("API ERROR", data);

        // THE BACKEND DICTATES THE NEXT STEP
        setStep(data.next_step as Step);

        } catch (err) {
        if (err instanceof Error) {
            toast.error(err.message);
            console.error(err.message);
        } else {
            toast.error("An unknown error occurred");
        }
        } finally {
        setLoading(false);
        setGoogleLoading(false)
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className=" text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">Get started for free</h1>
            <button
                onClick={() => handleBasicSubmit('google')}
                disabled={googleLoading}
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
            >
                {googleLoading ? <Loader2 className="animate-spin" /> :
                    <>
                        <Image height={48} width={48} src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        Continue with Google
                    </>
                }
            </button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="First Name" placeholder="Jane"
                    value={formData.firstName}
                    autoComplete='first-name'
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleBasicSubmit(); }}
                />
                <Input
                    label="Last Name" placeholder="Doe"
                    value={formData.lastName}
                    autoComplete='last-name'
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastName: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleBasicSubmit(); }}
                />
            </div>
            <Input
                label="Email" type="email" placeholder="jane@company.com"
                value={formData.email}
                autoComplete='email'
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleBasicSubmit(); }}
            />

            <div id="clerk-captcha"></div>

            <button
                onClick={() => handleBasicSubmit('email')}
                disabled={loading || !formData.email}
                className="w-full py-2.5 mt-6 bg-black hover:bg-zinc-700 text-white hover:cursor-pointer rounded-lg font-medium transition-colors flex justify-center items-center"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Continue"}
            </button>


            <p className='text-xs sm:text-sm text-gray-600 mt-6 text-center'>By creating an account, you agree to the&nbsp;
                <Link href="/terms-of-service" className="text-gray-600 hover:text-gray-900 underline">
                    Terms of Service
                </Link>
                &nbsp;and&nbsp;
                <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 underline">
                    Privacy Policy
                </Link>.
            </p>
        </div>
    )
}