"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // or your specific path

interface OtpProps {
  onComplete: (otp: string) => void;
  onClickEnter: (code?: string) => void;
  loading?: boolean; // 1. Add loading prop
}

export const OtpInput = ({ onComplete, onClickEnter, loading }: OtpProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // If loading stops (becomes false) AND the OTP is fully filled
    if (!loading && otp.every((digit) => digit !== "")) {
      // Small timeout ensures the disabled attribute is fully removed by React first
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 0);
    }
  }, [loading, otp]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    // Prevent typing if loading
    if (loading) return; 

    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.every((digit) => digit !== "")) {
        const finalCode = newOtp.join("");
        onComplete(finalCode);
        onClickEnter(finalCode); 
        
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      if (loading) return; // Prevent navigation if loading

      if (e.key === "Backspace" && !otp[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
      }
      if(e.key === "Enter") {
          const currentOtp = otp.join("");
          if (currentOtp.length === 6) {
              onComplete(currentOtp);
              onClickEnter(currentOtp);
          } else {
             onClickEnter();
          }
      }
  };

  return (
    // 2. Add 'relative' to the parent so the loader can be positioned absolutely inside it
    <div className="relative flex gap-2 justify-center my-6">
      
      {/* 3. The Loader Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-[1px] transition-all duration-300">
           <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )}

      {otp.map((data, index) => (
        <input
          key={index}
          type="tel"
          disabled={loading} // 4. Disable inputs visually and functionally
          autoComplete="one-time-code"
          maxLength={1}
          ref={(el) => { inputRefs.current[index] = el; }}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={cn(
            "w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-md outline-none transition-all",
            "focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:scale-[1.15]",
            // Dim the inputs slightly when loading
            loading ? "opacity-50 cursor-not-allowed" : "bg-white"
          )}
        />
      ))}
    </div>
  );
};