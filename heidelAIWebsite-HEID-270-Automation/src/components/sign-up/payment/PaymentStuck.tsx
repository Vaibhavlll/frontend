import { ChevronLeft, CreditCard } from "lucide-react";

interface PaymentStuckProps {
    setStep: React.Dispatch<React.SetStateAction<"BASIC" | "PASSWORD" | "OTP" | "PLAN" | "PHONE_NUMBER" | "SCHEDULE_CALL" | "PAYMENT" | "SUCCESS" | "FLOW_COMPLETED">>;
}

export const PaymentStuck = ({setStep} : PaymentStuckProps) => {
    return (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Did your payment go through?</h1>
            <p className="text-gray-500 mb-8">
              Looks like you cancelled the payment. <br /> Don&apos;t worry, you can try again.
            </p>

            <button 
            //   onClick={() => setIsCalendlyOpen(true)}
              className="w-full py-3 bg-black hover:bg-zinc-800 text-white rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Continue to Payment
            </button>

            <p className="text-gray-500 mt-4 text-xs">
              If you are facing any issues, feel free to reach out to our support team at <a href="mailto:support@heidelai.com" className="underline"> support@heidelai.com </a>.
            </p>
            <button 
              onClick={() => setStep("PLAN")} 
              className="mt-10 text-sm text-gray-400  flex items-center hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 inline-block mr-1 " />
              Back to all plans
            </button>
        </div>
    )
}