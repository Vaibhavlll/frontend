/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import DashboardView from "./DashboardView";
import EditorView from "./EditorView";
import WaBotEditor from "./WaBotEditor";
import { TemplatesModal } from "./Popups";
import { Plus, Settings } from "lucide-react";
import { isWaBotFlow } from "./automationFlowUtils";

export type ViewState = "dashboard" | "editor" | "wabot";

// Re-export so any existing callers of the old import path keep working
// without needing their own changes.
export { isWaBotFlow };

interface AutomationHubProps {
  onNavigateToSettings?: () => void;
}

export default function AutomationHub({ onNavigateToSettings }: AutomationHubProps) {
  const [view, setView] = useState<ViewState>("dashboard");
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [activeFlowId, setActiveFlowId] = useState<string>("new");
  const [activeWorkflowName, setActiveWorkflowName] = useState("Untitled");

  const handleCreateNew = () => {
    setActiveFlowId("new");
    setActiveWorkflowName("Untitled");
    // Always start in EditorView — user picks their trigger there
    setView("editor");
  };

  const handleFlowIdChange = (newFlowId: string) => {
    setActiveFlowId(newFlowId);
  };

  // Called by EditorView when user selects "WhatsApp Message Received" trigger
  const handleSwitchToWaBot = () => {
    setView("wabot");
  };

  /**
   * When opening an existing flow from the dashboard, detect which editor to use.
   * flowData is the full raw document returned from the API so isWaBotFlow()
   * can inspect any field regardless of nesting depth.
   */
  const handleEditFlow = (id: string, name: string, flowData?: any) => {
    setActiveFlowId(id);
    setActiveWorkflowName(name ?? "Untitled");
    setView(isWaBotFlow(flowData) ? "wabot" : "editor");
  };

  const handleConnectChannel = () => {
    if (onNavigateToSettings) {
      onNavigateToSettings();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Top Navigation */}
      <header className="h-14 flex items-center justify-between px-6 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shrink-0 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setView("dashboard")}
          >
            <span className="font-semibold text-[15px] text-slate-900 tracking-tight">
              Dashboard
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {view !== "dashboard" ? (
            <div className="flex items-center gap-2 text-[13px]">
              <button
                onClick={() => setView("dashboard")}
                className="text-slate-500 hover:text-slate-900 transition-colors px-2 py-1 rounded-md hover:bg-slate-50"
              >
                Workflows
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-medium px-2 py-1 rounded-md bg-slate-50">
                {activeWorkflowName}
              </span>
            </div>
          ) : (
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Templates
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleConnectChannel}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow"
          >
            <Settings className="w-3.5 h-3.5" />
            Connect Channel
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 relative overflow-hidden">
        {view === "dashboard" && (
          <DashboardView
            onCreateNew={handleCreateNew}
            onEditFlow={handleEditFlow}
          />
        )}

        {view === "editor" && (
          <EditorView
            onBack={() => setView("dashboard")}
            flowId={activeFlowId}
            flowName={activeWorkflowName}
            onFlowNameChange={setActiveWorkflowName}
            onFlowIdChange={handleFlowIdChange}
            onSwitchToWaBot={handleSwitchToWaBot}
          />
        )}

        {view === "wabot" && (
          <WaBotEditor
            onBack={() => setView("dashboard")}
            flowId={activeFlowId}
            flowName={activeWorkflowName}
            onFlowNameChange={setActiveWorkflowName}
            onFlowIdChange={handleFlowIdChange}
          />
        )}
      </main>

      {showTemplatesModal && (
        <TemplatesModal onClose={() => setShowTemplatesModal(false)} />
      )}
    </div>
  );
}