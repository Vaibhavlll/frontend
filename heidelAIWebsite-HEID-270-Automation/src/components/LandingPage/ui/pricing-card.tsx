"use client"

import * as React from "react"
import { BadgeCheck, ArrowRight } from "lucide-react"
import NumberFlow from "@number-flow/react"
import { useRouter } from "next/navigation"
import { Drawer } from 'vaul';import { Toaster, toast as sonnerToast } from 'sonner'
import { cn } from "@/lib/utils"
import { Badge } from "@/components/LandingPage/ui/badge"
import { Card } from "@/components/LandingPage/ui/card"
import { useState } from "react"

export interface PricingTier {
  name: string
  price: Record<string, number | string>
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
  popular?: boolean
  index?: number // Add index to track which card it is
}

interface PricingCardProps {
  tier: PricingTier
  paymentFrequency: string
}

export function PricingCard({ tier, paymentFrequency }: PricingCardProps) {
  const router = useRouter()
  const price = tier.price[paymentFrequency]
  const isHighlighted = tier.highlighted
  const isPopular = tier.popular
  const isEnterprise = tier.name.toLowerCase() === "professional"
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

  const handleClick = () => {
    if (isEnterprise) {
      // Don't do anything, the dialog will handle this
      return
    }
    
    // For the first two pricing tiers, redirect to onboarding
    router.push("/onboarding")
  }

  return (
    <Card
      className={cn(
        "relative flex flex-col gap-8 overflow-hidden p-6 border-[0.5px] border-gray-300",
        isHighlighted
          ? "bg-foreground text-background border-gray-600"
          : "bg-background text-foreground",
        isPopular && "ring-1 ring-gray-400"
      )}
    >
      {isHighlighted && <HighlightedBackground />}
      {isPopular && <PopularBackground />}

      <div className="relative z-10 flex flex-col gap-8 h-full">
        <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-semibold capitalize">
          {tier.name}
          {isPopular && (
            <Badge variant="secondary" className="mt-1 bg-gray-900 text-white hover:bg-gray-800 text-xs">
              🔥 Most Popular
            </Badge>
          )}
        </h2>

        <div className="relative h-12 sm:h-16">
          {typeof price === "number" ? (
            <>
              <NumberFlow
                format={{
                  style: "currency",
                  currency: "EUR",
                  trailingZeroDisplay: "stripIfInteger",
                }}
                value={price}
                className="text-2xl sm:text-4xl font-semibold"
              />
              <p className="-mt-1 sm:-mt-2 text-xs sm:text-sm text-muted-foreground">
                Per month
              </p>
            </>
          ) : (
            <h1 className="text-2xl sm:text-4xl font-semibold">{price}</h1>
          )}
        </div>

        <div className="flex-1 space-y-3 sm:space-y-4">
          <h3 className="text-sm sm:text-base font-medium">{tier.description}</h3>
          <ul className="space-y-2 sm:space-y-3">
            {tier.features.map((feature, index) => (
              <li
                key={index}
                className={cn(
                  "flex items-center gap-2 text-sm sm:text-base font-medium",
                  isHighlighted ? "text-background" : "text-muted-foreground"
                )}
              >
                <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {isEnterprise ? (
          <Drawer.Root repositionInputs={false} open={isOpen} onOpenChange={setIsOpen}>
            <Drawer.Trigger className="focus-visible:border-none">
              <button 
                className={cn(
                  "inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg relative z-20",
                  isHighlighted 
                    ? "bg-white text-gray-900 hover:bg-gray-100" 
                    : "bg-gray-900 text-white hover:bg-gray-800"
                )}
              >
                Contact Us
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
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
										<button onClick={() => setIsOpen(false)} type="submit" className="h-[44px] bg-black mx-auto rounded-full sticky bottom-0 text-gray-50  mt-4 w-full font-medium">Submit</button>
										</form>
									</div>
									</Drawer.Content>
								</Drawer.Portal>
								</Drawer.Root>
        ) : (
          <button 
            className={cn(
              "inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg relative z-20",
              isHighlighted 
                ? "bg-white text-gray-900 hover:bg-gray-100" 
                : "bg-gray-900 text-white hover:bg-gray-800"
            )}
            onClick={handleClick}
          >
            {tier.cta}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>
    </Card>
  )
}

const HighlightedBackground = () => (
  <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
)

const PopularBackground = () => (
  <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,0,0,0.05),rgba(255,255,255,0))]" />
)