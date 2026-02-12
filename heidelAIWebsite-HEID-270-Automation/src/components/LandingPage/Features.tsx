/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  FaChartLine,
  FaRobot,
  FaBullseye,
  FaLightbulb,
  FaDollarSign,
  FaSearch,
} from "react-icons/fa";

interface InputIcon {
  id: string;
  name: string;
  logoUrl: string;
  color: string;
}

interface OutputCard {
  id: string;
  icon: string;
  title: string;
  category: string;
}

const INPUT_ICONS: InputIcon[] = [
  {
    id: "1",
    name: "WhatsApp",
    logoUrl: "https://cdn.simpleicons.org/whatsapp/25D366",
    color: "border-green-500",
  },
  {
    id: "2",
    name: "Instagram",
    logoUrl: "https://cdn.simpleicons.org/instagram/E4405F",
    color: "border-pink-500",
  },
  {
    id: "3",
    name: "Facebook",
    logoUrl: "https://cdn.simpleicons.org/facebook/1877F2",
    color: "border-blue-500",
  },
  {
    id: "4",
    name: "Telegram",
    logoUrl: "https://cdn.simpleicons.org/telegram/2AABEE",
    color: "border-cyan-500",
  },
  {
    id: "5",
    name: "Shopify",
    logoUrl: "https://cdn.simpleicons.org/shopify/96BF48",
    color: "border-green-600",
  },
  {
    id: "6",
    name: "WooCommerce",
    logoUrl: "https://cdn.simpleicons.org/woocommerce/96588A",
    color: "border-purple-600",
  },
  {
    id: "9",
    name: "Twitter/X",
    logoUrl: "https://cdn.simpleicons.org/x/000000",
    color: "border-gray-800",
  },
  {
    id: "11",
    name: "YouTube",
    logoUrl: "https://cdn.simpleicons.org/youtube/FF0000",
    color: "border-red-600",
  },
  {
    id: "13",
    name: "Messenger",
    logoUrl: "https://cdn.simpleicons.org/messenger/00B2FF",
    color: "border-blue-400",
  },
  {
    id: "14",
    name: "WeChat",
    logoUrl: "https://cdn.simpleicons.org/wechat/07C160",
    color: "border-green-500",
  },
];

const OUTPUT_CARDS_1: OutputCard[] = [
  {
    id: "1",
    icon: "FaChartLine",
    title: "Real-Time Analytics",
    category: "INSIGHTS",
  },
  {
    id: "2",
    icon: "FaRobot",
    title: "Smart Automation",
    category: "EFFICIENCY",
  },
  {
    id: "3",
    icon: "FaBullseye",
    title: "Lead Qualification",
    category: "CONVERSION",
  },
];

const OUTPUT_CARDS_2: OutputCard[] = [
  {
    id: "4",
    icon: "FaLightbulb",
    title: "Predictive Insights",
    category: "STRATEGY",
  },
  {
    id: "5",
    icon: "FaDollarSign",
    title: "Revenue Optimization",
    category: "GROWTH",
  },
  {
    id: "6",
    icon: "FaSearch",
    title: "Market Intelligence",
    category: "COMPETITIVE",
  },
];

