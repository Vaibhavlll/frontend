'use client';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { WhatsAppLogo } from '@/components/icons/WhatsappLogo';
import WhatsAppProfileView from '@/components/setting_tab/WhatAppProfileView'; // Add this import
import { useApi } from "@/lib/session_api";
import { useOrganization, useUser } from '@clerk/nextjs';
import { useIntegrations, WhatsappData } from '../hooks/useIntegrations';
import { DB_KEYS, getData, storeData } from '@/lib/indexedDB';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FB: any;
    fbAsyncInit: () => void;
  }
}
interface ErrorResponse {
  message?: string;
}

interface WhatsAppSignupData {
  phone_number_id: string;
  waba_id: string;
  business_id: string;
  page_ids: string[];
  catalog_ids: string[];
  dataset_ids: string[];
  instagram_account_ids: string[];
}

// WhatsApp app configuration
const WHATSAPP_CLIENT_ID = '509681741462833';
const WHATSAPP_CONFIG_ID = '1209365947547146';
const WHATSAPP_REDIRECT_URI = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/whatsapp/callback`;

// Add this utility function near the top of your file
export const formatPhoneNumber = (phone: string) => {
  if (!phone) return "";

  // Remove any non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // US format: +1 (XXX) XXX-XXXX
  if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
    return `+1 (${digitsOnly.substring(1, 4)}) ${digitsOnly.substring(4, 7)}-${digitsOnly.substring(7)}`;
  }

  // India format: +91 XXXXX XXXXX
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return `+91 ${digitsOnly.substring(2, 7)} ${digitsOnly.substring(7)}`;
  }

  // Default international format with country code
  if (digitsOnly.length > 7) {
    // Try to extract country code (1-3 digits)
    const countryCodeLength = digitsOnly.length > 10 ? (digitsOnly.length - 10) : 2;
    return `+${digitsOnly.substring(0, countryCodeLength)} ${digitsOnly.substring(countryCodeLength)}`;
  }

  // If all else fails, just return with + prefix
  return `+${digitsOnly}`;
};

const WhatsAppLoginDialog = () => {
  const [connected, setConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState<{
    name: string;
    phone: string;
    businessInfo?: {
      account_type?: string;
      status?: string;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const { organization } = useOrganization();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const api = useApi();

  // Store the embedded signup data (waba_id, phone_number_id) temporarily
  const whatsappSignupDataRef = useRef<WhatsAppSignupData | null>(null);

  const { integrations, loading: integrationsLoading, refreshIntegrations } = useIntegrations();
  const { user } = useUser();

  const [oauthState] = useState(() =>
    window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
  );

  // Load and Initialize Facebook SDK
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: WHATSAPP_CLIENT_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v24.0'
      });
    };

    // Load the SDK asynchronously if not already loaded
    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      document.body.appendChild(js);
    }
  }, []);

  useEffect(() => {
    const checkRole = async () => {
      if (organization && user) {
        // Fetch all memberships for this org
        const memberships = await organization.getMemberships();

        // Find current user's membership
        const membership = memberships.data.find(
          (m) => m.publicUserData?.userId === user.id
        );
        setIsAdmin(membership?.roleName === "Admin");
      }
    };

    checkRole();
  }, [organization, user]);


  const getWhatsappUserId = async () => {
    try {
      const whatsappData = await getData<WhatsappData>(
        'integrations',
        DB_KEYS.INTEGRATIONS.WHATSAPP
      );
      return whatsappData?.userId || null;
    } catch (error) {
      console.error('Error retrieving Instagram user ID:', error);
      return null;
    }
  };

  // Check if user has already connected WhatsApp
  useEffect(() => {
    if (!integrationsLoading) {
      if (integrations.whatsapp && integrations.whatsapp.status) {
        setConnected(true);
        setAccountInfo({
          name: integrations.whatsapp.name,
          phone: integrations.whatsapp.phone,
          businessInfo: integrations.whatsapp.businessInfo || {}
        });
      } else {
        setConnected(false);
      }
    }
  }, [integrations, integrationsLoading]);


  useEffect(() => {
    // Listen for messages from popup window
    const handleMessage = (event: MessageEvent) => {
      // console.log('Received message event:', event);
      // Security check: only accept messages from Facebook
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
        return;
      }

      try {
        let data = event.data;

        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            // Not JSON, ignore
            return;
          }
        }

        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH' || data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' || data.data?.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') {
            // console.log("Captured WhatsApp Session Data:", data.data);
            whatsappSignupDataRef.current = data.data as WhatsAppSignupData;
          } else if (data.event === 'CANCEL') {
            const { current_step } = data.data || {};
            // console.log("WhatsApp Signup Canceled at", current_step);
            toast.info("Connection Canceled", {
              description: "WhatsApp setup was canceled."
            });
            setIsLoading(false);
          } else if (data.event === 'ERROR') {
            const { error_message } = data.data || {};
            // console.log('Error occurred in WhatsApp Signup:', error_message);
            toast.error("Connection Error", {
              description: `WhatsApp setup encountered an error: ${error_message}`
            });
            setIsLoading(false);
          }
        }
      } catch (e) {
        // console.log('Error processing message event', e);
      }
    };

    window.addEventListener('message', handleMessage);
    // console.log('added event listener for whatsapp')
    return () => {
      window.removeEventListener('message', handleMessage);
      // console.log('removed event listener for whatsapp')
    };
  }, []);


  // Function to initiate WhatsApp OAuth login
  const handleWhatsAppLogin = () => {
    setIsLoading(true);

    if (!window.FB) {
      toast.error("Facebook SDK not loaded", {
        description: "Please refresh the page and try again."
      });
      setIsLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.FB.login((response: any) => {
      if (response.authResponse) {
        const code = response.authResponse.code;
        // console.log("FB Login Success, Code received");
        handleWhatsAppCallback(code);
      } else {
        // console.log('User cancelled login or did not fully authorize.');
        setIsLoading(false);
        toast.info("Login Cancelled");
      }
    }, {
      config_id: WHATSAPP_CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        "featureType": "whatsapp_business_app_onboarding",
        "sessionInfoVersion": "3",
        "version": "v3"
      }
    });
  };

  // Process the auth callback code
  const handleWhatsAppCallback = async (code: string) => {
    try {
      setIsLoading(true);

      const signupData = whatsappSignupDataRef.current;

      // Exchange authorization code for access token via backend
      const response = await api.post('/api/whatsapp/auth', {
        code,
        redirect_uri: WHATSAPP_REDIRECT_URI,
        ...signupData
      });

      if (response.status === 403) {
        const errorData = response.data as ErrorResponse;
        const errorMessage = errorData.message || "This WhatsApp account is already connected to another organization.If you think this is incorrect, please contact us at support@heidelai.com for further assistance.";
        throw new Error(errorMessage);
      }

      if (response.status !== 200 || (typeof response.data === "object" && response.data.status === "error")) {
        let errorMessage = "Failed to connect WhatsApp account";
        const errorData = response.data as ErrorResponse;
        if (errorData?.message) errorMessage = errorData.message;
        throw new Error(errorMessage);
      }

      const profileData = response.data;

      const whatsappData: WhatsappData = {
        status: true,
        name: profileData.name,
        phone: profileData.phone,
        userId: profileData.user_id,
        businessInfo: profileData.business_info || {},
        lastUpdated: Date.now(),
      };

      await storeData("integrations", DB_KEYS.INTEGRATIONS.WHATSAPP, whatsappData);

      setConnected(true);

      setAccountInfo({
        name: profileData.name,
        phone: profileData.phone,
        businessInfo: profileData.business_info || {}
      });

      toast.success("WhatsApp connected successfully!", {
        description: "You can now receive and manage WhatsApp messages in HeidelAI"
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error processing WhatsApp auth callback:', error);
      toast.error("Connection Failed", {
        description: error.message || "Could not connect WhatsApp account. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Function to disconnect WhatsApp account
  const disconnectWhatsApp = async () => {
    try {
      setIsLoading(true);

      // Revoke the token
      const user_id = await getWhatsappUserId();

      if (user_id) {
        const data = { user_id };

        // Disconnect using the dedicated WhatsApp API
        await api.post('/api/instagram/disconnect', { data });

        // Update IndexedDB - set connected to false but keep other data
        try {
          const existingData = await getData<WhatsappData>(
            'integrations',
            DB_KEYS.INTEGRATIONS.WHATSAPP
          );

          if (existingData) {
            await storeData('integrations', DB_KEYS.INTEGRATIONS.WHATSAPP, {
              ...existingData,
              connected: false,
              lastUpdated: Date.now()
            });
          }
        } catch (dbError) {
          console.error("Error updating IndexedDB on disconnect:", dbError);
        }

        // For backward compatibility, also clear localStorage
        // localStorage.removeItem('whatsapp_auth_state');

        setConnected(false);
        setAccountInfo(null);

        // Update integrations status
        refreshIntegrations();

        toast.success('WhatsApp account disconnected successfully');
      }
      else {
        toast.error('No WhatsApp account found to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error('Failed to disconnect WhatsApp account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#25D366] hover:bg-green-600 text-white">
          {isLoading || integrationsLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking...
            </span>
          ) : connected ? (
            'Manage'
          ) : (
            'Connect'
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-black">{connected ? 'Manage WhatsApp Connection' : 'Connect WhatsApp Business'}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : connected && accountInfo ? (
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <WhatsAppLogo className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-black text-lg">{accountInfo.name}</p>
                  <p className="text-sm text-gray-600">{formatPhoneNumber(accountInfo.phone)}</p>
                  <p className="text-xs text-green-600 mt-1">Connected</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowProfileView(true)}
              >
                View Details
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm text-black font-medium">Permissions granted:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600 flex-shrink-0"
                  >
                    <circle cx="8" cy="8" r="7.5" stroke="#10B981" strokeOpacity="0.2" />
                    <path
                      d="M5 8L7 10L11 6"
                      stroke="#10B981"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Access to business profile information
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600 flex-shrink-0"
                  >
                    <circle cx="8" cy="8" r="7.5" stroke="#10B981" strokeOpacity="0.2" />
                    <path
                      d="M5 8L7 10L11 6"
                      stroke="#10B981"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Send and receive messages
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600 flex-shrink-0"
                  >
                    <circle cx="8" cy="8" r="7.5" stroke="#10B981" strokeOpacity="0.2" />
                    <path
                      d="M5 8L7 10L11 6"
                      stroke="#10B981"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Manage WhatsApp Business settings
                </li>
              </ul>
            </div>

            <Button
              variant="destructive"
              className="w-full mt-4"
              onClick={() => setShowDisconnectConfirm(true)}
              disabled={isLoading || !isAdmin}
              title={!isAdmin ? "Only admins can disconnect integrations" : ""}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                </span>
              ) : !isAdmin ? (
                "Admin permission required"
              ) : (
                'Disconnect Account'
              )}
            </Button>

            <ConfirmDialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
              <ConfirmDialogContent>
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>Are you sure you want to disconnect Instagram?</ConfirmDialogTitle>
                </ConfirmDialogHeader>
                <div className="py-4 text-gray-700">
                  This will archive all your currently stored messages and they will be deleted after 30 days automatically.
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowDisconnectConfirm(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      setShowDisconnectConfirm(false);
                      await disconnectWhatsApp();
                    }}
                  >
                    Disconnect
                  </Button>
                </div>
              </ConfirmDialogContent>
            </ConfirmDialog>


            {/* Show explanatory text for members */}
            {!isAdmin && connected && (
              <p className="text-sm text-amber-600">
                Only administrators can disconnect integrations.
              </p>
            )}
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-600">
              Connect your WhatsApp Business account to manage messages and customer interactions directly from this dashboard.
            </p>

            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 text-sm rounded">
              <p>
                Your WhatsApp credentials are never stored on our servers. We use secure, industry-standard authentication directly with WhatsApp. You are always in control and can disconnect at any time.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-black">This will allow HeidelAI to:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-600"></span>
                  Access your business profile information
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-600"></span>
                  Send and receive messages on your behalf
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-600"></span>
                  Manage your WhatsApp Business settings
                </li>
              </ul>
            </div>

            <Button
              className="w-full mt-4 bg-[#25D366] hover:bg-green-600  text-white"
              onClick={handleWhatsAppLogin}
              disabled={isLoading || !isAdmin}
              title={!isAdmin ? "Only admins can connect integrations" : ""}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                </>
              ) : !isAdmin ? (
                "Admin permission required"
              ) : (
                "Connect WhatsApp"
              )}
            </Button>

            {/* Show explanatory text for members */}
            {!isAdmin && !connected && (
              <p className="text-sm text-amber-600">
                Only administrators can connect integrations.
              </p>
            )}
          </div>
        )}
      </DialogContent>

      {/* WhatsAppProfileView component would go here similar to Instagram */}
      {connected && (
        <WhatsAppProfileView
          whatsappId={getWhatsappUserId}
          isOpen={showProfileView}
          onClose={() => setShowProfileView(false)}
        />
      )}
    </Dialog>
  );
};

export default WhatsAppLoginDialog;