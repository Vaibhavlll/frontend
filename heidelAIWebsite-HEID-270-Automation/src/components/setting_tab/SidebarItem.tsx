import React, { useEffect, useState } from 'react';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import AgentsSettings from './Agent_management';
import TeamsConfiguration from './Team_configuration';
import CannedResponses from './CannedResponsesContext';
// import AutomationPage from '../Automation/AutomationPage';
import BillingPlans from '../inbox/BillingPlans';
import { Construction, Loader2, Instagram } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@supabase/supabase-js';
import InstagramProfileView from './InstagramProfileView';
// import FacebookSDK, { FacebookLoginResponse } from '@/components/facebook/FacebookSDK';
import { useIntegrations } from '@/components/hooks/useIntegrations';
import { getData, storeData, deleteData, DB_KEYS } from "@/lib/indexedDB";

// import { useIntegrations } from '@/components/hooks/useIntegrations';
// import { getData, storeData, deleteData, DB_KEYS } from "@/lib/indexedDB";

// import { useIntegrations } from '@/components/hooks/useIntegrations';
// import { getData, storeData, deleteData, DB_KEYS } from "@/lib/indexedDB";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
// import { Shopify } from '@shopify/shopify-api';
import { toast } from 'sonner';
import WhatsAppLoginDialog from './WhatsappLoginDialog';
import { useApi } from "@/lib/session_api";
import { useUser, useOrganization } from '@clerk/nextjs';
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import ComingSoon from '../shared/ComingSoon';
import Pricing from '../LandingPage/Pricing';

// Function to fetch catalog data from the backend
interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
  price?: string;
  [key: string]: string | number | boolean | undefined; // For any additional fields
}


interface CatalogResponse {
  data: CatalogProduct[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

interface InstagramConnectionData {
  status: boolean;          // Connection status
  username: string;         // From API response
  profileImage: string;     // From profile_picture_url in API
  userId: string;           // From id in API
  businessInfo: {
    id?: string;
    biography?: string;
    followers_count?: number;
    follows_count?: number;
    media_count?: number;
    name?: string;
    website?: string;
  };
  lastUpdated?: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// import { useUser } from '@clerk/nextjs';

const loginWithFacebook = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      scopes: "catalog_management",
      queryParams: {
        config_id: '4039287289647486',
      }
    }
  });

  if (error) console.error("Login error:", error.message);
};




