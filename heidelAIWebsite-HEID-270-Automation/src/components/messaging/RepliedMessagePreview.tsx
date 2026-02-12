
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RepliedMessagePreview = ({ repliedMessage, currentMessage }: { repliedMessage: any, currentMessage:any }) => {
  // console.log("RepliedMessagePreview props:", { repliedMessage, currentMessage });
  if (!repliedMessage) return null;
  const isAgent = repliedMessage.role === "agent";
  const isAgentCurrentMessage = currentMessage.role === "customer";

  let textToDisplay = ""

  if(currentMessage.role == repliedMessage.role){
    textToDisplay = isAgent ? "You replied to yourself" : "Replied to themselves"
  } else {
    textToDisplay = isAgent ? "Replied to you" : "You replied to " + (repliedMessage.sender_name || "Customer")
  }

  let previewText = repliedMessage.content;
  if (repliedMessage.type !== "text") {
      if (repliedMessage.type === "image") previewText = `📷 ${previewText ? previewText : 'Image'}`;
      else if (repliedMessage.type === "video") previewText = "🎥 Video";
      else if (repliedMessage.type === "document") previewText = "📄 Document";
      else previewText = "Message";
  }

  return (
    <div className={`flex flex-col mb-1 ${isAgentCurrentMessage ? "items-start" : "items-end mr-2"} p-1 rounded-2xl `}>
      <p
        className={`text-sm ${
          isAgentCurrentMessage ? "pl-1.5 text-left" : "pr-1.5 text-right"
        } w-full text-gray-700 mb-1`}
      >
        {textToDisplay}
      </p>
    
      <div 
        className={`flex ${isAgentCurrentMessage ? "flex-row" : "flex-row-reverse"} gap-2`}
      >
        <div className="h-[38px] w-[4px] bg-gray-200 rounded-xl" />

        {previewText && (
          <p className={`text-sm  ${isAgentCurrentMessage ? "bg-gray-200 text-gray-600" : "bg-white text-gray-500"} border px-3 py-2 rounded-xl max-w-[180px] truncate`}>
            {previewText}
          </p>
        )}

      </div>
    </div>
  );
};
