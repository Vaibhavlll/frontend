export const renderContentWithLinks = (text: string, isAgent: boolean) => {
  if (!text) return null;

  // Regex to detect URLs (starting with http://, https://, or www.)
  const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;

  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      // Ensure href starts with http/https for www links
      const href = part.startsWith("www.") ? `https://${part}` : part;

      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline hover:opacity-80 transition-opacity break-all ${
            // 🎨 CONDITIONAL STYLING:
            // If Agent (Blue background) -> White/Light Blue links
            // If Customer (White background) -> Blue links
            isAgent ? "text-white decoration-white/50" : "text-blue-600 decoration-blue-500/50"
          }`}
          onClick={(e) => e.stopPropagation()} // Prevent clicking the message bubble itself
        >
          {part}
        </a>
      );
    }
    return part;
  });
};