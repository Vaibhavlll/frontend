import { Conversation } from "../../types/conversation";
import { Product } from "../../types/product";

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: AddressData;
  cart?: CartItem[];
}

export interface ProductData {
  id: number;
  image_link: string;
  name: string;
  on_sale: string;
  permalink: string;
  price: number;
  regular_price: string;
}

export interface Reminder {
  id: string;
  conversation_id: string;
  title: string;
  notes: string;
  trigger_time: string;
  status: "OVERDUE" | "SNOOZED" | "DONE" | "DELETED" | "PENDING";
  snooze_count: number;
  last_triggered_at: string;
  created_at: string;
  updated_at: string;
  recipient_email: string;
}

export interface ProductInfo {
  name: string;
  price: string;
  link: string;
  image_url: string;
  sale_price?: string;
}


export interface Message {
  id: string;
  content: string;
  timestamp: string;
  role: "customer" | "ai" | "agent" | "system";
  sender_id: string;
  conversation_id: string;
  sender_name?: string;
  status?: "sent" | "delivered" | "read" | "sending" | "failed";
  platform: "whatsapp" | "instagram";
  type?:
  | "text"
  | "image"
  | "file"
  | "voice"
  | "video"
  | "share"
  | "ig_story"
  | "ig_reel"
  | "story_reply"
  | "system"
  | "document";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  context_type?: "message_reply" |  null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  product_data?: ProductData[];
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  reaction?: MessageReactions;
  mode?: "reply" | "private";
}

export interface MessageReactions {
  emoji: string;
  username: string;
  full_name: string;
  timestamp: string;
  profile_picture_url: string;
}

export interface ChatViewProps {
  selectedConversationId: string;
  conversation: Conversation;
  sharedProduct: Product | null;
  onClearSharedProduct: () => void;
  isRightSidebarVisible?: boolean;
  onOpenRightSidebar?: () => void;
  onBackToList?: () => void;
  onConversationUpdate?: (conversationId: string, updates: Partial<Conversation>) => void;
}

export interface CartProductData {
  name: string;
  price: string;
  sale_price: string;
  image_url: string;
  link: string;
}

export interface CartItem {
  product_data: CartProductData;
  quantity: number;
  item_price: number;
  currency: string;
}

export interface AddressDetails {
  country: string;
  city: string;
  address: string;
  full_name: string;
  flow_token: string;
  state: string;
  email: string;
  pin_code: string;
}

export interface OrderItem {
  product_retailer_id: string;
  quantity: number;
  item_price: number;
  currency: string;
}

export interface AddressData {
  sender_id: string;
  order_details: OrderItem[];
  address: AddressDetails;
}

export interface CannedResponse {
  _id: string;
  org_id: string;
  shortcut: string;
  response: string;
  updated_at: string;
}