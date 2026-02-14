import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Play, Pause, Trash2, Copy, Calendar, Clock, Zap, Users, Archive, Loader2 } from 'lucide-react';
import { useApi } from "@/lib/session_api";
import { toast } from "sonner";

interface AutomationFlow {
  _id?: string;          // MongoDB ID (may be present but don't use it)
  flow_id: string;       // CRITICAL: Backend uses this field for all operations!
  name: string;
  status: 'draft' | 'published' | 'archived';
  description?: string;
  trigger_count?: number;
  last_run?: string;
  created_at?: string;
  updated_at?: string;
  flow_data?: any;
}

interface DashboardViewProps {
  onCreateNew: () => void;
  onEditFlow: (flowId: string, flowName: string) => void;
}

export default function DashboardView({ onCreateNew, onEditFlow }: DashboardViewProps) {
  const api = useApi();
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<AutomationFlow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch flows on mount
  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/automation_flows');
      
      console.log('🔍 RAW API RESPONSE:', response.data);
      
      // Handle different response formats
      let flowsData: AutomationFlow[] = [];
      
      if (Array.isArray(response.data)) {
        flowsData = response.data;
      } else if (response.data?.flows && Array.isArray(response.data.flows)) {
        flowsData = response.data.flows;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        flowsData = response.data.data;
      }
      
      console.log('✅ Fetched flows:', flowsData.length);
      flowsData.forEach((flow, index) => {
        console.log(`  Flow ${index + 1}:`, {
          flow_id: flow.flow_id,
          _id: flow._id,
          name: flow.name,
          status: flow.status
        });
      });
      
      setFlows(flowsData);
    } catch (error) {
      console.error('❌ Failed to fetch flows:', error);
      toast.error('Failed to load automations');
      setFlows([]);
    } finally {
      setLoading(false);
    }
  };

  // DELETE handler with correct flow_id field
  const handleDeleteClick = (flow: AutomationFlow) => {
    setFlowToDelete(flow);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!flowToDelete) return;

    // CRITICAL: Backend uses flow_id field, not _id!
    const flowId = flowToDelete.flow_id;
    
    if (!flowId) {
      toast.error('Invalid flow ID');
      setIsDeleting(false);
      return;
    }

    console.log('🗑️ Deleting flow with flow_id:', flowId);

    setIsDeleting(true);
    try {
      const response = await api.delete(`/api/automation_flows/${flowId}`);
      
      if (response.status === 200 || response.status === 204) {
        // Remove from local state
        setFlows((prevFlows) => prevFlows.filter((f) => f.flow_id !== flowId));
        
        toast.success('Flow deleted successfully', {
          description: `"${flowToDelete.name}" has been removed.`,
        });
        
        setShowDeleteModal(false);
        setFlowToDelete(null);
      }
    } catch (error: unknown) {
      console.error('❌ Delete failed:', error);
      
      const errorResponse = error as { 
        response?: { 
          data?: { message?: string; detail?: string }; 
          status?: number 
        } 
      };
      
      let errorMessage = 'Failed to delete flow';
      
      if (errorResponse.response?.data?.detail) {
        errorMessage = errorResponse.response.data.detail;
      } else if (errorResponse.response?.data?.message) {
        errorMessage = errorResponse.response.data.message;
      } else if (errorResponse.response?.status === 404) {
        errorMessage = 'Flow not found. It may have been already deleted.';
      } else if (errorResponse.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this flow';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setFlowToDelete(null);
  };

  // UNPUBLISH handler
  const handleUnpublish = async (flow: AutomationFlow) => {
    const flowId = flow.flow_id;
    
    if (!flowId) {
      toast.error('Invalid flow ID');
      return;
    }

    console.log('⏸️ Unpublishing flow with flow_id:', flowId);

    try {
      const response = await api.post(`/api/automation_flows/${flowId}/unpublish`);
      
      if (response.status === 200) {
        // Update local state
        setFlows((prevFlows) =>
          prevFlows.map((f) =>
            f.flow_id === flowId ? { ...f, status: 'draft' as const } : f
          )
        );
        
        toast.success('Flow unpublished successfully', {
          description: `"${flow.name}" is now in draft mode.`,
        });
      }
    } catch (error: unknown) {
      console.error('❌ Unpublish failed:', error);
      
      const errorResponse = error as { 
        response?: { 
          data?: { message?: string; detail?: string }; 
          status?: number 
        } 
      };
      
      let errorMessage = 'Failed to unpublish flow';
      
      if (errorResponse.response?.data?.detail) {
        errorMessage = errorResponse.response.data.detail;
      } else if (errorResponse.response?.data?.message) {
        errorMessage = errorResponse.response.data.message;
      } else if (errorResponse.response?.status === 404) {
        errorMessage = 'Flow not found';
      } else if (errorResponse.response?.status === 400) {
        errorMessage = 'Flow is already in draft mode';
      }
      
      toast.error(errorMessage);
    }
  };

  // Duplicate handler
  const handleDuplicate = async (flow: AutomationFlow) => {
    const flowId = flow.flow_id;
    
    if (!flowId) {
      toast.error('Invalid flow ID');
      return;
    }

    console.log('📋 Duplicating flow with flow_id:', flowId);

    try {
      const response = await api.get(`/api/automation_flows/${flowId}`);
      const flowData = response.data;
      
      const duplicateData = {
        name: `${flow.name} (Copy)`,
        description: flowData.description || '',
        flow_data: flowData.flow_data,
        status: 'draft',
      };
      
      const createResponse = await api.post('/api/automation_flows', duplicateData);
      
      if (createResponse.status === 201 || createResponse.status === 200) {
        toast.success('Flow duplicated successfully');
        fetchFlows(); // Refresh the list
      }
    } catch (error) {
      console.error('❌ Duplicate failed:', error);
      toast.error('Failed to duplicate flow');
    }
  };

  // Archive handler
  const handleArchive = async (flow: AutomationFlow) => {
    const flowId = flow.flow_id;
    
    if (!flowId) {
      toast.error('Invalid flow ID');
      return;
    }

    console.log('📦 Archiving flow with flow_id:', flowId);

    try {
      const response = await api.patch(`/api/automation_flows/${flowId}`, {
        status: 'archived',
      });
      
      if (response.status === 200) {
        setFlows((prevFlows) =>
          prevFlows.map((f) =>
            f.flow_id === flowId ? { ...f, status: 'archived' as const } : f
          )
        );
        
        toast.success('Flow archived successfully');
      }
    } catch (error) {
      console.error('❌ Archive failed:', error);
      toast.error('Failed to archive flow');
    }
  };

  // Filter and search flows
  const filteredFlows = flows.filter((flow) => {
    const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || flow.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Stats calculation (display 'published' as 'Live')
  const stats = {
    total: flows.length,
    live: flows.filter((f) => f.status === 'published').length,
    draft: flows.filter((f) => f.status === 'draft').length,
    archived: flows.filter((f) => f.status === 'archived').length,
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Automations</h1>
            <p className="text-sm text-slate-600">Create and manage your automation workflows</p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Automation
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Total</span>
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Live</span>
              <Play className="w-4 h-4 text-emerald-600 fill-current" />
            </div>
            <p className="text-2xl font-bold text-emerald-900">{stats.live}</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Draft</span>
              <Pause className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-900">{stats.draft}</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Archived</span>
              <Archive className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.archived}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {filterStatus === 'all' ? 'All Flows' : filterStatus === 'published' ? 'Live' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setShowFilterDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
                  >
                    {status === 'all' ? 'All Flows' : status === 'published' ? 'Live' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flows List */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredFlows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No flows found' : 'No automations yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first automation to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={onCreateNew}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Automation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlows.map((flow) => (
              <FlowCard
                key={flow.flow_id}
                flow={flow}
                onEdit={() => onEditFlow(flow.flow_id, flow.name)}
                onDelete={() => handleDeleteClick(flow)}
                onDuplicate={() => handleDuplicate(flow)}
                onArchive={() => handleArchive(flow)}
                onUnpublish={() => handleUnpublish(flow)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && flowToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Automation?</h3>
                <p className="text-sm text-slate-600">
                  Are you sure you want to delete <span className="font-semibold">"{flowToDelete.name}"</span>? 
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {flowToDelete.status === 'published' && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">Warning: Flow is Live</p>
                    <p className="text-xs text-amber-700">
                      This automation is currently active. Deleting it will immediately stop all triggers and scheduled actions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Flow
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// FlowCard Component
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

  const getStatusBadge = () => {
    switch (flow.status) {
      case 'published':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </span>
        );
      case 'draft':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wide">
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
      <div onClick={onEdit} className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
              {flow.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {formatDate(flow.created_at)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Edit Flow
                    </button>
                    
                    {flow.status === 'published' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnpublish();
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors flex items-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        Unpublish
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    
                    {flow.status !== 'archived' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive();
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                    )}
                    
                    <div className="border-t border-slate-100" />
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm font-medium text-red-600 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">Triggers</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{flow.trigger_count || 0}</p>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">Last Run</span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">{formatDate(flow.last_run)}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Users className="w-3.5 h-3.5" />
          <span>Updated {formatDate(flow.updated_at)}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}
