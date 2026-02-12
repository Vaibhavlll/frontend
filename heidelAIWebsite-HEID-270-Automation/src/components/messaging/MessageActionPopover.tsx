import { useEffect, useRef, useState } from "react";
// import EmojiPicker, { EmojiClickData } from "emoji-picker-react"


import { 
  // Plus,
   Reply } from "lucide-react";
import { createPortal } from "react-dom";

interface MessageActionsPopoverProps {
  onReact: (emoji: string) => void;
  onReply: () => void;
  onClose: () => void;
  isAgent: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  platform: "whatsapp" | "instagram";
}


export const MessageActionsPopover: React.FC<MessageActionsPopoverProps> = ({
  isAgent,
  onReact,
  onReply,
  onClose,
  anchorRef,
  platform
}) => {
  // const [showPicker, setShowPicker] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  
  const [pos, setPos] = useState({ top: 20, left: 50 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  let defaultEmojis: string[] = ["❤️", "😂", "😮", "😢", "👍", "👎"];
  if (platform === "instagram") {
    defaultEmojis = ["❤️"];
  } else if (platform === "whatsapp") {
    defaultEmojis = ["❤️", "😂", "😮", "😢", "👍", "👎"];
  }

  useEffect(() => {
    const anchor = anchorRef?.current;
    const pop = popoverRef?.current;
    if (!anchor || !pop) return;

    const rect = anchor.getBoundingClientRect();

    const top = rect.top - 25;
    const left = isAgent ? rect.right - pop.offsetWidth : rect.left;


    setPos({ top, left });
    setIsReady(true); // <-- show popover only when positioned
  }, [anchorRef, isAgent]);


  const handleReact = (emoji: string) => {
    onReact(emoji);
    onClose();
  };

  const handleReply = () => {
    onReply();
    onClose();
  };

  const handleEmojiMouseEnter = (emoji: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setHoveredEmoji(emoji);
    const btn = e.currentTarget as HTMLButtonElement;
    btn.style.transition = "transform 180ms ease";
    btn.style.transform = "translateY(-4px) scale(1.4)";
  };

  const handleEmojiMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setHoveredEmoji(null);
    const btn = e.currentTarget as HTMLButtonElement;
    btn.style.transform = "";
  };

  const PopoverUI = (
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        opacity: isReady ? 1 : 0,        // hide until position calculated
        pointerEvents: isReady ? "auto" : "none",
        transition: "opacity 120ms ease", // fade only, no sliding
        zIndex: 9999,
      }}
      className={`animate-in fade-in duration-200 flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-1 py-0.5 shadow-md z-50`}
    >
      {/* {!showPicker ? ( */}
        <>
          {defaultEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              onMouseEnter={(e) => handleEmojiMouseEnter(emoji, e)}
              onMouseLeave={handleEmojiMouseLeave}
              className={`text-xl hover:scale-110 transition-all duration-180 ${hoveredEmoji && hoveredEmoji !== emoji
                  ? 'opacity-100 brightness-75'
                  : 'opacity-100'
                }`}
            >
              {emoji}
            </button>
          ))}

          {/* <button
            onClick={() => setShowPicker(true)}
            className="p-1 rounded-full border hover:bg-gray-100  transition"
            title="More emojis"
          >
            <Plus size={18} className="text-gray-600" />
          </button> */}

          <div className="w-[2px] h-5 bg-gray-300  mx-1" />

          {/* Reply icon */}
          <button
            onClick={handleReply}
            className="p-1 rounded-full hover:bg-gray-100  transition"
            title="Reply"
          >
            <Reply size={20} className="text-gray-600" />
          </button>
        </>
       {/* ) : 
      // (
      //   <div className="absolute top-10 right-0 z-50">
      //     <Picker
      //       data={data}
      //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //       onEmojiSelect={(emoji: any) => {
      //         handleReact(emoji.native);
      //         setShowPicker(false);
      //       }}

              <EmojiPicker
                onEmojiClick={(emoji: EmojiClickData) => {
                  handleReact(emoji.emoji)
                  setShowPicker(false);
                }}
              />

      //       theme="light"
      //       previewPosition="none"
      //     />
      //   </div>
      // )} */}
    </div>
  );

  return createPortal(PopoverUI, document.body)
};
