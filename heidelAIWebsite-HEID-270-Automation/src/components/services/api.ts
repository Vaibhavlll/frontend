import { useApi } from "@/lib/session_api";
import { useMemo } from "react";

export interface WhatsAppMessage {
  conversation_id: string;
  content: string;
  sender_id: string;
  type?: string;
  media_id?: string;
  media_type?: string;
}

export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

const handleApiError = (error: unknown, context: string): never => {
  if (error instanceof Error) {
    console.error(`[ConversationService] ${context}:`, error.message);
  } else {
    console.error(`[ConversationService] ${context}:`, error);
  }
  throw error;
};

export const useConversationService = () => {
  const api = useApi();

  return useMemo(() => ({
    async getConversation(conversationId: string): Promise<ApiResponse> {
      try {
        const response = await api.get(`/api/conversations/${conversationId}`);
        return { status: "success", data: response.data };
      } catch (error) {
        handleApiError(error, "Fetching conversation");
        return { status: "error", message: "Failed to fetch conversation" };
      }
    },

    async getAllConversations(): Promise<ApiResponse> {
      try {
        const url = "api/conversations";
        const response = await api.get(url);
        return { status: "success", data: response.data };
      }
      catch (error) {
        handleApiError(error, "Fetching conversations by status");
        return { status: "error", message: "Failed to fetch conversations by status" };
      }
    },

    async getInstagramConversations(): Promise<ApiResponse> {
      try {
        const response = await api.get("/api/instagram/conversations");
        return { status: "success", data: response.data };
      } catch (error) {
        handleApiError(error, "Fetching Instagram conversations");
        return { status: "error", message: "Failed to fetch Instagram conversations" };
      }
    },

    async getWhatsAppConversations(): Promise<ApiResponse> {
      try {
        const response = await api.get("/api/whatsapp/conversations");
        return { status: "success", data: response.data };
      } catch (error) {
        handleApiError(error, "Fetching WhatsApp conversations");
        return { status: "error", message: "Failed to fetch WhatsApp conversations" };
      }
    },

    async getWhatsAppMessages(
      whatsappId: string,
      conversationId: string
    ): Promise<ApiResponse> {
      if (!whatsappId || !conversationId) {
        return { status: "error", message: "Missing WhatsApp ID or Conversation ID" };
      }

      try {
        const response = await api.get(
          `/api/whatsapp/${whatsappId}/conversations/${conversationId}/messages`
        );
        return { status: "success", data: response.data };
      } catch (error) {
        handleApiError(error, "Fetching WhatsApp messages");
        return { status: "error", message: "Failed to fetch WhatsApp messages" };
      }
    },

    async getWhatsAppAiStatus(
      whatsappId: string,
      conversationId: string
    ): Promise<ApiResponse> {
      if (!whatsappId || !conversationId) {
        return { status: "error", message: "Missing WhatsApp ID or Conversation ID" };
      }

      try {
        const response = await api.get(
          `/api/whatsapp/${whatsappId}/conversations/${conversationId}/ai`
        );
        return { status: "success", data: response.data };
      } catch (error) {
        console.warn("[ConversationService] Failed to fetch WhatsApp AI status, defaulting to enabled.");
        return { status: "success", data: true };
      }
    },

    async toggleWhatsAppAi(
      whatsappId: string,
      conversationId: string,
      enabled: boolean
    ): Promise<ApiResponse> {
      if (!whatsappId || !conversationId) {
        return { status: "error", message: "Missing WhatsApp ID or Conversation ID" };
      }

      try {
        const response = await api.post(
          `/api/whatsapp/${whatsappId}/conversations/${conversationId}/toggle_ai`,
          { enabled }
        );
        return { status: "success", data: response.data };
      } catch (error) {
        handleApiError(error, "Toggling WhatsApp AI");
        return { status: "error", message: "Failed to toggle WhatsApp AI" };
      }
    },

    async sendWhatsAppMessage(
      whatsappId: string,
      message: WhatsAppMessage
    ): Promise<ApiResponse> {
      if (!whatsappId) {
        return { status: "error", message: "Missing WhatsApp ID" };
      }
      if (!message?.conversation_id || !message?.content || !message?.sender_id) {
        return { status: "error", message: "Invalid message payload" };
      }

      try {
        const response = await api.post(
          `/api/whatsapp/${whatsappId}/conversations/send_message`,
          message
        );
        return { status: "success", data: response.data };
      } catch (error) {
        handleApiError(error, "Sending WhatsApp message");
        return { status: "error", message: "Failed to send WhatsApp message" };
      }
    },
  }), [api]);
};

