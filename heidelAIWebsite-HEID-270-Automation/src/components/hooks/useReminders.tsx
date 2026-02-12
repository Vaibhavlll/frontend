import { useApi } from "@/lib/session_api";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Reminder {
  id: string;
  conversation_id: string;
  title: string;
  notes: string;
  trigger_time: string;
  status: "OVERDUE" | "SNOOZED" | "DONE" | "PENDING" | "DELETED";
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


const getSnoozeUntil = (minutes: number) =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();

export const useReminders = (conversationId?: string) => {
  const queryClient = useQueryClient();
  const api = useApi();

  const remindersQuery = useQuery<Reminder[], Error>({
    queryKey: conversationId
      ? ["Conversation_reminders", conversationId]
      : ["reminders"],

    queryFn: async () => {
      const Url = conversationId
        ? `https://heidelai-2.koyeb.app/reminders/conversation/${conversationId}`
        : `https://heidelai-2.koyeb.app/reminders`;

      const res = await api.get(Url);
      if ("reminders" in res.data) {
        return res.data.reminders as Reminder[];
      }

      return res.data;

    },
  })

  const doneMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      return api.post(`https://heidelai-2.koyeb.app/reminders/${reminderId}/done`);

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    }
  })

  const snoozeMutation = useMutation({
    mutationFn: async ({ reminderId, snoozeUntil }: { reminderId: string, snoozeUntil: number }) => {
      return api.post(`https://heidelai-2.koyeb.app/reminders/${reminderId}/snooze`, {
        snooze_until: getSnoozeUntil(snoozeUntil),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      return api.post(`https://heidelai-2.koyeb.app/reminders/${reminderId}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    }
  })

  return {

    reminders: remindersQuery.data ?? [],
    loading: remindersQuery.isLoading,
    error: remindersQuery.error,

    snoozeReminder: snoozeMutation.mutate,
    doneReminder: doneMutation.mutate,
    deleteReminder: deleteMutation.mutate,

    snoozing: snoozeMutation.isPending,
    completing: doneMutation.isPending,
    deleting: deleteMutation.isPending,

    refetch: remindersQuery.refetch,
  }
};