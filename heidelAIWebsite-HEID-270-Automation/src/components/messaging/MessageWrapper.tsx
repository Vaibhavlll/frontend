import { useEffect, useRef, useState, memo } from "react";
import { MessageActionsPopover } from "./MessageActionPopover";
import MessageReaction from "./MessageReaction";
import { useApi } from "@/lib/session_api";
import { RepliedMessagePreview } from "./RepliedMessagePreview";
import { toast } from "sonner";
import { Message } from "../inbox/chat/types";

interface MessageWrapperProps {
  message: Message;
  index: number;
  allMessages: Message[];
  children: React.ReactNode;
  forceHide: boolean;
  setContextMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  setContextMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

 
const MessageWrapper = memo(({ message, index, children, allMessages, forceHide, setContextMessageId, setContextMessage, textAreaRef }: MessageWrapperProps) => {
  const anchorRef = useRef(null);
  const [showActions, setShowActions] = useState(false);
  const api = useApi()

  useEffect(() => {
    if (forceHide) {
      setShowActions(false);
    }
  }, [forceHide]);

  const handleReact = async (emoji: string) => {
    // console.log("Reacted with:", emoji, "on message:", message.id);
    
    const response = await api.post('/api/conversations/send_reaction', {
      "message_id": String(message.id),
      "platform": message.platform,
      "emoji": emoji
    });
    // console.log("Reaction response:", response.data);
    if (response.data.status == "error") {
      toast.error("Failed to send reaction");
    }
  };

  const handleReply = () => {
    if (message.platform == "instagram") {
      toast.warning("Can't reply to Instagram messages yet ☹️");
      return;
    }
    // TODO: handle reply input
    else if(message.platform == "whatsapp") {
      textAreaRef.current?.focus();
      setContextMessageId(message.id);
      setContextMessage(message);
    }
  };

  const repliedMessage =
    message.context_type === "message_reply"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? allMessages?.find((m: any) => m.id === message.context?.mid)
      : null;

  return (
    <div
      ref={anchorRef}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={` flex flex-col
          ${message.role === "customer" ? "items-start" : "items-end"}
        `}
    >
      {showActions && !forceHide && (
        <MessageActionsPopover
          anchorRef={anchorRef}
          isAgent={message.role === "agent"}
          onReact={handleReact}
          onReply={handleReply}
          platform={message.platform}
          onClose={() => setShowActions(false)} 
        />
      )}

      {repliedMessage && <RepliedMessagePreview repliedMessage={repliedMessage} currentMessage={message} />}

      {children}

      {message.reaction && (
        <div className={`flex ${message.role === "customer" ? "justify-start" : "justify-end"} mt-1`}>
          <MessageReaction
            platform={message.platform}
            reaction={message.reaction}
            messageId={message.id}
          />
        </div>
      )}
    </div>
  );
});

MessageWrapper.displayName = "MessageWrapper";

export default MessageWrapper;