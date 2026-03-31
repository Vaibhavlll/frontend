/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import SidebarSettings from "./SidebarSettings";
import { AddStepMenu, TriggerSelectionModal } from "./Popups";
import { validateFlowBeforeSave, type EditorNode } from "./flowExport";
import { buildFlowDetails } from "./automationFlowSchema";
import { STEP_SECTIONS, STEP_BY_ID, StepIcon } from "./stepDefinitions";
import { useApi } from "@/lib/session_api";
import { toast } from "sonner";
import {
  Play, Save, ArrowLeft, Undo2, Redo2, MoreVertical,
  Pencil, HelpCircle, Loader2, Plus, Zap,
  ZoomIn, ZoomOut, Maximize2, CheckCircle2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

type Node = EditorNode;
interface Connection { from: string; to: string; }

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT CONSTANTS  (match WaBotEditor card anatomy)
// ─────────────────────────────────────────────────────────────────────────────

const NODE_W     = 260;
const STRIPE_H   = 3;
const HDR_H      = 72;
const BODY_H     = 80;
const NODE_H     = STRIPE_H + HDR_H + BODY_H;   // = 155

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — one entry per stepDef category/type
// ─────────────────────────────────────────────────────────────────────────────

type NodeTheme = { accent: string; bg: string; fg: string; label: string };

function getNodeTheme(node: Node): NodeTheme {
  if (node.type === "trigger") {
    const t = node.data?.triggerType || node.data?.stepId || "";
    if (t.includes("google_sheet") || t === "google_sheet")
      return { accent: "#16a34a", bg: "#f0fdf4", fg: "#166534", label: "Google Sheet" };
    if (t.includes("whatsapp_followup") || t === "whatsapp_followup")
      return { accent: "#059669", bg: "#ecfdf5", fg: "#047857", label: "WhatsApp" };
    if (t.includes("whatsapp"))
      return { accent: "#059669", bg: "#ecfdf5", fg: "#047857", label: "WhatsApp" };
    if (t.includes("story"))
      return { accent: "#7c3aed", bg: "#f5f3ff", fg: "#6d28d9", label: "Instagram" };
    // default instagram
    return { accent: "#4f46e5", bg: "#eef2ff", fg: "#4338ca", label: "Trigger" };
  }
  if (node.type === "logic") {
    if (node.data?.logicType === "delay")
      return { accent: "#d97706", bg: "#fffbeb", fg: "#92400e", label: "Smart Delay" };
    if (node.data?.logicType === "condition")
      return { accent: "#0891b2", bg: "#ecfeff", fg: "#0e7490", label: "Condition" };
    return { accent: "#f59e0b", bg: "#fffbeb", fg: "#92400e", label: "Logic" };
  }
  // action
  const sid = node.data?.stepId || "";
  if (sid.includes("whatsapp"))
    return { accent: "#059669", bg: "#ecfdf5", fg: "#047857", label: "WhatsApp" };
  if (sid.includes("instagram") || node.app === "instagram")
    return { accent: "#7c3aed", bg: "#f5f3ff", fg: "#6d28d9", label: "Instagram" };
  if (sid.includes("content_"))
    return { accent: "#7c3aed", bg: "#f5f3ff", fg: "#6d28d9", label: "Message" };
  if (sid.includes("action_"))
    return { accent: "#2563eb", bg: "#eff6ff", fg: "#1d4ed8", label: "Action" };
  return { accent: "#64748b", bg: "#f8fafc", fg: "#475569", label: "Step" };
}

// ─────────────────────────────────────────────────────────────────────────────
// BEZIER PATH  (same math as before, unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function getBezierPath(from: Node, to: Node): string {
  const isFromTrigger = from.type === "trigger";
  const startX = isFromTrigger ? from.x + NODE_W / 2 : from.x + NODE_W + 6;
  const startY = isFromTrigger ? from.y + NODE_H + 6  : from.y + NODE_H / 2;
  const endX = to.x - 6;
  const endY = to.y + 40;
  const dx = endX - startX;
  const cpOffset = Math.max(Math.abs(dx) * 0.5, 100);
  const cp1X = startX + (isFromTrigger ? 0 : cpOffset);
  const cp1Y = startY + (isFromTrigger ? cpOffset : 0);
  const cp2X = endX - cpOffset;
  const cp2Y = endY;
  return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW STEP CARD  (WaBotEditor visual language)
// ─────────────────────────────────────────────────────────────────────────────

interface FlowStepProps {
  node: Node;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAddLink: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: () => void;
}

function FlowStep({ node, isSelected, onMouseDown, onAddLink, onDelete }: FlowStepProps) {
  const th = getNodeTheme(node);
  const isTrigger = node.type === "trigger";
  const stepId = node.data?.stepId as string | undefined;
  const stepDef = stepId ? STEP_BY_ID[stepId] : null;

  // Build preview text from node data
  const previewLines: string[] = [];
  if (node.data?.text) previewLines.push(node.data.text.slice(0, 60));
  if (node.data?.triggerConfig?.keywords?.length)
    previewLines.push(`Keywords: ${(node.data.triggerConfig.keywords as string[]).join(", ")}`);
  if (node.data?.triggerConfig?.conversation_name)
    previewLines.push(`To: ${node.data.triggerConfig.conversation_name}`);
  if (node.data?.triggerConfig?.sheet_name)
    previewLines.push(`Sheet: ${node.data.triggerConfig.sheet_name}`);
  if (node.data?.delayAmount)
    previewLines.push(`Wait ${node.data.delayAmount} ${node.data.delayUnit || "minutes"}`);
  const previewText = previewLines[0] || "";

  const DOT = 14;
  const DOT_R = DOT / 2;

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: NODE_W,
        height: NODE_H,
        userSelect: "none",
      }}
    >
      {/* Input dot — left side (not for trigger) */}
      {!isTrigger && (
        <div
          style={{
            position: "absolute",
            left: -DOT,
            top: STRIPE_H + HDR_H / 2 - DOT_R,
            width: DOT,
            height: DOT,
            borderRadius: "50%",
            background: "#fff",
            border: `2.5px solid ${th.accent}`,
            cursor: "crosshair",
            zIndex: 30,
            boxShadow: `0 0 0 3px ${th.accent}22`,
            transition: "box-shadow 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = `0 0 0 6px ${th.accent}28`;
            el.style.transform = "scale(1.2)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = `0 0 0 3px ${th.accent}22`;
            el.style.transform = "scale(1)";
          }}
        />
      )}

      {/* Card body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 13,
          overflow: "hidden",
          background: "#fff",
          border: isSelected
            ? `2px solid ${th.accent}`
            : "1.5px solid #e2e8f0",
          boxShadow: isSelected
            ? `0 0 0 4px ${th.accent}18, 0 8px 32px rgba(0,0,0,0.10)`
            : "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        {/* Accent stripe */}
        <div style={{ height: STRIPE_H, background: th.accent }} />

        {/* Header */}
        <div
          style={{
            height: HDR_H,
            padding: "10px 14px 8px",
            boxSizing: "border-box",
          }}
        >
          {/* Kind badge + delete */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 8px 3px 6px",
                borderRadius: 6,
                background: th.bg,
                color: th.fg,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
              }}
            >
              {stepDef && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <StepIcon step={stepDef} size="w-[10px] h-[10px]" />
                </div>
              )}
              {th.label}
            </div>
            {isSelected && node.type !== "trigger" && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#cbd5e1",
                  padding: "2px 4px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.12s, background 0.12s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "#ef4444";
                  el.style.background = "#fef2f2";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "#cbd5e1";
                  el.style.background = "none";
                }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Node label */}
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.35,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {node.label || "Untitled Step"}
          </p>
        </div>

        {/* Preview body */}
        <div style={{ height: BODY_H, padding: "0 14px 12px", boxSizing: "border-box" }}>
          <div
            style={{
              height: "100%",
              padding: "8px 10px",
              background: "#f8fafc",
              borderRadius: 8,
              border: "1px solid #f1f5f9",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
            }}
          >
            {previewText ? (
              <p
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  lineHeight: 1.5,
                  margin: 0,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                } as any}
              >
                {previewText}
              </p>
            ) : (
              <p style={{ fontSize: 11, color: "#cbd5e1", fontStyle: "italic", margin: 0 }}>
                Click to configure…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Output dot — trigger: bottom center; action/logic: right middle */}
      {isTrigger ? (
        <button
          onClick={e => { e.stopPropagation(); onAddLink(e as any); }}
          style={{
            position: "absolute",
            left: NODE_W / 2 - DOT_R,
            top: NODE_H - DOT_R,
            width: DOT,
            height: DOT,
            borderRadius: "50%",
            background: th.accent,
            border: "2.5px solid #fff",
            cursor: "crosshair",
            zIndex: 30,
            boxShadow: `0 2px 8px ${th.accent}60`,
            transition: "transform 0.1s",
            padding: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.35)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        />
      ) : (
        <button
          onClick={e => { e.stopPropagation(); onAddLink(e as any); }}
          style={{
            position: "absolute",
            right: -DOT_R,
            top: NODE_H / 2 - DOT_R,
            width: DOT,
            height: DOT,
            borderRadius: "50%",
            background: th.accent,
            border: "2.5px solid #fff",
            cursor: "crosshair",
            zIndex: 30,
            boxShadow: `0 1px 4px ${th.accent}55`,
            transition: "transform 0.1s, box-shadow 0.1s",
            padding: 0,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "scale(1.35)";
            el.style.boxShadow = `0 2px 8px ${th.accent}80`;
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "scale(1)";
            el.style.boxShadow = `0 1px 4px ${th.accent}55`;
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface EditorViewProps {
  onBack: () => void;
  flowId?: string;
  flowName?: string;
  onFlowNameChange?: (name: string) => void;
  onFlowIdChange?: (flowId: string) => void;
  onSwitchToWaBot?: () => void;
}

export default function EditorView({
  onBack,
  flowId: flowIdProp,
  flowName: flowNameProp,
  onFlowNameChange,
  onFlowIdChange,
  onSwitchToWaBot,
}: EditorViewProps) {
  const api = useApi();

  const [flowId, setFlowId] = useState<string | null>(() => {
    if (flowIdProp && flowIdProp !== "new" && !flowIdProp.startsWith("flow_")) return flowIdProp;
    return null;
  });
  const [flowNameLocal, setFlowNameLocal] = useState("Untitled");
  const flowName = flowNameProp !== undefined ? flowNameProp : flowNameLocal;
  const setFlowName = (v: string) => { setFlowNameLocal(v); onFlowNameChange?.(v); };

  const [sidebarOpen] = useState(false);
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

  // ── Sync flowId ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (flowIdProp && flowIdProp !== "new" && !flowIdProp.startsWith("flow_")) {
      if (flowIdProp !== flowId) setFlowId(flowIdProp);
    } else if (flowIdProp === "new" && flowId) {
      setFlowId(null);
    }
  }, [flowIdProp, flowId]);

  // ── Load existing flow ─────────────────────────────────────────────────────
  useEffect(() => {
    const loadFlow = async () => {
      if (!flowIdProp || flowIdProp === "new" || flowIdProp.startsWith("flow_")) return;
      setLoadingFlow(true);
      try {
        const response = await api.get(`/api/automation_flows/${flowIdProp}`);
        if (response.status !== 200) throw new Error("Failed to load flow");

        const flowData = response.data.flow || response.data;
        const backendFlowId = flowData.flow_id || flowData._id;
        setFlowId(backendFlowId);

        const reconstructedNodes: Node[] = [];
        const reconstructedConnections: Connection[] = [];

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
            if (trigger.type === "instagram_comment")      { label = "Post or Reel Comments"; stepId = "trigger_comment"; }
            else if (trigger.type === "story_reply")       { label = "Story Reply";           stepId = "trigger_story_reply"; }
            else if (trigger.type === "instagram_message") { label = "Instagram Message";     stepId = "trigger_instagram_message"; }
            else if (trigger.type === "whatsapp_followup") { label = "Follow-Up Message";     stepId = "trigger_whatsapp_followup"; }
            else if (trigger.type === "google_sheet")      { label = "Google Sheet Row";      stepId = "trigger_google_sheet"; }

            const config = trigger.config || {};
            const keywords = config.keyword
              ? config.keyword.split("|").map((k: string) => k.trim()).filter(Boolean)
              : [];

            reconstructedNodes.push({
              id: nodeId, type: "trigger", label,
              description: "Automation trigger",
              x: uiPos.x, y: uiPos.y,
              data: {
                stepId,
                triggerType: trigger.type,
                triggerConfig: { ...config, keywords },
                triggerSubtitle:
                  trigger.type === "whatsapp_followup"
                    ? config.conversation_name ? `To: ${config.conversation_name}`
                      : config.conversation_id ? `ID: ${config.conversation_id}` : undefined
                    : trigger.type === "google_sheet"
                      ? config.sheet_name ? `Sheet: ${config.sheet_name}`
                        : config.sheet_id ? `ID: ${config.sheet_id.substring(0, 15)}...` : undefined
                      : trigger.config?.post_id
                        ? `Post: ${trigger.config.post_id.substring(0, 15)}...`
                        : keywords.length > 0 ? `Keywords: ${keywords.join(", ")}` : undefined,
              },
            });

            if (trigger.start_node_id) reconstructedConnections.push({ from: nodeId, to: trigger.start_node_id });
          });
        }

        if (flowData.flow_data?.nodes) {
          Object.entries(flowData.flow_data.nodes).forEach(([backendId, nodeData]: [string, any]) => {
            const uiPos = flowData.flow_data.ui_config?.nodes?.[backendId] || {
              x: 400 + Math.random() * 200, y: 300 + Math.random() * 200,
            };
            let nodeType: Node["type"] = "action";
            let label = nodeData.name || "Step";
            let data: Node["data"] = {};

            if (nodeData.type === "message") {
              nodeType = "action";
              const isWaFlow = flowData.flow_data?.triggers?.some(
                (t: any) => t.type === "whatsapp_followup" || t.type === "google_sheet"
              );
              if (isWaFlow && !nodeData.content?.buttons?.length && !nodeData.content?.media_url) {
                label = "WhatsApp Message";
                data = { stepId: "content_whatsapp_message", text: nodeData.config?.content?.text || nodeData.content?.text || "", contentKind: "text" };
              } else {
                label = "Send Message";
                data = { stepId: "content_text", text: nodeData.content?.text || "", media_url: nodeData.content?.media_url || null, buttons: nodeData.content?.buttons || [], contentKind: "text" };
              }
            } else if (nodeData.type === "smart_delay") {
              nodeType = "logic"; label = "Smart Delay";
              data = { stepId: "logic_delay", logicType: "delay", delayAmount: nodeData.config?.amount || 5, delayUnit: nodeData.config?.unit || "minutes" };
            } else if (nodeData.type === "condition") {
              nodeType = "logic"; label = "Condition";
              data = { stepId: "logic_condition", logicType: "condition", conditionVariable: nodeData.config?.variable || "", conditionOperator: nodeData.config?.operator || "includes", conditionValue: nodeData.config?.value || "" };
            } else if (nodeData.type === "randomizer") {
              nodeType = "logic"; label = "Randomizer";
              data = { stepId: "logic_randomizer", logicType: "randomizer" };
            } else if (nodeData.type === "action") {
              nodeType = "action";
              const actionType = nodeData.config?.action_type;
              if (actionType === "send_dm")            { label = "Send DM";           data = { stepId: "action_send_dm",       actionType: "send_dm",          text: nodeData.config?.text || "", linkUrl: nodeData.config?.link_url, buttonTitle: nodeData.config?.button_title }; }
              else if (actionType === "reply_to_comment") { label = "Reply to Comment"; data = { stepId: "action_reply_comment", actionType: "reply_to_comment", text: nodeData.config?.text || "" }; }
              else if (actionType === "add_tag")       { label = "Add Tag";           data = { stepId: "action_tag",           actionType: "add_tag",          tagName: nodeData.config?.tag_name || "" }; }
              else if (actionType === "set_field")     { label = "Set Custom Field";  data = { stepId: "action_field",         actionType: "set_field",        fieldName: nodeData.config?.field_name || "", fieldValue: nodeData.config?.field_value || "" }; }
              else if (actionType === "api")           { label = "HTTP Request";      data = { stepId: "action_api",           actionType: "api",              apiUrl: nodeData.config?.api_url || "", apiMethod: nodeData.config?.api_method || "POST", apiBody: nodeData.config?.api_body || "" }; }
            }

            reconstructedNodes.push({ id: backendId, type: nodeType, label, description: nodeData.name || "Step", x: uiPos.x, y: uiPos.y, data });
            if (nodeData.next_node_id) reconstructedConnections.push({ from: backendId, to: nodeData.next_node_id });
            if (nodeData.paths) {
              if (nodeData.paths.true)  reconstructedConnections.push({ from: backendId, to: nodeData.paths.true });
              if (nodeData.paths.false) reconstructedConnections.push({ from: backendId, to: nodeData.paths.false });
            }
          });
        }

        setNodes(reconstructedNodes);
        setConnections(reconstructedConnections);
        setTimeout(() => autoFit(), 100);
      } catch (error) {
        console.error("Error loading flow:", error);
        toast.error("Failed to load flow", { description: "Could not load the automation flow. Please try again." });
      } finally {
        setLoadingFlow(false);
      }
    };
    loadFlow();
  }, [flowIdProp, api]);

  // ── Auto-fit ───────────────────────────────────────────────────────────────
  const autoFit = () => {
    if (nodes.length === 0) return;
    const padding = 100;
    let minX = nodes[0].x, maxX = nodes[0].x + NODE_W;
    let minY = nodes[0].y, maxY = nodes[0].y + NODE_H;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x + NODE_W);
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y + NODE_H);
    });
    const contentWidth = maxX - minX, contentHeight = maxY - minY;
    const viewWidth  = canvasRef.current?.clientWidth  || window.innerWidth;
    const viewHeight = canvasRef.current?.clientHeight || window.innerHeight;
    const newZoom = Math.max(0.4, Math.min(1.2, Math.min(
      (viewWidth  - padding * 2) / contentWidth,
      (viewHeight - padding * 2) / contentHeight,
    )));
    setZoom(newZoom);
    setPan({
      x: viewWidth  / 2 - (minX + contentWidth  / 2) * newZoom,
      y: viewHeight / 2 - (minY + contentHeight / 2) * newZoom,
    });
  };

  useEffect(() => {
    const lastNode = nodes[nodes.length - 1];
    if (!lastNode) return;
    const worldX = lastNode.x * zoom + pan.x;
    const worldY = lastNode.y * zoom + pan.y;
    const vw = canvasRef.current?.clientWidth  || window.innerWidth;
    const vh = canvasRef.current?.clientHeight || window.innerHeight;
    if (worldX < 0 || worldX > vw - NODE_W || worldY < 0 || worldY > vh - NODE_H) autoFit();
  }, [nodes.length]);

  // ── Canvas interaction ─────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("canvas-container")) {
      setIsPanning(true); setSelectedNodeId(null); setShowAddMenu(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) { setPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY })); return; }
    if (draggingNodeId) {
      const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top  - pan.y) / zoom - dragOffset.y;
      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x, y } : n));
    }
  };

  const handleMouseUp = () => { setIsPanning(false); setDraggingNodeId(null); };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.min(Math.max(zoom + (-e.deltaY) * 0.001, 0.2), 2);
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
    const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
    const worldMouseX = (mouseX - pan.x) / zoom, worldMouseY = (mouseY - pan.y) / zoom;
    setZoom(newZoom);
    setPan({ x: mouseX - worldMouseX * newZoom, y: mouseY - worldMouseY * newZoom });
  };

  const startDrag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id); if (!node) return;
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
    setDraggingNodeId(id); setSelectedNodeId(id);
    setDragOffset({
      x: (e.clientX - rect.left - pan.x) / zoom - node.x,
      y: (e.clientY - rect.top  - pan.y) / zoom - node.y,
    });
  };

  // ── Node CRUD ──────────────────────────────────────────────────────────────
  const addNodeByStepId = (stepId: string) => {
    const step = STEP_BY_ID[stepId]; if (!step) return;
    const lastNode = nodes[nodes.length - 1];
    const x = lastNode ? lastNode.x + 400 : 200;
    const y = lastNode ? lastNode.y : 300;
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode: Node = {
      id, type: step.type, app: step.app, label: step.label, description: step.description, x, y,
      data: {
        stepId,
        triggerType: step.triggerType,
        triggerConfig: step.triggerType ? {} : undefined,
        logicType: step.logicType as "delay" | "condition" | "randomizer" | "ai" | "actions" | undefined,
        contentKind: step.contentKind,
        actionType: step.actionType,
        delayAmount: 5,
        delayUnit: "minutes" as const,
      },
    };
    setNodes(prev => [...prev, newNode]);
    if (activePortId) { setConnections(prev => [...prev, { from: activePortId, to: id }]); setActivePortId(null); }
    setShowAddMenu(false);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const edges = connections.map(c => ({ from: c.from, to: c.to }));
    if (nodes.length > 0) {
      const validation = validateFlowBeforeSave(nodes, edges);
      if (!validation.valid) {
        toast.error("Flow validation failed", { description: validation.errors[0] ?? "Please check your flow configuration." });
        setSaveStatus("error"); setTimeout(() => setSaveStatus("idle"), 2000); return;
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
      const errorMessage = errorResponse.response?.data?.detail || errorResponse.response?.data?.message || "Failed to save flow";
      toast.error(errorMessage);
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  // ── Publish ────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    const edges = connections.map(c => ({ from: c.from, to: c.to }));
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
      if (errorResponse.response?.data?.detail)        errorMessage = errorResponse.response.data.detail;
      else if (errorResponse.response?.data?.message)  errorMessage = errorResponse.response.data.message;
      else if (errorResponse.response?.status === 400) errorMessage = "Flow validation failed. Make sure you have at least one trigger configured.";
      toast.error(errorMessage);
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleSelectTrigger = (stepId: string) => {
    if (stepId === "trigger_whatsapp_message" && onSwitchToWaBot) {
      setShowTriggerModal(false);
      onSwitchToWaBot();
      return;
    }
    addNodeByStepId(stepId);
    setShowTriggerModal(false);
  };

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loadingFlow) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "2.5px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Loading flow…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: "100%", width: "100%", display: "flex", flexDirection: "column",
      overflow: "hidden", background: "#f1f5f9",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        height: 52, flexShrink: 0, background: "#fff",
        borderBottom: "1.5px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", gap: 12,
      }}>
        {/* Left group */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button
            onClick={onBack}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1.5px solid #e2e8f0", background: "#fff",
              cursor: "pointer", color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.12s",
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#f8fafc"; el.style.color = "#0f172a"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fff";    el.style.color = "#64748b"; }}
          >
            <ArrowLeft size={15} />
          </button>

          <div style={{ width: 1, height: 18, background: "#e2e8f0", flexShrink: 0 }} />

          <input
            value={flowName}
            onChange={e => setFlowName(e.target.value)}
            style={{
              fontSize: 14, fontWeight: 700, color: "#0f172a",
              background: "transparent", border: "none", outline: "none",
              minWidth: 0, width: 190,
            }}
            placeholder="Flow name…"
          />
        </div>

        {/* Right group */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Undo / Redo */}
          <div style={{
            display: "flex", alignItems: "center",
            border: "1.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden",
          }}>
            {[
              { icon: <Undo2 size={13} />, title: "Undo"  },
              { icon: <Redo2 size={13} />, title: "Redo"  },
            ].map((b, i) => (
              <React.Fragment key={b.title}>
                {i > 0 && <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />}
                <button
                  disabled
                  title={b.title}
                  style={{
                    width: 34, height: 34,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "transparent", border: "none",
                    cursor: "not-allowed", color: "#cbd5e1",
                  }}
                >
                  {b.icon}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />

          {/* Save status */}
          {saveStatus === "saving" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
              <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />Saving…
            </span>
          ) : saveStatus === "saved" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#059669", fontWeight: 600 }}>
              <CheckCircle2 size={14} />Saved
            </span>
          ) : (
            <button
              onClick={handleSave}
              style={{
                display: "flex", alignItems: "center", gap: 6, height: 34,
                padding: "0 14px", borderRadius: 8,
                border: "1.5px solid #e2e8f0", background: "#fff",
                fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
            >
              <Save size={13} /> Save
            </button>
          )}

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={saveStatus === "saving" || nodes.length === 0}
            style={{
              display: "flex", alignItems: "center", gap: 6, height: 34,
              padding: "0 16px", borderRadius: 8,
              background: "#16a34a", color: "#fff", border: "none",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: (saveStatus === "saving" || nodes.length === 0) ? 0.6 : 1,
              transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (saveStatus !== "saving" && nodes.length > 0) (e.currentTarget as HTMLElement).style.background = "#15803d"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#16a34a"; }}
          >
            {saveStatus === "saving"
              ? <><Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />Publishing…</>
              : <><Play size={12} />Publish</>
            }
          </button>

          <button
            style={{
              width: 34, height: 34, borderRadius: 8,
              border: "1.5px solid #e2e8f0", background: "#fff",
              cursor: "pointer", color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Settings sidebar (slide-in from left, same logic as before) */}
        <div
          style={{
            position: "absolute", top: 0, bottom: 0, width: 320,
            background: "#fff", borderRight: "1.5px solid #e2e8f0",
            transition: "transform 0.2s", zIndex: 30,
            transform: selectedNodeId ? "translateX(0)" : "translateX(-100%)",
            boxShadow: selectedNodeId ? "4px 0 24px rgba(0,0,0,0.08)" : "none",
          }}
        >
          <SidebarSettings
            node={nodes.find(n => n.id === selectedNodeId)}
            onClose={() => setSelectedNodeId(null)}
            onUpdateNode={(nodeId, dataPartial) => {
              setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...dataPartial } } : n));
            }}
          />
        </div>

        {/* ── CANVAS ── */}
        <div
          ref={canvasRef}
          className="canvas-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          style={{
            flex: 1, height: "100%", position: "relative", overflow: "hidden",
            backgroundImage: "radial-gradient(circle, #c8d4e0 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
            backgroundPosition: `${((pan.x % 24) + 24) % 24}px ${((pan.y % 24) + 24) % 24}px`,
            cursor: isPanning ? "grabbing" : "default",
          }}
        >
          {/* Empty state */}
          {nodes.length === 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", maxWidth: 400 }}>
                <div style={{
                  width: 64, height: 64, background: "#fff",
                  borderRadius: 16, border: "1.5px solid #e2e8f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
                }}>
                  <Zap size={28} color="#94a3b8" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: "0 0 8px" }}>
                  Start building your automation
                </p>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: "0 0 24px" }}>
                  A trigger is an event that starts your automation.<br />
                  Click below to add your first trigger.
                </p>
                <button
                  onClick={() => setShowTriggerModal(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 20px",
                    border: "2px dashed #e2e8f0", borderRadius: 10,
                    background: "#fff", color: "#374151",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#4f46e5"; el.style.color = "#4f46e5"; el.style.background = "#eef2ff"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#e2e8f0"; el.style.color = "#374151"; el.style.background = "#fff"; }}
                >
                  <Plus size={14} /> Add Trigger
                </button>
              </div>
            </div>
          )}

          {/* Transformed canvas content */}
          {nodes.length > 0 && (
            <div
              style={{
                position: "absolute", inset: 0,
                transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                pointerEvents: "none",
              }}
            >
              {/* SVG connections */}
              <svg style={{ position: "absolute", inset: 0, width: "10000px", height: "10000px", overflow: "visible", zIndex: 1 }}>
                <defs>
                  <marker id="editor-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                  </marker>
                </defs>
                {connections.map((conn, idx) => {
                  const fromNode = nodes.find(n => n.id === conn.from);
                  const toNode   = nodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;
                  return (
                    <path
                      key={idx}
                      d={getBezierPath(fromNode, toNode)}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#editor-arrow)"
                      opacity={0.85}
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
                {nodes.map(node => (
                  <div key={node.id} style={{ pointerEvents: "all" }}>
                    <FlowStep
                      node={node}
                      isSelected={selectedNodeId === node.id}
                      onMouseDown={e => {
                        startDrag(e, node.id);
                        setSelectedNodeId(node.id);
                      }}
                      onAddLink={e => {
                        e.stopPropagation();
                        setActivePortId(node.id);
                        setShowAddMenu(true);
                      }}
                      onDelete={() => {
                        setNodes(prev => prev.filter(n => n.id !== node.id));
                        setConnections(prev => prev.filter(c => c.from !== node.id && c.to !== node.id));
                        setSelectedNodeId(null);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hint banner */}
          {nodes.length > 0 && (
            <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 10 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 16px",
                background: "rgba(255,251,235,0.97)",
                backdropFilter: "blur(4px)",
                border: "1.5px solid #fde68a",
                borderRadius: 10,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                whiteSpace: "nowrap",
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#92400e" }}>Click a step to configure it</span>
              </div>
            </div>
          )}

          {/* Right-side controls */}
          <div style={{
            position: "absolute", top: "50%", right: 20,
            transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            zIndex: 20,
          }}>
            {/* Add step */}
            <button
              onClick={() => { setActivePortId(null); setShowAddMenu(true); }}
              style={{
                width: 42, height: 42, borderRadius: 12,
                background: "#0f172a", color: "#fff", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 22, fontWeight: 300,
                boxShadow: "0 4px 16px rgba(15,23,42,0.25)",
                transition: "all 0.12s",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#1e293b"; el.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0f172a"; el.style.transform = "scale(1)"; }}
            >
              +
            </button>

            {/* Zoom cluster */}
            <div style={{
              background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
              overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              display: "flex", flexDirection: "column",
            }}>
              {[
                { icon: <ZoomIn  size={14} />, fn: () => setZoom(z => Math.min(z + 0.1, 2)),  title: "Zoom in"  },
                { icon: <span style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b", fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>, fn: null, title: "Zoom level" },
                { icon: <ZoomOut size={14} />, fn: () => setZoom(z => Math.max(z - 0.1, 0.2)), title: "Zoom out" },
                { icon: <Maximize2 size={13} />, fn: autoFit, title: "Fit view" },
              ].map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{ height: 1, background: "#f1f5f9" }} />}
                  <button
                    onClick={b.fn ?? undefined}
                    disabled={!b.fn}
                    title={b.title}
                    style={{
                      width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "transparent", border: "none",
                      cursor: b.fn ? "pointer" : "default", color: "#64748b",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { if (b.fn) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {b.icon}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Help */}
            <button
              title="Help"
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "#475569", color: "#fff", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#334155"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#475569"; }}
            >
              <HelpCircle size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals / menus (unchanged logic) */}
      {showAddMenu && (
        <AddStepMenu
          onClose={() => setShowAddMenu(false)}
          onSelectStep={addNodeByStepId}
          onSelect={() => {}}
          isFirstStep={nodes.find(n => n.id === activePortId)?.type === "trigger"}
        />
      )}
      {showTriggerModal && (
        <TriggerSelectionModal
          onClose={() => setShowTriggerModal(false)}
          onSelectTrigger={handleSelectTrigger}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
