import { Metadata } from 'next';
import Header from '@/components/LandingPage/Header'
import Footer from '@/components/LandingPage/Footer'

export const metadata: Metadata = {
    title: 'Privacy Policy - HeidelAI',
    description: "HeidelAI's Privacy Policy details how we collect, use, and protect your personal information when using our AI-powered customer engagement platform.",
    keywords: ['HeidelAI privacy policy', 'data protection', 'user privacy', 'personal information handling', 'privacy terms', 'customer data security'],
    authors: [{ name: 'HeidelAI' }],
    openGraph: {
        title: 'Privacy Policy - HeidelAI',
        description: 'Learn about how HeidelAI protects your privacy and handles your personal information.',
        images: ['/heidelai_mockup.png'],
        url: 'https://heidelai.com/privacy-policy',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Privacy Policy - HeidelAI',
        description: 'Learn about how HeidelAI protects your privacy and handles your personal information.',
        images: ['/heidelai_mockup.png'],
    },
};

export default function PrivacyPolicyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-white">
            <Header />
            <main className="min-h-screen bg-white">
                {children}
            </main>
            <Footer />
        </div>
    );
}