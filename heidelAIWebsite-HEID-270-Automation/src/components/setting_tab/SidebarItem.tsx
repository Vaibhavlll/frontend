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
import { useUser, useOrganization, useAuth } from '@clerk/nextjs';
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import ComingSoon from '../shared/ComingSoon';
import Pricing from '../LandingPage/Pricing';
import { isDevelopment } from '@/utils/environmentCheck';
import { BillingSection } from './BillingSection';
import GoogleLoginDialog from './GoogleLoginDialog';

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
  const { getToken } = useAuth();

  const handleGetToken = async () => {
    try {
      const sessionToken = await getToken();

      if (!sessionToken) {
        toast.error("No token found");
        return;
      }

      await navigator.clipboard.writeText(sessionToken);
      toast.success("Token copied");
    } catch (error) {
      console.error("Error in token_testDialog:", error);
      toast.error("Failed to copy token");
    }
  };

  return (
    <div className="p-4 bg-gray-50 border rounded-lg shadow-sm">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleGetToken}
      >
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


export const MacrosSettings = () => (
  <ComingSoon
    description="Streamline your workflow with powerful macros. Create automated responses and actions to handle common tasks with a single click!"
  />
);



export const IntegrationsSettings = () => (
  <div className="min-h-[300px] flex flex-col items-start p-4 md:p-8">
    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Platform Integrations</h2>

    {/* --- Active Integrations Section --- */}
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
      
      

      {/* Instagram Integration Card */}
      <div className="border rounded-lg p-4 md:p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Image
                height={120}
                width={120}
                src='/logos/instagram.webp'
                alt="Instagram Logo"
                className="w-10 h-10 text-white flex-shrink-0"
              />
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

      {/* WhatsApp Integration Card */}
      <div className="border rounded-lg p-4 md:p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Image
                height={120}
                width={120}
                src='/logos/whatsapp.png'
                alt="WhatsApp Logo"
                className="w-10 h-10 text-white flex-shrink-0"
              />
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
      {/* google integration card */}
      <div className="border rounded-lg p-4 md:p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Google colored icon */}
                    <div className="rounded-lg p-2 flex-shrink-0 bg-white border border-gray-200 shadow-sm">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base md:text-lg font-semibold truncate">Google Sheets & Forms</h3>
                        <p className="text-xs md:text-sm text-gray-600 truncate">Sync data from Sheets and Forms into automations</p>
                    </div>
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                    {/* GoogleLoginDialog imported from ./GoogleLoginDialog */}
                    <GoogleLoginDialog />
                </div>
            </div>
        </div>
    </div>
 </div>


<div className="relative flex items-center w-full mt-6 mb-8">
      <div className="flex-grow border-t border-gray-200"></div>
      <span className="flex-shrink-0 mx-4 text-gray-400 font-bold text-lg md:text-xl">Coming Soon</span>
      <div className="flex-grow border-t border-gray-200"></div>
    </div>
    
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      
      {/* Telegram Integration Card (Replaces Facebook) */}
      <div className="border rounded-lg p-4 md:p-6 bg-gray-50 opacity-75">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Image
                height={38}
                width={38}
                src='/logos/telegram.webp'
                alt="Telegram Logo"
                className="w-10 h-10 text-white flex-shrink-0 grayscale"
              />
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-semibold truncate text-gray-600">Telegram</h3>
                <p className="text-xs md:text-sm text-gray-500 truncate">Connect your Telegram Bot</p>
              </div>
            </div>
            <Button
              disabled
              className="bg-gray-200 text-gray-500 w-full sm:w-auto flex-shrink-0 cursor-not-allowed"
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 md:p-6 bg-gray-50 opacity-75">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Image
                height={38}
                width={38}
                src='/logos/facebook.svg'
                alt="Facebook Logo"
                className="w-10 h-10 text-white flex-shrink-0 grayscale"
              />
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-semibold truncate text-gray-600">Facebook</h3>
                <p className="text-xs md:text-sm text-gray-500 truncate">Connect your Facebook Page</p>
              </div>
            </div>
            <Button
              disabled
              className="bg-gray-200 text-gray-500 w-full sm:w-auto flex-shrink-0 cursor-not-allowed"
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>

      {/* WooCommerce Integration Card (Moved to Coming Soon) */}
      <div className="border rounded-lg p-4 md:p-6 bg-gray-50 opacity-75">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Image
                height={38}
                width={38}
                src='/logos/woocommerce.svg'
                alt="WooCommerce Logo"
                className="w-10 h-10 text-white flex-shrink-0 grayscale"
              />
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-semibold truncate text-gray-600">WooCommerce</h3>
                <p className="text-xs md:text-sm text-gray-500 truncate">Connect your WooCommerce store</p>
              </div>
            </div>
            <Button
              disabled
              className="bg-gray-200 text-gray-500 w-full sm:w-auto flex-shrink-0 cursor-not-allowed"
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>

      {/* Shopify Integration Card */}
      <div className="border rounded-lg p-4 md:p-6 bg-gray-50 opacity-75">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Image
                height={38}
                width={38}
                src='/logos/shopify.svg'
                alt="Shopify Logo"
                className="w-10 h-10 text-white flex-shrink-0 grayscale"
              />
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-semibold truncate text-gray-600">Shopify</h3>
                <p className="text-xs md:text-sm text-gray-500 truncate">Connect to your Shopify store</p>
              </div>
            </div>
            <Button
              disabled
              className="bg-gray-200 text-gray-500 w-full sm:w-auto flex-shrink-0 cursor-not-allowed"
            >
              Coming Soon
            </Button>
            {/* <div className="w-full sm:w-auto flex-shrink-0"> */}
              {/* <ShopifyDialog /> */}
            {/* </div> */}
          </div>
        </div>
      </div>

      {/* Token Test Box - for development purposes */}
      {isDevelopment && (
        <div className="lg:col-span-2">
          <TokenTestBox />
        </div>
      )}
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