const FunnelIcon: React.FC<{ icon: InputIcon }> = ({ icon }) => {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  useEffect(() => {
    const randomYRatio = Math.random() - 0.5;
    const duration = 6 + Math.random() * 6;
    const delay = Math.random() * -40;
    const scale = 0.5 + Math.random() * 0.4;
    const randomZ = Math.floor(Math.random() * 20) + 10;

    setStyle({
      "--y-ratio": randomYRatio,
      "--duration": `${duration}s`,
      "--delay": `${delay}s`,
      "--scale": scale,
      animation: `funnelFlow var(--duration) linear var(--delay) infinite`,
      willChange: "transform, opacity",
      zIndex: randomZ,
    } as React.CSSProperties & { [key: string]: any });
  }, []);

  if (!style) return null;

  return (
    <div
      className={`absolute left-0 top-1/2 rounded-full sm:rounded-2xl bg-white flex items-center justify-center shadow-md border ${icon.color} w-[28px] h-[28px] sm:w-[44px] sm:h-[44px]`}
      style={style}
    >
      <div className="relative w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center">
        <Image
          src={icon.logoUrl}
          alt={icon.name}
          width={32}
          height={32}
          className="w-full h-full object-contain"
          loading="lazy"
          unoptimized
        />
      </div>
    </div>
  );
};

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    FaChartLine,
    FaRobot,
    FaBullseye,
    FaLightbulb,
    FaDollarSign,
    FaSearch,
  };
  const IconComponent = icons[iconName];
  return IconComponent ? <IconComponent className="w-full h-full" /> : null;
};

const CardItem = ({ card }: { card: OutputCard }) => (
  <div className="flex items-center gap-1 sm:gap-4 bg-white/90 backdrop-blur-sm border border-gray-100 p-0.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm w-[75px] sm:w-[280px] flex-shrink-0">
    <div className="w-5 h-5 sm:w-12 sm:h-12 flex items-center justify-center bg-indigo-50 rounded-md sm:rounded-xl text-indigo-600 p-1 sm:p-2.5">
      {getIcon(card.icon)}
    </div>
    <div className="flex flex-col">
      <span className="text-[6px] sm:text-sm font-bold text-gray-900 leading-tight">
        {card.title}
      </span>
      <span className="text-[4px] sm:text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5 sm:mt-1">
        {card.category}
      </span>
    </div>
  </div>
);

const Row = ({
  cards,
  direction = "left",
}: {
  cards: OutputCard[];
  direction?: "left" | "right";
}) => {
  const segment = [...cards, ...cards, ...cards, ...cards, ...cards, ...cards];

  return (
    <div
      className="flex overflow-hidden w-full"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 15%, black 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 15%, black 90%, transparent 100%)",
      }}
    >
      <div
        className={`flex gap-2 sm:gap-6 px-2 sm:px-6 w-max ${
          direction === "left"
            ? "animate-infinite-scroll-left"
            : "animate-infinite-scroll-right"
        }`}
      >
        {segment.map((card, idx) => (
          <CardItem key={`s1-${idx}`} card={card} />
        ))}
        {segment.map((card, idx) => (
          <CardItem key={`s2-${idx}`} card={card} />
        ))}
      </div>
    </div>
  );
};

const OutputCarousel = () => {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[50vw] z-0 flex flex-col justify-center items-center overflow-hidden pointer-events-none">
      <div className="w-full flex flex-col gap-3 sm:gap-10 opacity-0 animate-emerge">
        <Row cards={OUTPUT_CARDS_1} direction="right" />
        <Row cards={OUTPUT_CARDS_2} direction="left" />
      </div>
    </div>
  );
};

