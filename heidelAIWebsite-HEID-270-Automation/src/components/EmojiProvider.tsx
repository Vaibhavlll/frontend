import { Emoji, EmojiStyle } from "emoji-picker-react";

interface EmojiProviderProps {
  children: React.ReactNode;
}

const EmojiConfig = {
  emojiStyle: EmojiStyle.APPLE,
  size: 20
};

export function EmojiProvider({ children }: EmojiProviderProps) {
  return (
    <div className="emoji-provider">
      {children}
    </div>
  );
}

// Helper component for consistent emoji rendering
export function EmojiDisplay({ unified }: { unified: string }) {
  return (
    <Emoji 
      unified={unified} 
      emojiStyle={EmojiConfig.emojiStyle}
      size={EmojiConfig.size}
    />
  );
}