import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MessageCircle, AlertCircle, ThumbsUp, Bot, User2 } from "lucide-react";
import { getRelativeTime } from '@/components/utils/dateUtils';
import Image from "next/image";

interface ConversationPreviewProps {
  id: string;
  channelType: "telegram" | "whatsapp" | "instagram" | "web";
  priority: "high" | "medium" | "low";
  sentiment: "positive" | "neutral" | "negative";
  customerName: string;
  lastMessage: string;
  lastMessageIsPrivateNote?: boolean;
  timestamp: string;
  unreadCount: number; 
  avatarUrl: string;
  isSelected?: boolean;
  onClick?: () => void;
  isAiEnabled?: boolean;
  assignedAgentId?: string | null;
}

const ConversationPreview = ({
  id,
  channelType,
  priority,
  sentiment,
  customerName,
  lastMessage,
  lastMessageIsPrivateNote,
  timestamp,
  unreadCount, 
  avatarUrl,
  isSelected = false,
  onClick,
  isAiEnabled = true,
  assignedAgentId
}: ConversationPreviewProps) => {
  const getPriorityBadgeStyles = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-600 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-600 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

return (
  <div
    className={`py-2 px-2.5 w-full cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
      isSelected ? "bg-gray-100" : ""
    }`}
    onClick={onClick}
  >
    <div className="flex items-start gap-2.5">
      {/* Avatar */}
      <div className="w-6 h-6 flex-shrink-0 rounded-full overflow-hidden  mt-0.5">
        <Image
          height={150} 
          width={150} 
          quality={100}
          src={
            channelType === "whatsapp" ? "/features/whatsapp.png" :
            channelType === "telegram" ? "/features/telegram.png" :
            "/features/instagram.png"
          }
          alt="" 
          className="w-full h-full object-cover" 
          loading="lazy"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1.5 mb-0.5">
          <h3 className={`text-gray-900 text-[15px] truncate leading-tight ${
            unreadCount > 0 ? "font-bold" : "font-normal"
          }`}>
            {customerName}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {priority && (
              <span
                className={`${getPriorityBadgeStyles(priority)} text-[9px] px-1.5 py-0.5 rounded capitalize font-medium border`}
              >
                {priority}
              </span>
            )}
            <span className="text-[11px] text-gray-500 font-normal">
              {timestamp}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-1.5">
          <p className={`text-[13px] text-gray-600 truncate flex-1 leading-relaxed ${
            unreadCount > 0 ? "font-bold" : "font-normal"
          }`}>
            {lastMessageIsPrivateNote ? (
              <>
                <span className="flex-shrink-0 bg-purple-500 text-white text-[13px] px-1.5 py-0.5 rounded-md font-medium">
                  Private Note
                </span>
                <span className="ml-1 truncate">
                  {lastMessage.replace(/^Private Note:\s*/i, "")}
                </span>
              </>
            ) : (
              <span className="truncate">
                {lastMessage}
              </span>
            )}
          </p>
          
          {unreadCount > 0 && (
            <div className="w-[18px] h-[18px] bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] text-white font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}
export default ConversationPreview;
