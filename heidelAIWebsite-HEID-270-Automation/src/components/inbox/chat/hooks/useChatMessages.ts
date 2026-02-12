/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useMainWebSocket } from "@/lib/websocket";
import { Message } from "../types";
import { storeData, getData } from "@/lib/indexedDB";
import { useApi } from "@/lib/session_api";
import { toast } from "sonner";
import { Product } from "@/components/types/product";


// Helper to save messages to IDB in background

export const useChatMessages = (selectedConversationId: string, user: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<
    Map<string, { agent_name: string; timestamp: number }>
  >(new Map());
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [contextMessageId, setContextMessageId] = useState<string | null>(null);
  const [contextMessage, setContextMessage] = useState<Message | null>(null);
  const MESSAGE_STORAGE_KEY = `messages_${selectedConversationId}`;
  const api = useApi()

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);


  const persistMessages = useCallback(
    async (msgs: Message[]) => {
      if (!selectedConversationId) return;
      try {
        await storeData("messages", MESSAGE_STORAGE_KEY, msgs);
      } catch (err) {
        console.warn("Failed to cache messages:", err);
      }
    },
    [selectedConversationId, MESSAGE_STORAGE_KEY]
  );

  const fetchMessages = async () => {
    if (!selectedConversationId) return;

    setMessagesLoading(true);
    let hasCached = false;

    // 1. Load from Cache immediately
    try {
      const cachedMessages = await getData<Message[]>(
        "messages",
        MESSAGE_STORAGE_KEY
      );
      if (
        cachedMessages &&
        Array.isArray(cachedMessages) &&
        cachedMessages.length > 0
      ) {
        setMessages(cachedMessages);
        hasCached = true;
        setMessagesLoading(false);
        // Optional: Scroll to bottom immediately upon loading cache
        // setTimeout(() => lastMessageRef.current?.scrollIntoView(), 100);
      }
    } catch (err) {
      console.warn("Error loading cached messages:", err);
    }

    // 2. Fetch from API (Network Sync)
    const agent_username = user.username;
    try {
      const response = await api.get(
        `/api/conversations/${selectedConversationId}/messages?agent_username=${agent_username}`
      );

      const newMessages = response?.data.messages || [];
      setMessages(newMessages);

      // 3. Update Cache
      await persistMessages(newMessages);
    } catch (error) {
      toast.error("Failed to load messages", { description: error as string });
    } finally {
      setMessagesLoading(false);
    }
  };

  const formatSharedProduct = (product: Product) => {
    if (!product) return "";

    return `📦 ${product.product_name} | ₹${product.price} | Stock: ${product.stock}`;
  };


  const sendMessage = useCallback(async (
    content: string,
    attachments: File[],
    mode: "reply" | "private",
    contextMessageId?: string,
    shared_product?: Product | null
  ) => {
    const platform = selectedConversationId.split("_")[0];
    const tempId = `temp-${Date.now()}`;
    let context_type = null;
    const context_obj: any = {};

    if (contextMessageId) {
      context_type = "message_reply";
      context_obj.mid = contextMessageId;
    }

    if (shared_product) {
      context_obj.product = formatSharedProduct(shared_product);
    }

    const context = Object.keys(context_obj).length > 0 ? JSON.stringify(context_obj) : null;

    // 1. Create Optimistic Message Object
    let optimisticMessage: Message;

    if (attachments.length > 0) {
      const file = attachments[0];
      const localPreviewUrl = URL.createObjectURL(file);
      optimisticMessage = {
        id: tempId,
        platform: platform as "whatsapp" | "instagram",
        content: content,
        sender_id: selectedConversationId.split("_")[1],
        role: "agent",
        conversation_id: selectedConversationId,
        timestamp: new Date(new Date().getTime() - 5.5 * 60 * 60 * 1000).toISOString(),
        type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
        status: "sending",
        payload: { url: localPreviewUrl, caption: content },
        fileName: file.name,
        fileType: file.type,
        mode: mode,
        context_type: context_type as "message_reply" | null,
        context: context ? JSON.parse(context) : null,
      };
    } else {
      optimisticMessage = {
        id: tempId,
        platform: platform as "whatsapp" | "instagram",
        content: content,
        sender_id: selectedConversationId.split("_")[1],
        role: "agent",
        conversation_id: selectedConversationId,
        timestamp: new Date(new Date().getTime() - 5.5 * 60 * 60 * 1000).toISOString(),
        type: "text",
        status: "sending",
        mode: mode,
        context_type: context_type as "message_reply" | null,
        context: context ? JSON.parse(context) : null,
      };
    }

    console.log("Optimistic message created:", optimisticMessage);
    console.log("Context type:", context_type, "Context:", context);

    // 2. Update UI Immediately
    setMessages((prev) => [...prev, optimisticMessage]);

    // 3. Send to Backend
    try {
      const formData = new FormData();
      formData.append("temp_id", tempId);
      formData.append("conversation_id", selectedConversationId);
      formData.append("platform", platform);
      formData.append("mode", mode);
      if (context_type) formData.append("context_type", context_type);
      if (context) formData.append("context", context);

      if (content.trim()) formData.append("content", content.trim());
      if (attachments.length > 0) formData.append("file", attachments[0]);

      const response = await api.post(`/api/conversations/send-message`, formData);

      if (response.status !== 200) throw new Error("Failed to send");

      // 4. Update Temp ID to Real ID on Success
      if (response.data.details.message_id || response.data.details.response?.message_id) {
        const messageId = response.data.details.message_id || response.data.details.response?.message_id;
        console.log("received response message_id:", messageId);
        let payload: { id: string; status?: "sending" | "sent" | "delivered" | "read" } = {
          id: messageId,
        }
        if (response.data.details.status) {
          payload = { ...payload, status: response.data.details.status }
        }
        setMessages((prev) => {
          const index = prev.findIndex((m) => m.id === tempId);
          console.log("optimistic message index:", index);
          if (index !== -1) {
            console.log("updating optimistic message with real ID");
            const newState = [...prev];
            newState[index] = { ...newState[index], ...payload };
            // persistMessages(newState); // Call your IDB helper here
            console.log("Updated message:", newState[index]);
            return newState;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Send failed:", error);
      toast.error("Failed to send message");
      // Rollback on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      throw error; // Re-throw so the UI component knows it failed
    }
  }, [selectedConversationId]);

  // WebSocket logic
  useMainWebSocket({
    onTypingIndicator: (data: any) => {
      const myClientId = localStorage.getItem("chat_client_id");

      // Only show typing if it's for this conversation
      if (
        data.agent_id !== myClientId &&
        data.conversation_id === selectedConversationId
      ) {
        if (data.is_typing) {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            next.set(data.agent_id, {
              agent_name: data.user,
              timestamp: Date.now(),
            });
            return next;
          });
        } else {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            next.delete(data.agent_id);
            return next;
          });
        }
      }
    },

    onNewMessage: (data: any) => {
      const newMessage = data.message;

      const isCurrentChat = newMessage.conversation_id === selectedConversationId;
      const isWindowVisible = document.visibilityState === "visible";
      const userIsViewingThisChat = isCurrentChat && isWindowVisible;
      const notificationIcon = newMessage.platform === "whatsapp"
        ? "/features/whatsapp.png"
        : "/features/instagram.png";

      if (
        newMessage.role !== "agent" && // Not from us
        Notification.permission === "granted" &&
        !userIsViewingThisChat // Trigger if user is NOT viewing this chat (Hidden window OR different chat)
      ) {

        const title = `Message from ${newMessage.sender_name || "Customer"}`;
        const body = newMessage.type === "text"
          ? newMessage.content
          : `Sent a ${newMessage.type}`; // e.g., "Sent a image"

        const notification = new Notification(title, {
          body,
          icon: notificationIcon,
          // Tag: Updates existing notification for this chat instead of creating a new stack
          tag: newMessage.conversation_id,
          // Renotify: Alerts again even if reusing the same tag
          renotify: true,
          // Image: Show preview if it's an image message (Works on Windows/Android)
          image: newMessage.type === 'image' ? newMessage.payload?.url : undefined,
          // Silent: Silence system default beep since we played custom audio above
          silent: false,
        } as any);

        notification.onclick = () => {
          window.focus(); // Bring window to front
          notification.close();
        };
      }

      if (data.message.conversation_id === selectedConversationId) {
        setMessages((prev) => {
          const incomingMsg = data.message;

          // ---------------------------------------------------------
          // 1. DETERMINISTIC MATCH (The Fix)
          // Check if the incoming message has a temp_id in its metadata
          // ---------------------------------------------------------
          if (incomingMsg.platform === 'whatsapp') {
            const incomingTempId = incomingMsg.temp_id;

            const exactMatchIndex = prev.findIndex(
              (msg) =>
                msg.id.toString() === incomingTempId // Direct ID comparison
            );

            if (exactMatchIndex !== -1) {
              const newState = [...prev];
              // Replace optimistic message with real message
              newState[exactMatchIndex] = incomingMsg;
              persistMessages(newState);
              return newState;
            }
          }

          // ---------------------------------------------------------
          // 2. Fallback: For IG we match the message_id
          // ---------------------------------------------------------
          else {
            console.log("Attempting fuzzy match for incoming IG message:", incomingMsg);
            const fuzzyMatchIndex = prev.findIndex(
              (msg) =>
                msg.id.toString() === incomingMsg.id.toString()
            );
            console.log("Fuzzy match index for incoming IG message:", fuzzyMatchIndex);
            if (fuzzyMatchIndex !== -1) {
              const newState = [...prev];
              newState[fuzzyMatchIndex] = incomingMsg;
              console.log("Updated message with fuzzy match:", newState[fuzzyMatchIndex]);
              persistMessages(newState);
              return newState;
            }
          }

          // 3. Standard New Message Logic
          const messageExists = prev.some((msg) => msg.id === incomingMsg.id);
          if (!messageExists) {
            const newState = [...prev, incomingMsg];
            persistMessages(newState);
            return newState;
          }

          return prev;
        });
      }
    },

    onMessageStatusUpdate: (data: any) => {
      if (data.message.conversation_id === selectedConversationId) {
        setMessages((prev) => {
          const incomingMsg = data.message;

          // ---------------------------------------------------------
          // 1. DETERMINISTIC MATCH (The Fix)
          // Check if the incoming message has a temp_id in its metadata
          // ---------------------------------------------------------
          if (incomingMsg.platform === 'whatsapp') {
            // Temp ID based match
            const incomingTempId = incomingMsg.temp_id;

            const exactMatchIndex = prev.findIndex(
              (msg) =>
                msg.id.toString() === incomingTempId // Direct ID comparison
            );

            if (exactMatchIndex !== -1) {
              const newState = [...prev];
              // Replace optimistic message with real message
              newState[exactMatchIndex] = incomingMsg;
              persistMessages(newState);
              return newState;
            }
            else {
              // If no Temp ID match, match on message ID
              const fuzzyMatchIndex = prev.findIndex(
                (msg) =>
                  msg.id.toString() === incomingMsg.id.toString()
              );
              if (fuzzyMatchIndex !== -1) {
                const newState = [...prev];
                newState[fuzzyMatchIndex] = incomingMsg;
                persistMessages(newState);
                return newState;
              }
            }
          }

          return prev;
        });
      }
    },

    onMessageReaction: (data: any) => {
      if (data.message.conversation_id === selectedConversationId) {
        const updatedMessage = data.message;
        setMessages((prev) => {
          const newState = prev.map((message) => {
            if (
              message.id === updatedMessage.message_id ||
              message.id === updatedMessage.id
            ) {
              return { ...message, reaction: updatedMessage.reaction };
            }
            return message;
          });
          persistMessages(newState); // <--- SAVE TO IDB
          return newState;
        });
      }
    },

    onMessageDeleted: (data: any) => {
      if (data.conversation_id === selectedConversationId) {
        setMessages((prev) => {
          const newState = prev.filter((msg) => msg.id !== data.message_id);
          persistMessages(newState); // <--- SAVE TO IDB
          return newState;
        });
      }
    },
  });

  useEffect(() => {
    fetchMessages();
  }, [selectedConversationId]);

  return {
    messages,
    setMessages,
    typingUsers,
    messagesLoading,
    fetchMessages,
    sendMessage,
    setTypingUsers,
    contextMessageId,
    setContextMessageId,
    contextMessage,
    setContextMessage,
    formatSharedProduct
  };
}