import { Message, CartItem, AddressData } from "./types";
import { format, parseISO } from "date-fns";

export const parseBackendDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    // Trim microseconds: .267000 -> .267
    let cleaned = dateStr.replace(/\.(\d{3})\d+/, ".$1");
    // Backend sends no timezone → force UTC to avoid NaN
    if (!cleaned.endsWith("Z") && !cleaned.includes("+")) {
        cleaned = cleaned + "Z";
    }
    const date = new Date(cleaned);
    return isNaN(date.getTime()) ? null : date;
};

export const formatReminderDate = (dateStr: string): string => {
    const date = parseBackendDate(dateStr);
    if (!date) return "Invalid date";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

// Helper to find the next message sent by the AGENT
export const getNextAgentMessage = (msgs: Message[], currentIndex: number) => {
  for (let i = currentIndex + 1; i < msgs.length; i++) {
    if (msgs[i].role === "agent") return msgs[i];
  }
  return null;
};

export const formatMessageTime = (timestamp: string): string => {
  try {
    const date = parseISO(timestamp);
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return format(istDate, "h:mma").toLowerCase();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export const validateFile = (file: File): string | null => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) return "Only images and videos allowed";

    const sizeMB = file.size / (1024 * 1024);
    if (isImage && sizeMB > 5) return "Image must be under 5MB";
    if (isVideo && sizeMB > 16) return "Video must be under 16MB";
    return null;
  };

export function getOrCreateChatClientId() {
    let id = localStorage.getItem("chat_client_id");
    if (!id) {
        id = `chat-view-${Date.now()}`;
        localStorage.setItem("chat_client_id", id);
    }
    return id;
}

export const formatPrice = (price: string) => {
  return price.replace(/\\u20b9/g, "₹").replace(/\u20b9/g, "₹");
};

const extractProductInfo = (content: string) => {
  try {
    const match = content.match(/know_more_request_from_sender=(\[.*?\])/);

    if (match) {
      const jsonStr = match[1]

        .replace(/'/g, '"') // Convert single quotes to double quotes

        .replace(/"name":\s*"([^"]*?)"/g, (match, nameValue) => {
          const fixedName = nameValue.replace(/(?<!\\)"/g, '\\"'); // Escape only unescaped double quotes inside the name

          return `"name": "${fixedName}"`;
        });

      return JSON.parse(jsonStr);
    }

    return null;
  } catch (error) {
    console.error("Error parsing product info:", error);

    return null;
  }
};

const extractBotProductInfo = (content: string) => {
  try {
    const match = content.match(/know_more_details_from_bot=(\[.*?\])/);

    if (match) {
      const jsonStr = match[1].replace(/'/g, '"');

      return JSON.parse(jsonStr);
    }

    return null;
  } catch (error) {
    console.error("Error parsing product info:", error);

    return null;
  }
};

const extractAgentProductInfo = (content: string) => {
  try {
    // Extract product info between =(...)]

    const match = content.match(
      /send_product_request_from_agent=\(.*?\)=(\[.*?\])/
    );

    if (match) {
      const jsonStr = match[1].replace(/'/g, '"');

      return JSON.parse(jsonStr);
    }

    return null;
  } catch (error) {
    console.error("Error parsing agent product info:", error);

    return null;
  }
};

const extractAgentProductText = (content: string): string | null => {
  try {
    // Extract text between parentheses

    const match = content.match(/send_product_request_from_agent=\((.*?)\)=/);

    if (match && match[1]) {
      // console.log("match", match[1]);

      return match[1];
    }

    return null;
  } catch (error) {
    console.error("Error parsing agent product text:", error);

    return null;
  }
};

const extractCartData = (content: string) => {
  try {
    const match = content.match(/cart_data_from_sender=(\[.+?\])/);

    if (!match) return null;

    const cartItems: CartItem[] = JSON.parse(match[1]);

    return cartItems;
  } catch (error) {
    console.error("Error parsing cart data:", error);

    return null;
  }
};

const extractAddressData = (content: string): AddressData | null => {
  try {
    const match = content.match(/address_data_from_sender\s*=\s*({.+})/);

    if (!match) return null;

    const jsonStr = match[1].replace(/'/g, '"');

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing address data:", error);

    return null;
  }
};

  // Helper to safely get UTC timestamp
export  const getUtcTime = (timestamp: string) => {
  if (!timestamp) return 0;
  // If string doesn't end in Z, assume it's UTC and append Z to force UTC interpretation
  // trimming potential microseconds if they exist to ensure compatibility might be handled by Date parser usually, 
  // but ensuring 'Z' forces UTC context.
  const safeTimestamp = timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`; 
  return new Date(safeTimestamp).getTime();
};

export function formatPhoneNumber(raw: string): string {
  if (!raw) return "";

  // Remove everything except digits
  const digits = raw.replace(/\D/g, "");

  if (digits.length <= 10) {
    // Not enough digits to contain a country code
    return raw;
  }

  // Last 10 digits = local number
  const local = digits.slice(-10);
  const countryCode = digits.slice(0, -10);

  // Split local number into 5 + 5
  const first = local.slice(0, 5);
  const second = local.slice(5);

  return `+${countryCode} ${first} ${second}`;
}
