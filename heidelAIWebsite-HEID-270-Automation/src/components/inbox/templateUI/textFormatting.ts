// textFormatting.ts
import { RefObject } from "react";

export const FORMAT_MARKERS = {
  bold: { start: "**", end: "**" },
  italic: { start: "_", end: "_" },
  strikethrough: { start: "~~", end: "~~" },
  monospace: { start: "`", end: "`" },
} as const;

export const insertTextAtCursor = (
  textarea: HTMLTextAreaElement,
  textToInsert: string,
  currentValue: string,
  setValue: (value: string) => void
) => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const newValue =
    currentValue.slice(0, start) + textToInsert + currentValue.slice(end);

  setValue(newValue);

  // Set cursor position after the inserted text
  setTimeout(() => {
    const newPos = start + textToInsert.length;
    textarea.selectionStart = newPos;
    textarea.selectionEnd = newPos;
    textarea.focus();
  }, 0);
};

type EmojiInput = string | { emoji: string };

export const insertEmoji = (
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  emoji: EmojiInput,
  currentValue: string,
  setValue: (value: string) => void
) => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const emojiChar = typeof emoji === "string" ? emoji : emoji.emoji;

  insertTextAtCursor(textarea, emojiChar, currentValue, setValue);
};

export const insertFormatting = (
  format: keyof typeof FORMAT_MARKERS,
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  currentValue: string,
  setValue: (value: string) => void
) => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const marker = FORMAT_MARKERS[format];

  // If there's no text selected, insert empty markers and place cursor between them
  if (start === end) {
    const textToInsert = marker.start + marker.end;
    const newValue =
      currentValue.slice(0, start) + textToInsert + currentValue.slice(end);

    setValue(newValue);

    setTimeout(() => {
      const newPos = start + marker.start.length;
      textarea.selectionStart = newPos;
      textarea.selectionEnd = newPos;
      textarea.focus();
    }, 0);
    return;
  }

  const selectedText = currentValue.substring(start, end);

  // Check if selection already has this formatting
  const hasFormatting =
    selectedText.startsWith(marker.start) &&
    selectedText.endsWith(marker.end);

  let newValue: string;
  let newSelectionEnd: number;

  if (hasFormatting) {
    // Remove formatting
    const unformattedText = selectedText.slice(
      marker.start.length,
      -marker.end.length
    );
    newValue =
      currentValue.slice(0, start) + unformattedText + currentValue.slice(end);
    newSelectionEnd = end - (marker.start.length + marker.end.length);
  } else {
    // Add formatting
    newValue =
      currentValue.slice(0, start) +
      marker.start +
      selectedText +
      marker.end +
      currentValue.slice(end);
    newSelectionEnd = end + (marker.start.length + marker.end.length);
  }

  setValue(newValue);

  // Preserve selection
  setTimeout(() => {
    textarea.selectionStart = start;
    textarea.selectionEnd = newSelectionEnd;
    textarea.focus();
  }, 0);
};
