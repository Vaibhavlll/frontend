// 'use client';

// import { useEffect } from 'react';

// interface FacebookSDKInterface {
//     init(options: {
//       appId: string;
//       cookie: boolean;
//       xfbml: boolean;
//       version: string;
//     }): void;
//     AppEvents: {
//       logPageView(): void;
//     };
//     login(
//       callback: (response: FacebookLoginResponse) => void,
//       options?: {
//         config_id?: string;
//         response_type?: string;
//         override_default_response_type?: boolean;
//         scope?: string; // Add this line
//       }
//     ): void;
//   }

// export interface FacebookLoginResponse {
//   authResponse?: {
//     accessToken: string; // Add this line
//     code: string;
//     expiresIn: number;
//     signedRequest?: string;
//     userID?: string;
//   };
//   status?: string;
// }

// // Update global window interface to include FB property
// declare global {
//   interface Window {
//     fbAsyncInit: () => void;
//     FB: FacebookSDKInterface;
//   }
// }

// const FACEBOOK_APP_ID = '509681741462833'; // Your FB App ID

// export default function FacebookSDK() {
//     useEffect(() => {
//       // Load the Facebook SDK
//       if (typeof window !== 'undefined' && !window.FB) {
//         window.fbAsyncInit = function() {
//           window.FB.init({
//             appId: FACEBOOK_APP_ID,
//             cookie: true,
//             xfbml: true,
//             version: 'v17.0'
//           });
          
//           window.FB.AppEvents.logPageView();
//         };
  
//         // Load the SDK asynchronously
//         (function(d, s, id) {
//         //   const js;
//           const fjs = d.getElementsByTagName(s)[0];
//           if (d.getElementById(id)) return;
//           const js = d.createElement(s) as HTMLScriptElement;
//           js.id = id;
//           js.src = "https://connect.facebook.net/en_US/sdk.js";
//           fjs?.parentNode?.insertBefore(js, fjs);
//         }(document, 'script', 'facebook-jssdk'));
//       }
  
//       // Cleanup
//       return () => {
//         // Clean up any event listeners if needed
//       };
//     }, []);
  
//     return null; // This component doesn't render anything
//   }