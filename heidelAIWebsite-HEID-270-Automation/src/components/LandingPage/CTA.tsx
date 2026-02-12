import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChromeGrid } from '@/components/LandingPage/ui/chrome-grid';
import { ScheduleDemo } from '@/components/LandingPage/ui/schedule-demo';
import { useRouter } from 'next/navigation';

const CTA = () => {
  const router = useRouter();
  return (
    <section data-section="cta" className="relative h-[50vh] w-full overflow-hidden">
      {/* 3D Chrome Grid Background */}
      <ChromeGrid />

      {/* Content Overlay with pointer-events-none to allow interaction with 3D scene */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="text-center mx-auto">
          <div className="flex flex-col items-center gap-4 px-4 mb-4 sm:gap-8 text-center">
            <h2 className="text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">
              Transform Your Customer Experience Today
            </h2>
            <span className="hidden sm:block">
              <p className="text-md max-w-[800px]  font-medium text-white/80 sm:text-xl">
                Join hundreds of businesses already using our AI platform to streamline customer support,
                boost sales, and create amazing customer experiences across all channels.
              </p>
            </span>
            <span className="block sm:hidden">
              <p className="text-md max-w-[700px] mb-2 font-medium text-white/80 sm:text-xl ">
                Start your free trial today and see the difference for yourself!
              </p>
            </span>
          </div>

          {/* Re-enable pointer events for buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto">
            {/* <button onClick={() => {router.push('/onboarding')}} className="inline-flex items-center px-6 py-3 bg-white text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </button> */}
            <span className='hidden sm:inline-flex '>
              <ScheduleDemo />
            </span>
          </div>
        </div>
      </div>

      {/* Subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-5" />
    </section>
  );
};

export default CTA;