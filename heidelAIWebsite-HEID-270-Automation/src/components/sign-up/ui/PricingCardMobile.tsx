"use client";

import { cn } from "@/components/cn"; // Adjust path as needed
import { CheckCircle2, Circle } from "lucide-react";
import { AnimatedPrice } from "./AnimatedPrice";

// 1. Define the Interface (or import it if shared)
interface PricingCardProps {
    item: {
        id: string;
        title: string;
        tagline: string;
        price: string;
        duration: string;
        highlighted?: boolean;
    };
    plan: 'monthly' | 'yearly';
    activeCardId: string;
    setActiveCardId: (id: string) => void;
    isSelected: boolean;
}

// 3. The Main Mobile Component
export const PricingCardMobile = ({ item, plan, activeCardId, setActiveCardId, isSelected }: PricingCardProps) => {
    
    // --- Logic for Price Calculation ---
    const basePrice = parseInt(item.price.replace('₹', '')) || 0;
    const isYearlyGrowth = plan === 'yearly' && item.id === 'growth';

    const finalPriceString = isYearlyGrowth
        ? `₹${Math.round(basePrice * 0.9)}`
        : item.price;

    return (
        <div
            onClick={() => setActiveCardId(item.id)}
            // Outer Wrapper: Handles Gradient Border & Shadow
            className={cn(
                "relative rounded-xl transition-all duration-300 cursor-pointer w-full",
                isSelected
                    ? "p-[2px] bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] shadow-[0_8px_30px_rgba(255,87,34,0.15)]"
                    : "border border-gray-200"
            )}
        >
            {/* Inner Content: White Background */}
            <div className={cn(
                "flex items-center justify-between p-4 bg-white rounded-[10px] h-full",
                isSelected ? "bg-white" : ""
            )}>
                
                {/* LEFT SIDE: Radio + Title */}
                <div className="flex items-center gap-3">
                    <div className={cn("flex-shrink-0 transition-colors", isSelected ? "text-[#ff5722]" : "text-gray-300")}>
                        {isSelected ? (
                            <CheckCircle2 className="w-6 h-6 fill-[#ff5722] text-white" />
                        ) : (
                            <Circle className="w-6 h-6" />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <span className="font-semibold text-sm text-gray-900 flex items-center gap-1">
                            {item.title}
                            {/* Optional: Add Popular badge if highlighted */}
                            {isYearlyGrowth && (
                                <span className="text-[10px] bg-gradient-to-r from-[#ff8c00] to-[#ff1744] text-white px-1.5  rounded-full font-semibold my-1 tracking-wide">
                                    -10%
                                </span>
                            )}
                        </span>
                        <span className="text-xs text-gray-500">
                            {item.tagline}
                        </span>
                    </div>
                </div>

                {/* RIGHT SIDE: Price Logic */}
                <div className="text-right flex flex-col items-end">
                    
                    {/* Discount UI: Show original price crossed out if discount applies */}

                    <div className="font-bold text-gray-900 tabular-nums">
                        {item.price === 'On Request' ? (
                            <span className="text-sm">On Request</span>
                        ) : (
                            <>
                            {isYearlyGrowth && (
                                <span className="text-xs text-gray-400 line-through mr-2">
                                    {item.price}
                                </span>
                            )}
                            <AnimatedPrice price={finalPriceString} />
                            </>
                        )}
                    </div>

                    {item.duration && (
                        <div className="text-[10px] text-gray-400">
                            {item.duration}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}