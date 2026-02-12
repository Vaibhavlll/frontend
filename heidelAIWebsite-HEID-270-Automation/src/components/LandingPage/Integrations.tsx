import React from 'react';

const Integrations = () => {
  const row1 = [
    { name: "WordPress", logo: "/logos/wordpress.svg" },
    { name: "Shopify", logo: "/logos/shopify.webp" },
    { name: "WhatsApp", logo: "/logos/whatsapp.png" },
    { name: "Instagram", logo: "/logos/instagram.webp" },
    { name: "Facebook Messenger", logo: "/logos/facebook.png" },
  ];

  const row2 = [
    { name: "SMS", logo: "/logos/sms.jpg", scale: 1.3 },
    { name: "Email", logo: "/logos/email.png" },
    { name: "TikTok", logo: "/logos/tiktok.jpg" },
    { name: "Telegram", logo: "/logos/telegram.webp" },
    { name: "Google Sheets", logo: "/logos/google_sheets.png", scale: 1.3 },
  ];

  // Double the rows for seamless looping
  const fullRow1 = [...row1, ...row1, ...row1];
  const fullRow2 = [...row2, ...row2, ...row2];

  return (
    <section id="integrations" className="py-16 overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-4xl md:text-6xl font-[500] text-black leading-[1.1] tracking-tight italic"
            style={{ fontFamily: "'Awesome Serif', serif" }}>
            Integrate With the Apps You Already Use
          </h2>
          <p className="text-lg md:text-xl max-w-[800px] font-medium text-gray-600 font-inter">
            <span className="block md:hidden">
              Manage every channel from one unified platform.
            </span>
            <span className="hidden md:block">
              Stop managing multiple channels separately. Deliver consistent conversations
              whether customers reach you on WhatsApp, Instagram, or your website.
            </span>
          </p>
        </div>
      </div>

      {/* Sliding Window Container */}
      <div className="relative flex flex-col gap-8 w-full">
        {/* Row 1: Right Moving */}
        <div className="flex overflow-hidden">
          <div className="flex animate-scroll-right whitespace-nowrap gap-4 md:gap-6 py-4">
            {fullRow1.map((platform, index) => (
              <div
                key={`${platform.name}-${index}`}
                className="flex items-center justify-center bg-white rounded-2xl p-4 md:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-gray-50 w-[28vw] h-[28vw] md:w-48 md:h-48 flex-shrink-0 transition-all duration-300 hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] hover:-translate-y-2"
              >
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="max-w-[70px] max-h-[70px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:scale-110 hover:drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Left Moving */}
        <div className="flex overflow-hidden">
          <div className="flex animate-scroll-left whitespace-nowrap gap-4 md:gap-6 py-4">
            {fullRow2.map((platform, index) => (
              <div
                key={`${platform.name}-${index}`}
                className="flex items-center justify-center bg-white rounded-2xl p-4 md:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-gray-50 w-[28vw] h-[28vw] md:w-48 md:h-48 flex-shrink-0 transition-all duration-300 hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] hover:-translate-y-2"
              >
                <img
                  src={platform.logo}
                  alt={platform.name}
                  style={{
                    transform: `scale(${platform.scale ?? 1})`,
                  }}
                  className="max-w-[80px] max-h-[80px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:scale-110 hover:drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {/* <div className="text-center mt-16 font-inter" style={{ fontFamily: "'Inter', sans-serif" }}>
        <p className="text-gray-600 mb-6 font-medium">
          Can't find your platform? We're constantly adding new integrations.
        </p>
        <button className="inline-flex items-center px-8 py-3 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-900 transition-all duration-300 hover:scale-105">
          Request Integration
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div> */}

      <style jsx>{`
        @keyframes scroll-right {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Integrations;
