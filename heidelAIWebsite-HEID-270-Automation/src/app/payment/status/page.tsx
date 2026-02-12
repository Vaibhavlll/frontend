'use client';

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PaymentLoader from "@/components/sign-up/payment/PaymentLoader";
import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner"; // Assuming you use sonner/toast

// Ensure this matches your backend URL config
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Captures 'sub_id' if redirected from Cashfree, 
  // or you might want to pass 'session_id' if you have it stored in localStorage/cookies
  const subId = searchParams.get("sub_id"); 
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const [status, setStatus] = useState<"PROCESSING" | "SUCCESS" | "FAILED" | "TIMEOUT">("PROCESSING");

  useEffect(() => {
    if (!subId) {
        setStatus("FAILED");
        return;
    }

    // Prevent duplicate connections in React Strict Mode
    if (eventSourceRef.current) return;

    // Connect to Backend SSE Endpoint
    // Note: Ensure your backend endpoint accepts the ID you are passing (subId vs session_id)
    const url = `${API_URL}/sse/stream-status/${subId}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
        console.log("SSE Connection Opened");
    };

    eventSource.onmessage = (event) => {
        try {
            // Parse the JSON data sent by the backend
            // Expected format: data: {"status": "SUCCESS", "message": "..."}
            const data = JSON.parse(event.data);
            console.log("SSE Status Update:", data);

            if (data.status === "SUCCESS") {
                setStatus("SUCCESS");
                eventSource.close();
                toast.success("Payment verified successfully!");
                
                // Redirect to dashboard after a brief delay
                setTimeout(() => router.push("/dashboard?payment=success"), 2500);
            
            } else if (data.status === "FAILED") {
                setStatus("FAILED");
                eventSource.close();
                toast.error("Payment failed or declined.");
            
            } else if (data.status === "TIMEOUT") {
                setStatus("TIMEOUT");
                eventSource.close();
            }
        } catch (err) {
            console.error("Error parsing SSE data:", event.data, err);
        }
    };

    eventSource.onerror = (err) => {
        console.error("SSE Connection Error:", err);
        eventSource.close();
        // Don't immediately set FAILED on connection error (retries might happen),
        // but if it persists, you might want to show a timeout UI.
    };

    // Cleanup on unmount
    return () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    };
  }, [subId, router]);

  // --- RENDER STATES ---

  if (status === "FAILED") {
      return (
          <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
              <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-sm w-full">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">Payment Failed</h1>
                  <p className="text-gray-600 mt-2 mb-6 text-sm">
                      We couldn&apos;t verify your payment. This might be due to a declined transaction or a bank issue.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => router.push("/sign-up")} className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors w-full">
                        Try Again
                    </button>
                  </div>
              </div>
          </div>
      );
  }

  if (status === "TIMEOUT") {
    return (
        <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
            <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-sm w-full">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Verification Pending</h1>
                <p className="text-gray-600 mt-2 mb-6 text-sm">
                    We haven&apos;t received a confirmation from the bank yet. Your payment might still process.
                </p>
                <button onClick={() => router.push("/dashboard")} className="px-6 py-2.5 bg-black text-white rounded-lg font-medium w-full">
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}
  
  if (status === "SUCCESS") {
      return (
          <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
               <div className="text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
                  <p className="text-gray-600 mt-2">Setting up your account...</p>
              </div>
          </div>
      );
  }

  // Default: Show the animation while processing
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <PaymentLoader />
        <p className="text-zinc-500 text-sm mt-8 animate-pulse">Verifying payment status...</p>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <PaymentLoader />
            <p className="text-zinc-500 text-sm mt-8 animate-pulse">Verifying payment status...</p>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}