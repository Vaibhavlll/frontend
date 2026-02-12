import { Conversation } from "@/components/types/conversation";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import CustomerInfo from "../../CustomerInfo";
import { Badge } from "@/components/ui/badge";
import CountDownTimer from "../../../LandingPage/CountDownTimer";
import UserStatus from "../../UserStatus";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Message } from "../types";
import { useApi } from "@/lib/session_api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, MoreVertical } from "lucide-react";
import { useReminders } from "@/components/hooks/useReminders";
import ReminderDialog from "./dialogs/ReminderDialog";
import { RemindersPopover } from "./reminders/RemindersPopover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useConversationService } from "@/components/services/api";
import CustomerInfoDialog from "./dialogs/CustomerInfoDialog";

interface ChatHeaderProps {
  conversation: Conversation | null;
  selectedConversationId: string;
  saveCustomerInfo: (updatedData: {
    name: string;
    email: string;
    billingaddress: string;
    shippingaddress: string;
    gstin: string;
    phoneOrUserId: string;
  }) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
  setConversation: React.Dispatch<React.SetStateAction<Conversation>>;
  isRightSidebarVisible?: boolean;
  onOpenRightSidebar?: () => void;
  conversationStatus: "open" | "closed" | "follow-up";
  setConversationStatus: React.Dispatch<
    React.SetStateAction<"open" | "closed" | "follow-up">
  >;
  setIsResolved: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFollowUp: React.Dispatch<React.SetStateAction<boolean>>;
  isWindowExpired: boolean;
  targetExpiryDate: string | null;
  updateConversation?: (
    conversationId: string,
    updates: Partial<Conversation>,
  ) => void;
}