const WooCommerceDialog = () => {
  const [credentials, setCredentials] = useState({
    siteUrl: '',
    consumerKey: '',
    consumerSecret: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const resetForm = () => {
      setCredentials({
        siteUrl: '',
        consumerKey: '',
        consumerSecret: ''
      });
      setError(null);
      setSuccess(false);
    };

    try {
      const api = new WooCommerceRestApi({
        url: credentials.siteUrl,
        consumerKey: credentials.consumerKey,
        consumerSecret: credentials.consumerSecret,
        version: "wc/v3"
      });

      // Test the connection by fetching products
      const response = await api.get("products", { per_page: 3 });
      console.log("Connection successful:", response.data);
      setSuccess(true);

      // Store the credentials securely (you can implement your storage method here)
      localStorage.setItem('woocommerce_credentials', JSON.stringify({
        url: credentials.siteUrl,
        key: credentials.consumerKey,
      }));

      setTimeout(() => {
        resetForm();
      }, 2000);

    } catch (error) {
      console.error("WooCommerce connection error:", error);
      setError(error instanceof Error ? error.message : 'Failed to connect to WooCommerce');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#96588A] hover:bg-[#804674] text-white">
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect WooCommerce Store</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="siteUrl">Site URL</label>
            <Input
              id="siteUrl"
              placeholder="https://your-store.com"
              value={credentials.siteUrl}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                siteUrl: e.target.value
              }))}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="consumerKey">Consumer Key</label>
            <Input
              id="consumerKey"
              type="password"
              placeholder="ck_xxxxxx"
              value={credentials.consumerKey}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                consumerKey: e.target.value
              }))}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="consumerSecret">Consumer Secret</label>
            <Input
              id="consumerSecret"
              type="password"
              placeholder="cs_xxxxxx"
              value={credentials.consumerSecret}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                consumerSecret: e.target.value
              }))}
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-500 bg-green-50 p-2 rounded">
              Successfully connected to WooCommerce store!
            </div>
          )}
          <Button
            onClick={handleConnect}
            className="bg-[#96588A] hover:bg-[#804674] text-white"
            disabled={isLoading || !credentials.siteUrl || !credentials.consumerKey || !credentials.consumerSecret}
          >
            {isLoading ? "Connecting..." : "Authenticate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};



const ShopifyDialog = () => {
  const [credentials, setCredentials] = useState({
    shopName: '',
    accessToken: '',
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#96bf48] hover:bg-[#7da039] text-white">
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Shopify Store</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="shopName">Name</label>
            <Input
              id="shopName"
              placeholder="your-store.myshopify.com"
              value={credentials.shopName}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                shopName: e.target.value
              }))}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="accessToken">Access Token</label>
            <Input
              id="accessToken"
              type="password"
              placeholder="shpat_xxxxxx"
              value={credentials.accessToken}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                accessToken: e.target.value
              }))}
            />
          </div>
          <Button
            className="bg-[#96bf48] hover:bg-[#7da039] text-white"
            onClick={() => console.log('Shopify connection clicked')}
          >
            Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InstagramDialog = () => {
  const [connected, setConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState<{
    username: string;
    profileImage: string;
    businessInfo?: {
      account_type?: string;
      follower_count?: number;
      media_count?: number;
      username?: string;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);

  const { user } = useUser();
  // const isAdmin = user?.publicMetadata?.role === 'admin';
  const api = useApi();


  // const { integrations, loading: integrationsLoading, refreshIntegrations } = useIntegrations();
  // const { user } = useUser();
  const { organization } = useOrganization();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

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



  const { integrations, loading: integrationsLoading, refreshIntegrations } = useIntegrations();

  // Check if user has already connected Instagram
  useEffect(() => {
    if (!integrationsLoading) {
      if (integrations.instagram && integrations.instagram.status) {
        setConnected(true);
        setAccountInfo({
          username: integrations.instagram.username,
          profileImage: integrations.instagram.profileImage || '/default-avatar.png',
          businessInfo: integrations.instagram.businessInfo || {}
        });
      } else {
        setConnected(false);
      }
    }
  }, [integrations, integrationsLoading]);


  const getInstagramUserId = async () => {
    try {
      const instagramData = await getData<InstagramConnectionData>(
        'integrations',
        DB_KEYS.INTEGRATIONS.INSTAGRAM
      );
      return instagramData?.userId || null;
    } catch (error) {
      console.error('Error retrieving Instagram user ID:', error);
      return null;
    }
  };

  // Function to initiate Instagram OAuth login
  const handleInstagramLogin = () => {
    setIsLoading(true);

    try {
      // Generate cryptographically secure state
      const state = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
      localStorage.setItem("instagram_auth_state", state);

      // Configurable values
      const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!;
      const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID!;

      const scopes = [
        "instagram_business_basic",
        "instagram_business_manage_messages",
      ].join("%2C");

      // Build auth URL
      const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=${scopes}&state=${state}`;

      window.location.assign(authUrl);
    } catch (error) {
      console.error("Error initiating Instagram login:", error);
      toast.error("Could not initiate Instagram login. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectInstagram = async () => {
    try {
      setIsLoading(true);

      // Get the user ID from IndexedDB instead of localStorage
      const user_id = await getInstagramUserId();

      if (user_id) {
        const data = { user_id };

        // Disconnect using the dedicated Instagram API
        await api.post('/api/instagram/disconnect', { data });

        // Update IndexedDB - set connected to false but keep other data
        try {
          const existingData = await getData<InstagramConnectionData>(
            'integrations',
            DB_KEYS.INTEGRATIONS.INSTAGRAM
          );

          if (existingData) {
            await storeData('integrations', DB_KEYS.INTEGRATIONS.INSTAGRAM, {
              ...existingData,
              connected: false,
              lastUpdated: Date.now()
            });
          }
        } catch (dbError) {
          console.error("Error updating IndexedDB on disconnect:", dbError);
        }

        // For backward compatibility, also clear localStorage
        localStorage.removeItem('instagram_auth_state');

        setConnected(false);
        setAccountInfo(null);

        // Update integrations status
        refreshIntegrations();

        toast.success('Instagram account disconnected successfully');
      } else {
        toast.error('No Instagram account found to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting Instagram:', error);
      toast.error('Failed to disconnect Instagram account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white">
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
          <DialogTitle className='text-black'>{connected ? 'Manage Instagram Connection' : 'Connect Instagram Account'}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : connected && accountInfo ? (
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={accountInfo.profileImage}
                  alt={accountInfo.username}
                  className="h-16 w-16 rounded-full object-cover border-2 border-pink-200"
                />
                <div>
                  <p className="font-medium text-black text-lg">{accountInfo.username}</p>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-600"></span>
                    <span>Connected</span>
                  </div>
                </div>
              </div>

              {/* View Profile button */}
              <Button
                variant="outline"
                className="border border-gray-300 hover:border-purple-500 hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-all flex items-center gap-1 px-3 py-1.5 rounded-md shadow-sm"
                onClick={() => setShowProfileView(true)}
              >
                <span className="flex items-center gap-1.5">
                  <span>View Profile</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm text-black font-medium">Permissions granted:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access to your Instagram profile information.
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access to your Instagram media and content.
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Permission to manage your Instagram messages.
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
                      await disconnectInstagram();
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
              Connect your Instagram account to manage messages and access media directly from this dashboard.
            </p>

            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 text-sm rounded">
              <p>
                Your Instagram credentials are never stored on our servers. We use secure, industry-standard OAuth authentication directly with Instagram. You are always in control and can disconnect at any time.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">This will allow HeidelAI to:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Access your basic profile information</li>
                <li>• View your media and content</li>
                <li>• Access your Instagram inbox to read and manage messages</li>
              </ul>
            </div>

            <Button
              className={`w-full mt-4 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white `}
              onClick={handleInstagramLogin}
              disabled={isLoading || !isAdmin}
              title={!isAdmin ? "Only admins can connect integrations" : ""}
            >
              <span className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : !isAdmin ? (
                  "Admin permission required"
                ) : (
                  <>
                    <Instagram className="h-4 w-4" /> Login with Instagram
                  </>
                )}
              </span>
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

      {connected && (
        <InstagramProfileView
          isOpen={showProfileView}
          onClose={() => setShowProfileView(false)}
        />
      )}
    </Dialog>
  );
};

const TokenTestBox = () => {
  const getToken = async () => {
    try {
      const sessionID = localStorage.getItem("sessionId");
      if (!sessionID) {
        throw new Error("No session ID found");
      }
      const res = await fetch(`/api/session-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionID }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to get session token: ${errorText}`);
      }

      const { token: sessionToken } = await res.json();
      if (!sessionToken) {
        throw new Error("Failed to retrieve session token");
      }

      // Copy token to clipboard
      await navigator.clipboard.writeText(sessionToken);
      toast.success("Token copied");
    } catch (error) {
      console.error("Error in token_testDialog:", error);
      toast.error("Failed to copy token");
    }
  };

  return (
    <div className="p-4 bg-gray-50 border rounded-lg shadow-sm">
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={getToken}>
        Test Token
      </button>
    </div>
  );
};



// export const FacebookCatalogIntegration = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   // Add state for dialog
//   const [showDialog, setShowDialog] = useState(false);

//   // On mount: check if user is logged in and has a Facebook catalog connection
//   useEffect(() => {
//     const checkConnection = async () => {
//       setIsLoading(true);

//       // Check if user has an active Supabase session (OAuth token present)
//       const { data, error } = await supabase.auth.getSession();
//       const session = data?.session;

//       if (session) {
//         // Optional: Check if this session was from Facebook (provider_id = 'facebook')
//         const provider = session?.user?.app_metadata?.provider;

//         // Check if previously marked as connected (persisted flag)
//         const fbStored = localStorage.getItem("facebook_catalog_connection");

//         if (provider === "facebook" || fbStored) {
//           localStorage.setItem(
//             "facebook_catalog_connection",
//             JSON.stringify({ connected: true })
//           );
//           setIsConnected(true);
//           toast.success("Facebook catalog connected successfully.");
//         } else {
//           setIsConnected(false);
//         }
//       } else {
//         setIsConnected(false);
//       }

//       setIsLoading(false);
//     };

//     checkConnection();
//   }, []);

//   function loadFacebookSDK(appId: string, callback: () => void) {
//   if (window.FB) {
//     callback();
//     return;
//   }
//   if (!document.getElementById('facebook-jssdk')) {
//     const script = document.createElement('script');
//     script.id = 'facebook-jssdk';
//     script.src = 'https://connect.facebook.net/en_US/sdk.js';
//     script.onload = () => {
//       window.FB.init({
//         appId,
//         cookie: true,
//         xfbml: false,
//         version: 'v19.0',
//       });
//       callback();
//     };
//     document.body.appendChild(script);
//   } else {
//     // If script exists but FB not ready, wait for it
//     const existingScript = document.getElementById('facebook-jssdk');
//     if (existingScript) {
//       existingScript.onload = () => {
//         window.FB.init({
//           appId,
//           cookie: true,
//           xfbml: false,
//           version: 'v19.0',
//         });
//         callback();
//       };
//     }
//   }
// }


// const FACEBOOK_CATALOG_CONFIG_ID = "524055147308362";
// const FACEBOOK_APP_ID = "509681741462833"; 

// const handleFacebookCatalogLogin = () => {
//   setIsLoading(true);

//   loadFacebookSDK(FACEBOOK_APP_ID, () => {
//     if (window.FB) {
//       window.FB.login(
//         function (response: FacebookLoginResponse) {
//           if (response.authResponse && response.status === 'connected') {
//             // Only store connection data if login was successful
//             const accessToken = response.authResponse.accessToken;
//             localStorage.setItem(
//               "facebook_catalog_connection",
//               JSON.stringify({
//                 accessToken,
//                 connected: true,
//                 time: Date.now(),
//               })
//             );
//             setIsConnected(true);
//             toast.success("Facebook catalog connected successfully.");
//             window.location.hash = "#integrations";
//           } else {
//             // If login was cancelled or failed, ensure we're disconnected
//             setIsConnected(false);
//             localStorage.removeItem("facebook_catalog_connection");
//             toast.error("Facebook login was cancelled or failed.");
//           }
//           setIsLoading(false);
//         },
//         {
//           config_id: FACEBOOK_CATALOG_CONFIG_ID,
//           scope: "catalog_management",
//         }
//       );
//     } else {
//       setIsLoading(false);
//       toast.error("Facebook SDK not loaded. Please try again later.");
//     }
//   });
// };

// const handleDisconnect = async () => {
//   setIsLoading(true);
//   try {
//     localStorage.removeItem("facebook_catalog_connection");
//     setIsConnected(false);
//     toast.success("Facebook catalog disconnected successfully.");
//   } catch (error) {
//     toast.error("Failed to disconnect Facebook catalog.");
//   } finally {
//     setIsLoading(false);
//     window.location.hash = "#integrations";
//   }
// };

// // Move handleClick to the parent scope so it is accessible


//   return (
//     <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
//       <div className="space-y-4">
//         <div className="flex items-start justify-between">
//           <div className="flex items-center gap-3">
//             <div className="bg-[#4267B2] rounded-lg p-2">
//               <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H9.691v-3.622h3.129V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24h-1.917c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.593 1.324-1.324V1.325C24 .593 23.407 0 22.675 0z" />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold">Facebook Catalog</h3>
//               <p className="text-sm text-gray-600">Connect your Facebook product catalog</p>
//             </div>
//           </div>
//           {isLoading ? (
//             <Button className="bg-gray-400 text-white" disabled>
//               Loading...
//             </Button>
//           ) : isConnected ? (
//             <Button
//               className="bg-red-500 hover:bg-red-600 text-white"
//               onClick={handleDisconnect}
//             >
//               Disconnect
//             </Button>
//           ) : (
//             <Dialog open={showDialog} onOpenChange={setShowDialog}>
//               <DialogTrigger asChild>
//                 <Button className="bg-[#4267B2] hover:bg-[#365899] text-white">
//                   Connect
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="sm:max-w-[425px] h-[55vh]">
//                 <DialogHeader>
//                   <DialogTitle>Connect Facebook Catalog</DialogTitle>
//                 </DialogHeader>
//                 <div className="py-2 space-y-2">
//                     <p>
//   Connect your Facebook account to manage your product catalog directly from this dashboard.
// </p>
//                 </div>
//                 <div className="p-1 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm rounded">
//                         <p>
//     Your Facebook credentials are never stored on our servers. We use secure, industry-standard OAuth authentication directly with Facebook. You are always in control and can disconnect at any time.
//   </p>
//                 </div>
//                 <div className="py-2 space-y-2">
//                   <div className="space-y-4">
//                     <h4 className="text-sm font-medium">This will allow HeidelAI to:</h4>
//                     <ul className="text-sm text-gray-600 space-y-2">
//                       <li className="flex items-center gap-2">
//                         <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                         Access products in your Meta Catalog
//                       </li>
//                       <li className="flex items-center gap-2">
//                         <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                         Update existing products in the catalog
//                       </li>
//                       <li className="flex items-center gap-2">
//                         <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                         Add new products to the catalog
//                       </li>
//                     </ul>
//                   </div>
//                   <Button 
//                     className="w-full bg-[#4267B2] hover:bg-[#365899] text-white mt-4"
//                     onClick={() => {
//                       setShowDialog(false);
//                       handleFacebookCatalogLogin();
//                     }}
//                   >
//                     Continue with Facebook
//                   </Button>
//                 </div>
//               </DialogContent>

//             </Dialog>

//           )}
//         </div>
//       </div>
//     </div>
//   );
// };



export default function DashboardPage() {
  const handleInsertResponse = (message: string) => {
    // Handle the canned response insertion
    console.log('Inserting canned response:', message);
    // Add your implementation here
  };
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Add component */}
      <AgentsSettings />
      <TeamsConfiguration />
      <CannedResponses onInsertResponse={handleInsertResponse} />
      {/* You can add other dashboard components here */}
    </div>
  );
}

export const InboxSettings = () => {
  return (
    <ComingSoon
      description="Configure how incoming messages are handled and routed. Advanced inbox management is arriving soon!"
    />
  );
};

export const LabelsSettings = () => {
  return (
    <ComingSoon
      description="Organize conversations with custom labels. Label management is arriving soon to help you categorize and prioritize your chats!"
    />
  );
};

export const CustomAttributesSettings = () => {
  return (
    <ComingSoon
      description="Define custom fields for contacts and conversations. Custom attributes are arriving soon to help you track business-specific data!"
    />
  );
};


export const Billing = () => (
  <div className="flex justify-center items-center">
    <Pricing showHeader={false} />
  </div>
);


export const MacrosSettings = () => (
  <ComingSoon
    description="Streamline your workflow with powerful macros. Create automated responses and actions to handle common tasks with a single click!"
  />
);



export const IntegrationsSettings = () => (
  <div className="min-h-[300px] flex flex-col items-start p-4 md:p-8">
    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Platform Integrations</h2>

    {/* Responsive Grid - 1 column mobile, 2 columns desktop */}
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

      {/* Facebook Integration Card */}
      <div className="border rounded-lg p-4 md:p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-[#1877F2] rounded-lg p-2 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H9.691v-3.622h3.129V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24h-1.917c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.593 1.324-1.324V1.325C24 .593 23.407 0 22.675 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-semibold truncate">Facebook</h3>
                <p className="text-xs md:text-sm text-gray-600 truncate">Connect your Facebook pages</p>
              </div>
            </div>
            <Button
              onClick={loginWithFacebook}
              className="bg-[#1877F2] hover:bg-[#0c5bdb] text-white w-full sm:w-auto flex-shrink-0"
            >
              Connect
            </Button>
          </div>
        </div>
      </div>

      {/* WooCommerce Integration Card */}
      <div className="border rounded-lg p-4 md:p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-[#96588A] rounded-lg p-2 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.2,6.2c-0.8-1.1-2.1-1.8-3.5-1.8c-0.8,0-1.6,0.2-2.2,0.6C12.9,4.4,12,4,11,4c-1.4,0-2.7,0.7-3.5,1.8C6.7,4.7,5.4,4,4,4C1.8,4,0,5.8,0,8c0,0.8,0.2,1.5,0.6,2.2C0.2,11.5,0,12.7,0,14c0,4.4,3.6,8,8,8h8c4.4,0,8-3.6,8-8c0-1.3-0.2-2.5-0.6-3.8C23.8,9.5,24,8.8,24,8C24,5.8,22.2,4,20,4C18.6,4,17.3,4.7,16.5,6.2z M11,15V9c0-0.6,0.4-1,1-1s1,0.4,1,1v6c0,0.6-0.4,1-1,1S11,15.6,11,15z M7,15V9c0-0.6,0.4-1,1-1s1,0.4,1,1v6c0,0.6-0.4,1-1,1S7,15.6,7,15z M15,15V9c0-0.6,0.4-1,1-1s1,0.4,1,1v6c0,0.6-0.4,1-1,1S15,15.6,15,15z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-semibold truncate">WooCommerce</h3>
                <p className="text-xs md:text-sm text-gray-600 truncate">Connect your WooCommerce store</p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
              <WooCommerceDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Shopify Integration Card */}
      <div className="border rounded-lg p-4 md:p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src='/logos/shopify.svg'
                alt="Shopify Logo"
                className="w-10 h-10 text-white flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-semibold truncate">Shopify</h3>
                <p className="text-xs md:text-sm text-gray-600 truncate">Connect to your Shopify store</p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
              <ShopifyDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Instagram Integration Card */}
      <div className="border rounded-lg p-4 md:p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg p-2 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-semibold truncate">Instagram</h3>
                <p className="text-xs md:text-sm text-gray-600 truncate">Connect your Instagram business account</p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
              <InstagramDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Facebook Catalog Integration Card */}
      {/* <FacebookCatalogIntegration /> */}

      {/* WhatsApp Integration Card */}
      <div className="border rounded-lg p-4 md:p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-[#25D366] rounded-lg p-2 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 6.01L0 24l6.15-1.58A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 22.05c-1.85 0-3.67-.5-5.26-1.45l-.38-.22-3.65.94.97-3.55-.25-.37A9.94 9.94 0 012.05 12c0-5.47 4.48-9.95 9.95-9.95 2.66 0 5.17 1.04 7.05 2.93a9.94 9.94 0 012.93 7.05c0 5.47-4.48 9.95-9.95 9.95zm5.6-7.88c-.31-.16-1.85-.91-2.14-1.02-.29-.1-.5-.16-.71.16-.2.31-.82 1.02-1.01 1.23-.18.2-.37.22-.68.07-.31-.16-1.3-.48-2.47-1.54-.91-.81-1.52-1.81-1.7-2.12-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.56.16-.18.2-.31.31-.52.1-.2.05-.38-.02-.54-.07-.16-.71-1.7-.97-2.33-.26-.63-.52-.54-.71-.55h-.6c-.2 0-.52.07-.79.38-.27.31-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.16.2 2.1 3.2 5.1 4.49.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.08 1.85-.76 2.11-1.5.26-.74.26-1.38.18-1.5-.07-.12-.29-.2-.6-.36z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-semibold truncate">WhatsApp</h3>
                <p className="text-xs md:text-sm text-gray-600 truncate">Connect WhatsApp account</p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
              <WhatsAppLoginDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <TokenTestBox />
      </div>
    </div>
  </div>
);

export const AuditLogsSettings = () => {
  return (
    <ComingSoon
      description="Track and review all system activities. Comprehensive audit logs are arriving soon to ensure transparency and security!"
    />
  );
};

export const CustomRolesSettings = () => (
  <ComingSoon
    description="Define precise access controls with custom roles. Personalized permission management is arriving soon to help you scale your team securely!"
  />
);

export const SLASettings = () => (
  <ComingSoon
    description="Maintain high standards with Service Level Agreements. Automated SLA tracking and reporting is arriving soon to help you deliver exceptional support!"
  />
);