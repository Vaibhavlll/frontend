"use client";
import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import React from "react";
import dynamic from "next/dynamic";
import ConversationList from "@/components/inbox/ConversationList";
import SettingsSidebar from "@/components/setting_tab/SettingsSidebar";
import { useConversations } from "@/components/hooks/useConversations";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/inbox_button";
import Image from "next/image";
import {
  BarChart2,
  CreditCard,
  Settings,
  ContactRoundIcon,
  BotMessageSquare,
  LogOut,
  LayoutDashboard,
  MessageCircle,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { InstagramLogoIcon } from "@radix-ui/react-icons";
import ReminderSidebar from "@/components/inbox/ReminderSideBar";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Product } from "@/components/types/product";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChatView from "@/components/inbox/chat/ChatView";
import LandingDashboard from "@/components/inbox/LandingDashboard";

const Sidebar = dynamic(() => import("@/components/inbox/sidebar/Sidebar"), {
  ssr: false,
  loading: () => <SidebarSkeleton />,
});

const ContactsDashboard = dynamic(
  () => import("@/components/Contacts/ContactsDashboard"),
  {
    ssr: false,
    loading: () => <TabLoadingSkeleton />,
  },
);

const TalkToDataTab = dynamic(
  () => import("@/components/TalkToData/TalkToDataTab"),
  {
    ssr: false,
    loading: () => <TabLoadingSkeleton />,
  },
);

const AnalyticsBot = dynamic(
  () => import("@/components/AnalyticsBot/AnalyticsBot"),
  {
    ssr: false,
    loading: () => <TabLoadingSkeleton />,
  },
);

const InfluencerBot = dynamic(
  () => import("@/components/influencerBot/influencerbot"),
  {
    ssr: false,
    loading: () => <TabLoadingSkeleton />,
  },
);

const AutomationHub = dynamic(
  () => import("@/components/Automation/AutomationHub"),
  {
    ssr: false,
    loading: () => <TabLoadingSkeleton />,
  },
);

const ChatViewSkeleton = React.memo(() => (
  <div className="h-full flex flex-col bg-white">
    <div className="p-4 border-b flex items-center gap-3">
      <div className="w-10 h-10 skeleton rounded-full" />
      <div className="space-y-2 flex-1 min-w-0">
        <div className="h-4 w-32 skeleton rounded" />
        <div className="h-3 w-24 skeleton rounded" />
      </div>
    </div>
    <div className="flex-1 p-4 space-y-4 min-h-0 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`max-w-[70%] p-4 skeleton rounded-2xl h-16 ${i % 2 === 0 ? "w-48" : "w-56"}`}
          ></div>
        </div>
      ))}
    </div>
    <div className="p-4 border-t">
      <div className="skeleton h-10 rounded-lg" />
    </div>
  </div>
));
ChatViewSkeleton.displayName = "ChatViewSkeleton";

const SidebarSkeleton = React.memo(() => (
  <div className="h-full bg-white border-l border-gray-200">
    <div className="px-4 py-4 border-b">
      <div className="h-5 w-20 skeleton rounded mb-3" />
      <div className="flex gap-3 min-w-0">
        <div className="w-10 h-10 skeleton rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="h-4 w-24 skeleton rounded" />
          <div className="h-3 w-32 skeleton rounded" />
        </div>
      </div>
    </div>
    <div className="p-4 space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 skeleton rounded-lg" />
      ))}
    </div>
  </div>
));
SidebarSkeleton.displayName = "SidebarSkeleton";

const TabLoadingSkeleton = React.memo(() => (
  <div className="h-full w-full flex items-center justify-center bg-gray-50">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 skeleton rounded-full mx-auto" />
      <div className="h-4 w-32 skeleton rounded mx-auto" />
    </div>
  </div>
));
TabLoadingSkeleton.displayName = "TabLoadingSkeleton";

