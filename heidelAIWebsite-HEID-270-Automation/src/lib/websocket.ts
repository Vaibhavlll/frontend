import { useEffect } from "react";
import { useWebSocket } from "./WebsocketContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMainWebSocket(handlers?: any) {
  const { addEventHandler, sendWsMessage } = useWebSocket();

  useEffect(() => {
    if (!handlers) return;

    // Store cleanup functions
    const cleanups: (() => void)[] = [];

    if (handlers.onNewConversation) {
      const remove = addEventHandler("new_conversation", handlers.onNewConversation);
      cleanups.push(remove);
    }

    if (handlers.onConversationUpdated) {
      const remove = addEventHandler("conversation_updated", handlers.onConversationUpdated);
      cleanups.push(remove);
    }

    if (handlers.onNewMessage) {
      const remove = addEventHandler("new_message", handlers.onNewMessage);
      cleanups.push(remove);
    }

    if (handlers.onTypingIndicator) {
      const remove = addEventHandler("typing_indicator", handlers.onTypingIndicator);
      cleanups.push(remove);
    }

    if(handlers.onMessageReaction) {
      const remove = addEventHandler("message_reaction", handlers.onMessageReaction);
      cleanups.push(remove);
    }

    if(handlers.onMessageDeleted) {
      const remove = addEventHandler("message_deleted", handlers.onMessageDeleted);
      cleanups.push(remove);
    }
    
    if(handlers.onMessageStatusUpdate) {
      const remove = addEventHandler("message_status_update", handlers.onMessageStatusUpdate);
      cleanups.push(remove);
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [handlers]);

  return { sendWsMessage }
}
