"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";

interface ConsultationDrawerProps {
    children: React.ReactNode;
}

export function ConsultationDrawer({ children }: ConsultationDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        country: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);


        if (!formData.name || !formData.email || !formData.phone || !formData.country) {
            sonnerToast.error("Please fill in all fields.");
            setIsSubmitting(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            sonnerToast.error("Please enter a valid email address.");
            setIsSubmitting(false);
            return;
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            sonnerToast.success("Consultation booked successfully! We'll contact you soon.");
            setFormData({ name: "", email: "", phone: "", country: "" });
            setIsOpen(false);
        } catch (error) {
            sonnerToast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
            <Drawer.Trigger asChild>
                {children}
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[9990]" />
                <Drawer.Content className="bg-white flex flex-col fixed bottom-0 left-0 right-0 max-h-[55vh] rounded-t-[24px] z-[9999] outline-none">
                    <div className="max-w-2xl w-full mx-auto p-4 md:p-6 overflow-y-auto">
                        <div className="mx-auto w-12 h-1 rounded-full bg-gray-200 mb-6" />

                        <Drawer.Title className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-1 font-inter tracking-tight">
                            Book a Free Consultation
                        </Drawer.Title>
                        <p className="text-gray-500 text-center text-sm mb-6 font-inter leading-relaxed">
                            Find the perfect solution for your business.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-gray-700 ml-1 font-inter">Name</label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 h-10 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-inter text-sm text-gray-900 placeholder:text-gray-400"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-gray-700 ml-1 font-inter">Phone No</label>
                                    <input
                                        required
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 h-10 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-inter text-sm text-gray-900 placeholder:text-gray-400"
                                        placeholder="+1 (555) 000-0000"
                                        type="tel"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-gray-700 ml-1 font-inter">Email</label>
                                    <input
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 h-10 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-inter text-sm text-gray-900 placeholder:text-gray-400"
                                        placeholder="you@company.com"
                                        type="email"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[13px] font-semibold text-gray-700 ml-1 font-inter">Country</label>
                                    <input
                                        required
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-3 h-10 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-inter text-sm text-gray-900 placeholder:text-gray-400"
                                        placeholder="Your country"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "w-full h-12 mt-4 rounded-lg text-white font-bold text-base font-inter transition-all duration-300 shadow-md shadow-orange-500/10",
                                    "bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] hover:opacity-95 active:scale-[0.98]",
                                    isSubmitting && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                        Booking...
                                    </div>
                                ) : "Book Now"}
                            </button>
                        </form>

                        <p className="text-[10px] text-gray-400 text-center mt-4 font-inter">
                            By booking, you agree to our Terms & Privacy Policy
                        </p>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