const SidebarNavigation = React.memo(
  ({
    activeView,
    isConversationListVisible,
    isExpanded,
    onShowConversationList,
    onNavigate,
    onToggleExpanded,
    isPending,
  }: {
    activeView: string;
    isConversationListVisible: boolean;
    isExpanded: boolean;
    onShowConversationList: () => void;
    onNavigate: (value: string) => void;
    onToggleExpanded: () => void;
    isPending: boolean;
  }) => {
    const { user } = useUser();
    const { isSignedIn, isLoaded } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const mainNavigationItems = useMemo(
      () => [
        { value: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { value: "inbox", icon: MessageCircle, label: "Inbox" },
        { value: "analyticsbot", icon: BarChart2, label: "Analytics" },
        { value: "Contacts", icon: ContactRoundIcon, label: "Customers" },
      ],
      [],
    );

    const additionalItems = useMemo(
      () => [
        { value: "Automation", icon: CreditCard, label: "AutomationHub" },
        { value: "talktodata", icon: BotMessageSquare, label: "Talk to Data" },
        {
          value: "influencerbot",
          icon: InstagramLogoIcon,
          label: "InfluIndex",
        },
      ],
      [],
    );

    const { signOut } = useClerk();
    const router = useRouter();

    useEffect(() => {
      if (isLoaded && !isSignedIn) {
        router.push("/login");
      }
    }, [isLoaded, isSignedIn, router]);

    const handleSignOut = async () => {
      toast.success("Signing out successfully!");
      await signOut();
      router.push("/");
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
    };

    const handleOpenIntegrations = useCallback(() => {
      onNavigate("settings");
      setTimeout(() => {
        const event = new CustomEvent("openIntegrationsSettings");
        window.dispatchEvent(event);
      }, 100);
    }, [onNavigate]);

    return (
      <aside
        className={`
      ${isExpanded ? "w-48" : "w-14"}
      bg-white
      border-r border-gray-200
      flex-shrink-0
      transition-all duration-300
      ${isPending ? "pointer-events-none opacity-70" : ""}
    `}
      >
        <div className="h-full flex flex-col p-3 min-h-0">
          {isExpanded && (
            <div className="space-y-3 mb-4 flex-shrink-0">
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/heidelai.png"
                        alt="HeidelAI Logo"
                        width={28}
                        height={28}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-gray-900 truncate overflow-hidden text-ellipsis">
                        {user?.fullName || user?.firstName || "User"}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate overflow-hidden text-ellipsis">
                        {user?.primaryEmailAddress?.emailAddress ||
                          "user@example.com"}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform flex-shrink-0 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-44 ml-3 bg-white border border-gray-200 rounded-xl shadow-lg"
                  align="start"
                  sideOffset={5}
                >
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {user?.fullName || user?.firstName || "User"}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {user?.primaryEmailAddress?.emailAddress ||
                          "user@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem
                    className="px-3 py-2 text-xs cursor-pointer focus:bg-red-50 focus:text-red-600 text-gray-700"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={handleOpenIntegrations}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-gray-100"
              >
                <div className="flex items-center gap-2">
                  {/* Integration Icon */}
                  <svg
                    className="w-3.5 h-3.5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">
                    Let&apos;s Link
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* WhatsApp */}
                  <div className="w-4 h-4 rounded-sm bg-[#25D366] flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 6.01L0 24l6.15-1.58A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 22.05c-1.85 0-3.67-.5-5.26-1.45l-.38-.22-3.65.94.97-3.55-.25-.37A9.94 9.94 0 012.05 12c0-5.47 4.48-9.95 9.95-9.95 2.66 0 5.17 1.04 7.05 2.93a9.94 9.94 0 012.93 7.05c0 5.47-4.48 9.95-9.95 9.95zm5.6-7.88c-.31-.16-1.85-.91-2.14-1.02-.29-.1-.5-.16-.71.16-.2.31-.82 1.02-1.01 1.23-.18.2-.37.22-.68.07-.31-.16-1.3-.48-2.47-1.54-.91-.81-1.52-1.81-1.7-2.12-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.56.16-.18.2-.31.31-.52.1-.2.05-.38-.02-.54-.07-.16-.71-1.7-.97-2.33-.26-.63-.52-.54-.71-.55h-.6c-.2 0-.52.07-.79.38-.27.31-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.16.2 2.1 3.2 5.1 4.49.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.08 1.85-.76 2.11-1.5.26-.74.26-1.38.18-1.5-.07-.12-.29-.2-.6-.36z" />
                    </svg>
                  </div>

                  {/* Instagram */}
                  <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </div>

                  {/* Facebook */}
                  <div className="w-4 h-4 rounded-sm bg-[#1877F2] flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H9.691v-3.622h3.129V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24h-1.917c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.593 1.324-1.324V1.325C24 .593 23.407 0 22.675 0z" />
                    </svg>
                  </div>

                  {/* Telegram */}
                  {/* <div className="w-4 h-4 rounded-sm bg-[#0088cc] flex items-center justify-center">
  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.87.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5 1.19-.38.04-3.92.07-6.46.07-.79 0-1.06-.08-1.36-.12z"/>
  </svg>
</div> */}
                </div>
              </button>
              <div className="border-t border-gray-200" />
            </div>
          )}

          {!isExpanded && (
            <div className="mb-4 flex flex-col items-center gap-2 flex-shrink-0">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    className="w-10 h-10 rounded flex items-center justify-center hover:bg-gray-100 transition-all p-1"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <Image
                      src="/heidelai.png"
                      alt="HeidelAI Logo"
                      width={28}
                      height={28}
                      className="w-full h-full object-contain"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-gray-800 text-white px-2 py-1.5 rounded-xl z-[60]"
                >
                  <div className="text-xs">
                    <p className="font-semibold">
                      {user?.fullName || user?.firstName || "User"}
                    </p>
                    <p className="text-gray-300 text-[10px]">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleOpenIntegrations}
                    className="w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-200"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-gray-800 text-white px-2 py-1.5 rounded-xl z-[60]"
                >
                  <span className="text-xs font-medium">Link Integrations</span>
                </TooltipContent>
              </Tooltip>

              {!isConversationListVisible && activeView === "inbox" && (
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onShowConversationList}
                      className="h-8 w-8 rounded-lg hover:bg-gray-100"
                      aria-label="Show conversation list"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-gray-800 text-white px-2 py-1.5 rounded-xl z-[60]"
                    sideOffset={8}
                  >
                    <span className="text-xs font-medium">
                      Show conversations
                    </span>
                  </TooltipContent>
                </Tooltip>
              )}

              <div className="border-t border-gray-200 w-full" />
            </div>
          )}

          <nav className="space-y-1 flex-1 overflow-y-auto min-h-0">
            {isExpanded ? (
              <>
                {mainNavigationItems.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => onNavigate(value)}
                    className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group
                    ${
                      activeView === value
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs font-medium truncate overflow-hidden text-ellipsis flex-1 text-left">
                      {label}
                    </span>

                    {/* Chevron inbox */}
                    {value === "inbox" &&
                      !isConversationListVisible &&
                      activeView === "inbox" && (
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onShowConversationList();
                              }}
                              className="p-1 -mr-1 rounded hover:bg-white/50 cursor-pointer flex-shrink-0"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-gray-800 text-white px-2 py-1.5 rounded-xl z-[60]"
                          >
                            <span className="text-xs font-medium">
                              Show conversations
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      )}
                  </button>
                ))}

                <div className="my-3 border-t border-gray-200" />

                <div className="space-y-1">
                  {additionalItems.map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => onNavigate(value)}
                      className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                      ${
                        activeView === value
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }
                    `}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-medium truncate overflow-hidden text-ellipsis">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {mainNavigationItems.map(({ value, icon: Icon }) => (
                  <Tooltip key={value} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onNavigate(value)}
                        className={`w-full h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                          activeView === value
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-gray-800 text-white text-xs"
                    >
                      {value === "dashboard"
                        ? "Dashboard"
                        : value === "inbox"
                          ? "Inbox"
                          : value === "Contacts"
                            ? "Customers"
                            : "Analytics"}
                    </TooltipContent>
                  </Tooltip>
                ))}

                <div className="my-3 border-t border-gray-200" />

                {additionalItems.map(({ value, icon: Icon }) => (
                  <Tooltip key={value} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onNavigate(value)}
                        className={`w-full h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                          activeView === value
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-gray-800 text-white text-xs"
                    >
                      {value === "Automation"
                        ? "AutomationHub"
                        : value === "talktodata"
                          ? "Talk to Data"
                          : "InfluIndex"}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </>
            )}
          </nav>

          <div className="space-y-1.5 mt-auto pt-3 border-t border-gray-200 flex-shrink-0">
            {isExpanded ? (
              <button
                onClick={onToggleExpanded}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              >
                <PanelLeftClose className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs font-medium">Collapse</span>
              </button>
            ) : (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={onToggleExpanded}
                    className="w-full h-10 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-gray-800 text-white text-xs"
                >
                  Expand
                </TooltipContent>
              </Tooltip>
            )}

            {isExpanded ? (
              <button
                onClick={() => onNavigate("settings")}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeView === "settings"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span className="text-xs font-medium">Settings</span>
              </button>
            ) : (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onNavigate("settings")}
                    className={`w-full h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      activeView === "settings"
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-gray-800 text-white text-xs"
                >
                  Settings
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {isPending && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse"></div>
          )}
        </div>
      </aside>
    );
  },
);

