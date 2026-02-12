import Image from "next/image";
import { useState } from "react";
import FileIcon from "./ui/FileIcon";
import { Message } from "../inbox/chat/types";
import { MessageItem } from "../inbox/chat/components/messages/MessageItem";

interface DocumentMessageProps {
  url: string;
  previewUrl?: string;
  fileName: string;
  fileSize: number;
  fileFormat: string;
  filePages?: number;
  isAgent?: boolean;
  caption?: string;
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
  message?: Message;
}

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function DocumentMessage({
  url,
  previewUrl,
  fileName,
  caption,
  fileSize,
  fileFormat,
  filePages,
  isAgent = false,
  timestamp,
  message,
}: DocumentMessageProps) {
  const [isImageError, setIsImageError] = useState(false);

  const ext = fileFormat ? fileFormat.toUpperCase() : fileName && fileName.split(".").pop()?.toUpperCase() || "FILE"
  // const isPdf = ext.includes("PDF");
  const isImage = ext.includes("PNG") || ext.includes("JPG") || ext.includes("JPEG") || ext.includes("GIF") || ext.includes("WEBP");
  const showPreview = (previewUrl || isImage) && !isImageError;

  const handleOpenDocument = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`flex flex-col ${isAgent ? "items-end" : "items-start"} max-w-[380px] p-1`}>

      {/* Main Bubble Container */}
      <div
        onClick={handleOpenDocument}
        className={`
          flex flex-col overflow-hidden rounded-xl cursor-pointer shadow-sm border border-gray-200 transition-all hover:shadow-md
          ${isAgent ? "bg-[#dcf8c6]" : "bg-white"}
        `}
      >
        {/* ✅ Top Section: Large Preview (Only if available) */}
        {showPreview && (
          <div className="relative h-[180px] w-[380px] bg-gray-100 border-b border-gray-200/50">
            <Image
              src={isImage ? url : previewUrl!}
              alt="Document Preview"
              fill
              className="object-cover object-top"
              onError={() => setIsImageError(true)}
              sizes="(max-width: 330px) 100vw"
            />

          </div>
        )}

        {/* ✅ Bottom Section: Document Info Bar */}
        {/* If preview exists, this is white/lighter. If no preview, this takes the bubble color. */}
        <div className={`flex items-center gap-3 p-3 pr-4 w-full min-w-[300px] ${showPreview ? "bg-white/60" : ""}`}>

          {/* File Icon */}
          <FileIcon fileType={ext} className="w-8 h-8" />

          {/* Text Info */}
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight mb-0.5" title={fileName}>
              {fileName && fileName.length > 36 ? fileName.substring(0, 36) + "..." : fileName || "Untitled Document"}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              {filePages && (
                <>
                  <span>{filePages} {filePages === 1 ? 'page' : 'pages'}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-gray-400" />
                </>
              )}
              <span>{formatFileSize(fileSize)}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-gray-400" />
              <span>{ext}</span>
            </div>
          </div>

          {/* Download/Open Arrow */}
          <div className="text-gray-400 pl-1">
            <Image src="/icons/new-tab.png" alt="Download or Open Document" width={20} height={20} />
          </div>

        </div>
      </div>

      {/* Caption OR Timestamp (Outside the bubble) */}
      {caption && message  ? (
        <div className="mt-2 text-sm text-gray-700">
          <MessageItem
            message={message}
            isReplyMessage={false}
            isMediaMessage={true}
            caption={caption}
          />
        </div>
      ) : (
        <div className={`w-full mt-1 ${isAgent ? "text-right pr-1" : "text-left pl-1"}`}>
          <p className="text-xs text-gray-500 tracking-wide">
            {timestamp}
          </p>
        </div>
      )}
    </div>
  );
}