import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "../types";
import React, { useRef, useState, memo } from "react";
import { MessageSkeleton } from "./core/Skeletons";
import { getNextAgentMessage, formatMessageTime } from "../utils";
import MessageWrapper from "@/components/messaging/MessageWrapper";
import LazyMediaLoader from "@/components/LazyMediaLoader";
import InstagramPost from "@/components/instagram/messaging/InstagramPost";
import InstagramReel from "@/components/instagram/messaging/InstagramReel";
import InstagramStory from "@/components/instagram/messaging/InstagramStory";
import MediaMessage from "@/components/messaging/MediaMessage";
import DocumentMessage from "@/components/messaging/DocumentMessage";
import { MessageItem } from "./messages/MessageItem";
import { AnimatePresence, motion } from "framer-motion";

interface MessageListProps {
    messages: Message[];
    messagesLoading: boolean;
    selectedConversationId: string;
    lastMessageRef: React.RefObject<HTMLDivElement | null>;
    setContextMessageId: React.Dispatch<React.SetStateAction<string | null>>;
    setContextMessage: React.Dispatch<React.SetStateAction<Message | null>>;
    textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
    mode: "reply" | "private";
}

const MessageList = memo(({ messages, messagesLoading, selectedConversationId, lastMessageRef, setContextMessageId, setContextMessage, textAreaRef, mode }: MessageListProps) => {
    const scrollAreaRef = useRef(null);
    const [fullscreenMediaId, setFullscreenMediaId] = useState<string | null>(null);
    const [activeMediaType, setActiveMediaType] = useState<
        "reel" | "story" | "video" | null
    >(null);
    const [globalMuted, setGlobalMuted] = useState(true);
    const [activeMediaId, setActiveMediaId] = useState<string | null>(null);

    const filteredPrivateMessages = mode === "private" ? messages.filter(msg => msg.mode === 'private') : messages;

    const handlePlay = (id: string, type: "reel" | "story" | "video") => {
        setActiveMediaId(id);
        setActiveMediaType(type);
    };

    const handleMuteToggle = (muted: boolean) => {
        setGlobalMuted(muted);
    };

    const latestMediaMessage = React.useMemo(() => {
        return [...messages]
            .reverse()
            .find((m) => m.type === "ig_reel" || m.type === "ig_story");
    }, [messages]);

    const latestMediaId =
        latestMediaMessage?.payload?.reel_video_id ||
        latestMediaMessage?.payload?.story_media_id;


    return (
        <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 h-full pr-1 pl-4 py-0.1"
        >
            <div className="space-y-3 max-w-full pb-4 sm:pb-0">
                {messagesLoading && messages.length === 0 ? (
                    <div className="space-y-6 p-4">
                        {[1, 2, 3, 4].map((i) => (
                            <MessageSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredPrivateMessages.length === 0 && mode === "private" ? (
                    <div className="flex items-center justify-center h-full p-36">
                        <div className="text-center text-muted-foreground ">
                            <p className="text-sm mb-2">It&apos;s quiet here - no private notes yet</p>
                            <p className="text-sm">Please start by creating one</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait" initial={false}>
                        <>
                            {filteredPrivateMessages.map((message, index) => {
                                // ####################################################
                                // Message Status Icon Logic
                                // ####################################################
                                const isMe = message.role === "agent";

                                let showStatusIcon = false;

                                if (isMe) {
                                    const nextAgentMsg = getNextAgentMessage(messages, index);

                                    // 2. Logic: Show icon if it's the LAST message OR status changes next
                                    if (!nextAgentMsg) {
                                        // It's the very last message -> ALWAYS SHOW
                                        showStatusIcon = true;
                                    } else if (nextAgentMsg.status !== message.status) {
                                        // The status changed in the next message (e.g., Read -> Delivered)
                                        // So this is the "last" message of the current status group -> SHOW
                                        showStatusIcon = true;
                                    }
                                }
                                // ####################################################


                                const isLatest =
                                    (message.type === "ig_reel" &&
                                        message.payload?.reel_video_id === latestMediaId) ||
                                    (message.type === "ig_story" &&
                                        message.payload?.story_media_id === latestMediaId);
                                return (
                                    <motion.div
                                        key={message.id}
                                        layout // Animates layout changes (reordering)
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="relative group w-full message-item"
                                    >
                                        <div
                                            className="relative group w-full message-item"
                                        >
                                            <div
                                                className={`flex ${message.role === "customer"
                                                    ? "justify-start"
                                                    : "justify-end"
                                                    }`}
                                            >
                                                <div
                                                    className={`flex flex-col max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] ${message.role === "customer"
                                                        ? "items-start"
                                                        : "items-end mr-2"
                                                        }`}
                                                >
                                                    <MessageWrapper
                                                        message={message}
                                                        index={index}
                                                        allMessages={messages}
                                                        forceHide={fullscreenMediaId === message.id}
                                                        setContextMessageId={setContextMessageId}
                                                        setContextMessage={setContextMessage}
                                                        textAreaRef={textAreaRef}
                                                    >
                                                        {/* IG Media Messages */}
                                                        {message.payload && (
                                                            <LazyMediaLoader key={index} index={index}>
                                                                {/* Render IG Posts */}
                                                                {message.type === "share" && (
                                                                    <InstagramPost
                                                                        mediaUrl={message.payload.url}
                                                                        timestamp={formatMessageTime(
                                                                            message.timestamp
                                                                        )}
                                                                    />
                                                                )}

                                                                {/* Render IG Reels */}
                                                                {message.type === "ig_reel" && (
                                                                    <InstagramReel
                                                                        key={index}
                                                                        id={message.payload.reel_video_id}
                                                                        reelVideoUrl={message.payload.url}
                                                                        title={message.payload.caption}
                                                                        timestamp={formatMessageTime(
                                                                            message.timestamp
                                                                        )}
                                                                        viewOnInstagramUrl={`https://instagram.com/reel/${message.payload.reel_video_id}`}
                                                                        isLatest={isLatest}
                                                                        isActive={
                                                                            activeMediaType === "reel" &&
                                                                            activeMediaId ===
                                                                            message.payload.reel_video_id
                                                                        }
                                                                        onPlay={(id) => handlePlay(id, "reel")} // stops others
                                                                        isMuted={globalMuted}
                                                                        onMuteToggle={handleMuteToggle}
                                                                        isAgent={
                                                                            message.role.toLowerCase() === "agent"
                                                                        }
                                                                    />
                                                                )}

                                                                {/* Render IG Story */}
                                                                {(message.type === "ig_story" ||
                                                                    message.type === "story_reply") && (
                                                                        <InstagramStory
                                                                            id={message.payload.story_media_id}
                                                                            sharedBy="You"
                                                                            storyOwnerName={"Instagram User"}
                                                                            storyMediaUrl={
                                                                                message.payload.story_media_url
                                                                            }
                                                                            isActive={
                                                                                activeMediaType === "story" &&
                                                                                activeMediaId ===
                                                                                message.payload.story_media_id
                                                                            } // only one plays
                                                                            onPlay={(id) => handlePlay(id, "story")}
                                                                            isMuted={globalMuted}
                                                                            isLatest={isLatest}
                                                                            onMuteToggle={(muted) =>
                                                                                setGlobalMuted(muted)
                                                                            }
                                                                            isAgent={
                                                                                message.role.toLowerCase() === "agent"
                                                                            }
                                                                            timestamp={formatMessageTime(
                                                                                message.timestamp
                                                                            )}
                                                                            content={message.content}
                                                                            storyOwnerUsername={
                                                                                message.payload.owner_username
                                                                            }
                                                                            type={message.type}
                                                                        />
                                                                    )}

                                                                {/* Render Images / Videos */}
                                                                {(message.type === "image" ||
                                                                    message.type === "video") && (
                                                                        <MediaMessage
                                                                            showStatusIcon={showStatusIcon}
                                                                            type={
                                                                                message.type === "image"
                                                                                    ? "image"
                                                                                    : "video"
                                                                            }
                                                                            url={message.payload.url}
                                                                            status={message.status}
                                                                            message={message}
                                                                            caption={message.payload.caption}
                                                                            key={message.id}
                                                                            isAgent={
                                                                                message.role.toLowerCase() === "agent"
                                                                            }
                                                                            isLatest={isLatest}
                                                                            isActive={
                                                                                activeMediaType === "video" &&
                                                                                activeMediaId === message.id
                                                                            }
                                                                            onPlay={(id) => handlePlay(id, "video")}
                                                                            isMuted={globalMuted}
                                                                            onMuteToggle={(muted) =>
                                                                                setGlobalMuted(muted)
                                                                            }
                                                                            id={message.id}
                                                                            timestamp={formatMessageTime(
                                                                                message.timestamp
                                                                            )}
                                                                            onFullscreenToggle={(isFullscreen) => {
                                                                                if (isFullscreen) {
                                                                                    setFullscreenMediaId(message.id);
                                                                                } else {
                                                                                    setFullscreenMediaId(null);
                                                                                }
                                                                            }}
                                                                        />
                                                                    )}

                                                                {/* Document Messages */}
                                                                {message.type === "document" && (
                                                                    <DocumentMessage
                                                                        url={message.payload.url}
                                                                        previewUrl={message.payload.thumbnail_url}
                                                                        fileName={message.payload.file_name}
                                                                        caption={message.payload.caption}
                                                                        fileSize={message.payload.file_size}
                                                                        fileFormat={message.payload.file_format}
                                                                        filePages={message.payload.file_pages}
                                                                        isAgent={message.role.toLowerCase() === "agent"}
                                                                        timestamp={formatMessageTime(message.timestamp)}
                                                                        message={message}
                                                                    />
                                                                )}
                                                            </LazyMediaLoader>
                                                        )}

                                                        {/* Normal Messages */}
                                                        {![
                                                            "ig_story",
                                                            "story_reply",
                                                            "ig_reel",
                                                            "share",
                                                            "image",
                                                            "video",
                                                            "document",
                                                        ].includes(message.type ?? "") && (
                                                                <MessageItem
                                                                    key={message.id}
                                                                    message={message}
                                                                    index={index}
                                                                    isLatest={isLatest}
                                                                    isLast={index === filteredPrivateMessages.length - 1}
                                                                    isReplyMessage={
                                                                        message.context_type == "message_reply"
                                                                    }
                                                                    showStatusIcon={showStatusIcon}
                                                                    platform={selectedConversationId.split("_")[1]}
                                                                />
                                                            )}
                                                    </MessageWrapper>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div className="mt-10" ref={lastMessageRef} />
                        </>

                    </AnimatePresence>
                )}
            </div>
        </ScrollArea>
    )
});

MessageList.displayName = "MessageList";

export default MessageList;