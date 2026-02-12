import React from "react";
import {
  Search,
  Settings,
  BellRing,
  MessageCircle,
  Instagram,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ActiveView = 
  | "inbox"
  | "billing"
  | "settings"
  | "talktodata"
  | "analyticsbot"
  | "Contacts"
  | "influencerbot";

interface TopNavigationProps {
  selectedChannels?: string[];
  unreadCount?: number;
  onChannelSelect?: (channel: string) => void;
  onSearch?: (query: string) => void;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  activeView: ActiveView;
}

const TopNavigation = ({
  selectedChannels = ["all"],
  unreadCount = 5,
  onChannelSelect = () => {},
  onSearch = () => {},
  onSettingsClick = () => {},
  onNotificationsClick = () => {},
  activeView,
}: TopNavigationProps) => {
  const channels = [
    {
      id: "telegram",
      label: "Telegram",
      icon: MessageCircle,
      color: "text-blue-500",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      color: "text-green-500",
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: Instagram,
      color: "text-purple-500",
    },
    { id: "web", label: "Web Chat", icon: Globe, color: "text-gray-500" },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200">
      {/* Desktop Navigation - Only shows for inbox view */}
      {activeView === "inbox" && (
        <div className="flex items-center justify-between px-6 py-4">
          {/* Channel filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <Button
                    key={channel.id}
                    variant={
                      selectedChannels.includes(channel.id) ? "default" : "outline"
                    }
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={() => onChannelSelect(channel.id)}
                  >
                    <Icon className={`h-4 w-4 ${
                      selectedChannels.includes(channel.id) 
                        ? "text-white" 
                        : channel.color
                    }`} />
                    {channel.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-gray-50 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button
              variant="outline"
              size="icon"
              onClick={onNotificationsClick}
              className="relative rounded-2xl border-gray-200 hover:bg-gray-50"
            >
              <BellRing className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-2xl border-gray-200 hover:bg-gray-50"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-xl">
                <DropdownMenuItem className="rounded-xl">AI Settings</DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl">Preferences</DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl">Help & Support</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavigation;
