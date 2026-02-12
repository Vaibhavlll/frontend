import { useUser } from '@clerk/nextjs';
import { useRef, useEffect, useCallback } from 'react';

export function useTypingIndicator(
  sendFn: (payload: Record<string, unknown>) => void,
  conversationId: string
) {
  const { user, isLoaded } = useUser();
  const agentIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stopTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      agentIdRef.current = localStorage.getItem('chat_client_id');
    }
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (stopTypingTimerRef.current) clearTimeout(stopTypingTimerRef.current);
      // On unmount, send stop typing if needed
      if (isTypingRef.current) {
        sendFn({
          type: 'typing_indicator',
          platform: conversationId.split('_')[0],
          is_typing: false,
          agent_id: agentIdRef.current,
          user: user?.username,
          conversation_id: conversationId,
        });
        isTypingRef.current = false;
      }
    };
  }, [conversationId, user]);

  const handleTyping = useCallback(() => {
    if (!isLoaded || !user) return;
    // Debounce start typing
    if (!isTypingRef.current && !debounceTimerRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        sendFn({
          type: 'typing_indicator',
          platform: conversationId.split('_')[0],
          is_typing: true,
          agent_id: agentIdRef.current,
          user: user.username,
          conversation_id: conversationId,
        });
        isTypingRef.current = true;
        debounceTimerRef.current = null;
      }, 300);
    }
    // Reset stop typing timer
    if (stopTypingTimerRef.current) clearTimeout(stopTypingTimerRef.current);
    stopTypingTimerRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        sendFn({
          type: 'typing_indicator',
          platform: conversationId.split('_')[0],
          is_typing: false,
          agent_id: agentIdRef.current,
          user: user.username,
          conversation_id: conversationId,
        });
        isTypingRef.current = false;
      }
    }, 2000);
  }, [sendFn, isLoaded, user, conversationId]);

  return { handleTyping };
}