import { CheckCircle, ChevronLeft, Phone } from "lucide-react";
import { useState } from "react";
import { useCalendlyEventListener, PopupModal } from "react-calendly";

interface ScheduleCallProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    planId: string;
  }
  rootElement: HTMLElement | null;
  setStep: React.Dispatch<React.SetStateAction<"BASIC" | "PASSWORD" | "OTP" | "PLAN" | "PHONE_NUMBER" | "SCHEDULE_CALL" | "PAYMENT" | "SUCCESS" | "FLOW_COMPLETED">>;
}

export const ScheduleCall = ({ formData, rootElement, setStep }: ScheduleCallProps) => {
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

useCalendlyEventListener({
    onEventScheduled: (e) => {
      console.log("Call scheduled!", e);
      setIsCalendlyOpen(false); // Close modal
      setIsScheduled(true);     // Trigger the success UI
    },
  });

  if (isScheduled) {
    return (
      <div className="animate-in zoom-in duration-500 w-full flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-100 shadow-sm">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Call Scheduled!
        </h1>
        
        <p className="text-gray-500 mb-8 max-w-sm">
          We&apos;ve sent a calendar invite to <span className="font-medium text-gray-900">{formData.email}</span>. We look forward to speaking with you.
        </p>

       
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Let&apos;s tailor this to your business</h1>
            <p className="text-gray-500 mb-8">
              Hop on a free call with us to walk through your requirements and see how we can set things up for your team.
            </p>

            <button 
              onClick={() => setIsCalendlyOpen(true)}
              className="w-full py-3 bg-black hover:bg-zinc-800 text-white rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Book a free call
            </button>

            <button 
              onClick={() => setStep("PLAN")} 
              className="mt-10 text-sm text-gray-400  flex items-center hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 inline-block mr-1 " />
              Back to all plans
            </button>

            {/* POPUP COMPONENT */}
            {rootElement && (
                <PopupModal
                    url="https://calendly.com/heidelai-sales/30min" // REPLACE THIS
                    onModalClose={() => setIsCalendlyOpen(false)}
                    open={isCalendlyOpen}
                    rootElement={rootElement}
                    prefill={{
                      email: formData.email,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      name: `${formData.firstName} ${formData.lastName}`
                    }}
                />
            )}
          </div>
  )
}