import { TypingUsers } from "./TypingUsers";
import { SharedProductPreview } from "./messages/SharedProductPreview";
import { Product } from "@/components/types/product";
import { useEffect, useRef, useState } from "react";
import {
    X, Send, Paperclip, Smile,
    // Mic, 
} from "lucide-react";
import { CannedResponses } from "./CannedResponses";
import { useCannedResponses } from "../hooks/useCannedResponses";
import { CannedResponse, Message } from "../types";
import { useTypingIndicator } from "@/components/hooks/typingIndicator";
import { useMainWebSocket } from "@/lib/websocket";
import { useFileHandler } from "../hooks/useFileHandler";
import { toast } from "sonner";
import Image from "next/image"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MIN_HEIGHT, MAX_HEIGHT } from "../constants";
import { ReplyPreview } from "./ReplyPreview";

interface ChatInputProps {
    sharedProduct: Product | null;
    onClearSharedProduct: () => void;
    selectedConversationId: string;
    lastMessageRef: React.RefObject<HTMLDivElement | null>;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
    sendMessage: (content: string, attachments: File[], mode: "reply" | "private", contextMessageId?: string, shared_product?: Product | null) => Promise<void>;
    typingUsers: Map<string, { agent_name: string }>
    isWindowExpired: boolean;
    contextMessageId: string | null;
    contextMessage: Message | null;
    setContextMessageId: React.Dispatch<React.SetStateAction<string | null>>;
    setContextMessage: React.Dispatch<React.SetStateAction<Message | null>>;
    mode: "reply" | "private";
    setMode: React.Dispatch<React.SetStateAction<"reply" | "private">>;
}

