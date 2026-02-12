import { Metadata } from 'next';
import Header from '@/components/LandingPage/Header'
import Footer from '@/components/LandingPage/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service - HeidelAI',
  description: "HeidelAI's Terms of Service outline the rules, guidelines, and agreements for using our AI-powered customer engagement and analytics platform.",
  keywords: ['HeidelAI terms of service', 'user agreement', 'service terms', 'legal terms', 'platform usage terms', 'business terms and conditions'],
  authors: [{ name: 'HeidelAI' }],
  openGraph: {
    title: 'Terms of Service - HeidelAI',
    description: "Read HeidelAI's Terms of Service to understand your rights and responsibilities when using our platform.",
    images: ['/heidelai_mockup.png'],
    url: 'https://heidelai.com/terms-of-service',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service - HeidelAI',
    description: "Read HeidelAI's Terms of Service to understand your rights and responsibilities when using our platform.",
    images: ['/heidelai_mockup.png'],
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-white text-zinc-900">
      <Header />
      <main className="min-h-screen bg-white text-zinc-900 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}