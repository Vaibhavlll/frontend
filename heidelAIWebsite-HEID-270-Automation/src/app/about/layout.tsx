import { Metadata } from 'next';
import Header from '@/components/LandingPage/Header'
import Footer from '@/components/LandingPage/Footer'

export const metadata: Metadata = {
  title: 'About Us - HeidelAI',
  description: 'Learn more about HeidelAI, our mission, and the team behind our AI-powered customer engagement and analytics platform.',
  keywords: ['HeidelAI about us', 'company information', 'team', 'mission', 'AI-powered platform'],
  authors: [{ name: 'HeidelAI' }],
  openGraph: {
    title: 'About Us - HeidelAI',
    description: 'Learn more about HeidelAI, our mission, and the team behind our AI-powered customer engagement and analytics platform.',
    images: ['/heidelai_mockup.png'],
    url: 'https://heidelai.com/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - HeidelAI',
    description: 'Learn more about HeidelAI, our mission, and the team behind our AI-powered customer engagement and analytics platform.',
    images: ['/heidelai_mockup.png'],
  },
};

export default function AboutLayout({
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