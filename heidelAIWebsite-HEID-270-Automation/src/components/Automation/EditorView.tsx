/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import SidebarSettings from "./SidebarSettings";
import { AddStepMenu, TriggerSelectionModal } from "./Popups";
import { validateFlowBeforeSave, type EditorNode } from "./flowExport";
import { buildFlowDetails } from "./automationFlowSchema";
import { STEP_SECTIONS, STEP_BY_ID, StepIcon } from "./stepDefinitions";
import { useApi } from "@/lib/session_api";
import { toast } from "sonner";
import { Zap, Plus } from "lucide-react";
import {
  Play,
  Save,
  ArrowLeft,
  Undo2,
  Redo2,
  MoreVertical,
  Pencil,
  HelpCircle,
  Loader2,
} from "lucide-react";

interface InstagramPost {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  thumbnail_url: string;
  timestamp: string;
  username: string;
}

type Node = EditorNode;

interface Connection {
  from: string;
  to: string;
}

interface FlowStepProps {
  node: Node;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAddLink: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: () => void;
}

const NODE_WIDTH = 260;
const NODE_HEIGHT = 140;

const NODE_STYLES = {
  trigger: "bg-blue-50/80 border-blue-100 hover:border-blue-300",
  action: "bg-white border-slate-200 hover:border-indigo-300",
  logic: "bg-amber-50/80 border-amber-100 hover:border-amber-300",
};

const getBezierPath = (from: Node, to: Node): string => {
  const isFromTrigger = from.type === "trigger";
  const startX = isFromTrigger
    ? from.x + NODE_WIDTH / 2
    : from.x + NODE_WIDTH + 6;
  const startY = isFromTrigger
    ? from.y + NODE_HEIGHT + 6
    : from.y + NODE_HEIGHT / 2;
  const endX = to.x - 6;
  const endY = to.y + 40;
  const dx = endX - startX;
  const cpOffset = Math.max(Math.abs(dx) * 0.5, 100);
  const cp1X = startX + (isFromTrigger ? 0 : cpOffset);
  const cp1Y = startY + (isFromTrigger ? cpOffset : 0);
  const cp2X = endX - cpOffset;
  const cp2Y = endY;
  return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
};

