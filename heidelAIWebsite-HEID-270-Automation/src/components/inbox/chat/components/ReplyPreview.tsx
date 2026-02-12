import { X } from "lucide-react";
import { Message } from "../types";

interface ReplyPreviewProps {
  message: Message;
  onCancel: () => void;
}

export const ReplyPreview = ({ message, onCancel }: ReplyPreviewProps) => {
  const isSelf = message.role === "agent"; // Adjust based on your Message type properties

let previewText = message.content;
if (message.type !== "text") {
    if (message.type === "image") previewText = `📷 ${previewText ? previewText : 'Image'}`;
    else if (message.type === "video") previewText = "🎥 Video";
    else if (message.type === "document") previewText = "📄 Document";
    else previewText = "Message";
}
  
  return (
    <div className="flex items-center justify-between bg-gray-100 backdrop-blur-sm p-2 rounded-lg border-l-4 border-blue-500 mb-2 relative z-10 shadow-sm">
      <div className="flex-1 overflow-hidden mr-2">
        <div className="text-sm font-bold text-blue-600 mb-1">
          {isSelf ? "You" : (message.sender_name || "Customer")}
        </div>
        <div className="text-xs text-gray-600 truncate">
          {previewText}
        </div>
      </div>
      <button
        onClick={onCancel}
        className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
      >
        <X className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );
};