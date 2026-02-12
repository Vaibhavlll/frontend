"use client";
import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X } from "lucide-react";
import ConversationPreview from "./ConversationPreview";
import { useConversations } from "../hooks/useConversations";
import { Conversation } from '@/components/types/conversation';
import { FilterMenu, FilterOptions } from './FilterMenu';
import { format, isToday, isYesterday, subDays, startOfDay, parseISO } from 'date-fns';
import { MessagesSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/inbox_button";

interface ConversationListProps {
  selectedConversationId?: string;
  onConversationSelect?: (id: string) => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

type TabValue = 'all' | 'open' | 'closed';

const SkeletonConversationItem = memo(() => (
  <div className="border-b border-gray-100/60 bg-white/80 p-2">
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-gray-200/80 rounded-xl flex-shrink-0 skeleton" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-3 bg-gray-200/80 rounded w-3/4 skeleton" />
        <div className="h-2.5 bg-gray-100/80 rounded w-full skeleton" />
      </div>
      <div className="text-right flex-shrink-0 space-y-1.5">
        <div className="h-2.5 bg-gray-100/80 rounded w-10 skeleton" />
        <div className="w-4 h-4 bg-blue-200/80 rounded-full skeleton ml-auto" />
      </div>
    </div>
  </div>
));
SkeletonConversationItem.displayName = "SkeletonConversationItem";

const SKELETON_ITEMS = Array.from({ length: 12 }, (_, i) => i);

const OptimisticSkeletonLayout = memo(() => (
  <div>
    {SKELETON_ITEMS.map((i) => (
      <SkeletonConversationItem key={i} />
    ))}
  </div>
));
OptimisticSkeletonLayout.displayName = "OptimisticSkeletonLayout";

const ConversationItem = memo(({ 
  conversation, 
  isSelected,
  onSelect,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onSelect(conversation.id);
  }, [conversation.id, onSelect]);

  const formattedTime = useMemo(() => {
    if (!conversation.timestamp) return "";
    try {
      const ISOdate = parseISO(conversation.timestamp);
      const date = new Date(ISOdate.getTime() + 5.5 * 60 * 60 * 1000);
      if (isToday(date)) {
        return format(date, "h:mm a");
      }    
      else if (isYesterday(date)) {
        return "Yesterday";
      } 
      else if (date >= subDays(startOfDay(new Date()), 7)) {
        return format(date, "EEE h:mm a");
      } else {
        return format(date, "MMM d");
      }
    } catch {
      return "";
    }
  }, [conversation.timestamp]);

  const lastMessage = useMemo(() => 
    conversation.last_message.includes("know_more_request_from_sender") 
      ? "Know more." 
      : conversation.last_message,
    [conversation.last_message]
  );

  return (
    <div 
      className={`border-b border-gray-100/60 hover:bg-gray-100/80 cursor-pointer ${
        isSelected ? 'bg-blue-50/80' : 'bg-white/80'
      }`}
      onClick={handleClick}
    >
      <ConversationPreview
        id={conversation.id}
        channelType={conversation.platform as "telegram" | "whatsapp" | "instagram" | "web"}
        customerName={conversation.customer_name}
        lastMessage={lastMessage}
        lastMessageIsPrivateNote={conversation.last_message_is_private_note}
        timestamp={formattedTime}
        unreadCount={conversation.unread_count}
        avatarUrl={conversation.avatar_url}
        isAiEnabled={conversation.is_ai_enabled}
        assignedAgentId={conversation.assigned_agent_id}
        isSelected={isSelected}
        onClick={handleClick}
        priority={conversation.priority}
        sentiment={conversation.sentiment}
      />
    </div>
  );
}, (prev, next) => {
  return (
    prev.conversation.id === next.conversation.id &&
    prev.isSelected === next.isSelected &&
    prev.conversation.last_message === next.conversation.last_message &&
    prev.conversation.unread_count === next.conversation.unread_count &&
    prev.conversation.timestamp === next.conversation.timestamp
  );
});
ConversationItem.displayName = "ConversationItem";



const ConversationList = ({
  selectedConversationId,
  onConversationSelect,
  isVisible = true,
  onToggleVisibility,
}: ConversationListProps) => {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const {conversations, loading, error, markAsRead } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    platform: [],
    priority: [],
    sentiment: [],
    unreadOnly: false,  
    hasQuery: false,
  });

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue);
  }, []);

  const tabFiltered = useMemo(()=>{
    switch(activeTab){
      case 'open':
        return conversations.filter(c=> c.status === 'open' || c.status === 'follow-up');
      case 'closed':
        return conversations.filter(c=> c.status === 'closed');
      default:
        return conversations;
    }
  }, [conversations, activeTab]);

  const filteredConversations = useMemo(() => {
    if (!conversations.length) return [];

    let filtered = tabFiltered;
    
    const hasFilters = filters.unreadOnly || filters.hasQuery || 
                       filters.platform.length || filters.priority.length || 
                       filters.sentiment.length || searchQuery;

    if (!hasFilters && activeTab === 'all') {
      return [...filtered].sort((a, b) => 
        (b.timestamp || "").localeCompare(a.timestamp || "")
      );
    }

   
    if (filters.unreadOnly) {
      filtered = filtered.filter(c => c.unread_count > 0);
    }

    if (filters.hasQuery) {
      filtered = filtered.filter(c => c.query);
      
    }

    if (filters.platform.length) {
      const platformSet = new Set(filters.platform);
      filtered = filtered.filter(c => platformSet.has(c.platform));
    }

    if (filters.priority.length) {
      const prioritySet = new Set(filters.priority);
      filtered = filtered.filter(c => prioritySet.has(c.priority));
    }

    if (filters.sentiment.length) {
      const sentimentSet = new Set(filters.sentiment);
      filtered = filtered.filter(c => sentimentSet.has(c.sentiment));
    }

    

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.customer_name.toLowerCase().includes(query) ||
        c.last_message.toLowerCase().includes(query) ||
        c.id?.includes(query)
      );
    }

    return [...filtered].sort((a, b) => 
      (b.timestamp || "").localeCompare(a.timestamp || "")
    );
  }, [conversations, filters, searchQuery, activeTab]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const handleConversationSelect = useCallback((id: string) => {
    markAsRead(id);
    onConversationSelect?.(id);
  }, [onConversationSelect, markAsRead]);

  const showSkeleton = loading && conversations.length === 0;


  return (
    <div className="w-full h-full max-h-screen bg-white/95 flex flex-col overflow-hidden border-r border-gray-200/60">
      <style jsx>{`
        .ios-scrollbar::-webkit-scrollbar { width: 3px; }
        .ios-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .ios-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(0,0,0,0.1); 
          border-radius: 8px; 
        }
        .skeleton {
          animation: shimmer 1.5s infinite;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          background-size: 200% 100%;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div className="px-3 py-2.5 bg-white/40 border-b border-gray-100/60 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 z-10 pointer-events-none" />
            <Input
              placeholder="Search conversations..."
              className="h-9 pl-9 pr-9 bg-gray-100/80 border-0 rounded-xl text-sm placeholder-gray-500 focus:bg-white/80 focus:ring-1 focus:ring-blue-500/30"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 p-0 hover:bg-gray-200/80 rounded-lg"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {onToggleVisibility && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleVisibility}
              className="h-9 w-9 rounded-xl hover:bg-gray-100/60 hidden lg:flex flex-shrink-0 bg-white/40"
              title="Hide conversation list"
            >
              <X className="h-3.5 w-3.5 text-gray-600" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2.5">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 min-w-0">
            <TabsList className="bg-gray-100/80 rounded-xl p-0.5 h-auto w-full">
              <TabsTrigger 
                value="all" 
                className="flex-1 text-xs rounded-xl font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 px-3 py-1.5"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="open" 
                className="flex-1 text-xs rounded-xl font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 px-3 py-1.5"
              >
                Open
              </TabsTrigger>
              <TabsTrigger 
                value="closed" 
                className="flex-1 text-xs rounded-xl font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 px-3 py-1.5"
              >
                Closed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex-shrink-0">
            <FilterMenu filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto ios-scrollbar">
        {showSkeleton ? (
          <OptimisticSkeletonLayout />
        ) : error ? ( 
          <div className="flex items-center justify-center p-8 h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100/80 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
              <p className="text-sm text-gray-600">Error loading conversations: {error.message}</p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center p-8 h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100/80 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <MessagesSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations</h3>
              <p className="text-sm text-gray-600 max-w-xs">
                {activeTab === "open"
                  ? "No open conversations found"
                  : activeTab === "closed"
                  ? "No closed conversations found"
                  : "No conversations found"}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onSelect={handleConversationSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ConversationList, (prevProps, nextProps) => {
  return (
    prevProps.selectedConversationId === nextProps.selectedConversationId &&
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.onConversationSelect === nextProps.onConversationSelect &&
    prevProps.onToggleVisibility === nextProps.onToggleVisibility
  );
});
