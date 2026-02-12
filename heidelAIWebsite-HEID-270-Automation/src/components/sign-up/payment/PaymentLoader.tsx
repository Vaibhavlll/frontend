// components/PaymentLoader.tsx
import { ShieldCheck, Banknote } from "lucide-react";

export default function PaymentLoader() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Blobs for that "Modern App" feel */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* The Animated Icon Container */}
        <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
            <div className="absolute inset-0 bg-blue-50 rounded-full animate-pulse"></div>
            <div className="relative bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-lg border border-blue-100">
               <Banknote className="w-10 h-10 text-blue-600" />
            </div>
            
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
        <p className="text-gray-500 mb-8">
            Please wait while we confirm your transaction with the bank...
        </p>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 py-2 px-4 rounded-full mx-auto w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>256-bit Secure Encryption</span>
        </div>
      </div>
    </div>
  );
}