const ProcessingNode: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { type: "logo", content: "HeidelAI" },
    {
      type: "text",
      content: "Derive actionable insights and optimize next steps",
    },
    { type: "text", content: "Optimized executive plans" },
    { type: "text", content: "High impact actions" },
  ];

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % slides.length),
      3500
    );
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative z-30 mx-auto transition-all duration-300 w-[150px] sm:w-auto sm:min-w-[450px] md:min-w-[550px] lg:min-w-[650px] max-w-5xl">
      <div className="w-full bg-white shadow-[0_15px_40px_rgba(8,_112,_184,_0.1)] sm:shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] border border-gray-100 flex flex-col items-center justify-center rounded-[1rem] sm:rounded-[2.5rem] md:rounded-[3rem] px-2 py-2 sm:px-10 sm:py-12 md:px-14 md:py-16 min-h-[80px] sm:min-h-auto">
        <div className="relative w-full flex items-center justify-center min-h-[40px] sm:min-h-auto aspect-auto sm:aspect-[3/1]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-4 pointer-events-none"
              }`}
            >
              {slide.type === "logo" ? (
                <div className="flex items-center justify-center gap-1.5 sm:gap-4 whitespace-nowrap">
                  <img
                    src="/heidelai.png"
                    alt="HeidelAI Logo"
                    className="w-6 h-6 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://cdn-icons-png.flaticon.com/512/2103/2103633.png";
                    }}
                  />
                  <span className="text-sm sm:text-4xl md:text-5xl font-medium tracking-tight text-gray-900">
                    {slide.content}
                  </span>
                </div>
              ) : (
                <div className="w-full flex items-center justify-center px-1">
                  <p className="text-center font-semibold bg-gradient-to-r from-orange-500 via-orange-600 to-red-700 bg-clip-text text-transparent text-[10px] sm:text-2xl md:text-3xl lg:text-4xl leading-tight sm:leading-snug max-w-full">
                    {slide.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  const denseIcons = useMemo(() => {
    let allIcons: (InputIcon & { uniqueKey: string })[] = [];
    for (let i = 0; i < 7; i++) {
      allIcons = [
        ...allIcons,
        ...INPUT_ICONS.map((icon, j) => ({
          ...icon,
          uniqueKey: `${icon.id}-${i}-${j}`,
        })),
      ];
    }
    return allIcons;
  }, []);

  return (
    <section
      id="features"
      className="relative w-full min-h-[60vh] sm:min-h-screen flex flex-col items-center justify-center py-6 sm:py-6 overflow-hidden bg-white"
    >
      <div className="relative z-10 w-full mb-6 sm:mb-10 px-4 mt-4 sm:mt-10">
        <h2
          className="text-4xl md:text-6xl font-normal text-gray-800 italic mb-0 text-center"
          style={{ fontFamily: "'Awesome Serif', serif" }}
        >
          From Chaos to <span className="text-orange-600">Clarity</span>
        </h2>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-[90%] sm:max-w-3xl mx-auto text-center mt-1 sm:mt-1">
          Connect scattered conversations across 20+ platforms into one
          intelligent command center that predicts trends, automates responses,
          and scales your impact effortlessly
        </p>
      </div>

      <div className="relative w-full flex items-center justify-center min-h-[180px] sm:min-h-[400px]">
        {/* Right Side */}
        <OutputCarousel />

        {denseIcons.map((icon) => (
          <FunnelIcon key={icon.uniqueKey} icon={icon} />
        ))}

        {/* Center Node */}
        <ProcessingNode />
      </div>

      <style jsx global>{`
        :root {
          /* spread for mobile */
          --spread-height: 250px;

          --target-x: calc(50vw - 85px);
        }
        @media (min-width: 640px) {
          :root {
            --spread-height: 400px;
            /* Desktop Convergence Point */
            --target-x: calc(50vw - 180px);
          }
        }

        @keyframes infinite-scroll-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @keyframes infinite-scroll-right {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .animate-infinite-scroll-left {
          animation: infinite-scroll-left 60s linear infinite;
          will-change: transform;
        }
        .animate-infinite-scroll-right {
          animation: infinite-scroll-right 60s linear infinite;
          will-change: transform;
        }

        @keyframes funnelFlow {
          0% {
            /* Start: Far Left */
            transform: translate3d(
                -10vw,
                calc(var(--y-ratio) * var(--spread-height)),
                0
              )
              scale(var(--scale));
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          70% {
            /* Target: Uses the new responsive --target-x variable */
            transform: translate3d(
                var(--target-x),
                calc(var(--y-ratio) * var(--spread-height) * 0.15),
                0
              )
              scale(var(--scale));
            opacity: 1;
          }
          100% {
            /* End: Hit Center */
            transform: translate3d(50vw, 0, 0) scale(0.1);
            opacity: 0;
          }
        }
        @keyframes emerge {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-emerge {
          animation: emerge 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </section>
  );
};

export default Features;
