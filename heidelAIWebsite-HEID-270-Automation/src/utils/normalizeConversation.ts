import { Conversation } from '@/components/types/conversation';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeConversation(conv: any): Conversation {
  return {
    conversation_id: conv.id || conv.conversation_id || '',
    id: conv.id || conv.conversation_id || '',
    platform: conv.platform,
    customer_id: conv.customer_id || '',
    customer_name: conv.customer_name || 'Unknown',
    last_message: conv.last_message || '',
    last_message_is_private_note: conv.last_message_is_private_note || false,
    timestamp: conv.last_message_timestamp,
    unread_count: conv.unread_count || 0,
    is_ai_enabled: conv.is_ai_enabled ?? true,
    assigned_agent_id: conv.assigned_agent_id || null,
    priority: ['high', 'low'].includes(conv.priority) ? conv.priority : 'medium',
    sentiment: ['positive', 'negative'].includes(conv.sentiment) ? conv.sentiment : 'neutral',
    email: conv.email || '',
    status: conv.status,
    reply_window_ends_at: conv.reply_window_ends_at,
    categories: conv.categories || [],
    billingAddress: conv.billingAddress || '',
    shippingAddress: conv.shippingAddress || '',
    gstin: conv.gstin || '',
    avatar_url: conv.avatar_url || ''
  };
}