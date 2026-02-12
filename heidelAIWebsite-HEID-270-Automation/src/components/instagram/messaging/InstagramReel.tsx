import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";

interface InstagramReelProps {
    id: string;
    profileImage?: string;
    username?: string;
    reelVideoUrl: string;
    title: string;
    timestamp: string;
    viewOnInstagramUrl?: string;
    isLatest?: boolean;
    isActive?: boolean;
    onPlay?: (id: string) => void;
    isMuted?: boolean;               
    onMuteToggle?: (muted: boolean) => void;
    isAgent?: boolean;
}

export default function InstagramReel({
    id,
    profileImage = "/icons/ig_no_pfp.jpg",
    username = "Instagram User",
    reelVideoUrl,
    timestamp,
    viewOnInstagramUrl,
    isLatest = false,
    isActive = false,
    onPlay,
    isMuted = true,                   
    onMuteToggle,
    isAgent = false,
}: InstagramReelProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loopCount, setLoopCount] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showWatchAgain, setShowWatchAgain] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const anyPlaying = Array.from(document.querySelectorAll("video")).some(
            (v) => !v.paused && v !== video
        );

        if (isActive) {
            video.play().catch(() => {});
        } else if (isLatest && !anyPlaying) {
            // Autoplay latest only if nothing else is playing
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    }, [isActive, isLatest]);



    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnded = () => {
            if (isFullscreen) {
                video.play(); // infinite loop fullscreen
                return;
            }

            if (loopCount < 1) {
                setLoopCount((prev) => prev + 1);
                video.play();
            } else {
                video.pause();
                setShowWatchAgain(true);
                setLoopCount(0); // reset for next time
            }
        };

        video.addEventListener("ended", handleEnded);
        return () => video.removeEventListener("ended", handleEnded);
    }, [loopCount, isFullscreen]);

    const handleVideoClick = () => {
        const video = videoRef.current;
        if (!video) return;

        setShowOverlay(true);
        if (video.paused) {
            onPlay?.(id);
            video.play();
        } else {
            video.pause();
        }
        setTimeout(() => setShowOverlay(false), 500);
    };

    const handleUnmuteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        const newMuted = !isMuted;
        video.muted = newMuted;

        onMuteToggle?.(newMuted);
    };

    const handleWatchAgain = () => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = 0;
        video.play();
        setLoopCount(0);
        setShowWatchAgain(false);
    };

    return (
        <>
            <div
                className={`relative cursor-pointer rounded-2xl overflow-hidden ${isFullscreen
                        ? "fixed inset-0 z-50 flex items-center justify-center bg-black"
                        : "w-[250px] max-w-sm mx-auto"
                    }`}
            >
                <div
                    className={`relative w-full ${isFullscreen ? "h-[90vh]" : "aspect-[9/16]"
                        } bg-gray-200 flex items-center rounded-2xl`}
                    onClick={isFullscreen ? handleVideoClick : undefined}
                >
                    <video
                        ref={videoRef}
                        src={reelVideoUrl}
                        muted={isMuted}
                        loop={isFullscreen}
                        playsInline
                        onClick={!isFullscreen ? handleVideoClick : undefined}
                        onPlay={() => onPlay?.(id)}
                        className="object-cover w-[250px] bg-black"
                    />

                    {/* Profile Info */}
                    <div className="absolute top-3 left-3 flex items-center space-x-2 rounded-full px-2 py-1">
                        <Image
                            src={profileImage}
                            alt="Profile"
                            width={26}
                            height={26}
                            className="rounded-full object-cover"
                        />
                        <p className="text-white text-xs font-semibold">{username}</p>
                    </div>

                    {/* Instagram Icon */}
                    {!isFullscreen && viewOnInstagramUrl && (
                        <a
                            href={viewOnInstagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 left-3 hover:opacity-80 transition"
                        >
                            <Image
                                src="/icons/ig_reel_white.png"
                                alt="Reel"
                                width={25}
                                height={25}
                                className="opacity-90"
                            />
                        </a>
                    )}

                    {/* Mute toggle */}
                    <button
                        onClick={handleUnmuteClick}
                        className="absolute bottom-3 right-3 bg-black/50 p-1 rounded-full"
                    >
                        {isMuted ? "🔇" : "🔊"}
                    </button>

                    {/* Play/Pause overlay */}
                    {showOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                            <svg
                                className="w-12 h-12 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                {videoRef.current?.paused ? (
                                    <path
                                        fillRule="evenodd"
                                        d="M4.5 3.5l11 6.5-11 6.5V3.5z"
                                        clipRule="evenodd"
                                    />
                                ) : (
                                    <path
                                        fillRule="evenodd"
                                        d="M6 4h2v12H6V4zm6 0h2v12h-2V4z"
                                        clipRule="evenodd"
                                    />
                                )}
                            </svg>
                        </div>
                    )}

                    {/* Watch Again overlay */}
                    {showWatchAgain && !isFullscreen && (
                        <div
                            onClick={handleWatchAgain}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                        >
                            <p className="text-white font-semibold text-lg">Watch Again</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={`py-1 w-full ${isAgent ? "pr-2" : "pl-2"}`}>
                <p className={`text-xs ${isAgent ? "text-right" : "text-left"} text-gray-500 mt-1 uppercase tracking-wide`}>
                    {timestamp}
                </p>
            </div>
        </>
    );
}
