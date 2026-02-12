import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Message } from "../inbox/chat/types";
import { getStatusIcon, MessageItem } from "../inbox/chat/components/messages/MessageItem";

interface MediaMessageProps {
  url: string;
  type: "image" | "video";
  isAgent?: boolean;
  isLatest?: boolean;
  isActive?: boolean;
  onPlay?: (id: string) => void;
  onMuteToggle?: (muted: boolean) => void;
  isMuted?: boolean;
  id: string;
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read" | "failed";
  message: Message;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  caption?: string;
  showStatusIcon: boolean;
}

export default function MediaMessage({
  url,
  type,
  isAgent = false,
  isLatest = false,
  isActive = false,
  onPlay,
  onMuteToggle,
  isMuted = true,
  id,
  timestamp,
  status,
  message,
  onFullscreenToggle,
  caption,
  showStatusIcon,
}: MediaMessageProps) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [mediaHeight, setMediaHeight] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWatchAgain, setShowWatchAgain] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Measure media dimensions or mark unavailable
  useEffect(() => {
    if (!url) {
      setIsUnavailable(true);
      return;
    }

    if (type === "image") {
      const img = document.createElement("img");
      img.src = url;

      img.onload = () => {
        setAspectRatio(img.width / img.height);
        setMediaHeight(img.height);
        setIsUnavailable(false);
      };
      img.onerror = () => {
        setIsUnavailable(true);
      };
    } else if (type === "video") {
      const vid = document.createElement("video");
      vid.src = url;

      vid.onloadedmetadata = () => {
        setAspectRatio(vid.videoWidth / vid.videoHeight);
        setMediaHeight(vid.videoHeight);
        setIsUnavailable(false);
      };
      vid.onerror = () => {
        setIsUnavailable(true);
      };
    }
  }, [url, type]);

  // Handle autoplay logic for latest/active videos
  useEffect(() => {
    const video = videoRef.current;
    if (!video || type !== "video") return;

    const anyPlaying = Array.from(document.querySelectorAll("video")).some(
      (v) => !v.paused && v !== video
    );

    if (isActive) {
      video.play().catch(() => { });
    } else if (isLatest && !anyPlaying) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, [isActive, isLatest, type]);

  // Handle video end looping logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (isFullscreen) {
        video.play();
        return;
      }

      if (loopCount < 1) {
        setLoopCount((prev) => prev + 1);
        video.play();
      } else {
        video.pause();
        setShowWatchAgain(true);
        setLoopCount(0);
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

  const isVertical = aspectRatio !== null && aspectRatio < 1;
  const mediaWidth = isVertical ? 190 : 410;

  return (
    <div
      className={`flex flex-col ${isAgent ? "items-end" : "items-start"
        } rounded-2xl w-fit max-w-[350px] p-1`}
    >
      <div className="flex w-full items-end">
      <div
        className={`relative h-fit overflow-hidden rounded-2xl ${message.status === 'failed' ? 'border border-red-600' : ''} bg-gray-200 shadow-sm cursor-pointer flex items-center justify-center `}
        style={{
          width: isUnavailable ? "190px" : mediaWidth,
          height: mediaHeight
            ? Math.min(mediaWidth / (aspectRatio || 1), 400)
            : 200,
          transition: "all 0.2s ease-in-out",
        }}
      >
        {isUnavailable ? (
          <p className="text-gray-500 text-sm font-medium">Media Unavailable</p>
        ) : type === "image" ? (
          <Image
            src={url}
            alt="Media"
            fill
            className="object-cover"
            sizes="(max-width: 350px) 100vw"
            onError={() => setIsUnavailable(true)}
            onClick={() => {
              setIsFullscreen(true);
              onFullscreenToggle?.(true);
            }}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={url}
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
              onClick={handleVideoClick}
              onError={() => setIsUnavailable(true)}
            />

            {/* Mute button */}
            <button
              onClick={handleUnmuteClick}
              className="absolute bottom-2 right-2 bg-black/50 text-white p-1 rounded-full text-xs"
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            {/* Overlay when toggled */}
            {showOverlay && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                {videoRef.current?.paused ? (
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 3.5l11 6.5-11 6.5V3.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 4h2v12H6V4zm6 0h2v12h-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            )}

            {/* Watch Again overlay */}
            {showWatchAgain && !isFullscreen && (
              <div
                onClick={handleWatchAgain}
                className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
              >
                <p className="text-white font-semibold text-lg">
                  Watch Again
                </p>
              </div>
            )}
          </>
        )}
      </div>
        {( ! caption && (showStatusIcon || message.status === "sending")) ? (
          <div className="animate-in fade-in zoom-in duration-300 ml-1">
            {getStatusIcon(message)}
          </div>
        ) : (
          <div className="ml-4"></div>
        )}

      </div>

      {caption ? (
        <div className="mt-2 text-sm text-gray-700">
          <MessageItem
            message={message}
            isReplyMessage={false}
            isMediaMessage={true}
            caption={caption}
            showStatusIcon={showStatusIcon}
          />
        </div>
      ) : (
        <div className={`w-full mt-1 ${isAgent ? "text-right pr-1" : "text-left pl-1"}`}>
          <p className="text-xs text-gray-500  tracking-wide">
            {timestamp}
          </p>
        </div>
      )}

      {isFullscreen && type === "image" && (
        <div
          className="fixed inset-0 z-[99999999999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setIsFullscreen(false);
            onFullscreenToggle?.(false);
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              fill
              src={url}
              alt="Full screen media"
              className=" p-10 max-w-full  max-h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(false);
                onFullscreenToggle?.(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
