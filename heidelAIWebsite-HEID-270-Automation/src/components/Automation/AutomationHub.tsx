// import React from 'react';
// import ComingSoon from '../shared/ComingSoon';

// const AutomationHub = () => {
//   return (
//     <div className="flex flex-col h-dvh min-h-screen w-full text-slate-900 font-sans overflow-hidden bg-white">
//       {/* Coming Soon Content */}
//       <main className="flex-1 relative overflow-hidden flex items-center justify-center">
//         {/* Animated Background Elements */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" />
//           <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-700" />
//         </div>

//         <ComingSoon
//           description={`We're building something amazing. Automation Hub is being designed to automate your daily tasks.
//                         Stay Tuned.`}
//         />
//       </main>
//     </div>
//   );
// };

// export default AutomationHub;

import React, { useState } from "react";
import DashboardView from "./DashboardView";
import EditorView from "./EditorView";
import WaBotEditor from "./WaBotEditor";
import { TemplatesModal } from "./Popups";
import { Plus, Settings } from "lucide-react";

export type ViewState = "dashboard" | "editor" | "wabot";

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

  // When opening an existing flow from dashboard, detect which editor to use
  const handleEditFlow = (id: string, name: string, flowData?: any) => {
    setActiveFlowId(id);
    setActiveWorkflowName(name ?? "Untitled");

    const triggerType = flowData?.trigger_type || "";
    const triggerEvent = flowData?.flow_data?.trigger_event || "";
    const hasWelcomeMsg = !!flowData?.flow_data?.welcome_message;

    const isWaBot =
      triggerType === "whatsapp_message_received" ||
      triggerEvent === "message_received" ||
      hasWelcomeMsg;

    setView(isWaBot ? "wabot" : "editor");
  };

  const handleConnectChannel = () => {
    setTimeout(() => {
      const event = new CustomEvent("openIntegrationsSettings");
      window.dispatchEvent(event);
    }, 100);
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