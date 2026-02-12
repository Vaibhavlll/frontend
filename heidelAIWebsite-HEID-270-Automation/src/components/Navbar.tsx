'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';


export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = 30;
      setHasScrolled(window.scrollY > viewportHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



    return(
      <motion.div
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      exit={{ opacity: 0, filter: "blur(20px)", y: -20 }}
      initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
      transition={{ duration: 0.6, delay: 1.5, type: "tween", ease: "easeInOut" }}
      className='fixed top-0 w-full z-50'
    >
      <nav className={`fixed top-0 w-full   z-50 
        ${hasScrolled ? 'backdrop-blur-sm bg-black/30 border-b border-neutral-900/50' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Link href="/" className='flex items-center space-x-2'>
                  <Image
                    src="/HeidelAi Favicon svg.svg" 
                    alt="Heidel AI Logo" 
                    width={32}
                    height={32}
                    className="h-8 w-8" 
                  />
                  <span className="text-xl font-normal  text-white">
                    Heidel AI
                  </span>
                  </Link>
                </div>
              </div>
              <div className="block md:hidden lg:hidden">
              <div className="ml-10 flex items-baseline space-x-4">
                  
              <button className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium" onClick={() => router.push('/login')}>Login</button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="#home" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Home
                  </a>
                  <a href="#features" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Features
                  </a>
                  <a href="#pricing" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
                    Pricing
                  </a>
              <button className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium" onClick={() => setIsOpen(true)}>Get Started</button>
              <button className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium" onClick={() => router.push('/login')}>Login</button>
                </div>
              </div>
            </div>
            
          </div>
        </nav>
        </motion.div>
    )
}

// {/* Hamburger Menu Button - Mobile Only */}
//             {/* <div className="absolute flex h-full justify-center items-center top-0 right-2 md:hidden">
//                 <button className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
//                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                   </svg>
//                 </button>
//               </div> */}