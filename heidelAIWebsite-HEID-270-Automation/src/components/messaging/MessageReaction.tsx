
"use client"
import React, { useState, memo, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { X, User } from "lucide-react";
import Image from "next/image";
import { formatPhoneNumber } from "../inbox/chat/utils";

interface MessageReaction {
  emoji: string;
  username: string;
  full_name: string;
  timestamp: string;
  profile_picture_url: string;
}

interface MessageReactionProps {
  reaction: MessageReaction;
  messageId: string;
  platform: "instagram" | "whatsapp";
}

const ReactionPopover = memo(({ 
  reaction, 
  isOpen, 
  onClose,
  position,
  onMouseEnter,
  onMouseLeave,
  platform
}: {
  reaction: MessageReaction;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  platform: "instagram" | "whatsapp";
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-[9999]"
      style={{
      top: position.top + 30,
      left: Math.max(
        10,
        Math.min(position.left - 100, window.innerWidth - 320) // 320 = popover width + margin
      ),
    }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white rounded-lg shadow-lg border p-4 min-w-[300px] animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {reaction.profile_picture_url ? (
              <Image 
                src={reaction.profile_picture_url} 
                alt={reaction.full_name}
                className="w-full h-full object-cover"
                width={32}
                height={32}
              />
            ) : (
              <User className="h-4 w-4 text-gray-500" />
            )}
          </div>
          
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">
              {reaction.full_name}
            </p>
            <p className="text-xs text-gray-500">
              {platform === 'instagram' ? '@'+reaction.username : formatPhoneNumber(reaction.username)}
            </p>
          </div>
          
          <div className="text-lg">
            {reaction.emoji}
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          {formatMessageTime(reaction.timestamp)}
        </div>
      </div>
    </div>
  );
});
ReactionPopover.displayName = "ReactionPopover";

const MessageReaction = memo(({ 
  reaction,
  messageId,
  platform
}: MessageReactionProps) => {
  const [showPopover, setShowPopover] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hidePopover = () => {
    setShowPopover(false);
  };

  const handleMouseEnter = () => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2
      });
    }
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      hidePopover();
    }, 150);
  };

  const handlePopoverMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    hidePopover();
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    reaction.emoji && (
      <div className="relative inline-block -mt-2">
        <button
          ref={buttonRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex items-center rounded-full text-md bg-white hover:bg-gray-200 border border-gray-200 transition-colors p-1"
        >
          <span>{reaction.emoji}</span>
        </button>
        
        <ReactionPopover
          reaction={reaction}
          isOpen={showPopover}
          onClose={hidePopover}
          position={position}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
          platform={platform}
        />
      </div>
    )
  );
});
MessageReaction.displayName = "MessageReaction";

const formatMessageTime = (timestamp: string): string => {
  try {
    const date = parseISO(timestamp);
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return format(istDate, "h:mma").toLowerCase();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export default MessageReaction;
