import React, { memo } from "react";
import { Message } from "../../types";
import { Check, CheckCheck, Clock, X } from "lucide-react";
import { formatMessageTime } from "../../utils";
import { renderContentWithLinks } from "@/utils/messagingFeatures";

export const getStatusIcon = (message: Message) => {
  switch (message.status) {
    case "sending":
      return <Clock className="w-4 h-4 text-gray-400 animate-pulse" />;
    case "sent":
      return <Check className="w-4 h-4 text-gray-400" />;
    case "delivered":
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    case "read":
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    case "failed":
      return <X className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

export const MessageItem = memo(
  ({
    message,
    isLast,
    index,
    isLatest,
    isReplyMessage,
    isMediaMessage,
    caption,
    showStatusIcon,
    platform
  }: {
    message: Message;
    isLast?: boolean;
    index?: number;
    isLatest?: boolean;
    isReplyMessage: boolean;
    isMediaMessage?: boolean;
    caption?: string;
    showStatusIcon?: boolean;
    platform?: string;
  }) => {
    const isAgent = message.role === "agent";
    // Helper to render the correct icon based on status
    
    if (message.role === "system") {
      return (
        <div className="flex justify-center my-4 message-item">
          <div className="bg-white/80 backdrop-blur-sm text-gray-600 text-sm px-4 py-2 rounded-2xl border border-gray-200/60 shadow-sm hw-accel">
            <span className="font-medium">{message.content}</span>
            <span className="ml-0.5 text-gray-400 text-xs">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex w-fit items-end ">
        <div
          className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 w-fit shadow-sm border hw-accel 
            ${message.role === "customer"
              ? `bg-white/90 backdrop-blur-sm 
                ${isReplyMessage || isMediaMessage ? "rounded-tl-lg" : "rounded-bl-lg"} 
                text-gray-900 border-gray-200/60`
            : 
              ` backdrop-blur-sm 
              ${isReplyMessage || isMediaMessage ? "rounded-tr-lg" : "rounded-br-lg"} 
              text-white ${message.status === 'failed' ? "border-red-500/60 bg-red-600/90" :  message.mode && message.mode === 'private' ? 'border-purple-500/60 bg-purple-600/90' : "border-blue-500/60 bg-blue-600/90"}`
            }`}
          style={{ wordBreak: "break-word" }}
        >
          <div className="break-words">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {renderContentWithLinks(caption ? caption : message.content, isAgent)}
            </p>
          </div>
          {/* <div className="flex justify-end mt-2">
            <span
              className={`text-xs ${isAgent ? "text-white/70" : "text-gray-500"
                }`}
            >
              {formatMessageTime(message.timestamp)}
            </span>
          </div> */}
        </div>
          {(showStatusIcon || message.status === "sending") ? (
            <div className="animate-in fade-in zoom-in duration-300 ml-1">
              {getStatusIcon(message)}
            </div>
        ) : (
          <div className="ml-4"></div>
        )}
        </div>
        <div className={`w-full mt-1 ${isAgent ? "text-right pr-3" : "text-left pl-1"}`}>
          <p className="text-xs text-gray-500  tracking-wide">
            {formatMessageTime(message.timestamp)}
          </p>
        </div>
        
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.isLast === nextProps.isLast &&
      prevProps.message.status === nextProps.message.status &&
      prevProps.showStatusIcon === nextProps.showStatusIcon &&
      JSON.stringify(prevProps.message.reaction) ===
      JSON.stringify(nextProps.message.reaction)
    );
  }
);
MessageItem.displayName = "MessageItem";