SidebarNavigation.displayName = "SidebarNavigation";

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "inbox"
    | "Automation"
    | "settings"
    | "talktodata"
    | "analyticsbot"
    | "Contacts"
    | "influencerbot"
  >("inbox");

  const currentAgentUsername = useMemo(() => {
    return (
      user?.username ||
      user?.primaryEmailAddress?.emailAddress ||
      user?.id ||
      "unknown_agent"
    );
  }, [user]);

  const [selectedConversationId, setSelectedConversationId] =
    useState<string>("");
  const [sharedProduct, setSharedProduct] = useState<Product | null>(null);
  const [isConversationListVisible, setIsConversationListVisible] =
    useState(true);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const { conversations, updateConversation } = useConversations();

  const conversation = useMemo(() => {
    if (!selectedConversationId) return undefined;

    const conv = conversations.find((c) => c.id === selectedConversationId);
    if (!conv) return undefined;

    return conv;
  }, [conversations, selectedConversationId]);

  const handleConversationSelect = useCallback((id: string) => {
    startTransition(() => {
      setSelectedConversationId(id);
    });
  }, []);

  const handleNavigation = useCallback((value: string) => {
    startTransition(() => {
      if (value !== "inbox") {
        setSelectedConversationId("");
      }
      setActiveView(value as typeof activeView);
    });
  }, []);

  const handleToggleNavExpanded = useCallback(() => {
    setIsNavExpanded((prev) => !prev);
  }, []);

  const handleClearSharedProduct = useCallback(() => {
    setSharedProduct(null);
  }, []);

  const handleShareProduct = useCallback((product: Product | null) => {
    setSharedProduct(product);
  }, []);

  const handleToggleRightSidebar = useCallback(() => {
    setIsRightSidebarVisible((prev) => !prev);
  }, []);

  const handleToggleConversationList = useCallback(() => {
    setIsConversationListVisible((prev) => !prev);
  }, []);

  const handleShowConversationList = useCallback(() => {
    setIsConversationListVisible(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 skeleton rounded-full mx-auto"></div>
          <div className="h-4 w-32 skeleton rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <style jsx global>{`
        .skeleton {
          background: linear-gradient(
            90deg,
            #f0f0f0 0%,
            #e0e0e0 50%,
            #f0f0f0 100%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>

      <div
        className="h-screen bg-white flex overflow-hidden min-w-0 min-h-0"
        suppressHydrationWarning
      >
        <SidebarNavigation
          activeView={activeView}
          isConversationListVisible={isConversationListVisible}
          isExpanded={isNavExpanded}
          onShowConversationList={handleShowConversationList}
          onNavigate={handleNavigation}
          onToggleExpanded={handleToggleNavExpanded}
          isPending={isPending}
        />

        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <div className="flex-1 h-full overflow-hidden relative min-h-0">
            {activeView === "dashboard" && (
              <div className="h-full w-full bg-gray-50/50 overflow-hidden min-h-0 min-w-0">
                <LandingDashboard />
              </div>
            )}

            {activeView === "inbox" && (
              <div className="flex h-full bg-white min-w-0 min-h-0">
                {isConversationListVisible && (
                  <section className="w-64 lg:w-72 xl:w-80 flex-shrink-0 border-r border-gray-200">
                    <ConversationList
                      selectedConversationId={selectedConversationId}
                      onConversationSelect={handleConversationSelect}
                      isVisible={isConversationListVisible}
                      onToggleVisibility={handleToggleConversationList}
                    />
                  </section>
                )}

                <section className="flex-1 min-w-0 h-full border-r border-gray-200 min-h-0">
                  {conversation ? (
                    <ChatView
                      selectedConversationId={selectedConversationId}
                      conversation={conversation}
                      sharedProduct={sharedProduct}
                      onClearSharedProduct={handleClearSharedProduct}
                      isRightSidebarVisible={isRightSidebarVisible}
                      onOpenRightSidebar={handleToggleRightSidebar}
                      onConversationUpdate={updateConversation}
                    />
                  ) : (
                    <>
                      <LandingDashboard />
                    </>
                  )}
                </section>

                {isRightSidebarVisible && (
                  <aside className="relative w-[260px] xl:w-[300px] flex-shrink-0">
                    {selectedConversationId ? (
                      <Sidebar
                        selectedConversationId={selectedConversationId}
                        conversation={conversation}
                        onConversationSelect={handleConversationSelect}
                        onShareProduct={handleShareProduct}
                        onToggleVisibility={handleToggleRightSidebar}
                        currentAgentUsername={currentAgentUsername}
                      />
                    ) : (
                      <ReminderSidebar
                        onToggleVisibility={handleToggleRightSidebar}
                      />
                    )}
                  </aside>
                )}
              </div>
            )}

            {activeView === "Contacts" && (
              <div className="h-full w-full bg-gray-50/50 overflow-hidden min-h-0 min-w-0">
                <ContactsDashboard />
              </div>
            )}

            {activeView === "talktodata" && (
              <div className="h-full w-full bg-gray-50/50 overflow-hidden min-h-0 min-w-0">
                <TalkToDataTab />
              </div>
            )}

            {activeView === "analyticsbot" && (
              <div className="h-full w-full bg-gray-50/50 overflow-hidden min-h-0 min-w-0">
                <AnalyticsBot />
              </div>
            )}

            {activeView === "influencerbot" && (
              <div className="h-full w-full bg-gray-50/50 overflow-hidden min-h-0 min-w-0">
                <InfluencerBot />
              </div>
            )}

            {activeView === "settings" && <SettingsSidebar />}

            {activeView === "Automation" && (
              <div className="h-full w-full min-h-0 min-w-0">
                <AutomationHub />
              </div>
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