const ChatInput = ({
    sharedProduct,
    onClearSharedProduct,
    selectedConversationId,
    lastMessageRef,
    message,
    setMessage,
    textAreaRef,
    sendMessage,
    typingUsers,
    isWindowExpired,
    contextMessageId,
    contextMessage,
    setContextMessageId,
    setContextMessage,
    mode,
    setMode
}: ChatInputProps) => {

    const {
        filterResponses,
        navigateSelection,
        getCurrentSelection,
        filteredResponses,
        setFilteredResponses,
        showCannedResponses,
        selectedCannedIndex,
        setSelectedCannedIndex,
        setShowCannedResponses
    } = useCannedResponses();
    const sendFn = (payload: Record<string, unknown>) => {
        // console.log("TypingIndicator payload sent to backend:", payload);
        sendWsMessage(payload);
    };
    const { handleTyping } = useTypingIndicator(sendFn, selectedConversationId);
    const { sendWsMessage } = useMainWebSocket();
    const { attachments, setAttachments, handleFiles, handleDrop, isDragging, setIsDragging, fileInputRef } = useFileHandler();




    // const [audioURL, setAudioURL] = useState<string | null>(null);
    // const [mode, setMode] = useState<"reply" | "private">("reply");
    // const [isRecording, setIsRecording] = useState(false);


    const backdropRef = useRef<HTMLDivElement>(null);
    const typingThrottleRef = useRef<number>(0);
    // const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    // const audioChunksRef = useRef<Blob[]>([]);

    const maxLength = selectedConversationId?.split("_")[0] === "instagram" ? 900 : 3500;

    // Handle canned response selection
    const handleSelectCannedResponse = (response: CannedResponse) => {
        setMessage(response.response);
        setShowCannedResponses(false);
        setFilteredResponses([]);
        setSelectedCannedIndex(0);

        // Focus back on textarea
        setTimeout(() => {
            textAreaRef.current?.focus();
        }, 0);
    };

    const handleScroll = () => {
        if (textAreaRef.current && backdropRef.current) {
            backdropRef.current.scrollTop = textAreaRef.current.scrollTop;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;

        setMessage(val);
        // PERFORMANCE FIX: Only run standard filtering logic if:
        // 1. The message starts with "/" (user defines a command)
        // 2. OR the menu is currently visible (so we can update/close it)
        // This prevents re-renders on every keystroke for normal messages.
        if (val.startsWith("/") || showCannedResponses) {
            filterResponses(val);
        }

        // Typing Indicator Throttle
        const now = Date.now();
        if (now - typingThrottleRef.current > 100) {
            handleTyping();
            typingThrottleRef.current = now;
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === "file") {
                if (mode === "private") {
                    toast.error("Attachments are disabled in private mode");
                    return;
                }
                const file = item.getAsFile();
                if (file) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    handleFiles(dt.files);
                }
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCannedResponses) {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                navigateSelection("up");
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                navigateSelection("down");
            } else if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const selected = getCurrentSelection();
                if (selected) {
                    handleSelectCannedResponse(selected);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                setShowCannedResponses(false);
            }
        } else {
            // Normal send logic
            // Default Enter key behavior (send message)
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
            if (e.key === "Escape") {
                e.preventDefault();
                textAreaRef.current?.focus();
                setContextMessageId(null);
                setContextMessage(null);
                setAttachments([]);
            }
            // if(e.key === "/") {
            //     // Open canned responses
            //     setShowCannedResponses(true);
            // }
        }
    };

    const handleSend = async () => {
        // 1. Validation
        if ((!message.trim() && attachments.length === 0)) return;
        if (message.length > maxLength) {
            toast.error(`Message exceeds limit`);
            return;
        }
        if (mode === "private" && attachments.length > 0) {
            toast.error("Attachments are disabled in private mode");
            return;
        }

        const contentToSend = message.trim();

        // 3. Save current state for rollback if needed
        const prevMessage = message;
        const prevAttachments = attachments;
        const prevContextId = contextMessageId;
        const prevContextMessage = contextMessage;
        const prevSharedProduct = sharedProduct;

        console.log(prevContextId)

        // 4. Clear UI immediately for responsiveness
        setMessage("");
        setAttachments([]);
        setShowCannedResponses(false);
        setContextMessageId(null);
        setContextMessage(null);
        onClearSharedProduct();

        // 5. Call the Hook
        try {
            await sendMessage(contentToSend, prevAttachments, mode, prevContextId || undefined, prevSharedProduct);

            // Scroll to bottom
            setTimeout(() => lastMessageRef.current?.scrollIntoView({ behavior: "smooth" }), 10);

        } catch (error) {
            // Restore UI on error (The hook handles removing the message bubble, we restore the text)
            setMessage(prevMessage);
            setAttachments(prevAttachments);
            setContextMessageId(prevContextId);
            setContextMessage(prevContextMessage);
            // We don't restore sharedProduct here because it's cleared in ChatView via props, 
            // but if we wanted to be super safe we'd need more logic. 
            // However, the current implementation clears it immediately.
        }
    };

    // const startRecording = async () => {
    //     try {
    //         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //         const mediaRecorder = new MediaRecorder(stream, {
    //         mimeType: "audio/webm;codecs=opus",
    //         });
    //         mediaRecorderRef.current = mediaRecorder;
    //         audioChunksRef.current = [];

    //         mediaRecorder.ondataavailable = (event) => {
    //         if (event.data.size > 0) {
    //             audioChunksRef.current.push(event.data);
    //         }
    //         };

    //         mediaRecorder.onstop = () => {
    //         const audioBlob = new Blob(audioChunksRef.current, {
    //             type: "audio/webm",
    //         });
    //         const audioUrl = URL.createObjectURL(audioBlob);
    //         setAudioURL(audioUrl);
    //         setIsRecording(false);
    //         };

    //         mediaRecorder.start();
    //         setIsRecording(true);
    //     } catch (error) {
    //         console.error("Error accessing microphone:", error);
    //         toast.error("Error accessing microphone. Please check your permissions.");
    //     }
    // };

    // const stopRecording = () => {
    //     if (mediaRecorderRef.current) {
    //         mediaRecorderRef.current.stop();
    //         setIsRecording(false);
    //         mediaRecorderRef.current.stream
    //         .getTracks()
    //         .forEach((track) => track.stop());
    //     }
    // };

    const handleFileClick = () => {
        fileInputRef.current?.click(); // trigger hidden input
        textAreaRef.current?.focus();
    };

    useEffect(() => {
        const textarea = textAreaRef.current;
        const backdrop = backdropRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";

        const scrollHeight = textarea.scrollHeight;

        if (scrollHeight <= MIN_HEIGHT) {
            // 2 lines
            textarea.style.height = `${MIN_HEIGHT}px`;
            textarea.style.overflowY = "hidden";
            if (backdrop) backdrop.style.overflowY = "hidden";
        } else if (scrollHeight >= MAX_HEIGHT) {
            // More than 10 lines
            textarea.style.height = `${MAX_HEIGHT}px`;
            textarea.style.overflowY = "auto";
            if (backdrop) backdrop.style.overflowY = "auto";
        } else {
            // Between 2-5 lines
            textarea.style.height = `${scrollHeight}px`;
            textarea.style.overflowY = "hidden";
            if (backdrop) backdrop.style.overflowY = "hidden";
        }
    }, [message]);


    return (
        <div className="flex-shrink-0 mb-3 relative bg-gray-100/80">
            {/* Typing Users */}
            <TypingUsers typingUsers={typingUsers} />


            {sharedProduct && (
                <div className="mb-3 px-3">
                    <SharedProductPreview
                        product={sharedProduct}
                        onRemove={onClearSharedProduct}
                    />
                </div>
            )}



            {/* {audioURL ? (
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-200/60 mx-3">
                <audio controls src={audioURL} className="flex-1" />
                <button
                className="p-2 rounded-xl hover:bg-gray-100/80 transition-colors"
                onClick={() => setAudioURL(null)}
                >
                <X className="h-4 w-4 text-gray-600" />
                </button>
            </div>
            ) : ( */}
            <div className="relative">
                {/* Canned Responses Dropdown */}
                <CannedResponses
                    filteredResponses={filteredResponses}
                    showCannedResponses={showCannedResponses}
                    selectedCannedIndex={selectedCannedIndex}
                    onHover={setSelectedCannedIndex} // Hover updates index for click
                    onSelect={(response) => {
                        handleSelectCannedResponse(response);
                    }}
                />

                <div className={`relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-3 hover:border-gray-300/60 flex flex-col shadow-xl mx-3 `}>

                    {/* Mode Toggle */}
                    <div className="mb-5 w-40 bg-gray-100/80 rounded-2xl p-0.5 flex items-center relative z-50">
                        <button
                            className={`flex-1 text-xs px-4 py-2 rounded-2xl transition-all duration-300 font-medium ${mode === "reply"
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-gray-600 hover:text-blue-600"
                                }`}
                            onClick={() => setMode("reply")}
                        >
                            Reply
                        </button>
                        <button
                            className={`flex-1 text-xs px-4 py-2 rounded-2xl transition-all duration-300 font-medium ${mode === "private"
                                ? "bg-purple-600 text-white shadow-md"
                                : "text-gray-600 hover:text-purple-600"
                                }`}
                            onClick={() => setMode("private")}
                        >
                            Private
                        </button>
                    </div>

                    {isWindowExpired && mode === "reply" && (
                        <div className="absolute inset-0 z-40 bg-gray-100/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                            <div className="bg-white text-red-600 px-4 py-2 rounded-xl border border-red-200 shadow-sm text-sm font-medium">
                                You can’t reply to this conversation because the 24-hour reply window has expired.
                            </div>
                        </div>
                    )}

                    {contextMessageId && contextMessage && (
                        <ReplyPreview
                            message={contextMessage}
                            onCancel={() => {
                                setContextMessageId(null);
                                setContextMessage(null);
                            }}
                        />
                    )}

                    {/* Textarea */}
                    <div className="flex-1 mb-1.5 relative">
                        <div
                            ref={backdropRef}
                            className="absolute inset-0 w-full h-full text-sm p-0 whitespace-pre-wrap break-words text-transparent pointer-events-none scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent"
                            style={{
                                lineHeight: "20px",
                                fontFamily: "inherit",
                            }}
                            aria-hidden="true"
                        >
                            {message.slice(0, maxLength)}
                            <span className="bg-red-300 text-transparent">{message.slice(maxLength)}</span>
                        </div>
                        <textarea
                            ref={textAreaRef}
                            onScroll={handleScroll}
                            value={message}
                            onChange={handleInputChange}
                            disabled={mode === "reply" && isWindowExpired}
                            onPaste={handlePaste}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                mode === "reply"
                                    ? sharedProduct
                                        ? "Add a message about this product..."
                                        : "Type your message... (Use / for quick replies)"
                                    : "Add a private note..."
                            }
                            rows={2}
                            style={{
                                minHeight: "40px", // 2 lines
                                maxHeight: "200px", // 10 lines
                                lineHeight: "20px",
                            }}
                            className="w-full bg-transparent border-none outline-none focus:outline-none resize-none overflow-y-hidden text-gray-800 placeholder-gray-500 text-sm p-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent transition-all duration-150 relative z-10"
                        />
                    </div>

                    {attachments.length > 0 && (
                        <div className="flex gap-2 mb-3 px-3 flex-wrap">
                            {attachments.map((file, idx) => {
                                const isImage = file.type.startsWith("image/");
                                const url = URL.createObjectURL(file);
                                return (
                                    <div key={idx} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                                        {isImage ? (
                                            <Image fill src={url} alt="preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <video src={url} className="w-full h-full object-cover" />
                                        )}
                                        <button
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                            onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            {/* Emoji picker
                    <Popover>
                        <PopoverTrigger asChild>
                        <button disabled={mode === "reply" && isWindowExpired} className="p-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 transition-colors">
                            <Smile className="h-4 w-4 text-gray-600" />
                        </button>
                        </PopoverTrigger>
                        <PopoverContent
                        className="w-80 p-0 rounded-2xl shadow-xl border-0 bg-white/95 backdrop-blur-xl"
                        side="top"
                        align="start"
                        >
                        </PopoverContent>
                    </Popover> 
                    */}

                            {/* File attachment */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        disabled={(mode === "reply" && isWindowExpired) || mode === "private"}
                                        onClick={handleFileClick}
                                        className={`p-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 transition-colors ${mode === "private" ? "cursor-not-allowed opacity-50" : ""}`}
                                    >
                                        <Paperclip className="h-4 w-4 text-gray-600" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-900/90 backdrop-blur-sm text-white rounded-xl">
                                    {mode === "private" ? "Disabled in private mode" : "Attach media"}
                                </TooltipContent>
                            </Tooltip>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                disabled={(mode === "reply" && isWindowExpired) || mode === "private"}
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(e) => handleFiles(e.target.files)}
                            />

                            {/* Voice recording */}
                            {/* <Tooltip>
                        <TooltipTrigger asChild>
                        <button
                            className={`p-2.5 rounded-xl transition-colors ${isRecording
                            ? "bg-red-100/80 hover:bg-red-200/80 text-red-600"
                            : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-600"
                            }`}
                            onClick={
                            isRecording ? stopRecording : startRecording
                            }
                        >
                            <Mic className="h-4 w-4" />
                        </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900/90 backdrop-blur-sm text-white rounded-xl">
                        {isRecording ? "Stop recording" : "Record message"}
                        </TooltipContent>
                    </Tooltip> */}
                        </div>

                        {/* Character count and send button */}
                        <div className="flex items-center gap-4">
                            <div className={`text-xs ${message.length > maxLength ? 'text-red-500' : 'text-gray-500'} font-medium`}>
                                {message.length}/{maxLength}
                            </div>

                            <button
                                className={`px-6 py-2.5 rounded-2xl flex items-center justify-center transition-all duration-300 font-medium text-sm ${message.trim() || attachments.length > 0
                                    ? mode === "reply"
                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg"
                                    : "bg-gray-200/80 text-gray-400 cursor-not-allowed"
                                    } ${message.length > maxLength ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => {
                                    if (message.length > maxLength) toast.error(`Message exceeds maximum length of ${maxLength} characters.`);
                                    handleSend();
                                }}
                                // ONLY disable if input is empty.
                                // We removed 'isSending' so you can spam click like WhatsApp.
                                disabled={(!message.trim() && attachments.length === 0) || message.length > maxLength || (mode === "reply" && isWindowExpired)}
                            >
                                <Send className="h-4 w-4" />
                                <span className="ml-2">
                                    {mode === "reply" ? "Send" : "Add Note"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* )} */}
        </div>
    )
}

export default ChatInput;