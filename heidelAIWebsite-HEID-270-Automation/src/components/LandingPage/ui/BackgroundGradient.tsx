'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface BackgroundGradientProps {
    children?: React.ReactNode;
    className?: string;
}

const BackgroundGradient = ({ children, className = "" }: BackgroundGradientProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    // Smooth out the mouse movement - refined for premium feel
    const springConfig = { damping: 45, stiffness: 70 }; // Slightly smoother
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    // Optimized transforms that stay outside the React render loop
    const x1 = useTransform(smoothX, [0, 1], ["-15%", "15%"]);
    const y1 = useTransform(smoothY, [0, 1], ["-10%", "10%"]);

    const x2 = useTransform(smoothX, [0, 1], ["10%", "-10%"]);
    const y2 = useTransform(smoothY, [0, 1], ["15%", "-15%"]);

    const x3 = useTransform(smoothX, [0, 1], ["-20%", "20%"]);
    const y3 = useTransform(smoothY, [0, 1], ["10%", "-10%"]);

    const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });
    const followX = useSpring(mouseX, { damping: 45, stiffness: 500 });
    const followY = useSpring(mouseY, { damping: 45, stiffness: 500 });

    // Pixel-perfect transforms for the interactive bubble
    const cursorX = useTransform(followX, [0, 1], [0, windowSize.w]);
    const cursorY = useTransform(followY, [0, 1], [0, windowSize.h]);

    // Parallax variations for interactive bubble depth
    const p1X = useTransform(followX, [0, 1], ["-25px", "25px"]);
    const p1Y = useTransform(followY, [0, 1], ["-25px", "25px"]);
    const p2X = useTransform(followX, [0, 1], ["40px", "-40px"]);
    const p2Y = useTransform(followY, [0, 1], ["40px", "-40px"]);

    useEffect(() => {
        const updateSize = () => {
            setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        };
        updateSize();
        window.addEventListener('resize', updateSize);

        const handleMouseMove = (e: MouseEvent) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            mouseX.set(x);
            mouseY.set(y);
        };

        const handleTouch = (e: TouchEvent) => {
            if (e.touches.length === 0) return;
            const touch = e.touches[0];
            const x = touch.clientX / window.innerWidth;
            const y = touch.clientY / window.innerHeight;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('touchstart', handleTouch, { passive: true });
        window.addEventListener('touchmove', handleTouch, { passive: true });

        return () => {
            window.removeEventListener('resize', updateSize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchstart', handleTouch);
            window.removeEventListener('touchmove', handleTouch);
        };
    }, [mouseX, mouseY]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${className}`}
        >
            {/* Base Background - Absolute to container */}
            <div className="absolute inset-0 -z-10" style={{ backgroundColor: '#f9f9fb' }} />

            {/* Animated Gradient Layer - Absolute to container */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Bubble 1 */}
                <motion.div
                    className="absolute w-[450px] h-[450px] sm:w-[900px] sm:h-[900px] rounded-full opacity-60 sm:opacity-50 blur-[100px] sm:blur-[150px]"
                    style={{
                        background: 'hsla(218, 88%, 92%, 1.00)',
                        x: x1,
                        y: y1,
                        left: '5%',
                        top: '0%',
                    }}
                    animate={{
                        scale: [1, 1.15, 1],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Bubble 2 */}
                <motion.div
                    className="absolute w-[400px] h-[400px] sm:w-[800px] sm:h-[800px] rounded-full opacity-50 sm:opacity-40 blur-[100px] sm:blur-[150px]"
                    style={{
                        background: 'hsla(216, 98%, 82%, 1.00)',
                        x: x2,
                        y: y2,
                        right: '-15%',
                        top: '10%',
                    }}
                    animate={{
                        scale: [1.1, 1, 1.1],
                    }}
                    transition={{
                        duration: 35,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Bubble 3 */}
                <motion.div
                    className="absolute w-[500px] h-[500px] sm:w-[1000px] sm:h-[1000px] rounded-full opacity-55 sm:opacity-45 blur-[120px] sm:blur-[180px]"
                    style={{
                        background: 'hsla(218, 96%, 90%, 1.00)',
                        x: x3,
                        y: y3,
                        left: '-10%',
                        bottom: '-10%',
                    }}
                    animate={{
                        scale: [1, 1.25, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Atmospheric Background Particles */}
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={`bg-particle-${i}`}
                        className="absolute rounded-full opacity-10 sm:opacity-[0.08] blur-[2px] sm:blur-[4px]"
                        style={{
                            background: i % 3 === 0 ? 'hsla(218, 88%, 92%, 0.8)' : i % 3 === 1 ? 'hsla(215, 100%, 85%, 0.8)' : 'hsla(218, 100%, 96%, 0.8)',
                            width: 15 + (i * 10),
                            height: 15 + (i * 10),
                            left: `${(i * 15) % 100}%`,
                            top: `${(i * 25) % 100}%`,
                        }}
                        animate={{
                            x: [0, (i % 2 === 0 ? 1 : -1) * 100, 0],
                            y: [0, (i % 3 === 0 ? 1 : -1) * 80, 0],
                            opacity: [0.05, 0.15, 0.05],
                        }}
                        transition={{
                            duration: 20 + (i * 5),
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}

                {/* Enhanced Interactive Bubble Group */}
                <motion.div
                    className="absolute pointer-events-none z-[1]"
                    style={{
                        left: cursorX,
                        top: cursorY,
                        x: "-50%",
                        y: "-50%",
                    }}
                >
                    {/* Main Core / Glow Falloff */}
                    <div className="relative">
                        {/* Primary Interaction Core */}
                        <div
                            className="w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] rounded-full opacity-40 sm:opacity-35 blur-[50px] sm:blur-[80px]"
                            style={{ background: 'hsla(215, 87%, 75%, 1.00)' }}
                        />

                        {/* Inner Vibrant Hub */}
                        <motion.div
                            className="absolute inset-0 m-auto w-[60px] h-[60px] sm:w-[120px] sm:h-[120px] rounded-full opacity-60 blur-[20px] sm:blur-[30px]"
                            style={{
                                background: 'hsla(215, 87%, 75%, 1.00)',
                                x: p1X,
                                y: p1Y,
                            }}
                        />

                        {/* Secondary Parallax Layer */}
                        <motion.div
                            className="absolute inset-0 m-auto w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] rounded-full opacity-20 blur-[40px] sm:blur-[60px]"
                            style={{
                                background: 'hsla(215, 87%, 75%, 0.5)',
                                x: p2X,
                                y: p2Y,
                            }}
                        />

                        {/* Floating Organic Sub-bubbles */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={`bubble-${i}`}
                                className="absolute rounded-full opacity-20 sm:opacity-15 blur-[20px] sm:blur-[40px]"
                                style={{
                                    background: 'hsla(215, 87%, 75%, 1.00)',
                                    width: 40 + (i * 15),
                                    height: 40 + (i * 15),
                                    left: `${20 + (i * 10)}%`,
                                    top: `${20 + (i * 12)}%`,
                                }}
                                animate={{
                                    x: [0, Math.sin(i) * 30, 0],
                                    y: [0, Math.cos(i) * 30, 0],
                                    scale: [1, 1.1 + (i * 0.05), 1],
                                }}
                                transition={{
                                    duration: 8 + (i * 2),
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}

                        {/* Innovative Satellite Orbs (Orbiting) */}
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={`satellite-${i}`}
                                className="absolute w-[10px] h-[10px] sm:w-[15px] sm:h-[15px] rounded-full opacity-60 blur-[3px] sm:blur-[5px]"
                                style={{
                                    background: 'hsla(215, 87%, 75%, 1.00)',
                                    left: "50%",
                                    top: "50%",
                                }}
                                animate={{
                                    x: [
                                        Math.cos(i * 1.5) * (80 + i * 40),
                                        Math.cos(i * 1.5 + Math.PI) * (80 + i * 40),
                                        Math.cos(i * 1.5) * (80 + i * 40),
                                    ],
                                    y: [
                                        Math.sin(i * 1.5) * (80 + i * 40),
                                        Math.sin(i * 1.5 + Math.PI) * (80 + i * 40),
                                        Math.sin(i * 1.5) * (80 + i * 40),
                                    ],
                                    scale: [1, 1.2, 0.8, 1],
                                }}
                                transition={{
                                    duration: 10 + (i * 3),
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                        ))}

                        {/* Innovative Micro-Particles (Swarming) */}
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={`particle-${i}`}
                                className="absolute w-[2px] h-[2px] sm:w-[4px] sm:h-[4px] rounded-full opacity-40 blur-[1px] sm:blur-[2px]"
                                style={{
                                    background: 'white',
                                    left: "50%",
                                    top: "50%",
                                }}
                                animate={{
                                    x: [
                                        (Math.random() - 0.5) * 200,
                                        (Math.random() - 0.5) * 200,
                                        (Math.random() - 0.5) * 200,
                                    ],
                                    y: [
                                        (Math.random() - 0.5) * 200,
                                        (Math.random() - 0.5) * 200,
                                        (Math.random() - 0.5) * 200,
                                    ],
                                    opacity: [0.1, 0.5, 0.1],
                                }}
                                transition={{
                                    duration: 4 + Math.random() * 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Noise Overlay - Absolute to container */}
            <div className="absolute inset-0 z-0 opacity-[0.18] sm:opacity-[0.14] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/png;base64,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")`
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default BackgroundGradient;
