import { supabase } from "@/components/supabase/client";
import { toast } from "@/components/hooks/use-toast";

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const storeMessage = async (
  message: Message,
  visitorName: string | null,
  visitorCompany: string | null,
  sessionId: string | null
) => {
  try {
    const { error } = await supabase
      .from('pitch_deck_conversations')
      .insert({
        visitor_name: visitorName,
        visitor_company: visitorCompany,
        message_content: message.content,
        role: message.role,
        session_id: sessionId,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error storing message:', error);
    toast({
      title: "Error",
      description: "Failed to store the message.",
      variant: "destructive",
    });
  }
};