const ChatHeader = ({
  conversation,
  selectedConversationId,
  saveCustomerInfo,
  setMessages,
  lastMessageRef,
  setConversation,
  onOpenRightSidebar,
  isRightSidebarVisible,
  conversationStatus,
  setConversationStatus,
  setIsResolved,
  setIsFollowUp,
  isWindowExpired,
  targetExpiryDate,
  updateConversation,
}: ChatHeaderProps) => {
  const {
    reminders,
    snoozeReminder,
    doneReminder,
    snoozing,
    completing,
    deleteReminder,
  } = useReminders(selectedConversationId);

  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const api = useApi();
  const conversationService = useConversationService();

  const activeCount = reminders.filter(
    (r) => r.status !== "DELETED" && r.status !== "DONE",
  ).length;

  let avatarSource = "";

  if (conversation?.platform === "whatsapp") {
    avatarSource = "/features/whatsapp.png";
  } else if (conversation?.platform === "telegram") {
    avatarSource = "/features/telegram.png";
  } else if (conversation?.platform === "instagram") {
    avatarSource = "/features/instagram.png";
  }

  const handleResolve = useCallback(
    async (selectedConversationId: string) => {
      setIsResolved(true);
      setIsFollowUp(false);
      setConversationStatus("closed");
      setIsStatusDropdownOpen(false);
      setStatusLoading(true);
      const agentName = "You";

      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `Conversation was marked Closed by ${agentName}`,
        type: "system",
        role: "system",
        platform: selectedConversationId.split("_")[0] as
          | "whatsapp"
          | "instagram",
        conversation_id: selectedConversationId || "",
        timestamp: new Date().toISOString(),
        sender_id: "system",
      };

      setMessages((prev) => [...prev, systemMessage]);

      setTimeout(() => {
        if (lastMessageRef.current) {
          lastMessageRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 100);

      try {
        // Use encodeURIComponent to be safe with IDs that contain special chars
        const res = await api.post(
          `/api/conversations/${encodeURIComponent(selectedConversationId)}/close`,
        );

        // handle non-2xx as error
        if (!(res && (res.status === 200 || res.status === 204))) {
          throw new Error(
            `Unexpected response from server: ${res?.status ?? "no status"}`,
          );
        }
        setConversation((prev) =>
          prev ? { ...prev, status: "closed" } : prev,
        );
        setConversationStatus("closed");
        updateConversation?.(selectedConversationId, { status: "closed" });
        toast.success("Closed conversation successfully");
      } catch (err) {
        // Rollback optimistic UI: remove system message we added earlier
        console.error("Error closing conversation:", err);
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== systemMessage.id),
        );

        // rollback other state if you want (optional — uncomment to revert)
        // setIsResolved(false);
        // setConversationStatus("open");

        const message =
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: { data?: { message?: string } } })
            .response?.data?.message === "string"
            ? (err as { response?: { data?: { message?: string } } }).response!
                .data!.message!
            : "Failed to close conversation. Try again.";
        toast.error(message);
      } finally {
        setStatusLoading(false);
      }
    },
    [selectedConversationId],
  );

  const handleFollowUp = useCallback(async (selectedConversationId: string) => {
    setIsResolved(false);
    setIsFollowUp(true);
    setConversationStatus("follow-up");
    setIsStatusDropdownOpen(false);
    setStatusLoading(true);
    const agentName = "You";

    try {
      const res = await api.post(
        `/api/ai/schedule-message/${selectedConversationId}`,
      );

      if (!(res && (res.status === 200 || res.status === 204))) {
        throw new Error(
          `Unexpected response from server: ${res?.status ?? "no status"}`,
        );
      }

      setConversation((prev) =>
        prev ? { ...prev, status: "follow-up" } : prev,
      );
      setConversationStatus("follow-up");
      updateConversation?.(selectedConversationId, { status: "follow-up" });
      toast.success("Marked conversation for follow-up successfully");
    } catch (err) {
      console.error("Error scheduling message for follow-up:", err);
      setMessages((prev) => prev.filter((msg) => msg.id !== systemMessage.id));

      // rollback other state if you want (optional — uncomment to revert)
      // setIsResolved(false);
      // setConversationStatus("open");

      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response!
              .data!.message!
          : "Failed to set conversation for follow-up. Try again.";
      toast.error(message);
    } finally {
      setStatusLoading(false);
    }

    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      content: `Conversation was marked for follow-up by ${agentName}`,
      platform: selectedConversationId.split("_")[0] as
        | "whatsapp"
        | "instagram",
      type: "system",
      role: "system",
      conversation_id: selectedConversationId || "",
      timestamp: new Date().toISOString(),
      sender_id: "system",
    };

    setMessages((prev) => [...prev, systemMessage]);

    setTimeout(() => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);
  }, []);

  const handleReopen = useCallback(async () => {
    setIsResolved(false);
    setIsFollowUp(false);
    setConversationStatus("open");
    setIsStatusDropdownOpen(false);
    setStatusLoading(true);
    const agentName = "You";

    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      content: `Conversation was reopened by ${agentName}`,
      type: "system",
      platform: selectedConversationId.split("_")[0] as
        | "whatsapp"
        | "instagram",
      role: "system",
      conversation_id: selectedConversationId || "",
      timestamp: new Date().toISOString(),
      sender_id: "system",
    };

    setMessages((prev) => [...prev, systemMessage]);

    setTimeout(() => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);

    try {
      const res = await api.post(
        `/api/conversations/${encodeURIComponent(selectedConversationId)}/reopen`,
      );

      if (!(res && (res.status === 200 || res.status === 204))) {
        throw new Error(
          `Unexpected response from server: ${res?.status ?? "no status"}`,
        );
      }

      setConversation((prev) => (prev ? { ...prev, status: "open" } : prev));
      setConversationStatus("open");
      updateConversation?.(selectedConversationId, { status: "open" });
      toast.success("Reopened conversation successfully");
    } catch (err) {
      console.error("Error reopening conversation:", err);
      setMessages((prev) => prev.filter((msg) => msg.id !== systemMessage.id));
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response!
              .data!.message!
          : "Failed to reopen conversation. Try again.";
      toast.error(message);
    } finally {
      setStatusLoading(false);
    }
  }, [selectedConversationId]);

  const toggleAI = async () => {
    if (!selectedConversationId || isToggling) return;

    setIsToggling(true);
    try {
      const platform = selectedConversationId.split("_")[0];
      let response;
      if (platform === "whatsapp") {
        const whatsappId = localStorage.getItem("whatsapp_user_id");
        if (!whatsappId) throw new Error("No WhatsApp ID found");
        response = await conversationService.toggleWhatsAppAi(
          whatsappId,
          selectedConversationId,
          !isAIEnabled,
        );
        if (response.status !== "success")
          throw new Error(response.message || "Failed to toggle AI");
      } else if (platform === "instagram") {
        response = await api.post(
          `/api/instagram/conversations/${selectedConversationId}/toggle_ai`,
          {
            enabled: !isAIEnabled,
          },
        );
        if (response.status !== 200) throw new Error("Failed to toggle AI");
      }
      setIsAIEnabled(!isAIEnabled);
      toast.success(
        `AI ${!isAIEnabled ? "enabled" : "disabled"} for this conversation`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle AI status",
      );
    } finally {
      setIsToggling(false);
    }
  };

  const fetchAIStatus = useCallback(async () => {
    try {
      const platform = selectedConversationId.split("_")[0];
      let response;
      if (platform === "instagram") {
        response = await api.get(
          `/api/instagram/conversations/${selectedConversationId}/ai`,
        );
        setIsAIEnabled(!!response?.data);
      } else if (platform === "whatsapp") {
        const whatsappId = localStorage.getItem("whatsapp_user_id");
        if (!whatsappId) return;
        response = await conversationService.getWhatsAppAiStatus(
          whatsappId,
          selectedConversationId,
        );
        setIsAIEnabled(!!response.data);
      }
    } catch (error) {
      setIsAIEnabled(true);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchAIStatus();
    }
  }, [selectedConversationId, fetchAIStatus]);

  return (
    <>
      <ReminderDialog
        open={showReminder}
        onOpenChange={setShowReminder}
        onSave={(reminderData) => {
          setShowReminder(false);
        }}
        conversation_id={selectedConversationId}
      />
      {/* Customer Info Dialog */}
      <CustomerInfoDialog
        showCustomerInfo={showCustomerInfo}
        setShowCustomerInfo={setShowCustomerInfo}
        conversation={conversation}
        selectedConversationId={selectedConversationId}
      />

      {/* Main Header Container */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-0.5 border-b border-gray-100 bg-white gap-2">
        {/* Avatar and name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            {avatarSource ? (
              <Avatar className="h-7 w-7 border-2 border-white shadow-sm ring-1 ring-gray-100 -mt-0.5">
                <Image
                  src={avatarSource}
                  alt="Platform avatar"
                  className="object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden",
                    );
                  }}
                  fill
                />
                <div className="hidden h-full w-full avatar-placeholder rounded-full"></div>
              </Avatar>
            ) : (
              <div className="h-8 w-8 skeleton rounded-full"></div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <Dialog>
              <DialogTrigger asChild>
                <div className="group cursor-pointer truncate">
                  {conversation ? (
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                      {conversation?.customer_name}
                    </h3>
                  ) : (
                    <div className="h-4 w-24 sm:w-32 skeleton rounded"></div>
                  )}
                </div>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[900px] sm:max-h-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {conversation?.customer_name} Information
                  </DialogTitle>
                </DialogHeader>
                {conversation && (
                  <CustomerInfo
                    name={conversation?.customer_name || "Unknown"}
                    email={conversation?.email || "Unknown"}
                    billingaddress={conversation?.billingAddress || "Unknown"}
                    shippingaddress={conversation?.shippingAddress || "Unknown"}
                    platform={conversation?.platform || ""}
                    selectedConversationId={selectedConversationId}
                    saveCustomerInfo={saveCustomerInfo}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Count down clock */}
          {targetExpiryDate && (
            <Badge
              variant="secondary"
              className={`backdrop-blur-sm ${isWindowExpired ? "bg-red-100 border-red-200 text-red-800 hover:bg-red-200" : "bg-green-100 border-green-200 text-black hover:bg-green-200"} hover:cursor-pointer px-2 rounded-full whitespace-nowrap`}
            >
              <CountDownTimer targetDate={targetExpiryDate} />
            </Badge>
          )}

          <UserStatus
            conversationStatus={conversationStatus}
            isStatusDropdownOpen={isStatusDropdownOpen}
            setIsStatusDropdownOpen={setIsStatusDropdownOpen}
            selectedConversationId={selectedConversationId}
            statusLoading={statusLoading}
            handleResolve={handleResolve}
            handleFollowUp={handleFollowUp}
            handleReopen={handleReopen}
          />

          {/* Reminders Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Clock className="h-5 w-5" />
                      {activeCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
                        >
                          {activeCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <RemindersPopover
                    reminders={reminders}
                    snoozeReminder={snoozeReminder}
                    doneReminder={doneReminder}
                    onCreateReminder={() => setShowReminder(true)}
                    snoozing={snoozing}
                    completing={completing}
                    activeCount={activeCount}
                    deleteReminder={deleteReminder}
                  />
                </Popover>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {activeCount > 0
                ? `${activeCount} reminder${activeCount > 1 ? "s" : ""} set`
                : "Set reminder"}
            </TooltipContent>
          </Tooltip>

          {/* AI Toggle */}
          <div className="hidden sm:flex items-center bg-white rounded-2xl px-3 py-1.5 border border-transparent hover:bg-gray-100 transition-colors">
            <Switch
              checked={isAIEnabled}
              onCheckedChange={toggleAI}
              disabled={isToggling}
              className="data-[state=checked]:bg-blue-600 mr-2 scale-75"
            />
            <span className="text-sm font-medium text-gray-800">AI</span>
          </div>
          {/* Mobile AI Toggle */}
          <div className="sm:hidden">
            <Switch
              checked={isAIEnabled}
              onCheckedChange={toggleAI}
              disabled={isToggling}
              className="data-[state=checked]:bg-blue-600 scale-75"
            />
          </div>

          {/* Kebab Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onOpenRightSidebar && (
                <DropdownMenuItem onClick={onOpenRightSidebar}>
                  View Customer Info
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
