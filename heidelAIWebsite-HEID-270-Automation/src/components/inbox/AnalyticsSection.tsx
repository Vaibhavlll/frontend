import React, { useEffect, useState, useMemo } from "react";
import {
  Clock,
  TrendingUp,
  UserCircle,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  User,
} from "lucide-react";
import AnalyticsCard from "./AnalyticsCard";
import { useApi } from "@/lib/session_api";
import AssignDropdown from "./AssignToAgent";

interface AnalyticsSectionProps {
  selectedConversationId: string | null;
  currentAgentUsername: string;
}

interface AssignedAgent {
  id: string;
  username: string;
  role?: string;
  assigned_at?: string;
}

interface AssignmentHistoryEntry {
  id: string;
  username: string;
  role?: string;
  assigned_at: string;
  assigned_until?: string;
  assigned_by?: string;
}

interface AssignmentData {
  assigned_agent: AssignedAgent | null;
  assignment_history: AssignmentHistoryEntry[];
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  selectedConversationId,
  currentAgentUsername,
}) => {
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendReturnsNull, setBackendReturnsNull] = useState(false);
  const api = useApi();

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!selectedConversationId || !currentAgentUsername) {
        setAssignment(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setBackendReturnsNull(false);

        const res = await api.get(
          `/api/conversations/${selectedConversationId}`,
          { params: { agent_username: currentAgentUsername } },
        );

        const assignmentBlock = res.data;

        if (assignmentBlock === null || assignmentBlock === undefined) {
          setBackendReturnsNull(true);
          setAssignment(null);
          return;
        }

        setAssignment({
          assigned_agent: assignmentBlock?.assigned_agent || null,
          assignment_history: Array.isArray(assignmentBlock?.assignment_history)
            ? assignmentBlock.assignment_history
            : [],
        });
      } catch (err) {
        setError("Failed to load analytics");
        setAssignment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [selectedConversationId, currentAgentUsername]);

  const currentAgentLabel = useMemo(() => {
    if (!assignment?.assigned_agent) return "Unassigned";
    const a = assignment.assigned_agent;
    return `${a.username}${a.role ? ` (${a.role})` : ""}`;
  }, [assignment]);

  const assignedAt = useMemo(() => {
    if (!assignment?.assigned_agent?.assigned_at) return null;
    return new Date(assignment.assigned_agent.assigned_at).toLocaleString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }, [assignment]);

  const historyEntries = useMemo(() => {
    if (
      !assignment ||
      !Array.isArray(assignment.assignment_history) ||
      !assignment.assignment_history.length
    ) {
      return [];
    }

    const sorted = [...assignment.assignment_history].sort(
      (a, b) =>
        new Date(a.assigned_at).getTime() - new Date(b.assigned_at).getTime(),
    );

    const entries: Array<{
      from: string;
      to: string;
      when: string;
      by: string | null;
    }> = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i];
      const to = sorted[i + 1];

      const fromLabel = `${from.username}${from.role ? ` (${from.role})` : ""}`;
      const toLabel = `${to.username}${to.role ? ` (${to.role})` : ""}`;
      const when = new Date(to.assigned_at).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      entries.push({
        from: fromLabel,
        to: toLabel,
        when,
        by: to.assigned_by || null,
      });
    }
    return entries;
  }, [assignment]);

  // Empty state
  if (!selectedConversationId) {
    return (
      <div className="space-y-[var(--sidebar-gap)] px-[var(--sidebar-padding)] py-[var(--sidebar-padding)]">
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 w-16 h-16 shadow-sm">
            <MessageSquare className="text-gray-400 h-7 w-7" />
          </div>
          <p className="font-sans text-xs font-medium text-gray-900 mb-1">
            No Conversation Selected
          </p>
          <p className="font-sans text-xs text-gray-500 leading-relaxed">
            Select a conversation to view assignment analytics
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-[var(--sidebar-gap)] px-[var(--sidebar-padding)] py-[var(--sidebar-padding)]">
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="font-sans text-xs font-medium text-gray-600">
              Loading analytics…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Backend null state
  if (backendReturnsNull) {
    return (
      <div className="space-y-[var(--sidebar-gap)] px-[var(--sidebar-padding)] py-[var(--sidebar-padding)]">
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3 w-16 h-16 shadow-sm">
            <AlertCircle className="text-orange-500 h-7 w-7" />
          </div>
          <p className="font-sans text-xs font-medium text-gray-900 mb-1">
            No Assignment Data
          </p>
          <p className="font-sans text-xs text-gray-600 leading-relaxed px-4">
            This conversation may not have an assigned agent yet
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !assignment) {
    return (
      <div className="space-y-[var(--sidebar-gap)] px-[var(--sidebar-padding)] py-[var(--sidebar-padding)]">
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3 w-16 h-16 shadow-sm">
            <AlertCircle className="text-red-500 h-7 w-7" />
          </div>
          <p className="font-sans text-xs font-medium text-gray-900 mb-1">
            Analytics Unavailable
          </p>
          <p className="font-sans text-xs text-gray-600 leading-relaxed px-4">
            Unable to load analytics data for this conversation
          </p>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-3 px-[var(--sidebar-padding)] py-[var(--sidebar-padding)]">
      <div className="space-y-3">
        <div className="group">
          <AssignDropdown />
        </div>
      </div>
      {/* Analytics Cards */}
      <div className="space-y-2">
        <AnalyticsCard
          icon={UserCircle}
          title="Assigned Agent"
          subtitle="Current owner"
          value={currentAgentLabel}
          color="blue"
        />

        <AnalyticsCard
          icon={TrendingUp}
          title="Transfers"
          subtitle="Total reassignments"
          value={`${Math.max(historyEntries.length, 0)}`}
          color="green"
        />

        <AnalyticsCard
          icon={Clock}
          title="Last Transfer"
          subtitle="Most recent change"
          value={
            historyEntries.length
              ? `${historyEntries[historyEntries.length - 1].to}`
              : "No transfer history"
          }
          color="purple"
        />
      </div>

      {/* Current Assignment Info */}
      {assignment.assigned_agent && (
        <div
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm"
          style={{ padding: "10px 12px" }}
        >
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <span className="font-sans text-[10px] font-medium text-white">
                  {assignment.assigned_agent.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-xs font-medium text-gray-900 mb-0.5">
                {currentAgentLabel}
              </p>
              {assignedAt && (
                <p className="font-sans text-[11px] text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Assigned on {assignedAt}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer History */}
      {historyEntries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-sans text-xs font-medium text-gray-900">
              Transfer History
            </h4>
            <span className="font-sans text-[11px] text-gray-500">
              {historyEntries.length} transfer
              {historyEntries.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-2">
            {historyEntries
              .slice()
              .reverse()
              .map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-2.5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-xs text-gray-700">
                      {entry.from}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="font-sans text-xs text-blue-600">
                      {entry.to}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.when}
                    </span>
                    {entry.by && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        by {entry.by}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* No history state */}
      {historyEntries.length === 0 && assignment.assigned_agent && (
        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
          <p className="font-sans text-xs font-medium text-gray-600">
            No transfer history yet
          </p>
          <p className="font-sans text-[11px] text-gray-500 mt-1">
            This is the first assignment
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;
