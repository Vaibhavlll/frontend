"use client";

import { useState } from "react";
import { cn } from "../cn"; // Adjust path if needed
import { PricingCardDesktop } from "./ui/PricingCardDesktop";
import { Loader2, Check } from "lucide-react";
import { PricingCardMobile } from "./ui/PricingCardMobile";

const plans = [
    {
        id: 'free',
        title: 'Free',
        tagline: 'Start small, dream big',
        description: 'Explore core features and see how HeidelAI fits your workflow—no commitment.',
        price: '₹0',
        duration: '/month',
        features: [
            'Unified inbox across channels',
            'AI chat for instant replies',
            'Basic automation and follow-ups',
            'Media sharing inside chats',
            'Seen & delivered message status',
        ],
        cta: 'Get Started',
    },
    {
        id: 'growth',
        title: 'Growth',
        tagline: 'Your complete growth engine',
        description: 'Unlock advanced automation and AI-powered conversations built for scaling teams.',
        price: '₹2199',
        duration: '/month',
        features: [
            'Advanced AI chat with smart lead scoring',
            'Automated follow-ups that drive action',
            'AI product recommendations during chats',
            'Multi-channel support (WhatsApp, Instagram, Facebook)',
            'Real-time analytics with actionable insights',
            'Shopify, WordPress & WhatsApp ads integration',
        ],
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
        features: [
            'Fully custom AI & automations',
            'Deep integrations & advanced analytics',
            'Dedicated setup & support',
            'Team collaboration & live handoff',
        ],
        cta: 'Get Started',
    },
]

interface PricingPlansProps {
    onSelectPlan: (planId: string) => void;
    loading: boolean;
}

export const PricingPlans = ({ onSelectPlan, loading }: PricingPlansProps) => {
    const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [activeCardId, setActiveCardId] = useState<string>('growth');

    // Helper to find the currently active plan details for mobile view
    const activePlanData = plans.find(p => p.id === activeCardId) || plans[0];

    return (
        <div className="bg-white  flex flex-col items-center w-full mx-auto rounded-lg pb-32 md:pb-0">

            {/* Duration Toggle */}
            <div className="flex justify-center w-full px-2 mb-6">
                <div className="relative flex w-full max-w-[180px] sm:max-w-[200px] rounded-full bg-gray-100 p-1">
                    <div
                        className={cn(
                            "absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full bg-black transition-transform duration-300 ease-in-out",
                            plan === 'yearly' && "translate-x-full"
                        )}
                    />
                    <button
                        onClick={() => setPlan('monthly')}
                        className={cn(
                            "relative z-10 flex-1 rounded-full py-2 text-xs sm:text-xs font-medium transition-colors font-inter",
                            plan === 'monthly' ? "text-white" : "text-gray-500"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setPlan('yearly')}
                        className={cn(
                            "relative z-10 flex-1 rounded-full py-2 text-xs sm:text-xs font-medium transition-colors font-inter",
                            plan === 'yearly' ? "text-white" : "text-gray-500"
                        )}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            {/* Plan Selectors (Desktop) */}
            <div className='hidden md:grid max-w-5xl mx-auto grid-cols-3 gap-8'>
                {plans.map((item) => {
                    const isSelected = activeCardId === item.id;
                    return (
                        <PricingCardDesktop
                            key={item.id}
                            item={item}
                            plan={plan}
                            isSelected={isSelected}
                            activeCardId={activeCardId}
                            setActiveCardId={setActiveCardId}
                        />
                    )
                })}
            </div>

            {/* Plan Selectors (Mobile) */}
            <div className="block md:hidden w-full px-4">
                <div className="flex flex-col gap-4">
                    {plans.map((item) => {
                        const isSelected = activeCardId === item.id;
                        return (
                            <PricingCardMobile 
                                key={item.id}
                                item={item}
                                plan={plan}
                                isSelected={isSelected}
                                activeCardId={activeCardId}
                                setActiveCardId={setActiveCardId}
                            />
                        )
                    })}
                </div>

                {/* Features List (Mobile) */}
                <div 
                    key={activeCardId} 
                    className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-bold text-gray-900">
                            Included in {activePlanData.title}:
                        </span>
                        <div className="h-px flex-1 bg-gray-100"></div>
                    </div>
                    
                    <ul className="space-y-2 pl-1">
                        {activePlanData.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <Check className={cn(
                                        "h-4 w-4",
                                        // Use brand orange for checks to match border
                                        "text-green-600" 
                                    )} strokeWidth={3} />
                                </div>
                                <span className="text-sm text-gray-600 leading-snug font-medium font-inter">
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>


            {/* Submit Button  */}
            <div className="fixed bottom-0 w-full left-0 right-0 p-4 bg-white/80 backdrop-blur-xs  md:static md:bg-transparent md:border-none md:p-0 z-50 pb-4 md:pb-0">
                <div className="max-w-xs mx-auto flex justify-center">
                    <button
                        onClick={() => onSelectPlan(activeCardId + (plan === 'yearly' ? '_yearly' : '_monthly'))}
                        disabled={loading}
                        className="w-full md:mt-10 px-5 py-3.5 md:py-2.5 bg-black hover:bg-zinc-800 hover:cursor-pointer text-white rounded-xl md:rounded-lg font-medium transition-colors flex justify-center items-center shadow-xl md:shadow-none text-sm md:text-base"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Select & Continue"}
                    </button>
                </div>
            </div>
        </div>
    )
}