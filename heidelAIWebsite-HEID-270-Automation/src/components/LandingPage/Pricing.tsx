import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
	{
		id: 'free',
		title: 'Free',
		tagline: 'Start small, dream big',
		description:
			'Explore core features and see how HeidelAI fits your workflow—no commitment.',
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
		description:
			'Unlock advanced automation and AI-powered conversations built for scaling teams.',
		price: '₹2199',
		duration: '/month',
		features: [
			'Advanced AI chat with smart lead scoring',
			'Automated follow-ups that drive action',
			'AI product recommendations during chats',
			'Multi-channel support (WhatsApp, Instagram, Facebook, Telegram)',
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
		description:
			'Custom features, deeper integrations, and dedicated support tailored to your business.',
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

interface PricingProps {
	showHeader?: boolean;
	showToggle?: boolean;
}

const Pricing = ({ showHeader = true, showToggle = true }: PricingProps) => {
	const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
	const [activeCardId, setActiveCardId] = useState<string>('growth');

	return (
		<section id="pricing" className={cn("relative z-10 bg-white pb-24 md:pb-32", showHeader && "py-16 md:py-24")}>
			{showHeader && (
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
					<div className="flex flex-col items-center gap-4 text-center">
						<h2 className="text-4xl md:text-6xl font-[400] text-gray-800 leading-tight italic"
							style={{ fontFamily: "'Awesome Serif', serif" }}>
							Plans built for every business. Pick yours.
						</h2>
						<p className="text-lg md:text-xl max-w-[800px] font-medium text-gray-500 font-inter mt-4">
							From your first customer to enterprise scale—flexible pricing that grows with you, with all the features you need at every stage.
						</p>
					</div>
				</div>
			)}

			{showToggle && (
				<div className="flex justify-center px-2 mb-12">
					<div className="relative flex w-full max-w-[280px] sm:max-w-[320px] rounded-full bg-gray-100 p-1">
						<div
							className={cn(
								"absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full bg-black transition-transform duration-300 ease-in-out",
								plan === 'yearly' && "translate-x-full"
							)}
						/>
						<button
							onClick={() => setPlan('monthly')}
							className={cn(
								"relative z-10 flex-1 rounded-full py-2.5 text-sm sm:text-base font-medium transition-colors font-inter",
								plan === 'monthly' ? "text-white" : "text-gray-500"
							)}
						>
							Monthly
						</button>
						<button
							onClick={() => setPlan('yearly')}
							className={cn(
								"relative z-10 flex-1 rounded-full py-2.5 text-sm sm:text-base font-medium transition-colors font-inter",
								plan === 'yearly' ? "text-white" : "text-gray-500"
							)}
						>
							Yearly
						</button>
					</div>
				</div>
			)}

			<div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
				{plans.map((item) => (
					<Card
						key={item.id}
						onClick={() => setActiveCardId(item.id)}
						className={cn(
							"relative flex flex-col transition-all duration-500 rounded-3xl font-inter cursor-pointer overflow-hidden",
							item.id === 'growth'
								? "p-[1.5px] bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] shadow-[0_20px_50px_rgba(255,87,34,0.15)]"
								: activeCardId === item.id
									? "border-[1.5px] border-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
									: "border-[1.5px] border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
						)}
					>
						<div className={cn(
							"flex flex-col h-full bg-white transition-all duration-500",
							item.id === 'growth' ? "p-[30.5px] rounded-[22.5px]" : "p-8"
						)}>
							<div className="mb-6">
								<h3 className="text-3xl font-semibold text-gray-900 mb-8 font-inter">
									{item.title}
								</h3>

								<div className="space-y-2 mb-6">
									<p className="text-xl font-medium text-gray-900 leading-tight font-inter">
										{item.tagline}
									</p>
									<p className="text-[15px] text-gray-500 leading-relaxed font-medium font-inter">
										{item.description}
									</p>
								</div>

								<div className="flex flex-col gap-1 mt-6">
									{plan === 'yearly' && item.id === 'growth' && (
										<div className="flex items-center gap-2">
											<span className="text-lg text-gray-400 line-through font-inter">{item.price}</span>
											<span className="bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
												-10% Discount
											</span>
										</div>
									)}
									<div className="flex items-baseline gap-1">
										<span className="text-4xl font-bold text-gray-900 font-inter">
											{plan === 'yearly' && item.id === 'growth' ? `₹${Math.round(parseInt(item.price.replace('₹', '')) * 0.9)}` : item.price}
										</span>
										{item.duration && (
											<span className="text-gray-500 font-medium text-lg font-inter">{item.duration}</span>
										)}
									</div>
								</div>
							</div>

							<div className="h-[1px] w-full bg-gray-200" />

							<div className="flex-1 py-4">
								<ul className="space-y-5">
									{item.features.map((feature, idx) => (
										<li key={idx} className="flex items-start gap-3">
											<div className="mt-1 flex-shrink-0">
												<Check
													className={cn(
														"h-5 w-5",
														item.id === 'growth' ? "text-[#ff5722]" : "text-gray-900"
													)}
													strokeWidth={2.5}
												/>
											</div>
											<span className="text-[14px] text-gray-700 leading-snug font-medium font-inter">
												{feature}
											</span>
										</li>
									))}
								</ul>
							</div>

							<div className="h-[1px] w-full bg-gray-100 my-5" />

							<Button
								className={cn(
									"w-full h-14 rounded-xl text-lg font-bold transition-all duration-300 font-inter",
									item.id === 'growth'
										? "bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] hover:opacity-90 text-white border-none shadow-md"
										: "bg-black hover:bg-zinc-800 text-white border-none shadow-sm"
								)}
							>
								{item.cta}
							</Button>
						</div>
					</Card>
				))}
			</div>
		</section>
	);
};

export default Pricing;
