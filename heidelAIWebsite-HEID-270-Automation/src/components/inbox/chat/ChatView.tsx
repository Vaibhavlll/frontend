"use client";
import { useEffect, useMemo, useRef, memo, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Upload,
} from "lucide-react";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import "../../../app/dashboard/dashboard.css";
import LandingDashboard from "../LandingDashboard";
import { useUser } from "@clerk/nextjs";
import { useMainWebSocket } from "@/lib/websocket";
import { ChatViewProps } from "./types";
import { getOrCreateChatClientId, getUtcTime } from "../chat/utils";
import { useChatMessages } from "./hooks/useChatMessages";
import { useFileHandler } from "./hooks/useFileHandler";
import MessageList from "./components/MessageList";
import ChatHeader from "./components/ChatHeader";
import { useConversation } from "./hooks/useConversation";
import ChatInput from "./components/ChatInput";
import { useMessage } from "./hooks/useMessage";

const ChatView = ({
  selectedConversationId,
  conversation: initialConversation,
  sharedProduct,
  onClearSharedProduct,
  isRightSidebarVisible,
  onOpenRightSidebar,
  onConversationUpdate,
}: ChatViewProps) => {
  const { user } = useUser();
  const { setAttachments, handleDrop, isDragging, setIsDragging } = useFileHandler();
  const { messages, setMessages, messagesLoading, setTypingUsers, sendMessage, typingUsers, contextMessageId, setContextMessageId, contextMessage, setContextMessage, formatSharedProduct } = useChatMessages(selectedConversationId, user);
  const { message, setMessage } = useMessage();
  const { conversation, setConversation, setIsResolved, setIsFollowUp, setIsOpen } = useConversation({ initialConversation, selectedConversationId });
  const { sendWsMessage } = useMainWebSocket();
  const [conversationStatus, setConversationStatus] = useState<"open" | "closed" | "follow-up">("open");
  const [mode, setMode] = useState<"reply" | "private">("reply");
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSharedProductRef = useRef<boolean>(false);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (sharedProduct && !lastSharedProductRef.current) {
      setMessage(formatSharedProduct(sharedProduct))
      lastSharedProductRef.current = true;
    } else if (!sharedProduct) {
      lastSharedProductRef.current = false;
    }
  }, [sharedProduct]);


  const saveCustomerInfo = async (updatedData: {
    name: string;
    email: string;
    billingaddress: string;
    shippingaddress: string;
    gstin: string;
  }) => {
    try {
      const response = await fetch(
        `https://egenie-whatsapp.koyeb.app/conversations/${selectedConversationId}/update_customer_info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update customer info");
      }

      const updatedConversation = await response.json();
      setConversation(updatedConversation);
      toast.success("Customer information updated successfully!");
    } catch (error) {
      console.error("Error updating customer info:", error);
      toast.error("Failed to update customer information.");
    }
  };

  useEffect(() => {
    if (!selectedConversationId) return () => { };

    setConversation(initialConversation)

    setMessage("");
    textareaRef.current?.focus();
    sendWsMessage({
      type: "join_conversation",
      conversation_id: selectedConversationId,
    });
    setMode('reply');

    getOrCreateChatClientId();
    setMessages([]);
    setAttachments([]);
    setTypingUsers(new Map());

    return () => {
      sendWsMessage({
        type: "leave_conversation",
        conversation_id: selectedConversationId,
      });
    };


  }, [selectedConversationId]);

  useEffect(() => {
    if (!conversation) return;
    setConversationStatus(conversation.status || "open");
  }, [conversation])

  const lastCustomerMessage = useMemo(() => {
    return messages
      .filter((m) => m.role === "customer")
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
  }, [messages]);

  const targetExpiryDate = lastCustomerMessage
    ? new Date(getUtcTime(lastCustomerMessage.timestamp) + (24 * 60 * 60 * 1000) - (45 * 1000)).toISOString()
    : null;

  const isWindowExpired = lastCustomerMessage
    ? new Date().getTime() - getUtcTime(lastCustomerMessage.timestamp) >
    24 * 60 * 60 * 1000
    : false;

  return (
    <>
      { /*<Toaster richColors position="top-right" /> */}
      <style>
        {`
          .product-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
          .product-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
          .product-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .skeleton { background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%); background-size: 200% 100%; animation: loading 1.5s infinite; }
          @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `}
      </style>

      <TooltipProvider>
        {!selectedConversationId ? (
          <div className="h-full flex flex-col bg-white">
            <LandingDashboard />
          </div>
        ) : (
          <Card
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative h-full flex flex-col bg-gray-100/80 max-h-screen rounded-none overflow-hidden ${isDragging ? "" : "border border-gray-200"}`}
          >

            {/* Header */}
            <ChatHeader
              conversation={conversation}
              selectedConversationId={selectedConversationId}
              saveCustomerInfo={saveCustomerInfo}
              setMessages={setMessages}
              lastMessageRef={lastMessageRef}
              setConversation={setConversation}
              onOpenRightSidebar={onOpenRightSidebar}
              isRightSidebarVisible={isRightSidebarVisible}
              conversationStatus={conversationStatus}
              setConversationStatus={setConversationStatus}
              setIsResolved={setIsResolved}
              setIsFollowUp={setIsFollowUp}
              isWindowExpired={isWindowExpired}
              targetExpiryDate={targetExpiryDate}
              updateConversation={onConversationUpdate}
            />

            {isDragging && (
              <div
                className="absolute mt-12  border-blue-500 border-2 border-dashed inset-0 z-50 flex bg-white/30 backdrop-blur-sm items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <div className="flex flex-col items-center justify-center gap-3  rounded-2xl p-6  text-gray-600">
                  <Upload className="h-12 w-12" />
                  <div className="text-sm font-semibold">Drop files to upload</div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <MessageList
              messages={messages}
              messagesLoading={messagesLoading}
              selectedConversationId={selectedConversationId}
              lastMessageRef={lastMessageRef}
              setContextMessageId={setContextMessageId}
              setContextMessage={setContextMessage}
              textAreaRef={textareaRef}
              mode={mode}
            />

            {/* Input Section */}
            <ChatInput
              sharedProduct={sharedProduct}
              onClearSharedProduct={onClearSharedProduct}
              selectedConversationId={selectedConversationId}
              lastMessageRef={lastMessageRef}
              message={message}
              setMessage={setMessage}
              textAreaRef={textareaRef}
              sendMessage={sendMessage}
              typingUsers={typingUsers}
              isWindowExpired={isWindowExpired}
              contextMessageId={contextMessageId}
              contextMessage={contextMessage}
              setContextMessage={setContextMessage}
              setContextMessageId={setContextMessageId}
              mode={mode}
              setMode={setMode}
            />

          </Card>
        )}
      </TooltipProvider>
    </>
  );
};




export default memo(ChatView);
