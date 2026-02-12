import Image from "next/image";
import React, { useState } from "react";

interface FileIconProps {
  fileType: string;
  className?: string;
}

export default function FileIcon({ fileType, className = "w-8 h-8" }: FileIconProps) {
  // Normalize extension (e.g., "PDF" -> "pdf")
  const ext = fileType ? fileType.toLowerCase() : "unknown";
  
  // Path to the specific icon
  const iconPath = `/icons/file-types/${ext}.png`;
  
  // Fallback state if the specific icon (e.g., "xyz.png") doesn't exist
  const [src, setSrc] = useState(iconPath);

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <Image
        src={src}
        alt={`${ext} file icon`}
        fill
        quality={50}
        className="object-contain"
        onError={() => {
          setSrc("/icons/file-types/default.png"); 
        }}
        sizes="40px"
      />
    </div>
  );
}