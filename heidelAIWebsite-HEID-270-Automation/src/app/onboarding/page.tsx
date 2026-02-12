/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, OnboardingData } from '@/lib/schemas'; 
import { completeOnboardingAction } from '@/app/actions/complete-onboarding';
import {
  Send, BriefcaseBusiness, ArrowLeft, ArrowRight, Check, Plus, X,
  MailCheck, CreditCard, Phone, Loader2
} from 'lucide-react';
import Lottie from 'lottie-react';
import { useRouter } from 'next/navigation';
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { toast } from "sonner";
import { useSignUp, useClerk } from "@clerk/nextjs";
import { Card } from '@/components/LandingPage/ui/card';
import { Button } from '@/components/LandingPage/ui/button';
import { cn } from '@/lib/utils';
import { load } from '@cashfreepayments/cashfree-js'; // Import Cashfree SDK
import { useApi }from "@/lib/session_api"


const plans = [
    {
        id: 'free',
        title: 'Free',
        tagline: 'Start small, dream big',
        description: 'Explore core features and see how HeidelAI fits your workflow—no commitment.',
        price: '₹0',
        duration: '/month',
        features: ['Unified inbox across channels', 'AI chat for instant replies', 'Basic automation', 'Media sharing', 'Seen & delivered status'],
        cta: 'Get Started',
    },
    {
        id: 'growth',
        title: 'Growth',
        tagline: 'Your complete growth engine',
        description: 'Unlock advanced automation and AI-powered conversations built for scaling teams.',
        price: '₹2199',
        duration: '/month',
        features: ['Advanced AI chat', 'Automated follow-ups', 'AI recommendations', 'Multi-channel support', 'Real-time analytics', 'Ad integrations'],
        cta: 'Get Started',
        highlighted: true,
    },
    {
        id: 'enterprise',
        title: 'Enterprise',
        tagline: 'Built for your unique vision',
        description: 'Custom features, deeper integrations, and dedicated support tailored to your business.',
        price: 'On Request',
        duration: '',
        features: ['Fully custom AI', 'Deep integrations', 'Dedicated setup', 'Team collaboration'],
        cta: 'Get Started',
    },
];

