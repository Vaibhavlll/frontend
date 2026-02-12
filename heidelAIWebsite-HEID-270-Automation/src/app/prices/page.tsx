'use client'

import React, { useState } from 'react';
import { Card } from '@/components/LandingPage/ui/card';
import { Button } from '@/components/LandingPage/ui/button';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ConsultationDrawer } from '@/components/ConsultationDrawer';

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

const activeFeatureGroups = [
    {
        title: "Messaging & Contacts",
        features: [
            { name: "Tags", free: "3", growth: "30", enterprise: "Custom", note: "" },
            { name: "Messaging Contacts", free: "1000", growth: "1750", enterprise: "Custom", note: "Once reach limit cannot delete contacts" },
        ]
    },
    {
        title: "Automation & AI",
        features: [
            { name: "AI Chat", free: "NA", growth: "2250", enterprise: "Custom", note: "2250 requests per month" },
            { name: "Customer buying intent segregation", free: "NA", growth: "2250", enterprise: "Custom", note: "Total API calls/requests per month" },
            { name: "Conversation summary", free: "NA", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Product recommendation", free: "NA", growth: "YES", enterprise: "Custom", note: "" },
        ]
    },
    {
        title: "Messaging & Media",
        features: [
            { name: "Seen, Delivered notification", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Video Support", free: "Yes", growth: "YES", enterprise: "Custom", note: "Free: 25mb limit, Growth: 40mb limit" },
            { name: "Image support", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Document support", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Reaction support", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
        ]
    },
    {
        title: "Tools & Integrations",
        features: [
            { name: "Wordpress", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Telegram", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Private Notes", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Canned Responses", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Create Template", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Reminder feature", free: "Yes & No", growth: "Yes & No", enterprise: "Custom", note: "Yes for dashboard, no for email (Paid fixes email)" },
        ]
    }
];

const comingSoonFeatureGroups = [
    {
        title: "Coming Soon: Marketing & Scaling",
        features: [
            { name: "Broadcast limit", free: "YES", growth: "YES", enterprise: "Custom", note: "Free: 50 per batch, 2000/mo. Growth: 350 per batch, 15000/mo" },
            { name: "CTWA Ads Dashboard", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Draft", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Shopify", free: "YES", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Web Chat widget", free: "Yes", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Round robin assignment", free: "NA", growth: "YES", enterprise: "Custom", note: "" },
        ]
    },
    {
        title: "Coming Soon: Advanced Contacts & AI",
        features: [
            { name: "Contacts storage", free: "NO LIMIT", growth: "NO LIMIT", enterprise: "Custom", note: "" },
            { name: "Contacts update", free: "NO LIMIT", growth: "NO LIMIT", enterprise: "Custom", note: "" },
            { name: "Contact Import", free: "NO LIMIT", growth: "NO LIMIT", enterprise: "Custom", note: "" },
            { name: "Contact Export", free: "NA", growth: "NO LIMIT", enterprise: "Custom", note: "" },
            { name: "Automation", free: "2 & 300", growth: "5 & 700", enterprise: "Custom", note: "Growth: 5 concurrent, 700 triggers/mo" },
            { name: "Nos of Agents", free: "1", growth: "4", enterprise: "Custom", note: "Growth: 1 Owner + 3 Employees" },
            { name: "Auto Follow-up", free: "NA", growth: "YES", enterprise: "Custom", note: "" },
            { name: "Transfer Limit", free: "No limit", growth: "NO LIMIT", enterprise: "Custom", note: "" },
            { name: "Upload Data-Section", free: "YES", growth: "YES", enterprise: "Custom", note: "Includes company details, products upload" },
        ]
    }
];

export default function PricesPage() {
    const [planCycle, setPlanCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [activeCardId, setActiveCardId] = useState<string>('growth');
    const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-white font-inter">
            <main className="pt-32 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-20">
                    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-10 md:gap-12">
                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[400] text-gray-800 leading-tight italic"
                                style={{ fontFamily: "'Awesome Serif', serif" }}>
                                Plans built for every business. Pick yours.
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-gray-500 font-medium max-w-[800px] mt-4 mx-auto lg:mx-0">
                                Compare our plans and find the right one for your company.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-6 sm:gap-8 md:gap-10">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative w-40 sm:w-40 h-20 sm:h-20 mb-1">
                                    <Image src="/logos/meta.png" alt="Meta Business" fill className="object-contain" priority />
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative w-40 sm:w-40 h-20 sm:h-20 mb-1">
                                    <Image src="/logos/microsoft.png" alt="Microsoft" fill className="object-contain" priority />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                    <div className="flex flex-col gap-4 mb-12">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Billing</div>
                        <div className="relative flex w-full max-w-[280px] rounded-2xl bg-gray-100 p-1.5 border border-gray-200/50 shadow-inner">
                            <button onClick={() => setPlanCycle('monthly')} className={cn("relative z-10 flex-1 rounded-xl py-3 text-[14px] font-bold transition-all duration-300 font-inter", planCycle === 'monthly' ? "bg-white text-gray-900 shadow-md" : "text-gray-400 hover:text-gray-500")}>Monthly</button>
                            <button onClick={() => setPlanCycle('yearly')} className={cn("relative z-10 flex-1 rounded-xl py-3 text-[14px] font-bold transition-all duration-300 font-inter", planCycle === 'yearly' ? "bg-white text-gray-900 shadow-md" : "text-gray-400 hover:text-gray-500")}>Yearly</button>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
                        {plans.map((item) => (
                            <Card key={item.id} onClick={() => setActiveCardId(item.id)} className={cn("relative flex flex-col transition-all duration-500 rounded-3xl font-inter cursor-pointer overflow-hidden", item.id === 'growth' ? "p-[1.5px] bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] shadow-[0_20px_50px_rgba(255,87,34,0.15)]" : activeCardId === item.id ? "border-[1.5px] border-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)]" : "border-[1.5px] border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.1)]")}>
                                <div className={cn("flex flex-col h-full bg-white transition-all duration-500", item.id === 'growth' ? "p-[30.5px] rounded-[22.5px]" : "p-8")}>
                                    <div className="mb-6">
                                        <h3 className="text-3xl font-semibold text-gray-900 mb-8 font-inter">{item.title}</h3>
                                        <div className="space-y-2 mb-6">
                                            <p className="text-xl font-medium text-gray-900 leading-tight font-inter">{item.tagline}</p>
                                            <p className="text-[15px] text-gray-500 leading-relaxed font-medium font-inter">{item.description}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 mt-6">
                                            {planCycle === 'yearly' && item.id === 'growth' && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg text-gray-400 line-through font-inter">{item.price}</span>
                                                    <span className="bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">-10% Discount</span>
                                                </div>
                                            )}
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold text-gray-900 font-inter">
                                                    {planCycle === 'yearly' && item.id === 'growth' ? `₹${Math.round(parseInt(item.price.replace('₹', '')) * 0.9)}` : item.price}
                                                </span>
                                                {item.duration && <span className="text-gray-500 font-medium text-lg font-inter">{item.duration}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[1px] w-full bg-gray-200" />
                                    <div className="flex-1 py-4">
                                        <ul className="space-y-5">
                                            {item.features.slice(0, 5).map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <div className="mt-1 flex-shrink-0"><Check className={cn("h-5 w-5", item.id === 'growth' ? "text-[#ff5722]" : "text-gray-900")} strokeWidth={2.5} /></div>
                                                    <span className="text-[14px] text-gray-700 leading-snug font-medium font-inter">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="h-[1px] w-full bg-gray-100 my-5" />
                                    <Button className={cn("w-full h-14 rounded-xl text-lg font-bold transition-all duration-300 font-inter", item.id === 'growth' ? "bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] hover:opacity-90 text-white border-none shadow-md" : "bg-black hover:bg-zinc-800 text-white border-none shadow-sm")}>{item.cta}</Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className='flex justify-center mt-12'>
                        <button onClick={() => { document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" }) }} className="px-10 h-14 rounded-2xl border-2 border-gray-400 text-lg transition-all duration-300 font-inter hover:bg-gray-900 hover:text-white">Compare all features</button>
                    </div>
                </div>

                <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 md:mb-32'>
                    <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-gray-200 bg-white shadow-sm p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 relative z-10">
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2 tracking-tight font-inter">Discover our premium consulting services</h2>
                                <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed mb-6 font-inter max-w-xl">Tailored solutions: Our experts develop and implement strategies perfectly suited to your needs.</p>
                                <ConsultationDrawer>
                                    <Button className="bg-[#00a3ff] hover:bg-[#0092e6] text-white px-6 h-12 rounded-xl text-base font-inter font-bold transition-all border-none shadow-md shadow-blue-100 uppercase tracking-wide">Book a free consultation</Button>
                                </ConsultationDrawer>
                            </div>
                            <div className="relative flex-shrink-0 w-full md:w-[240px] h-[160px] md:h-[200px] flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full border border-blue-50/50 flex items-center justify-center">
                                        <div className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-full border border-blue-50 flex items-center justify-center">
                                            <div className="w-[100px] h-[100px] md:w-[160px] md:h-[160px] rounded-full bg-gradient-to-br from-blue-50/50 to-transparent" />
                                        </div>
                                    </div>
                                </div>
                                <div className="relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-full border-4 md:border-8 border-white shadow-xl overflow-hidden bg-white">
                                    <Image src="/consultant.png" alt="Consultant" fill className="object-cover" />
                                </div>
                                <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-50 cursor-pointer hover:translate-y-[-2px] transition-transform"><span className="text-xl md:text-2xl font-black text-gray-300">?</span></div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/30 to-transparent pointer-events-none" />
                    </div>
                </div>

                <div id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                    <div className='flex flex-col items-center text-center mb-12 sm:mb-20'>
                        <h2 className='text-3xl md:text-4xl font-bold font-inter text-gray-900 mb-4 tracking-tight font-inter'>Find the plan that suits you</h2>
                        <p className='text-base md:text-lg font-medium font-inter text-gray-600 max-w-2xl'>Compare all plans and features to find the right plan for you and your team.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        <div className="hidden lg:block lg:w-[260px] lg:sticky lg:top-32 z-30">
                            <div className="flex flex-col gap-4">
                                <div className="text-[11px] font-bold font-inter text-gray-400 uppercase tracking-widest ml-1">Billing</div>
                                <div className="relative flex w-full max-w-[280px] rounded-2xl bg-gray-100 p-1.5 border border-gray-200/50 shadow-inner">
                                    <button onClick={() => setPlanCycle('monthly')} className={cn("relative z-10 flex-1 rounded-xl py-3 text-[14px] font-bold transition-all duration-300 font-inter", planCycle === 'monthly' ? "bg-white text-gray-900 shadow-md" : "text-gray-400 hover:text-gray-500")}>Monthly</button>
                                    <button onClick={() => setPlanCycle('yearly')} className={cn("relative z-10 flex-1 rounded-xl py-3 text-[14px] font-bold transition-all duration-300 font-inter", planCycle === 'yearly' ? "bg-white text-gray-900 shadow-md" : "text-gray-400 hover:text-gray-500")}>Yearly</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <div className="hidden md:block overflow-x-auto lg:overflow-visible">
                                <div className="min-w-[800px]">
                                    <div className="sticky top-32 z-40 bg-white shadow-sm border-b border-gray-100 grid grid-cols-4 items-center h-36 px-8 rounded-t-[2rem]">
                                        <div className="text-sm font-bold font-inter text-gray-400 uppercase tracking-widest">Features</div>
                                        <div className="text-center flex flex-col items-center gap-1">
                                            <div className="font-bold font-inter text-gray-900 text-xl md:text-2xl">Free</div>
                                            <div className="text-sm font-semibold text-gray-400 font-inter">₹0/mo</div>
                                        </div>
                                        <div className="text-center flex flex-col items-center">
                                            <div className="font-bold font-inter text-orange-600 text-xl md:text-2xl">Growth</div>
                                            <div className="flex flex-col items-center mt-1">
                                                {planCycle === 'yearly' && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm text-gray-400 line-through font-inter font-medium">₹2199</span>
                                                        <span className="bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight">-10%</span>
                                                    </div>
                                                )}
                                                <div className="text-lg font-bold text-gray-900 font-inter leading-none">
                                                    {planCycle === 'yearly' ? '₹1979' : '₹2199'}<span className="text-sm text-gray-400 font-medium lowercase ml-1">/mo</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center flex flex-col items-center gap-1">
                                            <div className="font-bold font-inter text-gray-900 text-xl md:text-2xl">Enterprise</div>
                                            <div className="text-sm font-semibold text-gray-400 font-inter italic">On Request</div>
                                        </div>
                                    </div>

                                    <div className="bg-white border-x border-b border-gray-100 rounded-b-[2rem] overflow-hidden">
                                        {[...activeFeatureGroups, ...comingSoonFeatureGroups].map((group, groupIdx) => (
                                            <div key={groupIdx} className="border-t border-gray-100 first:border-t-0">
                                                <div className="bg-gray-50/50 px-6 sm:px-8 py-4 text-xs sm:text-sm font-bold font-inter text-gray-900 uppercase tracking-wide">{group.title}</div>
                                                {group.features.map((feature, featureIdx) => {
                                                    const renderValue = (val: string, isGrowth?: boolean, isEnterprise?: boolean) => {
                                                        if (isEnterprise) return <span className="text-gray-900 font-bold italic">Custom</span>;
                                                        if (val === "Yes" || val === "YES") {
                                                            return <Check className={cn("h-4 w-4 sm:h-5 sm:w-5", isGrowth ? "text-orange-600" : "text-gray-900")} strokeWidth={2.5} />;
                                                        }
                                                        if (val === "NA" || val === "NAT" || val === "NAT") return <span className="text-gray-300">—</span>;
                                                        if (val === "Custom") return <span className="text-gray-900 font-bold italic">Custom</span>;
                                                        return val;
                                                    };

                                                    return (
                                                        <div key={featureIdx} className="grid grid-cols-4 px-6 sm:px-8 py-5 sm:py-6 border-t border-gray-50/50 hover:bg-gray-50/30 transition-colors group">
                                                            <div className="flex flex-col pr-4">
                                                                <span className="text-sm sm:text-[15px] font-semibold font-inter text-gray-700">{feature.name}</span>
                                                                {feature.note && <span className="text-[10px] sm:text-[11px] text-gray-400 mt-1 font-medium italic leading-tight font-inter">{feature.note}</span>}
                                                            </div>
                                                            <div className="flex items-center justify-center text-sm sm:text-[15px] font-medium font-inter text-gray-600">
                                                                {renderValue(feature.free)}
                                                            </div>
                                                            <div className="flex items-center justify-center text-sm sm:text-[15px] font-bold font-inter text-gray-900">
                                                                {renderValue(feature.growth, true)}
                                                            </div>
                                                            <div className="flex items-center justify-center text-sm sm:text-[15px] font-medium font-inter text-gray-600">
                                                                {renderValue(feature.enterprise, false, true)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 grid grid-cols-4 px-8">
                                        <div className="hidden lg:block"></div>
                                        <div className="px-4"><Button className="w-full bg-black text-white font-inter rounded-xl h-12 text-sm font-bold">Get Started</Button></div>
                                        <div className="px-4"><Button className="w-full bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] text-white font-inter rounded-xl h-12 text-sm font-bold hover:opacity-90">Get Started</Button></div>
                                        <div className="px-4"><Button className="w-full bg-black text-white font-inter rounded-xl h-12 text-sm font-bold">Book a demo</Button></div>
                                    </div>
                                </div>
                            </div>


                            <div className="md:hidden w-full space-y-8">
                                {activeFeatureGroups.map((group, groupIdx) => (
                                    <div key={groupIdx} className="flex flex-col">
                                        <div className="text-[12px] font-bold font-inter text-gray-900 uppercase tracking-[0.15em] mb-4">{group.title}</div>
                                        <div className="border-t border-gray-100">
                                            {group.features.map((feature, featureIdx) => {
                                                const uniqueId = `${groupIdx}-${featureIdx}`;
                                                const isExpanded = expandedFeature === uniqueId;

                                                const renderMobileValue = (val: string, isGrowth?: boolean, isEnterprise?: boolean) => {
                                                    if (isEnterprise) return <span className="text-gray-900 font-bold italic">Custom</span>;
                                                    if (val === "Yes" || val === "YES") {
                                                        return <Check className={cn("h-4 w-4", isGrowth ? "text-orange-600" : "text-gray-900")} strokeWidth={2.5} />;
                                                    }
                                                    if (val === "NA" || val === "NAT") return <span className="text-gray-300">—</span>;
                                                    if (val === "Custom") return <span className="text-gray-900 font-bold italic">Custom</span>;
                                                    return val;
                                                };

                                                return (
                                                    <div key={featureIdx} className="border-b border-gray-100 bg-white">
                                                        <button
                                                            onClick={() => setExpandedFeature(isExpanded ? null : uniqueId)}
                                                            className="w-full flex items-center justify-between py-6 text-left"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-[15px] font-semibold font-inter text-gray-800">{feature.name}</span>
                                                                {feature.note && <span className="text-[11px] text-gray-400 mt-1 font-medium italic leading-tight font-inter">{feature.note}</span>}
                                                            </div>
                                                            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                                        </button>

                                                        <div className={cn(
                                                            "overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50",
                                                            isExpanded ? "max-h-[300px]" : "max-h-0"
                                                        )}>
                                                            <div className="py-6 space-y-4">
                                                                <div className="flex justify-between items-center px-2">
                                                                    <span className="text-sm font-medium text-gray-400 font-inter">Free</span>
                                                                    <div className="text-sm font-bold text-gray-900 font-inter">
                                                                        {renderMobileValue(feature.free)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center px-2">
                                                                    <span className="text-sm font-medium text-gray-400 font-inter">Growth</span>
                                                                    <div className="text-sm font-bold text-gray-900 font-inter">
                                                                        {renderMobileValue(feature.growth, true)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center px-2">
                                                                    <span className="text-sm font-medium text-gray-400 font-inter">Enterprise</span>
                                                                    <div className="text-sm font-bold text-gray-900 font-inter">
                                                                        {renderMobileValue(feature.enterprise, false, true)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {comingSoonFeatureGroups.map((group, groupIdx) => (
                                    <div key={`cs-${groupIdx}`} className="flex flex-col mt-8">
                                        <div className="text-[12px] font-bold font-inter text-gray-400 uppercase tracking-[0.15em] mb-4">{group.title}</div>
                                        <div className="border-t border-gray-100">
                                            {group.features.map((feature, featureIdx) => {
                                                const uniqueId = `cs-${groupIdx}-${featureIdx}`;
                                                const isExpanded = expandedFeature === uniqueId;

                                                const renderMobileValue = (val: string, isGrowth?: boolean, isEnterprise?: boolean) => {
                                                    if (isEnterprise) return <span className="text-gray-900 font-bold italic">Custom</span>;
                                                    if (val === "Yes" || val === "YES") {
                                                        return <Check className={cn("h-4 w-4", isGrowth ? "text-orange-600" : "text-gray-900")} strokeWidth={2.5} />;
                                                    }
                                                    if (val === "NA" || val === "NAT") return <span className="text-gray-300">—</span>;
                                                    if (val === "Custom") return <span className="text-gray-900 font-bold italic">Custom</span>;
                                                    return val;
                                                };

                                                return (
                                                    <div key={featureIdx} className="border-b border-gray-100 bg-white">
                                                        <button
                                                            onClick={() => setExpandedFeature(isExpanded ? null : uniqueId)}
                                                            className="w-full flex items-center justify-between py-6 text-left"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-[15px] font-semibold font-inter text-gray-400 italic">{feature.name}</span>
                                                            </div>
                                                            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                                        </button>

                                                        <div className={cn(
                                                            "overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50",
                                                            isExpanded ? "max-h-[300px]" : "max-h-0"
                                                        )}>
                                                            <div className="py-6 space-y-4">
                                                                <div className="flex justify-between items-center px-2">
                                                                    <span className="text-sm font-medium text-gray-400 font-inter">Free</span>
                                                                    <div className="text-sm font-bold text-gray-900 font-inter">
                                                                        {renderMobileValue(feature.free)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center px-2">
                                                                    <span className="text-sm font-medium text-gray-400 font-inter">Growth</span>
                                                                    <div className="text-sm font-bold text-gray-900 font-inter">
                                                                        {renderMobileValue(feature.growth, true)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center px-2">
                                                                    <span className="text-sm font-medium text-gray-400 font-inter">Enterprise</span>
                                                                    <div className="text-sm font-bold text-gray-900 font-inter">
                                                                        {renderMobileValue(feature.enterprise, false, true)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>
            </main>
            <style jsx global>{`
				.font-inter {
					font-family: var(--font-inter), sans-serif;
				}
			`}</style>
        </div>
    );
}
