import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, Instrument_Serif } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/contexts/AuthContext";
import { LogoutHandler } from "@/components/LogoutHandler";
import { RoleProvider } from "@/contexts/RoleContext";
import { Toaster } from "sonner";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import MixpanelInit from "@/components/MixpanelInit";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-instrument-serif',
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://heidelai.com'),
  alternates: {
    canonical: '/'
  },
  title: {
    default: 'HeidelAI - AI-Powered Customer Engagement & Analytics Platform',
    template: '%s | HeidelAI'
  },
  description: 'Transform your business with HeidelAI\'s AI-powered tools for customer engagement, real-time analytics, and smart chatbots.',
  keywords: [
    'AI customer engagement tools',
    'real-time business analytics',
    'AI chatbots for businesses',
    'ads optimization platform',
    'influencer marketing analytics',
    'WhatsApp chatbots',
    'Telegram chatbots',
    'conversation analytics tools',
    'business growth with AI insights'
  ],
  authors: [{ name: 'HeidelAI' }],
  icons: {
    icon: '/heidelai.png',
    apple: '/heidelai.png',
  },
  openGraph: {
    title: 'HeidelAI - AI-Powered Customer Engagement & Analytics Platform',
    description: 'Transform your business with HeidelAI\'s AI-powered tools for customer engagement, real-time analytics, and smart chatbots.',
    url: 'https://heidelai.com',
    siteName: 'HeidelAI',
    images: ['/heidelai_mockup.png'],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeidelAI - AI-Powered Customer Engagement & Analytics Platform',
    description: 'Transform your business with HeidelAI\'s AI-powered tools for customer engagement, real-time analytics, and smart chatbots.',
    images: ['/heidelai_mockup.png']
  },
  // Add viewport for better mobile responsiveness

}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "HeidelAI - AI Sales & Support Engine",
              "description": "Unify every social platform with intelligent AI that handles operations and scales revenue.",
              "url": "https://heidelai.com",
              "inLanguage": "en-US",
              "isPartOf": { "@id": "https://heidelai.com/#website" }
            })
          }}
        />
        {/* Google Tag Manager in head per Next.js docs */}
        {process.env.NODE_ENV === "production" && (
          <GoogleTagManager
            gtmId={process.env.NEXT_PUBLIC_GTM_ID ?? ""}
          />
        )}
      </head>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} antialiased bg-white text-black font-sans`}
      >
        <Toaster position="top-right" richColors />

        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
          afterSignOutUrl="/"
        >
          <AuthProvider>
            <LogoutHandler />
            <RoleProvider>
              {children}

              {process.env.NODE_ENV === "production" && (
                <>
                  <MixpanelInit />
                  {/* Microsoft Clarity */}
                  <Script id="clarity-script" strategy="afterInteractive">
                    {`
                      (function(c,l,a,r,i,t,y){
                        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                      })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
                    `}
                  </Script>

                  {/* Meta / Facebook Pixel */}
                  <Script id="meta-pixel" strategy="afterInteractive">
                    {`
                      !function(f,b,e,v,n,t,s)
                      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                      n.queue=[];t=b.createElement(e);t.async=!0;
                      t.src=v;s=b.getElementsByTagName(e)[0];
                      s.parentNode.insertBefore(t,s)}(window, document,'script',
                      'https://connect.facebook.net/en_US/fbevents.js');
                      fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                      fbq('track', 'PageView');
                    `}
                  </Script>

                  <noscript>
                    <img
                      height="1"
                      width="1"
                      style={{ display: "none" }}
                      src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
                      alt=""
                    />
                  </noscript>
                </>
              )}
            </RoleProvider>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
