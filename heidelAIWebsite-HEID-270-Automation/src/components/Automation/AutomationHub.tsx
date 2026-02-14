import React, { useState } from "react";
import DashboardView from "./DashboardView";
import EditorView from "./EditorView";
import { ConnectChannelModal, TemplatesModal } from "./Popups";
import { LayoutGrid, Plus, Zap, Settings, Bell } from "lucide-react";

export type ViewState = "dashboard" | "editor";

export default function AutomationHub() {
  const [view, setView] = useState<ViewState>("dashboard");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [activeFlowId, setActiveFlowId] = useState<string>("new");
  const [activeWorkflowName, setActiveWorkflowName] = useState("Untitled");

  const handleCreateNew = () => {
    setActiveFlowId("new");
    setActiveWorkflowName("Untitled");
    setView("editor");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden selection:bg-indigo-100">
      {/* Top Utility Navigation */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 z-50 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setView("dashboard")}
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">
              AutoFlow
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Breadcrumbs / Nav */}
          {view === "editor" ? (
            <div className="flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">
              <button
                onClick={() => setView("dashboard")}
                className="text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-50 px-2 py-1 rounded-lg"
              >
                Workflows
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded-lg">
                {activeWorkflowName}
              </span>
            </div>
          ) : (
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setView("dashboard")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === "dashboard"
                    ? "bg-slate-100 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> Dashboard
              </button>
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Templates
              </button>
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          <button
            onClick={() => setShowConnectModal(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
          >
            <Settings className="w-3 h-3" /> Connect Channel
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
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
        />
        )}
      </main>

      {/* Persistent System Modals */}
      {showConnectModal && (
        <ConnectChannelModal onClose={() => setShowConnectModal(false)} />
      )}
      {showTemplatesModal && (
        <TemplatesModal onClose={() => setShowTemplatesModal(false)} />
      )}
    </div>
  );
}
