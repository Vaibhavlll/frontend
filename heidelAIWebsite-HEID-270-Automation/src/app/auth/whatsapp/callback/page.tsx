"use client"

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppSignupData {
  phone_number_id: string;
  waba_id: string;
  business_id: string;
  page_ids: string[];
  catalog_ids: string[];
  dataset_ids: string[];
  instagram_account_ids: string[];
}

function WhatsAppCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Processing WhatsApp authorization...");

  const whatsappSignupDataRef = useRef<WhatsAppSignupData | null>(null);
  
  useEffect(() => {
    // Listen for messages from popup window
    const handleMessage = (event: MessageEvent) => {
      // console.log("Received message event from WhatsApp window in callback page:", event);

      // Allow messages from self (for auth callback) and facebook (for embedded signup events)
      const isSelf = event.origin === window.location.origin;
      const isFacebook = event.origin === "https://www.facebook.com" || event.origin === "https://web.facebook.com";

      if (!isSelf && !isFacebook) {
        // console.log("Ignored message from unknown origin in callback page:", event.origin);
        return;
      };

      let data = event.data;

      // Handle Facebook Embedded Signup events (often wrapped in array)
      if (Array.isArray(data)) {
        data = data[0];
      }

      // Check for WA_EMBEDDED_SIGNUP events
      if (data && data.type === 'WA_EMBEDDED_SIGNUP') {
        if (data.event === 'FINISH') {
          // console.log("Captured WhatsApp Session Data in callback page:", data.data);
          whatsappSignupDataRef.current = data.data;
        } else if (data.event === 'CANCEL') {
          const {current_step} = data.data;
          // console.log("WhatsApp Signup Canceled at callback page:", current_step);
          toast.info("Connection Canceled", {
            description: "WhatsApp setup was canceled."
          });
        } else if(data.event == 'ERROR') {
          const {error_message} = data.data;
          // console.log('Error occured in WhatsApp Signup in callback page:', error_message);
          toast.error("Connection Error", {
            description: `WhatsApp setup encountered an error: ${error_message}`
          });
        }
        return;
      };

      // Handle auth data from popup
      if (isSelf && data && data.type === 'WHATSAPP_AUTH_CALLBACK') {
        // console.log("Processing WhatsApp auth callback data in callback page:", data);
        const { code, state } = data;
        // console.log("Extracted state values:", {
        //   popupReturned: state,
        //   expectedLocal: sessionStorage.getItem("whatsapp_auth_state"),
        // });
        if (code && state === sessionStorage.getItem("whatsapp_auth_state")) {          
          // console.log("State matches, handling WhatsApp callback in callback page");
        }
      };
    };
    
    window.addEventListener('message', handleMessage);
    // console.log('added event listener for whatsapp in callback')
    return () => {
      window.removeEventListener('message', handleMessage);
      // console.log('removed event listener for whatsapp in callback')
    };
  }, []);

  useEffect(() => {
    if (!searchParams) return; // early return if searchParams is null
    
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const storedState = typeof window !== 'undefined' ? sessionStorage.getItem('whatsapp_auth_state') : null;
    
    // First, handle the case where this page was opened directly (not in popup)
    if (!window.opener) {
      if (!code) {
        setStatus('error');
        setMessage("Missing required parameters from WhatsApp.");
        toast.error("WhatsApp connection failed: Missing parameters");
        
        setTimeout(() => {
          router.push('/dashboard#integrations');
        }, 3000);
        return;
      }
      
      if (state !== storedState) {
        setStatus('error');
        setMessage("Security validation failed. Please try again.");
        toast.error("WhatsApp connection failed: Invalid state parameter");
        
        setTimeout(() => {
          router.push('/dashboard#integrations');
        }, 3000);
        return;
      }
      
      handleCodeExchange(code);
    } else {
      // For popup case, just send the message back to opener and close
      if (code && state) {
        window.opener.postMessage({
          type: 'WHATSAPP_AUTH_CALLBACK',
          code,
          state
        }, window.location.origin);
        
        // Show success briefly before closing
        setStatus('success');
        setMessage("Connection successful! Closing popup...");
        
        // Close the popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        setStatus('error');
        setMessage("Missing required parameters from WhatsApp.");
        
        // Close the popup after showing error
        setTimeout(() => {
          window.close();
        }, 2000);
      }
    }
    
    // Clean up the state from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('whatsapp_auth_state');
    }
  }, [searchParams, router]);
  
  const handleCodeExchange = async (code: string) => {
    try {
      const response = await fetch('https://egenie-whatsapp.koyeb.app/api/whatsapp/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: `${window.location.origin}/auth/whatsapp/callback`,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        let errorMessage = 'Failed to connect WhatsApp account';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.detail) {
            errorMessage = errorJson.detail;
          }
        } catch {
          if (errorText && errorText.length < 100) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      localStorage.setItem('whatsapp_connection', JSON.stringify({
        name: data.name,
        phone: data.phone,
        userId: data.user_id,
        businessInfo: data.business_info || {},
        connected: true,
      }));
      
      localStorage.setItem('whatsapp_user_id', data.user_id);
      
      setStatus('success');
      setMessage("WhatsApp connected successfully!");
      toast.success("WhatsApp account connected successfully");
      
      setTimeout(() => {
        router.push('/dashboard#integrations');
      }, 2000);
    } catch (error) {
      console.error('Error exchanging WhatsApp code:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error(`WhatsApp connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setTimeout(() => {
        router.push('/dashboard#integrations');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-green-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Connecting WhatsApp</h1>
            <p className="text-gray-600">Please wait while we complete the connection process...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="bg-green-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-2">Connection Successful!</h1>
            <p className="text-gray-600">{message}</p>
            {!window.opener && (
              <p className="text-sm text-gray-500 mt-4">Redirecting you back to settings...</p>
            )}
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-2">Connection Failed</h1>
            <p className="text-gray-600">{message}</p>
            {!window.opener && (
              <p className="text-sm text-gray-500 mt-4">Redirecting you back to settings...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function CallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-500" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Loading</h1>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}

export default function WhatsAppCallback() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <WhatsAppCallbackContent />
    </Suspense>
  );
}