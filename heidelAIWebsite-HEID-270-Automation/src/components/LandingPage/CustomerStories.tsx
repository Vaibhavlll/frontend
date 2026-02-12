import React from 'react';
import Image from 'next/image';

const CustomerStories = () => {
    return (
        <section id="CustomerStories" className="py-14 relative overflow-hidden z-10 -mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-[500] text-black italic mb-4 leading-[1.1] tracking-tight"
                        style={{ fontFamily: "'Awesome Serif', serif" }}>
                        Get Real, Measurable Results
                    </h2>
                    <p className="text-gray-500 font-medium tracking-tight">
                        Scale faster and smarter
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 relative overflow-hidden h-[240px] flex flex-col group">
                        <div className="absolute -bottom-5 -right-5 opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 pointer-events-none">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7h-2.54v-2.9h2.54v-2.21c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <p className="text-5xl font-bold text-gray-800 mb-2">3.7x</p>
                            <p className="text-gray-400 font-semibold">More Weekly Leads</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 relative overflow-hidden h-[240px] flex flex-col group">
                        <div className="absolute -bottom-5 -right-5 opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 pointer-events-none">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c3 0 5.5-1 7.29-2.71l-3.57-2.77c-1 .67-2.28 1.07-3.72 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.06c-.22-.67-.35-1.39-.35-2.12s.13-1.45.35-2.12V7.01H2.18C1.43 8.5 1 10.2 1 12s.43 3.5 1.18 4.99l3.66-2.93z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.01l3.66 2.93C6.71 7.31 9.14 5.38 12 5.38z" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <p className="text-5xl font-bold text-gray-800 mb-2">4.1x</p>
                            <p className="text-gray-400 font-semibold">ROI On Campaigns</p>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#E5E7EB" className="mb-4" aria-hidden="true">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                            <blockquote className="text-gray-500 text-lg font-semibold leading-relaxed mb-6">
                                HeidelAi Gives Us Confidence. It&apos;s Like Having An Entire Team Of Subject Matter Experts In All Verticals At Your Finger Tips.
                            </blockquote>
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div>
                                <div className="text-sm font-bold text-gray-800">Sam Patel</div>
                                <p className="text-xs text-gray-400 font-semibold">VP of Marketing</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-16 -right-16 opacity-[0.03] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6 pointer-events-none">
                            <Image
                                src="/heidelai.png"
                                alt=""
                                width={320}
                                height={320}
                                className="object-contain"
                                loading="lazy"
                                aria-hidden="true"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#E5E7EB" className="mb-4" aria-hidden="true">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                            <blockquote className="text-gray-500 text-lg font-semibold leading-relaxed mb-6">
                                HeidelAi Knew Our Market Better Than We Did, Delivering Actionable Plans And Insights That Drove Real Results.
                            </blockquote>
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div>
                                <div className="text-sm font-bold text-gray-800">Even Hayes</div>
                                <p className="text-xs text-gray-400 font-semibold">Head of Growth</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-16 -right-16 opacity-[0.03] transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 pointer-events-none">
                            <Image
                                src="/heidelai.png"
                                alt=""
                                width={320}
                                height={320}
                                className="object-contain"
                                loading="lazy"
                                aria-hidden="true"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 relative overflow-hidden h-[240px] flex flex-col group">
                        <div className="absolute -bottom-10 -right-7 opacity-[0.20] transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400" aria-hidden="true">
                                <path d="M6 2h12v2H6V2zm0 18h12v2H6v-2zm11-14v2.5c0 2.48-2.02 4.5-4.5 4.5S8 10.98 8 8.5V6h9zm-2 2H9v.5c0 1.38 1.12 2.5 2.5 2.5S14 9.88 14 8.5V8zm-2.5 5.5c2.48 0 4.5 2.02 4.5 4.5V20H8v-2c0-2.48 2.02-4.5 4.5-4.5zM10 18h5v-1c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v1z" />
                                <circle cx="12" cy="11.5" r="0.5" className="animate-pulse" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <p className="text-5xl font-bold text-gray-800 mb-2">60h</p>
                            <p className="text-gray-400 font-semibold">Saved Weekly</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 relative overflow-hidden h-[240px] flex flex-col group">
                        <div className="absolute -bottom-5 -right-5 opacity-[0.08] transition-all duration-500 group-hover:scale-110 pointer-events-none">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <p className="text-5xl font-bold text-gray-800 mb-2">2.3x</p>
                            <p className="text-gray-400 font-semibold">Increased In LIV</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CustomerStories;
