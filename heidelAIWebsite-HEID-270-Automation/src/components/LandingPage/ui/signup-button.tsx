"use client";
import React from "react";
import { useRouter } from 'next/navigation';
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Drawer } from 'vaul';
import { Button } from '@/components/LandingPage/ui/button';
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input2";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/components/supabase/client";
import { useToast } from "@/components/hooks/use-toast";
import { systemPrompt } from "@/components/config/chatSystemPrompt";
import { Message, storeMessage } from "@/components/services/chatService";
import ReactMarkdown from "react-markdown";
import { cn } from '@/lib/utils';
import { Toaster, toast as sonnerToast } from 'sonner'

export function SignUp() {

  const [isOpen, setIsOpen] = React.useState(false);


  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation checks
    if (!userName.trim() || !userEmail.trim() || !userPhone.trim() || !companyName.trim()) {
      sonnerToast.error('Please fill all the details.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      sonnerToast.error('Please enter a valid email address.');
      return;
    }

    // Phone number validation (basic check for digits and common formats)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanedPhone = userPhone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses

    if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 8) {
      sonnerToast.error('Please enter a valid phone number (minimum 8 digits).');
      return;
    }

    // Create form data to match Google Form's expected format
    const formData = new FormData();
    formData.append('entry.545040562', userName.trim());       // Name
    formData.append('entry.1231199003', userEmail.trim());     // Email
    formData.append('entry.1154213412', cleanedPhone);         // Phone (cleaned)
    formData.append('entry.1081121699', companyName.trim());   // Company

    try {
      await fetch("https://docs.google.com/forms/d/e/1FAIpQLSdB_mtDsubutUM_y1draxzdbfzcsqcIz9Ok_hTwPayBukJPNg/formResponse", {
        method: 'POST',
        mode: 'no-cors',  // Required to bypass CORS errors
        body: formData,
      });

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
    }
  };

  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [visitorCompany, setVisitorCompany] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeChat = async () => {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      setSessionId(newSessionId);

      // Send initial greeting message
      const initialMessage: Message = {
        role: 'assistant',
        content: "Hello! I'm HeidelAI's AI Assistant. Before we begin, could you please tell me your name and the company you're representing?"
      };

      setMessages([initialMessage]);
      await storeMessage(initialMessage, null, null, newSessionId);
      setIsInitializing(false);
    }

    initializeChat();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    await storeMessage(userMessage, visitorName, visitorCompany, sessionId);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, userMessage],
          systemPrompt,
        },
      });

      if (error) throw error;

      const assistantMessage = {
        role: 'assistant' as const,
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);

      await storeMessage(assistantMessage, visitorName, visitorCompany, sessionId);

      // Only try to extract visitor info from the first user message
      if (!visitorName && !visitorCompany && messages.length === 1) {
        const nameMatch = userMessage.content.match(/(?:my name is|I'm|I am) ([^,.]+)/i);
        const companyMatch = userMessage.content.match(/(?:from|with|at) ([^,.]+)/i);

        if (nameMatch) setVisitorName(nameMatch[1].trim());
        if (companyMatch) setVisitorCompany(companyMatch[1].trim());
      }

    } catch (error) {
      console.error('Error calling chat function:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="z-[100000]">
      </div>
      <div className=" flex justify-center text-center">
        <Drawer.Root repositionInputs={false} open={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Trigger className="focus-visible:border-none">
            <Button
              asChild
              size="sm"
              className={cn(
                'backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-lg bg-white text-black hover:bg-white/90'
              )}
            >
              <a href="#">
                <span>Sign Up</span>
              </a>
            </Button>

          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40" />
            <Drawer.Content className="bg-white flex flex-col  fixed bottom-0  left-0 right-0 max-h-[85vh] rounded-t-[10px] z-[999]">
              <div className="max-w-md flex justify-center flex-col w-full mx-auto overflow-auto p-4 mb-4 rounded-t-[10px]">
                <div aria-hidden className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-4" />

                <Drawer.Title className="text-2xl lg:text-3xl md:text-3xl font-semibold text-black text-center">
                  Contact Us
                </Drawer.Title>
                <p className="text-neutral-600 px-4 lg:px-0 text-xs lg:text-base text-center mt-2">
                  We will contact you based on the below information
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
                  <button onClick={() => setIsOpen(false)} type="submit" className="h-[44px] bg-black mx-auto rounded-xl sticky bottom-0 text-gray-50  mt-4 w-full font-medium">Submit</button>
                </form>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>




      </div>
    </>
  );
}
