import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Trash2,
  FolderPlus,
  ChevronsUpDown,
  MoreVertical,
  Pencil,
  Loader2,
} from 'lucide-react';
import { useApi } from '@/lib/session_api';
import { toast } from 'sonner';

export interface AutomationFlow {
  id: string;
  name: string;
  description?: string;
  status?: string;
  updated_at?: string;
  created_at?: string;
  flow_data?: unknown;
}

interface DashboardViewProps {
  onOpenAutomation: (id: string, name: string) => void;
}

const INSTAGRAM_ICON = (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-dash)" />
    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
    <defs>
      <linearGradient id="ig-dash" x1="2" y1="22" x2="22" y2="2">
        <stop offset="0%" stopColor="#FD5949" />
        <stop offset="50%" stopColor="#D6249F" />
        <stop offset="100%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
  </svg>
);

const FLOW_CARD_STORAGE_KEY = 'automation_dashboard_view_grid';

function getStoredGridView(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const v = localStorage.getItem(FLOW_CARD_STORAGE_KEY);
    return v === 'true';
  } catch {
    return false;
  }
}

function setStoredGridView(isGrid: boolean) {
  try {
    localStorage.setItem(FLOW_CARD_STORAGE_KEY, String(isGrid));
  } catch {}
}

export default function DashboardView({ onOpenAutomation }: DashboardViewProps) {
  const api = useApi();
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isGridView, setIsGridView] = useState(getStoredGridView);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<AutomationFlow | null>(null);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  const fetchFlows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/automation_flows');
      const data = response.data;
      const list = Array.isArray(data) ? data : data?.flows ?? data?.data ?? [];
      setFlows(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load automations';
      toast.error(msg);
      setFlows([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const toggleView = () => {
    const next = !isGridView;
    setIsGridView(next);
    setStoredGridView(next);
  };

  const filteredFlows = search.trim()
    ? flows.filter(
        (f) =>
          f.name?.toLowerCase().includes(search.trim().toLowerCase()) ||
          f.description?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : flows;

  //  dummy flow
  const hasRealFlows = filteredFlows.length > 0;
  const displayedFlows: AutomationFlow[] = hasRealFlows
    ? filteredFlows
    : [
        {
          id: 'demo-flow',
          name: 'Untitled',
          description: 'Sample automation (demo only)',
          status: 'draft',
        },
      ];

  const openCreateModal = () => {
    setCreateName('');
    setCreateDescription('');
    setCreateError('');
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = createName.trim();
    if (!name) {
      setCreateError('Name is required.');
      return;
    }
    if (name.length < 3) {
      setCreateError('Name must be at least 3 characters.');
      return;
    }
    if (name.length > 255) {
      setCreateError('Name must be at most 255 characters.');
      return;
    }
    if (createDescription.length > 500) {
      setCreateError('Description must be at most 500 characters.');
      return;
    }
    setCreateSubmitting(true);
    setCreateError('');
    try {
      const payload = { name, description: createDescription.trim() || undefined };
      const response = await api.post('/api/automation_flows', payload);
      const created = response.data?.id != null ? response.data : response.data?.flow ?? response.data;
      const newId = typeof created?.id === 'string' ? created.id : String(created?.id ?? created?._id ?? '');
      const newName = created?.name ?? name;
      if (newId) {
        setFlows((prev) => [...prev, { id: newId, name: newName, description: createDescription.trim() || undefined }]);
        setCreateModalOpen(false);
        onOpenAutomation(newId, newName);
        toast.success('Automation created');
      } else {
        setCreateError('Invalid response from server.');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create automation';
      setCreateError(msg);
      toast.error(msg);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEditModal = (flow: AutomationFlow, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFlow(flow);
    setEditName(flow.name ?? '');
    setEditDescription(flow.description ?? '');
    setEditError('');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlow?.id) return;
    const name = editName.trim();
    if (!name) {
      setEditError('Name is required.');
      return;
    }
    if (name.length < 3) {
      setEditError('Name must be at least 3 characters.');
      return;
    }
    if (name.length > 255) {
      setEditError('Name must be at most 255 characters.');
      return;
    }
    if (editDescription.length > 500) {
      setEditError('Description must be at most 500 characters.');
      return;
    }
    setEditSubmitting(true);
    setEditError('');
    try {
      const payload = { name, description: editDescription.trim() || undefined };
      await api.patch(`/api/automation_flows/${editingFlow.id}`, payload);
      setFlows((prev) =>
        prev.map((f) => (f.id === editingFlow.id ? { ...f, name, description: editDescription.trim() || undefined } : f))
      );
      setEditModalOpen(false);
      setEditingFlow(null);
      toast.success('Automation updated');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update automation';
      setEditError(msg);
      toast.error(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays} days ago`;
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="flex flex-1 min-h-0">
        <aside className="w-56 shrink-0 border-r border-slate-200 bg-white py-4 px-3">
          <h2 className="text-lg font-bold text-slate-900 px-3 mb-4">Automation</h2>
          <nav className="space-y-0.5">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-medium text-sm">
              <LayoutGrid className="w-4 h-4 text-slate-600" />
              My Automations
            </button>
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">My Automations</h1>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search all Automations"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                {/* <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
                >
                  <FolderPlus className="w-4 h-4" />
                  New Folder
                </button> */}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
                  <Trash2 className="w-4 h-4" />
                  Trash
                </button>
                <button
                  type="button"
                  onClick={toggleView}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  {isGridView ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                  View as {isGridView ? 'list' : 'grid'}
                </button>
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Automation
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : isGridView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedFlows.map((flow) => (
                  <div
                    key={flow.id}
                    onClick={() => onOpenAutomation(flow.id, flow.name ?? 'Untitled')}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group relative"
                  >
                    <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => openEditModal(flow, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                      <LayoutGrid className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      {(flow.status === 'draft' || !flow.status) && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Draft" />
                      )}
                      <span className="font-semibold text-slate-900 truncate pr-8">{flow.name ?? 'Untitled'}</span>
                    </div>
                    <p className="text-xs text-slate-500">{formatDate(flow.updated_at ?? flow.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1">
                          Name
                        </span>
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Runs</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1">
                          Modified
                        </span>
                      </th>
                      <th className="px-4 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedFlows.map((flow) => (
                      <tr
                        key={flow.id}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        onClick={() => onOpenAutomation(flow.id, flow.name ?? 'Untitled')}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-400 uppercase">
                              {(flow.status as string) === 'published' ? 'LIVE' : 'DRAFT'}
                            </span>
                            <span className="font-semibold text-slate-900">{flow.name ?? 'Untitled'}</span>
                          </div>
                          {flow.description && (
                            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{flow.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">—</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatDate(flow.updated_at ?? flow.created_at)}</td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => openEditModal(flow, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredFlows.length === 0 && (
                  <div className="px-4 py-12 text-center text-slate-500">No automations yet. Create one to get started.</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Flow Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">New Automation</h2>
              <p className="text-sm text-slate-500 mt-0.5">Create a new automation flow.</p>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createError && (
                <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{createError}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name (required)</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Welcome Message Flow"
                  minLength={3}
                  maxLength={255}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="text-xs text-slate-400 mt-1">Min 3, max 255 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="e.g. Automated welcome message for new subscribers"
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">Max 500 characters</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Flow Modal */}
      {editModalOpen && editingFlow && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Edit automation</h2>
              <p className="text-sm text-slate-500 mt-0.5">Update name and description.</p>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{editError}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name (required)</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Flow name"
                  minLength={3}
                  maxLength={255}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditModalOpen(false); setEditingFlow(null); }}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
