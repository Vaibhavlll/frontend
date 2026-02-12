import { Card } from '@/components/LandingPage/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedPrice } from './AnimatedPrice';

export interface PricingCardProps {
    item: {
        id: string;
        title: string;
        tagline: string;
        description: string;
        price: string;
        duration: string;
        features: string[];
        cta: string;
        highlighted?: boolean;
    };
    plan: 'monthly' | 'yearly';
    activeCardId: string;
    setActiveCardId: (id: string) => void;
    isSelected: boolean;
}

export const PricingCardDesktop = ({ item, plan, activeCardId, setActiveCardId, isSelected }: PricingCardProps) => {
    // Parse the base price (remove ₹)
    const basePrice = parseInt(item.price.replace('₹', '')) || 0;

    // Check if discount applies
    const isYearlyGrowth = plan === 'yearly' && item.id === 'growth';

    // Calculate final amount
    const finalPriceString = isYearlyGrowth
        ? `₹${Math.round(basePrice * 0.9)}`
        : item.price;

    return (
        <Card
            key={item.id}
            onClick={() => setActiveCardId(item.id)}
            className={cn(
                "relative flex flex-col transition-all duration-500 rounded-3xl font-inter cursor-pointer overflow-hidden",
                isSelected
                    ? "p-[1.5px] bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] shadow-[0_20px_50px_rgba(255,87,34,0.15)] transform scale-[1.02]"
                    : "border-[1.5px] border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:border-gray-200"
            )}
        >
            <div className={cn("flex flex-col h-full bg-white transition-all duration-500 p-6", isSelected ? "rounded-[22.5px]" : "")}>
                <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 font-inter">{item.title}</h3>

                    <div className="flex flex-col gap-1 mt-2">


                        {/* Discount Badge & Strikethrough (Only for Yearly Growth) */}
                        {isYearlyGrowth && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="text-lg text-gray-400 line-through font-inter">
                                    {item.price}
                                </span>
                                <span className="bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] text-white text-xs font-semibold px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                                    -10% Discount
                                </span>
                            </div>
                        )}

                        {/* Animated Price Display */}
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900 font-inter tabular-nums">
                                {/* Only animate if it's a number (handles "On Request" case) */}
                                {item.price === 'On Request' ? (
                                    item.price
                                ) : (
                                    <AnimatedPrice price={finalPriceString} />
                                )}
                            </span>

                            {item.duration && (
                                <span className="text-gray-500 font-medium text-sm font-inter">
                                    {item.duration}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="h-[1px] w-full bg-gray-200" />
                <div className="flex-1 py-4">
                    <ul className="space-y-3">
                        {item.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <div className=" flex-shrink-0">
                                    <Check className={cn("h-5 w-5", isSelected ? "text-[#ff5722]" : "text-gray-900")} strokeWidth={2.5} />
                                </div>
                                <span className="text-xs text-gray-700 leading-snug font-medium font-inter">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </Card>
    )
}