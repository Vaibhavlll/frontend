import { Conversation } from "@/components/types/conversation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/session_api";

export const useConversation = ({ initialConversation, selectedConversationId }: { initialConversation: Conversation, selectedConversationId: string }) => {
    const [conversation, setConversation] = useState<Conversation>(initialConversation);

    const [isResolved, setIsResolved] = useState(false);
    const [isFollowUp, setIsFollowUp] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    return {
        conversation,
        setConversation,

        isResolved,
        setIsResolved,
        isFollowUp,
        setIsFollowUp,
        isOpen,
        setIsOpen,
    }
}