const AppIcon = ({ app }: { app?: string }) => {
  if (app === "instagram") {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instagram-gradient)" />
        <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
        <defs>
          <linearGradient id="instagram-gradient" x1="2" y1="22" x2="22" y2="2">
            <stop offset="0%" stopColor="#FD5949" />
            <stop offset="50%" stopColor="#D6249F" />
            <stop offset="100%" stopColor="#285AEB" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (app === "whatsapp") {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#25D366" />
        <path
          d="M17.5 14.45c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28z"
          fill="white"
        />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
};

const NodeTypeIcon = ({ node }: { node: Node }) => {
  const stepId = node.data?.stepId as string | undefined;
  const stepDef = stepId ? STEP_BY_ID[stepId] : null;
  if (stepDef) {
    return (
      <div className={`p-1.5 rounded-xl flex items-center justify-center ${stepDef.bgColor} shrink-0`}>
        <StepIcon step={stepDef} size="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className="p-1.5 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 shrink-0">
      <AppIcon app={node.app} />
    </div>
  );
};

const FlowStep = ({ node, isSelected, onMouseDown, onAddLink, onDelete }: FlowStepProps) => {
  const isTrigger = node.type === "trigger";
  const currentStyle = NODE_STYLES[node.type] || NODE_STYLES.action;

  return (
    <div
      onMouseDown={onMouseDown}
      className={`absolute w-[250px] rounded-xl transition-all cursor-pointer pointer-events-auto border-2 backdrop-blur-sm
        ${isSelected ? "border-slate-900 shadow-xl ring-4 ring-slate-900/5 z-10" : `${currentStyle} shadow-md hover:shadow-lg`}
      `}
      style={{ left: node.x, top: node.y }}
    >
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between gap-2.5 border-b border-slate-100/80">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <NodeTypeIcon node={node} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-900 leading-tight mb-0.5 truncate">
              {node.label}
            </p>
            <p className="text-[11px] text-slate-600 leading-tight truncate">
              {node.description || "Configure step"}
            </p>
            {node.type === "trigger" && (node.data?.triggerSubtitle as string) && (
              <p className="text-[10px] text-slate-500 mt-1 truncate">
                {node.data.triggerSubtitle as string}
              </p>
            )}
          </div>
        </div>
        {isSelected && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-slate-300 hover:text-red-500 shrink-0 transition-colors p-1 rounded hover:bg-red-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <div className="w-full py-3 px-3.5 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all group">
          <span className="text-[12px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
            {isTrigger ? "Configure Trigger" : "Configure Step"}
          </span>
        </div>
      </div>

      {/* Connection Points */}
      {isTrigger ? (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 flex flex-col items-center group z-10">
          <button
            onClick={onAddLink}
            className="w-6 h-6 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center hover:border-slate-900 hover:shadow-md transition-all shadow-sm"
          >
            <div className="w-2 h-2 bg-slate-400 rounded-full group-hover:bg-slate-900 transition-colors" />
          </button>
        </div>
      ) : (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center group z-10">
          <button
            onClick={onAddLink}
            className="w-6 h-6 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center hover:border-slate-900 hover:shadow-md transition-all shadow-sm"
          >
            <div className="w-2 h-2 bg-slate-400 rounded-full group-hover:bg-slate-900 transition-colors" />
          </button>
        </div>
      )}

      {/* Input Handle */}
      {!isTrigger && (
        <div className="absolute -left-1.5 top-[40px] w-3 h-3 bg-white border-2 border-slate-300 rounded-full shadow-sm z-10" />
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface EditorViewProps {
  onBack: () => void;
  flowId?: string;
  flowName?: string;
  onFlowNameChange?: (name: string) => void;
  onFlowIdChange?: (flowId: string) => void;
  // ↓ NEW: called when user picks "WhatsApp Message Received" trigger
  onSwitchToWaBot?: () => void;
}

export default function EditorView({
  onBack,
  flowId: flowIdProp,
  flowName: flowNameProp,
  onFlowNameChange,
  onFlowIdChange,
  onSwitchToWaBot,   // ← NEW prop
}: EditorViewProps) {
  const api = useApi();

  const [flowId, setFlowId] = useState<string | null>(() => {
    if (flowIdProp && flowIdProp !== "new" && !flowIdProp.startsWith("flow_")) {
      return flowIdProp;
    }
    return null;
  });
  const [flowNameLocal, setFlowNameLocal] = useState("Untitled");
  const flowName = flowNameProp !== undefined ? flowNameProp : flowNameLocal;
  const setFlowName = (v: string) => {
    setFlowNameLocal(v);
    onFlowNameChange?.(v);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activePortId, setActivePortId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loadingFlow, setLoadingFlow] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync flowId when props change
  useEffect(() => {
    if (flowIdProp && flowIdProp !== "new" && !flowIdProp.startsWith("flow_")) {
      if (flowIdProp !== flowId) {
        setFlowId(flowIdProp);
      }
    } else if (flowIdProp === "new" && flowId) {
      setFlowId(null);
    }
  }, [flowIdProp]);

  useEffect(() => {
    const loadFlow = async () => {
      if (!flowIdProp || flowIdProp === "new" || flowIdProp.startsWith("flow_")) {
        return;
      }

      setLoadingFlow(true);
      try {
        const response = await api.get(`/api/automation_flows/${flowIdProp}`);
        if (response.status !== 200) throw new Error("Failed to load flow");

        const flowData = response.data.flow || response.data;
        const backendFlowId = flowData.flow_id || flowData._id;
        setFlowId(backendFlowId);

        const reconstructedNodes: Node[] = [];
        const reconstructedConnections: Connection[] = [];

        // Process triggers
        if (flowData.flow_data?.triggers) {
          flowData.flow_data.triggers.forEach((trigger: any, index: number) => {
            let nodeId = "";
            if (flowData.flow_data.ui_config?.nodes) {
              const uiKeys = Object.keys(flowData.flow_data.ui_config.nodes);
              const actionNodeKeys = Object.keys(flowData.flow_data.nodes || {});
              const triggerIds = uiKeys.filter((key) => !actionNodeKeys.includes(key));
              if (triggerIds[index]) nodeId = triggerIds[index];
            }
            if (!nodeId) nodeId = `trigger-${trigger.type}-${index}`;

            const uiPos = flowData.flow_data.ui_config?.nodes?.[nodeId] || { x: 200, y: 100 + index * 200 };

            let label = "Trigger";
            let stepId = "trigger_comment";
            if (trigger.type === "instagram_comment") { label = "Post or Reel Comments"; stepId = "trigger_comment"; }
            else if (trigger.type === "story_reply") { label = "Story Reply"; stepId = "trigger_story_reply"; }
            else if (trigger.type === "instagram_message") { label = "Instagram Message"; stepId = "trigger_instagram_message"; }

            const config = trigger.config || {};
            const keywords = config.keyword ? config.keyword.split("|").map((k: string) => k.trim()).filter(Boolean) : [];

            reconstructedNodes.push({
              id: nodeId,
              type: "trigger",
              label,
              description: "Automation trigger",
              x: uiPos.x,
              y: uiPos.y,
              data: {
                stepId,
                triggerType: trigger.type,
                triggerConfig: { ...config, keywords },
                triggerSubtitle: config.post_id
                  ? `Post: ${config.post_id.substring(0, 15)}...`
                  : keywords.length > 0 ? `Keywords: ${keywords.join(", ")}` : undefined,
              },
            });

            if (trigger.start_node_id) {
              reconstructedConnections.push({ from: nodeId, to: trigger.start_node_id });
            }
          });
        }

        // Process action/logic nodes
        if (flowData.flow_data?.nodes) {
          Object.entries(flowData.flow_data.nodes).forEach(([backendId, nodeData]: [string, any]) => {
            const uiPos = flowData.flow_data.ui_config?.nodes?.[backendId] || {
              x: 400 + Math.random() * 200,
              y: 300 + Math.random() * 200,
            };

            let nodeType: Node["type"] = "action";
            let label = nodeData.name || "Step";
            let data: Node["data"] = {};
            let stepId = "";

            if (nodeData.type === "message") {
              nodeType = "action"; label = "Send Message"; stepId = "content_text";
              data = { stepId, text: nodeData.content?.text || "", media_url: nodeData.content?.media_url || null, buttons: nodeData.content?.buttons || [], contentKind: "text" };
            } else if (nodeData.type === "smart_delay") {
              nodeType = "logic"; label = "Smart Delay"; stepId = "logic_delay";
              data = { stepId, logicType: "delay", delayAmount: nodeData.config?.amount || 5, delayUnit: nodeData.config?.unit || "minutes" };
            } else if (nodeData.type === "condition") {
              nodeType = "logic"; label = "Condition"; stepId = "logic_condition";
              data = { stepId, logicType: "condition", conditionVariable: nodeData.config?.variable || "", conditionOperator: nodeData.config?.operator || "includes", conditionValue: nodeData.config?.value || "" };
            } else if (nodeData.type === "randomizer") {
              nodeType = "logic"; label = "Randomizer"; stepId = "logic_randomizer";
              data = { stepId, logicType: "randomizer" };
            } else if (nodeData.type === "action") {
              nodeType = "action";
              const actionType = nodeData.config?.action_type;
              if (actionType === "send_dm") { label = "Send DM"; stepId = "action_send_dm"; data = { stepId, actionType: "send_dm", text: nodeData.config?.text || "", linkUrl: nodeData.config?.link_url, buttonTitle: nodeData.config?.button_title }; }
              else if (actionType === "reply_to_comment") { label = "Reply to Comment"; stepId = "action_reply_comment"; data = { stepId, actionType: "reply_to_comment", text: nodeData.config?.text || "" }; }
              else if (actionType === "add_tag") { label = "Add Tag"; stepId = "action_tag"; data = { stepId, actionType: "add_tag", tagName: nodeData.config?.tag_name || "" }; }
              else if (actionType === "set_field") { label = "Set Custom Field"; stepId = "action_field"; data = { stepId, actionType: "set_field", fieldName: nodeData.config?.field_name || "", fieldValue: nodeData.config?.field_value || "" }; }
              else if (actionType === "api") { label = "HTTP Request"; stepId = "action_api"; data = { stepId, actionType: "api", apiUrl: nodeData.config?.api_url || "", apiMethod: nodeData.config?.api_method || "POST", apiBody: nodeData.config?.api_body || "" }; }
            }

            reconstructedNodes.push({ id: backendId, type: nodeType, label, description: nodeData.name || "Step", x: uiPos.x, y: uiPos.y, data });

            if (nodeData.next_node_id) reconstructedConnections.push({ from: backendId, to: nodeData.next_node_id });
            if (nodeData.paths) {
              if (nodeData.paths.true) reconstructedConnections.push({ from: backendId, to: nodeData.paths.true });
              if (nodeData.paths.false) reconstructedConnections.push({ from: backendId, to: nodeData.paths.false });
            }
          });
        }

        setNodes(reconstructedNodes);
        setConnections(reconstructedConnections);
        setTimeout(() => autoFit(), 100);
      } catch (error) {
        console.error("❌ Error loading flow:", error);
        toast.error("Failed to load flow", { description: "Could not load the automation flow. Please try again." });
      } finally {
        setLoadingFlow(false);
      }
    };

    loadFlow();
  }, [flowIdProp, api, flowId]);

  const autoFit = () => {
    if (nodes.length === 0) return;
    const padding = 100;
    let minX = nodes[0].x, maxX = nodes[0].x + NODE_WIDTH;
    let minY = nodes[0].y, maxY = nodes[0].y + NODE_HEIGHT;
    nodes.forEach((n) => {
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x + NODE_WIDTH);
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y + NODE_HEIGHT);
    });
    const contentWidth = maxX - minX, contentHeight = maxY - minY;
    const viewWidth = canvasRef.current?.clientWidth || window.innerWidth;
    const viewHeight = canvasRef.current?.clientHeight || window.innerHeight;
    const scaleX = (viewWidth - padding * 2) / contentWidth;
    const scaleY = (viewHeight - padding * 2) / contentHeight;
    const newZoom = Math.max(0.4, Math.min(1.2, Math.min(scaleX, scaleY)));
    setZoom(newZoom);
    setPan({ x: viewWidth / 2 - (minX + contentWidth / 2) * newZoom, y: viewHeight / 2 - (minY + contentHeight / 2) * newZoom });
  };

  useEffect(() => {
    const lastNode = nodes[nodes.length - 1];
    if (!lastNode) return;
    const worldX = lastNode.x * zoom + pan.x;
    const worldY = lastNode.y * zoom + pan.y;
    const vw = canvasRef.current?.clientWidth || window.innerWidth;
    const vh = canvasRef.current?.clientHeight || window.innerHeight;
    if (worldX < 0 || worldX > vw - NODE_WIDTH || worldY < 0 || worldY > vh - NODE_HEIGHT) {
      autoFit();
    }
  }, [nodes.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("canvas-container")) {
      setIsPanning(true);
      setSelectedNodeId(null);
      setShowAddMenu(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan((prev) => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    } else if (draggingNodeId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
      setNodes((prev) => prev.map((n) => (n.id === draggingNodeId ? { ...n, x, y } : n)));
    }
  };

  const handleMouseUp = () => { setIsPanning(false); setDraggingNodeId(null); };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = 0.001;
    const newZoom = Math.min(Math.max(zoom + delta * factor, 0.2), 2);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
    const worldMouseX = (mouseX - pan.x) / zoom, worldMouseY = (mouseY - pan.y) / zoom;
    setZoom(newZoom);
    setPan({ x: mouseX - worldMouseX * newZoom, y: mouseY - worldMouseY * newZoom });
  };

  const startDrag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDraggingNodeId(id);
    setSelectedNodeId(id);
    const mouseXInCanvas = (e.clientX - rect.left - pan.x) / zoom;
    const mouseYInCanvas = (e.clientY - rect.top - pan.y) / zoom;
    setDragOffset({ x: mouseXInCanvas - node.x, y: mouseYInCanvas - node.y });
  };

  const addNodeByStepId = (stepId: string) => {
    const step = STEP_BY_ID[stepId];
    if (!step) return;
    const lastNode = nodes[nodes.length - 1];
    const x = lastNode ? lastNode.x + 400 : 200;
    const y = lastNode ? lastNode.y : 300;
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode: Node = {
      id, type: step.type, app: step.app, label: step.label, description: step.description, x, y,
      data: {
        stepId, triggerType: step.triggerType, triggerConfig: step.triggerType ? {} : undefined,
        logicType: step.logicType as "delay" | "condition" | "randomizer" | "ai" | "actions" | undefined,
        contentKind: step.contentKind, actionType: step.actionType, delayAmount: 5, delayUnit: "minutes" as const,
      },
    };
    setNodes((prev) => [...prev, newNode]);
    if (activePortId) { setConnections((prev) => [...prev, { from: activePortId, to: id }]); setActivePortId(null); }
    setShowAddMenu(false);
  };

  const handleSave = async () => {
    const edges = connections.map((c) => ({ from: c.from, to: c.to }));
    if (nodes.length > 0) {
      const validation = validateFlowBeforeSave(nodes, edges);
      if (!validation.valid) {
        toast.error("Flow validation failed", { description: validation.errors[0] ?? "Please check your flow configuration." });
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2000);
        return;
      }
    }
    setSaveStatus("saving");
    const isExistingFlow = flowId && flowId !== "new" && !flowId.startsWith("flow_");
    try {
      const flow_details = buildFlowDetails(nodes, edges, { flowId: flowId || undefined, flowName, status: "draft", version: 1 });
      if (isExistingFlow) {
        const response = await api.patch(`/api/automation_flows/${flowId}`, flow_details);
        if (response.status === 200) { toast.success("Flow updated successfully"); setSaveStatus("saved"); }
        else throw new Error("Update failed");
      } else {
        const response = await api.post("/api/automation_flows", flow_details);
        if (response.status === 201 || response.status === 200) {
          const flowData = response.data.flow || response.data;
          const savedFlowId = flowData.flow_id || flowData._id;
          if (savedFlowId) { setFlowId(savedFlowId); if (onFlowIdChange) onFlowIdChange(savedFlowId); }
          else throw new Error("No flow ID returned from server");
        } else throw new Error("Create failed");
      }
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: unknown) {
      setSaveStatus("error");
      const errorResponse = err as { response?: { data?: { message?: string; detail?: string }; status?: number } };
      let errorMessage = "Failed to save flow";
      if (errorResponse.response?.data?.detail) errorMessage = errorResponse.response.data.detail;
      else if (errorResponse.response?.data?.message) errorMessage = errorResponse.response.data.message;
      toast.error(errorMessage);
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handlePublish = async () => {
    const edges = connections.map((c) => ({ from: c.from, to: c.to }));
    if (nodes.length === 0) { toast.error("Cannot publish empty flow"); return; }
    const validation = validateFlowBeforeSave(nodes, edges);
    if (!validation.valid) { toast.error("Flow validation failed", { description: validation.errors[0] ?? "Please fix the errors before publishing." }); return; }
    setSaveStatus("saving");
    try {
      const flow_details = buildFlowDetails(nodes, edges, { flowId: flowId || undefined, flowName, status: "draft", version: 1 });
      let currentFlowId = flowId;
      const isExistingFlow = flowId && flowId !== "new" && !flowId.startsWith("flow_");
      if (isExistingFlow) {
        await api.patch(`/api/automation_flows/${flowId}`, flow_details);
      } else {
        const response = await api.post("/api/automation_flows", flow_details);
        const flowData = response.data.flow || response.data;
        currentFlowId = flowData.flow_id || flowData._id;
        if (currentFlowId) { setFlowId(currentFlowId); if (onFlowIdChange) onFlowIdChange(currentFlowId); }
        else throw new Error("Failed to create flow");
      }
      if (currentFlowId && currentFlowId !== "new" && !currentFlowId.startsWith("flow_")) {
        const publishResponse = await api.post(`/api/automation_flows/${currentFlowId}/publish`);
        if (publishResponse.status === 200) {
          setSaveStatus("saved");
          toast.success("Flow published successfully!", { description: "Your automation is now live and active." });
          setTimeout(() => onBack(), 1500);
        } else throw new Error("Publish failed");
      } else throw new Error("Invalid flow ID for publishing");
    } catch (err: unknown) {
      setSaveStatus("error");
      const errorResponse = err as { response?: { data?: { message?: string; detail?: string }; status?: number } };
      let errorMessage = "Failed to publish flow";
      if (errorResponse.response?.data?.detail) errorMessage = errorResponse.response.data.detail;
      else if (errorResponse.response?.data?.message) errorMessage = errorResponse.response.data.message;
      else if (errorResponse.response?.status === 400) errorMessage = "Flow validation failed. Make sure you have at least one trigger configured.";
      toast.error(errorMessage);
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  // ─── THE ONLY REAL CHANGE FROM YOUR ORIGINAL ─────────────────────────────
  // When user selects a trigger from TriggerSelectionModal:
  // - If it's "trigger_whatsapp_message" → switch to WaBotEditor
  // - Everything else → add the node normally (unchanged behaviour)
  const handleSelectTrigger = (stepId: string) => {
    if (stepId === "trigger_whatsapp_message" && onSwitchToWaBot) {
      // Close the modal and hand off to WaBotEditor
      setShowTriggerModal(false);
      onSwitchToWaBot();
      return;
    }
    // All other triggers: existing behaviour unchanged
    addNodeByStepId(stepId);
    setShowTriggerModal(false);
  };

  if (loadingFlow) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 overflow-hidden relative font-sans">
      {/* Top Bar */}
      <div className="h-14 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 flex items-center justify-between px-5 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-slate-500">Automations</span>
            <span className="text-slate-300">›</span>
            <input value={flowName} onChange={(e) => setFlowName(e.target.value)}
              className="text-slate-900 font-medium bg-transparent border-none outline-none focus:ring-0 w-36 px-1" placeholder="Untitled" />
            <Pencil className="w-3 h-3 text-slate-400" />
          </div>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">DRAFT</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {saveStatus === "saved" ? (
              <span className="text-[13px] font-medium text-emerald-600 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Saved
              </span>
            ) : saveStatus === "saving" ? (
              <span className="text-[13px] font-medium text-slate-600 flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving
              </span>
            ) : (
              <button onClick={handleSave}
                className="text-[13px] text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-50 transition-all">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            )}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-all" title="Undo" disabled>
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-slate-200" />
              <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-all" title="Redo" disabled>
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <button onClick={handlePublish} disabled={saveStatus === "saving" || nodes.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-slate-800 text-white rounded-lg text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md">
              {saveStatus === "saving" ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing</>
              ) : (
                <><Play className="w-3.5 h-3.5" /> Set Live</>
              )}
            </button>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR */}
        <aside
          className={`h-full bg-white border-r border-slate-200/60 shadow-sm transition-all duration-200 flex-shrink-0 ${sidebarOpen ? "w-60" : "w-0"}`}
          style={{ overflow: sidebarOpen ? "visible" : "hidden" }}
        >
          <div className="w-60 h-full flex flex-col">
            <div className="px-4 py-3.5 border-b border-slate-200/60 bg-slate-50/50 flex-shrink-0">
              <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Add Step</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Click to add to canvas</p>
            </div>
            <div className="flex-1 overflow-y-auto py-3 bg-white">
              {STEP_SECTIONS.map((section) => (
                <div key={section.title} className="mb-5">
                  <h4 className="px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{section.title}</h4>
                  <div className="space-y-0.5">
                    {section.steps.map((step) => (
                      <button key={step.id} type="button" onClick={() => addNodeByStepId(step.id)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50 transition-all group border-l-2 border-transparent hover:border-slate-900">
                        <div className={`p-1.5 rounded-lg ${step.bgColor} group-hover:shadow-sm transition-shadow`}>
                          <StepIcon step={step} size="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-slate-900 truncate group-hover:text-slate-700">{step.label}</p>
                          <p className="text-[11px] text-slate-500 truncate">{step.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* SETTINGS SIDEBAR */}
        <div
          className={`absolute top-0 bottom-0 w-80 bg-white border-r border-slate-200/60 transition-all duration-200 shadow-xl ${selectedNodeId ? "z-30" : "z-10"} ${sidebarOpen ? "left-60" : "left-0"} ${selectedNodeId ? "translate-x-0" : "-translate-x-full"}`}
        >
          <SidebarSettings
            node={nodes.find((n) => n.id === selectedNodeId)}
            onClose={() => setSelectedNodeId(null)}
            onUpdateNode={(nodeId, dataPartial) => {
              setNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...dataPartial } } : n));
            }}
          />
        </div>

        {/* CANVAS */}
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="flex-1 h-full outline-none relative overflow-hidden select-none canvas-container bg-white"
          style={{ backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        >
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Zap className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-700 text-[15px] font-medium mb-2">Start building your automation</p>
                <p className="text-slate-500 text-[13px] mb-6 leading-relaxed">
                  A trigger is an event that starts your automation.<br />Click below to add your first trigger.
                </p>
                <button type="button" onClick={() => setShowTriggerModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-slate-300 rounded-lg bg-white text-slate-700 font-medium text-[13px] hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm hover:shadow">
                  <Plus className="w-4 h-4" />
                  Add Trigger
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="absolute inset-0 pointer-events-none transition-transform duration-75 ease-out origin-top-left"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              >
                <svg className="absolute inset-0 w-[10000px] h-[10000px]">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                    </marker>
                  </defs>
                  {connections.map((conn, idx) => {
                    const fromNode = nodes.find((n) => n.id === conn.from);
                    const toNode = nodes.find((n) => n.id === conn.to);
                    if (!fromNode || !toNode) return null;
                    return (
                      <path key={idx} d={getBezierPath(fromNode, toNode)} stroke="#94a3b8" strokeWidth="2" fill="none" markerEnd="url(#arrow)" className="transition-all" />
                    );
                  })}
                </svg>
                {nodes.map((node) => (
                  <FlowStep
                    key={node.id}
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    onMouseDown={(e) => startDrag(e, node.id)}
                    onAddLink={(e) => { e.stopPropagation(); setActivePortId(node.id); setShowAddMenu(true); }}
                    onDelete={() => {
                      setNodes((prev) => prev.filter((n) => n.id !== node.id));
                      setConnections((prev) => prev.filter((c) => c.from !== node.id && c.to !== node.id));
                      setSelectedNodeId(null);
                    }}
                  />
                ))}
              </div>

              <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50/95 backdrop-blur-sm border border-amber-200/60 rounded-lg shadow-sm">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[11px] font-medium text-amber-900">Click a step to configure it</span>
                </div>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 right-6 flex flex-col gap-3 items-center pointer-events-auto">
                <button onClick={() => { setActivePortId(null); setShowAddMenu(true); }}
                  className="w-11 h-11 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center text-xl font-light hover:bg-slate-800 hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                  +
                </button>
                <div className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
                  <button onClick={autoFit} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all" title="Fit view">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                  <div className="w-full h-px bg-slate-200" />
                  <button onClick={() => setZoom((z) => Math.min(z + 0.1, 2))} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all">
                    <span className="text-lg font-medium">+</span>
                  </button>
                  <div className="w-full h-px bg-slate-200" />
                  <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.2))} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all">
                    <span className="text-lg font-medium">−</span>
                  </button>
                </div>
                <button className="w-9 h-9 bg-slate-700 text-white rounded-xl shadow-md flex items-center justify-center hover:bg-slate-800 transition-all hover:scale-105 active:scale-95" title="Help">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {showAddMenu && (
          <AddStepMenu
            onClose={() => setShowAddMenu(false)}
            onSelectStep={addNodeByStepId}
            onSelect={() => {}}
            isFirstStep={nodes.find((n) => n.id === activePortId)?.type === "trigger"}
          />
        )}
        {showTriggerModal && (
          <TriggerSelectionModal
            onClose={() => setShowTriggerModal(false)}
            onSelectTrigger={handleSelectTrigger}
          />
        )}
      </div>
    </div>
  );
}