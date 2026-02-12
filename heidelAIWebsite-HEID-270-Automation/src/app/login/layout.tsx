import { Metadata } from 'next';
import Header from '@/components/LandingPage/Header';
import Footer from '@/components/LandingPage/Footer';

export const metadata: Metadata = {
  title: 'HeidelAI - AI-Powered Customer Engagement & Analytics Platform',
  description: "Transform your business with HeidelAI's AI-powered tools for customer engagement, real-time analytics, and smart chatbots.",
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
  openGraph: {
    title: 'HeidelAI - AI-Powered Customer Engagement & Analytics Platform',
    description: "Transform your business with HeidelAI's AI-powered tools for customer engagement, real-time analytics, and smart chatbots.",
    images: ['/heidelai_mockup.png'],
    url: 'https://heidelai.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeidelAI - AI-Powered Customer Engagement & Analytics Platform',
    description: "Transform your business with HeidelAI's AI-powered tools for customer engagement, real-time analytics, and smart chatbots.",
    images: ['/heidelai_mockup.png'],
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen text-white'>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
