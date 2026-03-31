/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Copy,
  Calendar,
  Clock,
  Zap,
  Users,
  Archive,
  Loader2,
} from "lucide-react";
import { useApi } from "@/lib/session_api";
import { toast } from "sonner";
import { isWaBotFlow } from "./AutomationHub";

interface AutomationFlow {
  _id?: string;
  flow_id: string;
  name: string;
  // "active" is the DB value WaBotEditor publishes; shown as "Live"
  status: "draft" | "published" | "active" | "archived";
  description?: string;
  trigger_count?: number;
  last_run?: string;
  created_at?: string;
  updated_at?: string;
  flow_data?: any;
  // Flat WaBot fields (wa_bot_flows collection)
  flow_type?: string;
  trigger_type?: string;
  trigger_event?: string;
  welcome_message?: any;
}

interface DashboardViewProps {
  onCreateNew: () => void;
  // flowData is the full raw document so AutomationHub can detect the correct editor
  onEditFlow: (flowId: string, flowName: string, flowData?: any) => void;
}

export default function DashboardView({ onCreateNew, onEditFlow }: DashboardViewProps) {
  const api = useApi();
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "archived">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<AutomationFlow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Route to correct API collection ────────────────────────────────────────
  const apiBase = (flow: AutomationFlow) =>
    isWaBotFlow(flow) ? "/api/wa_bot_flows" : "/api/automation_flows";

  // ── Normalize raw API document ──────────────────────────────────────────
  const normalizeFlow = (flow: any): AutomationFlow => {
    const created_at = flow.created_at || flow.createdAt || undefined;
    const updated_at = flow.updated_at || flow.updatedAt || created_at || undefined;
    return {
      ...flow,
      created_at,
      updated_at,
      last_run: flow.last_run || flow.lastRun || undefined,
    };
  };

  // ── Fetch BOTH automation_flows and wa_bot_flows, merge them ────────────
  const fetchFlows = useCallback(async () => {
    setLoading(true);
    try {
      const [editorRes, wabotRes] = await Promise.allSettled([
        api.get("/api/automation_flows"),
        api.get("/api/wa_bot_flows"),
      ]);

      let editorFlows: any[] = [];
      let wabotFlows: any[] = [];

      if (editorRes.status === "fulfilled") {
        const d = editorRes.value.data;
        if (Array.isArray(d))             editorFlows = d;
        else if (Array.isArray(d?.flows)) editorFlows = d.flows;
        else if (Array.isArray(d?.data))  editorFlows = d.data;
      }

      if (wabotRes.status === "fulfilled") {
        const d = wabotRes.value.data;
        if (Array.isArray(d))             wabotFlows = d;
        else if (Array.isArray(d?.flows)) wabotFlows = d.flows;
        else if (Array.isArray(d?.data))  wabotFlows = d.data;
      }

      const merged = [...editorFlows, ...wabotFlows]
        .map(normalizeFlow)
        .sort((a, b) => {
          const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        });

      setFlows(merged);
    } catch (error) {
      console.error("Failed to fetch flows:", error);
      toast.error("Failed to load automations");
      setFlows([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchFlows(); }, [fetchFlows]);

  // ── DELETE ──────────────────────────────────────────────────────────────
  const handleDeleteClick = (flow: AutomationFlow) => {
    setFlowToDelete(flow);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!flowToDelete) return;
    const flowId = flowToDelete.flow_id;
    if (!flowId) { toast.error("Invalid flow ID"); setIsDeleting(false); return; }

    setIsDeleting(true);
    try {
      const base = apiBase(flowToDelete);
      const response = await api.delete(`${base}/${flowId}`);
      if (response.status === 200 || response.status === 204) {
        setFlows((prev) => prev.filter((f) => f.flow_id !== flowId));
        toast.success("Flow deleted successfully", { description: `"${flowToDelete.name}" has been removed.` });
        setShowDeleteModal(false);
        setFlowToDelete(null);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; detail?: string }; status?: number } };
      let msg = "Failed to delete flow";
      if (err.response?.data?.detail)        msg = err.response.data.detail;
      else if (err.response?.data?.message)  msg = err.response.data.message;
      else if (err.response?.status === 404) msg = "Flow not found. It may have already been deleted.";
      else if (err.response?.status === 403) msg = "You do not have permission to delete this flow";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => { setShowDeleteModal(false); setFlowToDelete(null); };

  // ── UNPUBLISH ────────────────────────────────────────────────────────────
  const handleUnpublish = async (flow: AutomationFlow) => {
    const flowId = flow.flow_id;
    if (!flowId) { toast.error("Invalid flow ID"); return; }
    try {
      const base = apiBase(flow);
      const response = await api.post(`${base}/${flowId}/unpublish`);
      if (response.status === 200) {
        toast.success("Flow unpublished successfully", { description: `"${flow.name}" is now in draft mode.` });
        await fetchFlows();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; detail?: string }; status?: number } };
      let msg = "Failed to unpublish flow";
      if (err.response?.data?.detail)        msg = err.response.data.detail;
      else if (err.response?.data?.message)  msg = err.response.data.message;
      else if (err.response?.status === 404) msg = "Flow not found";
      else if (err.response?.status === 400) msg = "Flow is already in draft mode";
      toast.error(msg);
    }
  };

  // ── DUPLICATE ────────────────────────────────────────────────────────────
  const handleDuplicate = async (flow: AutomationFlow) => {
    const flowId = flow.flow_id;
    if (!flowId) { toast.error("Invalid flow ID"); return; }
    try {
      const base = apiBase(flow);
      const response = await api.get(`${base}/${flowId}`);
      const flowData = response.data?.flow || response.data;
      // Strip identity fields so backend treats this as a new document
      const { _id, flow_id, created_at, updated_at, published_at, ...rest } = flowData;
      const duplicateData = { ...rest, name: `${flow.name} (Copy)`, status: "draft" };
      const createResponse = await api.post(base, duplicateData);
      if (createResponse.status === 201 || createResponse.status === 200) {
        toast.success("Flow duplicated successfully");
        await fetchFlows();
      }
    } catch (error) {
      console.error("Duplicate failed:", error);
      toast.error("Failed to duplicate flow");
    }
  };

  // ── ARCHIVE ──────────────────────────────────────────────────────────────
  const handleArchive = async (flow: AutomationFlow) => {
    const flowId = flow.flow_id;
    if (!flowId) { toast.error("Invalid flow ID"); return; }
    try {
      const base = apiBase(flow);
      const response = await api.patch(`${base}/${flowId}`, { status: "archived" });
      if (response.status === 200) {
        toast.success("Flow archived successfully");
        await fetchFlows();
      }
    } catch (error) {
      console.error("Archive failed:", error);
      toast.error("Failed to archive flow");
    }
  };

  // ── FILTER & STATS ───────────────────────────────────────────────────────
  const isLive = (s: string) => s === "published" || s === "active";

  const filteredFlows = flows.filter((flow) => {
    const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      flow.status === filterStatus ||
      (filterStatus === "published" && isLive(flow.status));
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total:    flows.length,
    live:     flows.filter((f) => isLive(f.status)).length,
    draft:    flows.filter((f) => f.status === "draft").length,
    archived: flows.filter((f) => f.status === "archived").length,
  };

  useEffect(() => {
    if (!showFilterDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setShowFilterDropdown(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowFilterDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showFilterDropdown]);

  return (
    <div className="h-full w-full flex flex-col bg-white font-sans">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/60 px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Automations</h1>
            <p className="text-[13px] text-slate-600">Manage and monitor your automation workflows</p>
          </div>
          <button
            onClick={onCreateNew}
            className="group flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            New Automation
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total",    value: stats.total,    icon: <Zap className="w-4 h-4 text-slate-600" />,    bg: "bg-slate-50",   gradient: "from-slate-50",   desc: "All workflows" },
            { label: "Live",     value: stats.live,     icon: <Play className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-50", gradient: "from-emerald-50", desc: null, live: true },
            { label: "Draft",    value: stats.draft,    icon: <Pause className="w-4 h-4 text-amber-600" />,  bg: "bg-amber-50",   gradient: "from-amber-50",   desc: "In progress" },
            { label: "Archived", value: stats.archived, icon: <Archive className="w-4 h-4 text-slate-600" />,bg: "bg-slate-50",   gradient: "from-slate-50",   desc: "Stored" },
          ].map((stat) => (
            <div key={stat.label} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <div className="relative bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-1.5 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                </div>
                <p className="text-2xl font-semibold text-slate-900 mb-1">{stat.value}</p>
                {stat.live ? (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-medium">Active</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">{stat.desc}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border-b border-slate-200/60 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 focus:bg-white text-[13px] transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-[13px] font-medium text-slate-700 transition-all shadow-sm hover:shadow"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {filterStatus === "all" ? "All" : filterStatus === "published" ? "Live" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              </span>
              <svg className={`w-3 h-3 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showFilterDropdown && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-10 py-1">
                {(["all", "published", "draft", "archived"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 text-[13px] font-medium transition-colors ${filterStatus === status ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {status === "all" ? "All" : status === "published" ? "Live" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flows List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
        ) : filteredFlows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <Zap className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-900 mb-1">
              {searchQuery || filterStatus !== "all" ? "No flows found" : "No automations yet"}
            </h3>
            <p className="text-[13px] text-slate-500 max-w-sm mb-5">
              {searchQuery || filterStatus !== "all" ? "Try adjusting your search or filters" : "Create your first automation to get started"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <button onClick={onCreateNew} className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-medium transition-all shadow-sm hover:shadow-md">
                <Plus className="w-4 h-4" />
                Create Automation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlows.map((flow) => (
              <FlowCard
                key={flow.flow_id}
                flow={flow}
                onEdit={() => onEditFlow(flow.flow_id, flow.name, flow)}
                onDelete={() => handleDeleteClick(flow)}
                onDuplicate={() => handleDuplicate(flow)}
                onArchive={() => handleArchive(flow)}
                onUnpublish={() => handleUnpublish(flow)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && flowToDelete && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[17px] font-semibold text-slate-900 mb-2">Delete Automation?</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    Are you sure you want to delete <span className="font-semibold text-slate-900">&ldquo;{flowToDelete.name}&rdquo;</span>? This action cannot be undone.
                  </p>
                </div>
              </div>
              {isLive(flowToDelete.status) && (
                <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200/60 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-amber-900 mb-0.5">Flow is Live</p>
                      <p className="text-[12px] text-amber-800">This will immediately stop all triggers and actions.</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button onClick={handleDeleteCancel} disabled={isDeleting} className="flex-1 px-4 py-2 border border-slate-200 bg-white rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm hover:shadow">
                  Cancel
                </button>
                <button onClick={handleDeleteSubmit} disabled={isDeleting} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[13px] font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                  {isDeleting ? (<><Loader2 className="w-4 h-4 animate-spin" />Deleting...</>) : (<><Trash2 className="w-4 h-4" />Delete</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FlowCard ─────────────────────────────────────────────────────────────────

interface FlowCardProps {
  flow: AutomationFlow;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onUnpublish: () => void;
}

function FlowCard({ flow, onEdit, onDelete, onDuplicate, onArchive, onUnpublish }: FlowCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isLive = flow.status === "published" || flow.status === "active";
  const isWaBot = isWaBotFlow(flow);

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-semibold uppercase tracking-wide shadow-sm">
          <span className="relative flex h-1 w-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
          </span>
          Live
        </span>
      );
    }
    if (flow.status === "archived") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 border border-red-200/60 text-red-700 text-[10px] font-semibold uppercase tracking-wide">Archived</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 text-slate-600 text-[10px] font-semibold uppercase tracking-wide">Draft</span>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
    } catch { return "Invalid date"; }
  };

  return (
    <div className="group relative bg-white rounded-lg border border-slate-200/60 hover:border-slate-300 transition-all cursor-pointer shadow-sm hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/0 to-slate-100/0 group-hover:from-slate-50/50 group-hover:to-slate-100/30 transition-all duration-300 pointer-events-none"></div>

      <div onClick={onEdit} className="relative p-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-slate-700 transition-colors">
                {flow.name}
              </h3>
              {/* WA Bot type badge */}
              {isWaBot && (
                <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                  WA Bot
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Calendar className="w-2.5 h-2.5" />
              <span>Created {formatDate(flow.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {getStatusBadge()}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-all"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-2xl z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-[12px] font-medium text-slate-700 transition-colors flex items-center gap-2 group/item">
                      <div className="p-0.5 rounded bg-slate-100 group-hover/item:bg-slate-200 transition-colors"><Play className="w-3 h-3 text-slate-600" /></div>
                      <span>Edit Flow</span>
                    </button>

                    {isLive && (
                      <button onClick={(e) => { e.stopPropagation(); onUnpublish(); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-[12px] font-medium text-slate-700 transition-colors flex items-center gap-2 group/item">
                        <div className="p-0.5 rounded bg-slate-100 group-hover/item:bg-amber-100 transition-colors"><Pause className="w-3 h-3 text-slate-600 group-hover/item:text-amber-600" /></div>
                        <span>Unpublish</span>
                      </button>
                    )}

                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-[12px] font-medium text-slate-700 transition-colors flex items-center gap-2 group/item">
                      <div className="p-0.5 rounded bg-slate-100 group-hover/item:bg-slate-200 transition-colors"><Copy className="w-3 h-3 text-slate-600" /></div>
                      <span>Duplicate</span>
                    </button>

                    {flow.status !== "archived" && (
                      <button onClick={(e) => { e.stopPropagation(); onArchive(); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-[12px] font-medium text-slate-700 transition-colors flex items-center gap-2 group/item">
                        <div className="p-0.5 rounded bg-slate-100 group-hover/item:bg-slate-200 transition-colors"><Archive className="w-3 h-3 text-slate-600" /></div>
                        <span>Archive</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-[12px] font-medium text-red-600 transition-colors flex items-center gap-2 group/item">
                      <div className="p-0.5 rounded bg-red-50 group-hover/item:bg-red-100 transition-colors"><Trash2 className="w-3 h-3 text-red-600" /></div>
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-md p-2 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-0.5 rounded bg-white/80 shadow-sm"><Zap className="w-2.5 h-2.5 text-slate-600" /></div>
              <span className="text-[10px] font-medium text-slate-600">Triggers</span>
            </div>
            <p className="text-base font-semibold text-slate-900">{flow.trigger_count || 0}</p>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-md p-2 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-0.5 rounded bg-white/80 shadow-sm"><Clock className="w-2.5 h-2.5 text-slate-600" /></div>
              <span className="text-[10px] font-medium text-slate-600">Last Run</span>
            </div>
            <p className="text-[10px] font-semibold text-slate-900 truncate">{formatDate(flow.last_run)}</p>
          </div>
        </div>
      </div>

      <div className="relative px-3 py-2 bg-gradient-to-r from-slate-50/80 to-slate-100/40 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Users className="w-2.5 h-2.5" />
          <span>Updated {formatDate(flow.updated_at)}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-[11px] font-medium text-slate-700 hover:text-slate-900 flex items-center gap-0.5 group/btn transition-colors">
          <span>View</span>
          <svg className="w-3 h-3 transform group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}