const companyTypes = ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Marketing', 'Real Estate', 'Non-profit', 'Other'];
const companySizeRanges = ['1-10 people', '10-50 people', '50-100 people', '100-500 people', '500-1000 people', '1000+ people'];

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const OnboardingFlow: React.FC = () => {
  const router = useRouter();
  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
  const api = useApi();

  // Cashfree Ref
  const cashfree = useRef<any>(null);
  
  // State for UI Transitions/Loading only
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState(''); // Local state for the "Add Member" input
  const [isDragging, setIsDragging] = useState(false);
  const [tempCompanySize, setTempCompanySize] = useState(0);
  // Add this new state at the top
const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);

  // Initialize React Hook Form
  const { 
    control, 
    watch, 
    setValue, 
    trigger,
    getValues,
    formState: { errors } 
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues: {
      step1: { noCompany: false, companyName: '', fullName: '', email: '', password: '', confirmPassword: '' },
      step2: { verificationCode: '' },
      step3: { companyTypes: [], companySize: 0 },
      step4: { planId: 'growth', billingCycle: 'monthly' },
      step5: { teamMembers: [], phoneNumber: '' }
    }
  });

  // Watch values for UI logic
  const formData = watch();
  const activePlanId = formData.step4.planId;
  const noCompany = formData.step1.noCompany;
  const teamMembers = formData.step5.teamMembers || [];
  const billingCycle = formData.step4.billingCycle;
  const companySize = formData.step3.companySize;
  const selectedCompanyTypes = formData.step3.companyTypes || [];

  const teamMemberLimit = activePlanId === 'free' ? 1 : activePlanId === 'growth' ? 3 : 10;
  
  // --- 1. Initialize Cashfree SDK ---
  useEffect(() => {
    const initializeSDK = async () => {
      cashfree.current = await load({
        mode: "sandbox" // Change to "production" for live
      });
    };
    initializeSDK();
  }, []);

  // --- 2. Payment Logic ---
  // Function 1: Only Creates the Session (Called on 'Continue')
  const createPaymentSession = async () => {
    try {
      setLoading(true);
      const values = getValues();

      const response = await api.post('/api/payments/create-subscription', {
          plan_id: values.step4.planId, 
          amount: 2199,
          currency: 'INR',
          customer_id: values.step1.email, 
          customer_phone: values.step5.phoneNumber,
          customer_email: values.step1.email,
          customer_full_name: values.step1.fullName
      });

      const data = response.data;

      if (!data.payment_session_id) throw new Error('Failed to create session');
      
      // STORE THE ID AND STOP LOADING
      setPaymentSessionId(data.payment_session_id);
      setLoading(false); 
      // The UI will now update to show the "Pay Now" button

    } catch (error) {
      console.error("Payment Init Error:", error);
      toast.error("Could not initiate payment.");
      setLoading(false);
    }
  };

  // Function 2: Opens the Modal (Called on 'Pay Now')
  const openPaymentModal = () => {
    if (!paymentSessionId || !cashfree.current) return;

    const checkoutOptions = {
      subsSessionId: paymentSessionId,
      redirectTarget: "_self", // This will now work perfectly
    };

    cashfree.current.subscriptionsCheckout(checkoutOptions).then((result: any) => {
        if(result.error){
            toast.error("Payment cancelled.");
        }
        if(result.paymentDetails){
            toast.success("Payment Successful!");
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(6);
                setIsTransitioning(false);
            }, 150);
        }
    });
  };
  

  // Clerk methods

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isDragging) {
      setTempCompanySize(value);
    } else {
      setValue('step3.companySize', value, { shouldValidate: true });
    }
  };

  const toggleCompanyType = (type: string) => {
    const current = getValues('step3.companyTypes') || [];
    if (current.includes(type)) {
      setValue('step3.companyTypes', current.filter(t => t !== type), { shouldValidate: true });
    } else if (current.length < 3) {
      setValue('step3.companyTypes', [...current, type], { shouldValidate: true });
    }
    // Note: Max 3 limit is enforced by schema, but this UI logic prevents selecting more than 3 visually
  };

  const addTeamMember = () => {
    if (teamMembers.length >= teamMemberLimit) {
      toast.error(`You can only add up to ${teamMemberLimit} team members`);
      return;
    }
    const email = newMemberEmail.trim();
    
    // Basic regex for UI feedback before hitting schema validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Check if trying to invite self
    if (email.toLowerCase() === formData.step1.email.toLowerCase()) {
        toast.error("You can't invite yourself");
        return;
    }

    if (teamMembers.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      toast.error('This email is already added');
      return;
    }
    
    setValue('step5.teamMembers', [...teamMembers, { email }], { shouldValidate: true });
    setNewMemberEmail('');
  };

  const removeMember = (emailToRemove: string) => {
    const current = getValues('step5.teamMembers') || [];
    setValue('step5.teamMembers', current.filter(m => m.email !== emailToRemove));
  };

  // --- Styles (Keep exact same) ---
  const sliderStyles = `
    .slider { transition: none; }
    .slider.snapping { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .slider::-webkit-slider-thumb { appearance: none; height: 20px; width: 20px; border-radius: 50%; background: white; border: 2px solid #16a34a; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s ease; }
    .slider::-webkit-slider-thumb:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .slider::-webkit-slider-thumb:active { transform: scale(1.05); }
    .slider::-moz-range-thumb { height: 20px; width: 20px; border-radius: 50%; background: white; cursor: pointer; border: 2px solid #16a34a; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s ease; }
    .slider::-moz-range-thumb:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
  `;

  // --- Navigation Logic (Updated to use trigger) ---
  const handleNext = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await trigger('step1');
      if (isValid) await handleSignUp();
    } else if (currentStep === 2) {
      isValid = await trigger('step2');
      if (isValid) await handleVerifyEmail();
    } else if (currentStep === 3) {
      isValid = await trigger('step3');
      if (isValid) {
        setIsTransitioning(true);
        setTimeout(() => { setCurrentStep(4); setIsTransitioning(false); }, 150);
      }
    } else if (currentStep === 4) {
      setIsTransitioning(true);
      setTimeout(() => { setCurrentStep(5); setIsTransitioning(false); }, 150);
} else if (currentStep === 5) {
      // Validate Phone
      if (activePlanId !== 'free') {
         const isValid = await trigger('step5.phoneNumber');
         if (!isValid) return;
      }

      if (activePlanId === 'growth') {
          // If we already have a session ID, the button acts as "Pay Now"
          if (paymentSessionId) {
              openPaymentModal();
          } else {
              // If no session ID, create it first
              await createPaymentSession();
          }
          return;
      }

      // Enterprise/Free logic...
      setIsTransitioning(true);
      setTimeout(() => { setCurrentStep(6); setIsTransitioning(false); }, 150);

    } else if (currentStep === 6) {
      await handleFinalSubmit();
    }
  };

  // --- Auth Handlers (Using your provided logic) ---
  const handleSignUp = async () => {
    if (!isSignUpLoaded) return;
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: formData.step1.email,
        password: formData.step1.password,
        firstName: formData.step1.fullName.split(' ')[0],
        lastName: formData.step1.fullName.split(' ').slice(1).join(' ') || '',
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("Verification code sent!");
      setIsTransitioning(true);
      setTimeout(() => { setCurrentStep(2); setIsTransitioning(false); }, 150);
    } catch (err: any) {
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        toast.error("Email already taken. Please login.");
      } else {
        toast.error(err.errors?.[0]?.message || "Error creating account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!isSignUpLoaded) return;
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: formData.step2.verificationCode,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Email Verified!");
        setIsTransitioning(true);
        setTimeout(() => { setCurrentStep(3); setIsTransitioning(false); }, 150);
      } else {
        toast.error("Verification failed. Please check the code.");
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("Code resent!");
    } catch (error) {
      toast.error("Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (activePlanId === 'enterprise') {
        toast.success("Callback request submitted successfully!");
        router.push('/');
        return;
    }
    setLoading(true);
    try {
      const response = await completeOnboardingAction(formData);
      if (response.success) {
        toast.success("Setup Complete!");
        router.push('/dashboard');
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong during setup.");
      setLoading(false);
    }
  };

  // --- Navigation Helpers ---
  const handleBack = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => { setCurrentStep(currentStep - 1); setIsTransitioning(false); }, 150);
    }
  };

  const handleSkip = () => {
    if (currentStep === 5) {
      setIsTransitioning(true);
      setTimeout(() => { setCurrentStep(currentStep + 1); setIsTransitioning(false); }, 150);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (currentStep > 2 && stepId <= 2) return;
    if (stepId <= currentStep || steps[stepId - 1].completed) {
      setIsTransitioning(true);
      setTimeout(() => { setCurrentStep(stepId); setIsTransitioning(false); }, 150);
    }
  };

  const getInitials = (email: string) => {
    const name = email.split('@')[0];
    return name.length >= 2 ? name.substring(0, 2).toUpperCase() : name.charAt(0).toUpperCase();
  };

  const getProfileColor = (email: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-gray-500'];
    const index = email.length % colors.length;
    return colors[index];
  };

  // Define steps array for sidebar
  const steps: Step[] = [
    { 
      id: 1, 
      title: 'Create Account', 
      description: 'Provide an email and password', 
      icon: <MailCheck className="w-5 h-5" />, 
      completed: currentStep > 1 
    },
    { 
      id: 2, 
      title: 'Verify Email', 
      description: 'Enter the code sent to your email', 
      icon: <MailCheck className="w-5 h-5" />, 
      completed: currentStep > 2 
    },
    { 
      id: 3, 
      title: 'Your Details', 
      description: 'Tell us a bit more for personalised experience', 
      icon: <BriefcaseBusiness className="w-5 h-5" />, 
      completed: currentStep > 3 
    },
    { 
      id: 4, 
      title: 'Select your Plan', 
      description: 'Choose a plan that fits your needs', 
      icon: <CreditCard className="w-5 h-5" />, 
      completed: currentStep > 4 
    },
    { 
      id: 5, 
      title: activePlanId === 'enterprise' ? 'Request a Callback' : activePlanId === 'growth' ? 'Your Phone Details' : 'Invite your Team', 
      description: activePlanId === 'enterprise' ? 'Our team will reach out to you' : activePlanId === 'growth' ? 'Provide your phone number' : 'Start collaborating with your team', 
      icon: activePlanId === 'enterprise' || activePlanId === 'growth' ? <Phone className="w-5 h-5" /> : <Send className="w-5 h-5" />, 
      completed: currentStep > 5 
    },
    { 
      id: 6, 
      title: 'Success', 
      description: activePlanId === 'enterprise' ? 'All done! Our team will contact you shortly' : 'All done! Account setup successful', 
      icon: <Check className="w-5 h-5" />, 
      completed: false 
    }
  ];

  // --- RENDER CONTENT SWITCHER ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={`space-y-6 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Get Started for Free</h2>
              <p className="text-gray-600 hidden sm:block">
                Set up your workspace to connect platforms like WhatsApp, Instagram, and more. From here, you can add team members, and streamline conversations across all your channels. All in one place.
              </p>
              <p className="text-gray-600 sm:hidden">
                Set up your workspace to connect platforms like WhatsApp, Instagram, and more.
              </p>
            </div>

            {/* Company Name Field - Controlled */}
            <div className={`transition-all p-1 duration-300 overflow-hidden ${!noCompany ? 'max-h-22 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company name *</label>
                <Controller
                  name="step1.companyName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g. X"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${errors.step1?.companyName ? 'border-red-300' : 'border-gray-300'}`}
                    />
                  )}
                />
                {errors.step1?.companyName && <p className="text-sm text-red-600 mt-1">{errors.step1.companyName.message}</p>}
              </div>
            </div>

            {/* No Company Checkbox - Controlled */}
            <div className="flex pl-1 items-center space-x-2">
              <Controller
                name="step1.noCompany"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <input
                    type="checkbox"
                    id="noCompany"
                    checked={value}
                    onChange={(e) => {
                      onChange(e.target.checked);
                      if (e.target.checked) setValue('step1.companyName', '', { shouldValidate: true });
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500 transition-all duration-200 cursor-pointer"
                  />
                )}
              />
              <label htmlFor="noCompany" className="text-sm text-gray-700 cursor-pointer">I don&apos;t have a company</label>
            </div>

            {/* Full Name Field - Controlled */}
            <div className='pl-1'>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full name *</label>
              <Controller
                name="step1.fullName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g. Elon Musk"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${errors.step1?.fullName ? 'border-red-300' : 'border-gray-300'}`}
                  />
                )}
              />
              {errors.step1?.fullName && <p className="text-sm text-red-600 mt-1">{errors.step1.fullName.message}</p>}
            </div>

            {/* Email Address Field - Controlled */}
            <div className='pl-1'>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address *</label>
              <Controller
                name="step1.email"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="e.g. elon.musk@x.com"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${errors.step1?.email ? 'border-red-300' : 'border-gray-300'}`}
                  />
                )}
              />
              {errors.step1?.email && <p className="text-sm text-red-600 mt-1">{errors.step1.email.message}</p>}
            </div>

            {/* Password Field - Controlled */}
            <div className='pl-1'>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <Controller
                name="step1.password"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${errors.step1?.password ? 'border-red-300' : 'border-gray-300'}`}
                  />
                )}
              />
              {errors.step1?.password ? (
                <p className="text-sm text-red-600 mt-1">{errors.step1.password.message}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters long</p>
              )}
            </div>

            {/* Confirm Password Field - Controlled */}
            <div className='pl-1'>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password *</label>
              <Controller
                name="step1.confirmPassword"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Confirm your password"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${errors.step1?.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                  />
                )}
              />
              {errors.step1?.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.step1.confirmPassword.message}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={`space-y-6 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verify your email address</h2>
              <p className="text-gray-600">
                We&apos;ve sent a verification code to <span className="font-medium">{formData.step1.email}</span>. Please check your inbox and enter the code below to continue.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification code</label>
                <Controller
                  name="step2.verificationCode"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter 6-digit code"
                      className={`w-full px-3 py-3 text-center text-4xl tracking-widest border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${errors.step2?.verificationCode ? 'border-red-300' : 'border-gray-300'}`}
                    />
                  )}
                />
                {errors.step2?.verificationCode && <p className="text-sm text-red-600 mt-2">{errors.step2.verificationCode.message}</p>}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MailCheck className="w-4 h-4" />
                  <span>Code sent to {formData.step1.email}</span>
                </div>
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center transition-all duration-200 disabled:opacity-50"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Resending...
                    </>
                  ) : (
                    'Resend code'
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={`space-y-6 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Tell us more about {formData.step1.companyName ? `${formData.step1.companyName}` : 'yourself'}
              </h2>
              <p className="text-gray-600 mb-10 sm:mb-16">
                Help us customize your workspace by telling us a bit about
                {formData.step1.companyName ? ` ${formData.step1.companyName} and how it operates.` : ' yourself and your work.'}
              </p>
            </div>

            {/* Company Type Selection */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                What kind of {formData.step1.companyName ? 'company are you' : 'work do you do'}?
              </h3>
              <p className="text-sm text-gray-500 mb-3">Select up to 3 categories</p>
              <div className="flex flex-wrap gap-3 sm:gap-4 max-w-3xl">
                {companyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleCompanyType(type)}
                    className={`px-3 sm:px-4 text-sm sm:text-base py-2 rounded-lg ${selectedCompanyTypes.includes(type) ? 'bg-zinc-800 text-white' : 'bg-[#f0f0f0] text-black hover:bg-[#dbdbdb]'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.step3?.companyTypes && <p className="text-sm text-red-600 mt-2">{errors.step3.companyTypes.message}</p>}
            </div>

            {/* Company Size Slider */}
            <div>
              <h3 className="text-xl font-semibold mt-14 text-gray-900 mb-5">
                How large is your {formData.step1.companyName ? 'company' : 'team'}?
              </h3>
              <div className="space-y-4 max-w-3xl">
                <div className="text-left">
                  <span className="text-4xl font-semibold text-black">{companySizeRanges[isDragging ? tempCompanySize : companySize]}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={companySizeRanges.length - 1}
                    value={isDragging ? tempCompanySize : companySize}
                    onChange={handleSliderChange}
                    onMouseDown={() => { setIsDragging(true); setTempCompanySize(companySize); }}
                    onMouseUp={() => { setIsDragging(false); setValue('step3.companySize', tempCompanySize); }}
                    onTouchStart={() => { setIsDragging(true); setTempCompanySize(companySize); }}
                    onTouchEnd={() => { setIsDragging(false); setValue('step3.companySize', tempCompanySize); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((isDragging ? tempCompanySize : companySize) / (companySizeRanges.length - 1)) * 100}%, #e5e7eb ${((isDragging ? tempCompanySize : companySize) / (companySizeRanges.length - 1)) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 px-1">
                  {companySizeRanges.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1 h-1 rounded-full transition-all duration-200 ${index === (isDragging ? tempCompanySize : companySize) ? 'bg-green-600 scale-150' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={`space-y-6 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
            <div>
              <h2 className="text-2xl hidden sm:block font-semibold text-gray-900 mb-2">Plans built for every business. Pick yours.</h2>
              <h2 className="text-2xl sm:hidden font-semibold text-gray-900 mb-2">Plans for every business.</h2>
              <p className="text-gray-600 hidden sm:block">From your first customer to enterprise scale. Flexible pricing that grows with you, with all the features you need at every stage.</p>
              <p className="text-gray-600 sm:hidden">Start small. Scale big. Flexible pricing that grows with you.</p>
            </div>

            <div className="flex justify-center px-2 mb-12">
              <div className="relative flex w-full max-w-[210px] sm:max-w-[250px] rounded-full bg-gray-100 p-1">
                <div
                  className={cn(
                    "absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full bg-black transition-transform duration-300 ease-in-out",
                    billingCycle === 'yearly' && "translate-x-full"
                  )}
                />
                <button
                  onClick={() => setValue('step4.billingCycle', 'monthly')}
                  className={cn("relative z-10 flex-1 rounded-full py-2 text-xs sm:text-sm font-medium transition-colors font-inter", billingCycle === 'monthly' ? "text-white" : "text-gray-500")}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setValue('step4.billingCycle', 'yearly')}
                  className={cn("relative z-10 flex-1 rounded-full py-2 text-xs sm:text-sm font-medium transition-colors font-inter", billingCycle === 'yearly' ? "text-white" : "text-gray-500")}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
              {plans.map((item) => {
                const isSelected = activePlanId === item.id;
                return (
                  <Card
                    key={item.id}
                    onClick={() => setValue('step4.planId', item.id as any)}
                    className={cn(
                      "relative flex flex-col transition-all duration-500 rounded-3xl font-inter cursor-pointer overflow-hidden",
                      isSelected
                        ? "p-[1.5px] bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] shadow-[0_20px_50px_rgba(255,87,34,0.15)] transform scale-[1.02]"
                        : "border-[1.5px] border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:border-gray-200"
                    )}
                  >
                    <div className={cn("flex flex-col h-full bg-white transition-all duration-500", isSelected ? "p-[30.5px] rounded-[22.5px]" : "p-8")}>
                      <div className="mb-6">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-inter">{item.title}</h3>
                        <div className="space-y-2 mb-4">
                          <p className="text-base font-medium text-gray-900 leading-tight font-inter">{item.tagline}</p>
                          <p className="text-[13px] text-gray-500 leading-relaxed font-medium font-inter">{item.description}</p>
                        </div>
                        <div className="flex items-baseline gap-1 mt-4">
                          <span className="text-3xl font-bold text-gray-900 font-inter">{item.price}</span>
                          {item.duration && <span className="text-gray-500 font-medium text-md font-inter">{item.duration}</span>}
                        </div>
                      </div>
                      <div className="h-[1px] w-full bg-gray-200" />
                      <div className="flex-1 py-4">
                        <ul className="space-y-5">
                          {item.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className="mt-1 flex-shrink-0">
                                <Check className={cn("h-5 w-5", isSelected ? "text-[#ff5722]" : "text-gray-900")} strokeWidth={2.5} />
                              </div>
                              <span className="text-[14px] text-gray-700 leading-snug font-medium font-inter">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="h-[1px] w-full bg-gray-100 my-5" />
                      <Button
                        onClick={(e) => { e.stopPropagation(); setValue('step4.planId', item.id as any); }}
                        className={cn(
                          "w-full h-12 rounded-xl bg-zinc-300 text-base font-bold transition-all duration-300 font-inter",
                          isSelected
                            ? "bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] hover:opacity-90 text-white border-none shadow-md"
                            : "bg-zinc-300 hover:bg-black text-gray-400 hover:text-white border-none shadow-sm"
                        )}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 5:
        if (activePlanId === 'enterprise' || activePlanId === 'growth') {
          return (
            <div className={`space-y-6 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2"> {activePlanId === 'enterprise' ? 'Request a Callback' : 'Your Phone Details'}</h2>
                <p className="text-gray-600">
                  {activePlanId === 'enterprise' ? 'Please provide your phone number so our team can reach out to you regarding your Enterprise plan.' : 'Phone number is required for verification and account-related updates.'}
                </p>
              </div>

              <div className="max-w-md mx-auto mt-10">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Controller
                      name="step5.phoneNumber"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <input
                          type="tel"
                          inputMode='numeric'
                          value={value || ''}
                          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="98765 43210"
                          className={`w-full pl-10 pr-3 py-3 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${errors.step5?.phoneNumber ? 'border-red-300' : 'border-gray-300'}`}
                          onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                        />
                      )}
                    />
                  </div>
                  {errors.step5?.phoneNumber && <p className="text-sm text-red-600 mt-2">{errors.step5.phoneNumber.message}</p>}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className={`space-y-6 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
            <div>
              <h2 className="text-2xl hidden sm:block font-semibold text-gray-900 mb-2">
                Invite your team to {formData.step1.companyName || 'your workspace'}
              </h2>
              <h2 className="text-2xl sm:hidden font-semibold text-gray-900 mb-2">Invite your team</h2>
              <p className="text-gray-600 hidden sm:block">
                Collaborate with your team members by inviting them to join your workspace.
                They&apos;ll be able to access conversations and help manage customer communications.
              </p>
              <p className="text-gray-600 sm:hidden">Collaborate with your team members by inviting them to join your workspace.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black mb-3">Add team members (up to {teamMemberLimit})</h3>
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Enter email address"
                    disabled={teamMembers.length >= teamMemberLimit}
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 border-gray-300 ${teamMembers.length >= teamMemberLimit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
                  />
                </div>
                <button
                  onClick={addTeamMember}
                  disabled={teamMembers.length >= teamMemberLimit}
                  className={`px-4 py-2 rounded-md text-sm sm:text-base flex items-center transition-all duration-200 ${teamMembers.length >= teamMemberLimit ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-700 text-white hover:bg-green-800 hover:shadow-md'}`}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>
              {teamMembers.length >= teamMemberLimit && <p className="text-sm text-gray-500 mt-2">Maximum of {teamMemberLimit} team members reached</p>}
            </div>

            {teamMembers.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Team members ({teamMembers.length}/{teamMemberLimit})</h4>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.email} className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex items-center flex-1 space-x-3">
                        <div className={`w-10 h-10 rounded-full ${getProfileColor(member.email)} flex items-center justify-center text-white font-medium text-sm`}>
                          {getInitials(member.email)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{member.email}</p>
                          <p className="text-xs text-gray-500">Team member</p>
                        </div>
                      </div>
                      <button onClick={() => removeMember(member.email)} className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{teamMembers.length}</strong> team member{teamMembers.length > 1 ? 's' : ''} will be invited
                  </p>
                </div>
              </div>
            )}

            {teamMembers.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                <p className="text-gray-500 hidden sm:block">Add up to {teamMemberLimit} email addresses to start building your team</p>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className={`space-y-6 flex flex-col items-center justify-center h-full transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
            <div className="text-center max-w-lg">
              <div className="mx-auto w-48 h-48 mb-6 flex items-center justify-center">
                <Lottie
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  animationData={require('./Success.json')}
                  loop={false}
                  autoplay={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              {activePlanId === 'enterprise' ? (
                <>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-4">Request Received!</h2>
                  <p className="text-gray-600 mb-8">Success! We will call you back shortly to discuss your detailed requirements and set up your Enterprise environment.</p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-4">Welcome to Heidel AI!</h2>
                  <p className="text-gray-600 hidden sm:block mb-8">
                    {formData.step1.companyName ? `${formData.step1.companyName}'s` : 'Your'} workspace is ready to use. You can now start managing your customer conversations and collaborating with your team 🎉
                  </p>
                  <p className="text-gray-600 mb-8 sm:hidden">
                    {formData.step1.companyName ? `${formData.step1.companyName}'s` : 'Your'} workspace is ready to use. We&apos;re excited to have you on board with us 🎉
                  </p>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      <div className="min-h-screen flex justify-center items-center overflow-hidden bg-white">
        <div className="w-full mx-auto px-4 py-6 sm:p-6 ">
          <div className="bg-white h-full rounded-xl transition-shadow duration-300">
            <div className="flex h-screen sm:h-[calc(100vh-3rem)]">
              {/* Sidebar - Fixed */}
              <div className="w-96 bg-[#f0f0f0] rounded-xl hidden sm:flex p-6  flex-col flex-shrink-0">
                <div
                  className="absolute left-36 bottom-8 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: "url('/heidelai.png')",
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    width: '350px',
                    height: '350px',
                    filter: 'grayscale(100%) brightness(0.5)',
                    clipPath: 'inset(0% 25% 0% 0%)'
                  }}
                ></div>

                <div className="mb-14 relative z-10">
                  <div className="flex items-center mb-6 space-x-2">
                    <div className="w-12 h-12 rounded flex items-center justify-center transition-colors duration-200">
                      <img src="/heidelai.png" alt="HeidelAI Logo" className='w-full text-black h-full' />
                    </div>
                    <span className="text-xl font-semibold">Heidel AI</span>
                  </div>
                </div>

                <div className="flex-1 relative z-10">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-start space-x-3 transition-all duration-200 ${currentStep > 2 && step.id <= 2 ? 'cursor-default' : 'cursor-pointer'} ${(step.id <= currentStep || step.completed) && !(currentStep > 2 && step.id <= 2) ? 'hover:bg-blue-100 rounded-lg p-2 -m-2' : ''}`}
                      onClick={() => handleStepClick(step.id)}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-600 text-white ' : currentStep === step.id ? 'bg-green-600 text-white ring-4 ring-green-200 ' : 'bg-gray-200 text-gray-500'} transition-all duration-300`}>
                          {step.completed ? <Check className="w-5 h-5" /> : step.icon}
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`w-px h-12 ml-5 mt-2 transition-colors duration-300 ${step.completed ? 'bg-green-300' : 'bg-gray-300'}`}></div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center relative z-10">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:bg-white hover:bg-opacity-50 px-3 py-2 rounded-md" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to home</span>
                  </button>
                </div>
              </div>

              {/* Main Content - Scrollable */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-1 pt-2 sm:pt-12 pb-24 sm:pb-12 sm:px-20">
                  {renderStepContent()}
                </div>

                {/* Navigation - Fixed at bottom */}
                <div className="flex-shrink-0 px-4 sm:px-20 sm:pb-6 fixed sm:relative bottom-0 left-0 right-0 bg-transparent backdrop-blur-sm sm:bg-white border-t border-gray-200">
                  <div className="flex items-center justify-between pt-4 md:pt-6">
                    <div>
                      {currentStep > 1 && currentStep !== 3 && (
                        <button
                          onClick={handleBack}
                          className="flex items-center text-gray-600 hover:text-gray-800 transition-all duration-200 hover:bg-gray-100 px-3 py-2 rounded-md"
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Back</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {currentStep === 5 && activePlanId !== 'enterprise' && activePlanId !== 'growth' && (
                        <button
                          onClick={handleSkip}
                          className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md transition-all duration-200 hover:bg-gray-100 text-sm"
                        >
                          <span className="hidden sm:inline">Skip this step</span>
                          <span className="inline sm:hidden">Skip</span>
                        </button>
                      )}

                      <button
                        onClick={handleNext}
                        disabled={loading || isResending}
                        className="px-4 md:px-6 py-2 rounded-md flex items-center transition-all duration-200 hover:shadow-lg transform hover:scale-105 bg-green-700 text-white hover:bg-green-800 text-sm md:text-base"
                      >
                        {(loading || isResending) ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                            <span className="hidden sm:inline">{currentStep === 2 ? "Verifying..." : "Processing..."}</span>
                            <span className="inline sm:hidden">Loading...</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">
                              {currentStep === 4
                                ? (activePlanId === 'free' ? 'Continue' : activePlanId === 'growth' ? 'Continue to Payment' : 'Request Callback')
                                : currentStep === 5 && teamMembers.length > 0
                                  ? `Invite ${teamMembers.length} people`
                                  : currentStep === 6
                                    ? activePlanId !== 'enterprise' ? 'Continue to Dashboard' : 'Continue'
                                    : 'Save and continue'
                              }
                            </span>
                            <span className="inline sm:hidden">
                              {currentStep === 4
                                ? (activePlanId === 'free' ? 'Continue' : activePlanId === 'growth' ? 'Pay Now' : 'Request Call')
                                : currentStep === 5 && teamMembers.length > 0
                                  ? `Invite`
                                  : currentStep === 6
                                    ? activePlanId !== 'enterprise' ? 'Continue to Dashboard' : 'Continue'
                                    : 'Save'
                              }
                            </span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="hidden sm:flex justify-center mt-6 space-x-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`h-2 w-16 rounded-full transition-all duration-300 ${step === currentStep ? 'bg-green-700' : step < currentStep ? 'bg-gray-300' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MultiStepLoader
        loadingStates={[{ text: "Verifying" }, { text: "Creating Account" }, { text: "Setting up Workspace" }]}
        loading={loading && currentStep === 6 && activePlanId !== 'enterprise'}
        duration={1500}
        loop={false}
      />
    </>
  );
};

export default OnboardingFlow;