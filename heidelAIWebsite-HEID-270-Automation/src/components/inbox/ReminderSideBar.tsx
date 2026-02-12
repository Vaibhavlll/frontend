import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useState } from 'react';
import { Clock, Calendar, Bell, AlertCircle, X, Check } from 'lucide-react';
import { useConversations } from '../hooks/useConversations';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useApi } from "@/lib/session_api";
import {
  useQuery,
  useMutation,
  QueryClient,
  useQueryClient,
} from '@tanstack/react-query'
import { useReminders } from "../hooks/useReminders";
import { Button } from '@/components/ui/button';
import { format } from "date-fns";

interface remindersideBarProps {
  onToggleVisibility?: () => void;
}

interface Reminder {
  id: string;
  conversation_id: string;
  title: string;
  notes: string;
  trigger_time: string;
  status: "OVERDUE" | "SNOOZED" | "DONE" | "DELETED" | "PENDING";
  snooze_count: number;
  last_triggered_at: string;
  created_at: string;
  updated_at: string;
  recipient_email: string;
}


interface ApiResponse {
  reminders: Reminder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const parseBackendDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Trim microseconds: .267000 -> .267
  let cleaned = dateStr.replace(/\.(\d{3})\d+/, ".$1");

  // Backend sends no timezone → force UTC to avoid NaN
  if (!cleaned.endsWith("Z") && !cleaned.includes("+")) {
    cleaned = cleaned + "Z";
  }

  const date = new Date(cleaned);
  return isNaN(date.getTime()) ? null : date;
};

const formatReminderDate = (dateStr: string): string => {
  const date = parseBackendDate(dateStr);
  if (!date) return "Invalid date";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};


const ReminderSideBar = ({ onToggleVisibility }: remindersideBarProps) => {
  const { conversations } = useConversations();
  const { reminders, loading, error, snoozeReminder, doneReminder, deleteReminder, snoozing, completing, deleting, refetch } = useReminders();
  const api = useApi();
  const getCustomerName = (conversationId: string): string => {
    const conversation = conversations.find((conv) => conv.id === conversationId);
    return conversation?.customer_name || 'Unknown Customer';
  };

  const getPriorityBadge = (dateTime: string) => {
    const reminderDate = new Date(dateTime);
    const now = new Date();
    const diffHours = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 24) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-600">
          High
        </Badge>
      );
    } else if (diffHours <= 72) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-600">
          Medium
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-100 text-green-600">
        Low
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <Card className="h-full max-h-screen bg-white/95 ios-backdrop border-l border-gray-200/60 overflow-hidden flex flex-col relative">
        <style>
          {`
            .ios-backdrop {
              backdrop-filter: blur(20px) saturate(180%);
              -webkit-backdrop-filter: blur(20px) saturate(180%);
            }
          `}
        </style>

        {/* Close Button - Same as Sidebar */}
        {onToggleVisibility && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleVisibility}
                className="
                  absolute -right-[-9] top-2 z-20 h-8 w-8 
                  bg-white/90 ios-backdrop rounded-2xl 
                  transition-all duration-200 hover:scale-110
                  flex items-center justify-center
                "
                aria-label="Hide details sidebar"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-gray-900/90 ios-backdrop text-white rounded-xl text-xs">
              Hide sidebar
            </TooltipContent>
          </Tooltip>
        )}

        {/* Header */}
        <div className="flex items-center p-3 bg-white/40 ios-backdrop border-b border-gray-100/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="text-blue-600" size={18} />
            <h1 className="text-base font-semibold text-gray-900">Reminders</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 space-y-3 ios-scrollbar">
          <style>
            {`
              .ios-scrollbar::-webkit-scrollbar {
                width: 3px;
              }

              .ios-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }

              .ios-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(0,0,0,0.1);
                border-radius: 8px;
                transition: all 0.3s ease;
              }

              .ios-scrollbar:hover::-webkit-scrollbar-thumb {
                background: rgba(0,0,0,0.2);
              }
            `}
          </style>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 bg-blue-100/80 rounded-xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border border-blue-600 border-t-transparent"></div>
                </div>
                <p className="text-sm text-gray-600">Loading reminders...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-4 bg-red-50/80 ios-backdrop rounded-lg border border-red-200/60">
              <AlertCircle className="text-red-500 mr-2" size={18} />
            </div>
          ) : (reminders?.filter((reminder) => reminder.status !== "DELETED").length ?? 0) > 0 ? (
            reminders
              ?.filter((reminder) => reminder.status !== "DELETED")
              .map((reminder) => (
                <Card
                  key={reminder.id}
                  className="group transition-all hover:shadow-md bg-white/80 ios-backdrop border border-gray-100/60"
                >
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      {/* LEFT: Title + Customer */}
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold text-gray-900 truncate">
                          {reminder.title}
                        </CardTitle>

                        <CardDescription className="flex items-center gap-1 text-xs text-gray-500">
                          Customer: {getCustomerName(reminder.conversation_id)}
                        </CardDescription>
                      </div>

                      {/* RIGHT: Badges (fixed position) */}
                      <div className="flex items-center gap-1 shrink-0">
                        {getPriorityBadge(reminder.trigger_time)}

                        <Badge
                          variant="outline"
                          className={
                            reminder.status === "DONE"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          }
                        >
                          {reminder.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>


                  <CardContent className="px-3 pb-2">
                    <p className="text-xs text-gray-600 leading-relaxed">{reminder.notes}</p>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between gap-2 px-3 py-2 border-t border-gray-100/60 overflow-hidden">
                    <div className="flex items-center text-xs font-medium text-gray-500 whitespace-nowrap shrink-0">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatReminderDate(reminder.trigger_time)}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-yellow-600 hover:text-yellow-600 hover:bg-red-50"
                            onClick={() =>
                              snoozeReminder({ reminderId: reminder.id, snoozeUntil: 30 })
                            }
                            disabled={reminder.status === 'DONE' || snoozing}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent className="bg-gray-900/90 ios-backdrop text-white rounded-xl text-xs">
                          {reminder.status === 'SNOOZED' ? 'Resnooze for 30 minutes' : 'Snooze for 30 minutes'}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => doneReminder(reminder.id)}
                            disabled={reminder.status === 'DONE' || completing}
                          >

                            <Check className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent className="bg-gray-900/90 ios-backdrop text-white rounded-xl text-xs">
                          Mark as Done
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteReminder(reminder.id)}
                            disabled={deleting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900/90 ios-backdrop text-white rounded-xl text-xs">
                          Delete Reminder
                        </TooltipContent>
                      </Tooltip>
                    </div>

                  </CardFooter>
                </Card>
              ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100/80 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">No reminders</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                You don&apos;t have any active reminders at the moment.
              </p>
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default ReminderSideBar;
