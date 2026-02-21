import React, { useState } from "react";
import DashboardView from "./DashboardView";
import EditorView from "./EditorView";
import {  TemplatesModal } from "./Popups";
import {  Plus, Settings } from "lucide-react";

export type ViewState = "dashboard" | "editor";

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
    setView("editor");
  };
  
  const handleFlowIdChange = (newFlowId: string) => {
    // console.log('AutomationHub: Flow ID changed to:', newFlowId);
    setActiveFlowId(newFlowId);
  };

  // Handler to open Integrations Settings
  const handleConnectChannel = () => {
    setTimeout(() => {
      const event = new CustomEvent("openIntegrationsSettings");
      window.dispatchEvent(event);
    }, 100);
    
    // Then navigate to settings
    if (onNavigateToSettings) {
      onNavigateToSettings();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Premium Top Navigation */}
      <header className="h-14 flex items-center justify-between px-6 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shrink-0 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          {/* Logo section remains the same */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setView("dashboard")}
          >
            {/* <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div> */}
            <span className="font-semibold text-[15px] text-slate-900 tracking-tight">
              Dashboard
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* Breadcrumbs */}
          {view === "editor" ? (
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

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all group">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button> */}

          <button
            onClick={handleConnectChannel}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-600 transition-all shadow-sm hover:shadow"
          >
            <Settings className="w-3.5 h-3.5" />
            Connect Channel
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 relative overflow-hidden">
        {view === "dashboard" ? (
          <DashboardView
            onCreateNew={handleCreateNew}
            onEditFlow={(id, name) => {
              setActiveFlowId(id);
              setActiveWorkflowName(name ?? "Untitled");
              setView("editor");
            }}
          />
        ) : (
          <EditorView
            onBack={() => setView("dashboard")}
            flowId={activeFlowId}
            flowName={activeWorkflowName}
            onFlowNameChange={setActiveWorkflowName}
            onFlowIdChange={handleFlowIdChange}
          />
        )}
      </main>

      {/* Modals */}
      {showTemplatesModal && (
        <TemplatesModal onClose={() => setShowTemplatesModal(false)} />
      )}
    </div>
  );
}
