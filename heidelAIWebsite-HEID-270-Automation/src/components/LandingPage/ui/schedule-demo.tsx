"use client";
import React from "react";
// import { useRouter } from 'next/navigation';
// import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Drawer } from 'vaul';

import {
  useState,
  // useRef, useEffect 
} from "react";
// import { v4 as uuidv4 } from "uuid";
// import { Button } from "@/components/LandingPage/ui/flow-hover-button";
// import { Input } from "@/components/ui/input2";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { supabase } from "@/components/supabase/client";
// import { useToast } from "@/components/hooks/use-toast";
// import { systemPrompt } from "@/components/config/chatSystemPrompt";
// import { Message, storeMessage } from "@/components/services/chatService";
// import ReactMarkdown from "react-markdown";

import { Toaster, toast as sonnerToast } from 'sonner'
// import { set } from "react-hook-form";
// import { Toast } from "@radix-ui/react-toast";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function ScheduleDemo({ trigger }: { trigger?: React.ReactNode }) {

  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter()

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation checks
    if (!userName.trim() || !userEmail.trim() || !userPhone.trim() || !companyName.trim()) {
      sonnerToast.error('Please fill all the details.');
      setIsSubmitting(false);
      return;
    }

    // Email validation 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      sonnerToast.error('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    // Phone number validation (basic check for digits and common formats)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanedPhone = userPhone.replace(/[\s\-\(\)]/g, '');

    if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 8) {
      sonnerToast.error('Please enter a valid phone number (minimum 8 digits).');
      setIsSubmitting(false);
      return;
    }

    // Create form data to match Google Form's expected format
    const formData = new FormData();
    formData.append('entry.545040562', userName.trim());
    formData.append('entry.1231199003', userEmail.trim());
    formData.append('entry.1154213412', cleanedPhone);
    formData.append('entry.1081121699', companyName.trim());

    try {
      // Google Forms (no-cors, can't check result)
      await fetch("https://docs.google.com/forms/d/e/1FAIpQLSdB_mtDsubutUM_y1draxzdbfzcsqcIz9Ok_hTwPayBukJPNg/formResponse", {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      });

      // Your backend
      const response = await fetch("https://egenie-whatsapp.koyeb.app/api/clerk/waitlist", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail.trim(),
        })
      });

      const data = await response.json();

      if (data.data.status === 'rejected') {
        sonnerToast.error('Your previous request was rejected. Please contact support for more information.');
        setIsOpen(true);
        setIsSubmitting(false);
        return;
      }

      sonnerToast.success('Request received! We will contact you shortly.');

      // Clear the form after successful submission
      setUserName('');
      setUserEmail('');
      setUserPhone('');
      setCompanyName('');

      // Close the drawer after successful submission
      setIsOpen(false);
    } catch (error) {
      sonnerToast.error('Failed to submit the form. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const router = useRouter();
  // const [messages, setMessages] = useState<Message[]>([]);
  // const [input, setInput] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  // const [visitorName, setVisitorName] = useState<string | null>(null);
  // const [visitorCompany, setVisitorCompany] = useState<string | null>(null);
  // const [sessionId, setSessionId] = useState<string | null>(null);
  // const [isInitializing, setIsInitializing] = useState(true);
  // const scrollAreaRef = useRef<HTMLDivElement>(null);
  // const { toast } = useToast();


  // useEffect(() => {
  //   const initializeChat = async () => {
  //       const newSessionId = uuidv4();
  //       setSessionId(newSessionId);
  //       setSessionId(newSessionId);

  //       // Send initial greeting message
  //       const initialMessage: Message = {
  //         role: 'assistant',
  //         content: "Hello! I'm HeidelAI's AI Assistant. Before we begin, could you please tell me your name and the company you're representing?"
  //       };

  //       setMessages([initialMessage]);
  //       await storeMessage(initialMessage, null, null, newSessionId);
  //       setIsInitializing(false);
  //     }

  //   initializeChat();
  // }, []);

  // useEffect(() => {
  //   if (scrollAreaRef.current) {
  //     scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  //   }
  // }, [messages]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!input.trim()) return;

  //   const userMessage: Message = { role: 'user', content: input };
  //   setMessages(prev => [...prev, userMessage]);
  //   setInput('');
  //   setIsLoading(true);

  //   await storeMessage(userMessage, visitorName, visitorCompany, sessionId);

  //   try {
  //     const { data, error } = await supabase.functions.invoke('chat', {
  //       body: {
  //         messages: [...messages, userMessage],
  //         systemPrompt,
  //       },
  //     });

  //     if (error) throw error;

  //     const assistantMessage = { 
  //       role: 'assistant' as const, 
  //       content: data.choices[0].message.content 
  //     };

  //     setMessages(prev => [...prev, assistantMessage]);

  //     await storeMessage(assistantMessage, visitorName, visitorCompany, sessionId);

  //     // Only try to extract visitor info from the first user message
  //     if (!visitorName && !visitorCompany && messages.length === 1) {
  //       const nameMatch = userMessage.content.match(/(?:my name is|I'm|I am) ([^,.]+)/i);
  //       const companyMatch = userMessage.content.match(/(?:from|with|at) ([^,.]+)/i);

  //       if (nameMatch) setVisitorName(nameMatch[1].trim());
  //       if (companyMatch) setVisitorCompany(companyMatch[1].trim());
  //     }

  //   } catch (error) {
  //     console.error('Error calling chat function:', error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to get a response. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <>
      <div className="z-[100000]">
      </div>
      <div className=" flex justify-center space-x-2 text-center">
        <Drawer.Root repositionInputs={false} open={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Trigger asChild className="focus-visible:border-none">
            {trigger ? trigger : (
              <button className="inline-flex items-center px-6 py-4 bg-transparent bg-white text-gray-900 text-base font-medium rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg">
                Join Beta
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40" />
            <Drawer.Content className="bg-white flex flex-col  fixed bottom-0  left-0 right-0 max-h-[85vh] rounded-t-[10px] z-[999]">
              <div className="max-w-md flex justify-center flex-col w-full mx-auto overflow-auto p-4 mb-4 rounded-t-[10px]">
                <div aria-hidden className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-4" />

                <Drawer.Title className="text-2xl lg:text-3xl md:text-3xl font-semibold text-black text-center">
                  Join Beta
                </Drawer.Title>
                <p className="text-neutral-600 px-4 lg:px-0 text-xs lg:text-base text-center mt-2">
                  Sign up for our beta program to get access
                </p>
                <form method="POST" action={"https://docs.google.com/forms/d/e/1FAIpQLSdB_mtDsubutUM_y1draxzdbfzcsqcIz9Ok_hTwPayBukJPNg/formResponse"} onSubmit={handleDemoRequest}>
                  <label htmlFor="fname" className="font-medium text-gray-900 text-sm mt-8 mb-2 block">
                    Name
                  </label>
                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    id="name"
                    name="entry.545040562"
                    type="text"
                    className="border border-gray-200 bg-white w-full text-sm p-3 py-2 h-9 rounded-xl outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
                  />
                  <label htmlFor="email" className="font-medium text-gray-900 text-sm mt-4 mb-2 block">
                    Email ID
                  </label>
                  <input
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    type="text"
                    name="entry.1231199003"
                    className="border border-gray-200 bg-white w-full resize-none rounded-xl p-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-black/5 focus:ring-offset-0"
                  />
                  <label htmlFor="number" className="font-medium text-gray-900 text-sm mt-4 mb-2 block">
                    Phone Number
                  </label>
                  <input
                    value={userPhone}
                    onChange={(e) => {
                      // Allow only numbers, spaces, dashes, parentheses, and plus sign
                      const value = e.target.value.replace(/[^0-9\s\-\(\)\+]/g, '');
                      setUserPhone(value);
                    }}
                    type="tel" // Changed from "number" to "tel" for better mobile experience
                    name="entry.1154213412"
                    placeholder="+91 9876543210"
                    className="border border-gray-200 bg-white w-full resize-none rounded-xl p-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-black/5 focus:ring-offset-0"
                  />
                  <label htmlFor="name" className="font-medium text-gray-900 text-sm mt-4 mb-2 block">
                    Company name
                  </label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    type="text"
                    name="entry.1081121699"
                    className="border border-gray-200 bg-white w-full resize-none  p-3 rounded-xl py-2 text-gray-900 outline-none focus:ring-2 focus:ring-black/5 focus:ring-offset-0"
                  />
                  <p className="text-neutral-600  text-xs  mt-2 mb-8">
                    By submitting you agree to our <span className="underline cursor-pointer" onClick={() => router.push("/terms-of-service")}>Terms & Conditions.</span>
                  </p>
                  <button
                    type="submit"
                    className="h-[44px] bg-black mx-auto rounded-xl sticky bottom-0 text-gray-50 mt-4 w-full font-medium flex items-center justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </form>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>




      </div>
    </>
  );
}
