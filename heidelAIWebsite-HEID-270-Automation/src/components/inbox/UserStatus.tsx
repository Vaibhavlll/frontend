import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Loader2, XCircle, Clock, RefreshCw } from "lucide-react";

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  role: "customer" | "ai" | "agent" | "system";
  sender_id: string;
  conversation_id: string;
  status?: "sent" | "delivered" | "read" | "sending";
  type?:
  | "text"
  | "image"
  | "file"
  | "voice"
  | "video"
  | "share"
  | "ig_story"
  | "ig_reel"
  | "story_reply"
  | "system"
  | "document";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  context_type?: "message_reply";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  platform: "whatsapp" | "instagram" | "messenger" | "webchat";
  product_data?: ProductData[];
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  reaction?: MessageReactions;
}

interface ProductData {
  id: number;
  image_link: string;
  name: string;
  on_sale: string;
  permalink: string;
  price: number;
  regular_price: string;
}

interface MessageReactions {
  emoji: string;
  username: string;
  full_name: string;
  timestamp: string;
  profile_picture_url: string;
}


interface UserStatusProps {
  conversationStatus: "open" | "closed" | "follow-up";
  isStatusDropdownOpen: boolean;
  setIsStatusDropdownOpen: (open: boolean) => void;
  selectedConversationId: string;
  statusLoading: boolean;
  handleResolve: (id: string) => void;
  handleFollowUp: (id: string) => void;
  handleReopen: () => void;
}

const UserStatus: React.FC<UserStatusProps> = ({
  conversationStatus,
  isStatusDropdownOpen,
  setIsStatusDropdownOpen,
  selectedConversationId,
  statusLoading,
  handleResolve,
  handleFollowUp,
  handleReopen,
}) => {
  // console.log("conversationStatus in User_Status:", conversationStatus);
  return (
    <div>
      <DropdownMenu
        open={isStatusDropdownOpen}
        onOpenChange={setIsStatusDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-2xl hover:bg-gray-100 flex items-center space-x-1 px-3 py-2.5 bg-white"
            disabled={statusLoading}
          >
            {conversationStatus === "closed" ? (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            ) : conversationStatus === "follow-up" ? (
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            ) : (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
            <span className="text-sm font-medium text-gray-800">
              {conversationStatus === "closed"
                ? "Closed"
                : conversationStatus === "follow-up"
                ? "Follow-up"
                : "Open"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
            {statusLoading && (
              <Loader2 className="h-4 w-4 ml-2 animate-spin text-blue-600" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-2xl shadow-xl border bg-white py-2"
        >
          {conversationStatus === "open" && (
            <>
              <DropdownMenuItem
                onClick={() => handleResolve(selectedConversationId)}
                className="flex items-center px-4 py-3 cursor-pointer text-sm hover:bg-red-50 rounded-xl mx-2"
                disabled={statusLoading}
              >
                <XCircle className="h-4 w-4 mr-3 text-red-600" />
                <span className="font-medium">Close Conversation</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFollowUp(selectedConversationId)}
                className="flex items-center px-4 py-3 cursor-pointer text-sm hover:bg-amber-50 rounded-xl mx-2"
                disabled={statusLoading}
              >
                <Clock className="h-4 w-4 mr-3 text-amber-600" />
                <span className="font-medium">Mark for Follow-up</span>
              </DropdownMenuItem>
            </>
          )}
          {(conversationStatus === "closed" ||
            conversationStatus === "follow-up") && (
            <DropdownMenuItem
              onClick={handleReopen}
              className="flex items-center px-4 py-3 cursor-pointer text-sm hover:bg-green-50 rounded-xl mx-2"
              disabled={statusLoading}
            >
              <RefreshCw className="h-4 w-4 mr-3 text-green-600" />
              <span className="font-medium">Reopen Conversation</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserStatus;