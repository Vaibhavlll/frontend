// ─────────────────────────────────────────────────────────────────────────────
// wa-bot-editor.tsx  (main file)
// NodeCard + WaBotEditor — canvas interaction, state, save/load
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  ArrowLeft, Save, Loader2, Plus, X,
  List, MousePointer2, ZoomIn, ZoomOut, Maximize2,
  CheckCircle2, ExternalLink, Play, Code,
} from "lucide-react";
import { useApi } from "@/lib/session_api";
import { toast } from "sonner";
import type { NodeKind, CNode, CEdge } from "./types";
import {
  NW, STRIPE_H, HDR_H, PRE_H, NH_BASE, HDL_BORDER, HDL_PAD,
  CHIP_H, CHIP_GAP, DOT_D, DOT_R,
  chipDotY, nodeH, getHandles, outPos, inPos, makePath,
  TH, KIND_ICON, buildSchema, uid,
} from "./wa-bot-constants";
import { RightPanel, AddMenu, JsonPreviewModal } from "./wa-bot-panels";

// ─────────────────────────────────────────────────────────────────────────────
// NODE CARD
// ─────────────────────────────────────────────────────────────────────────────

function NodeCard({
  node, selected, onMouseDown, onSelect, onHandleDown, onInputUp,
}: {
  node: CNode; selected: boolean;
  onMouseDown(e: React.MouseEvent): void;
  onSelect(): void;
  onHandleDown(nodeId: string, handleId: string, e: React.MouseEvent): void;
  onInputUp(nodeId: string): void;
}) {
  const th = TH[node.kind];
  const hlist = getHandles(node);
  const body = node.kind === "welcome" ? node.welcomeBodyText : node.body_text;
  const hdr  = node.kind === "welcome" ? node.welcomeHeader   : node.header;
  const h = nodeH(node);
  const previewText = body?.split("\n").map(l => l.replace(/\*/g, "").replace(/_/g, "").trim()).filter(l => l).join(" ") || "";

  return (
    <div
      onMouseDown={e => { onMouseDown(e); onSelect(); }}
      style={{ position: "absolute", left: node.x, top: node.y, width: NW, height: h, userSelect: "none" }}
    >
      {node.kind !== "trigger" && (
        <div
          onMouseUp={e => { e.stopPropagation(); onInputUp(node.id); }}
          style={{
            position: "absolute", left: -DOT_D, top: STRIPE_H + HDR_H / 2 - DOT_R,
            width: DOT_D, height: DOT_D, borderRadius: "50%", background: "#fff",
            border: `2.5px solid ${th.accent}`, cursor: "crosshair", zIndex: 30,
            boxShadow: `0 0 0 3px ${th.accent}22`, transition: "box-shadow 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 0 0 6px ${th.accent}28`; el.style.transform = "scale(1.2)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 0 0 3px ${th.accent}22`; el.style.transform = "scale(1)"; }}
        />
      )}

      <div style={{
        position: "absolute", inset: 0, borderRadius: 13, overflow: "hidden", background: "#fff",
        border: selected ? `2px solid ${th.accent}` : "1.5px solid #e2e8f0",
        boxShadow: selected
          ? `0 0 0 4px ${th.accent}18, 0 8px 32px rgba(0,0,0,0.10)`
          : "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}>
        <div style={{ height: STRIPE_H, background: th.accent }} />
        <div style={{ height: HDR_H, padding: "10px 14px 8px", boxSizing: "border-box" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 8px 3px 6px", borderRadius: 6, marginBottom: 8,
            background: th.bg, color: th.fg, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.07em", textTransform: "uppercase",
          }}>
            {KIND_ICON[node.kind]}{th.label}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0,
            lineHeight: 1.35, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {node.kind === "trigger"
              ? (node.trigger_messages ? `Keys: ${node.trigger_messages}` : "Set trigger keywords…")
              : (previewText.slice(0, 48) || "Click to configure…")}
          </p>
        </div>
        <div style={{ height: PRE_H, padding: "0 14px 12px", boxSizing: "border-box" }}>
          {node.kind === "trigger" ? (
            <div style={{ height: "100%", padding: "8px 10px", background: "#f8fafc",
              borderRadius: 8, border: "1px solid #f1f5f9", display: "flex", alignItems: "center" }}>
              <code style={{ fontSize: 12, color: th.accent, fontWeight: 600, wordBreak: "break-all" }}>
                {node.trigger_messages || "hi, hey, hello, menu"}
              </code>
            </div>
          ) : (
            <div style={{ height: "100%", padding: "8px 10px", background: "#f8fafc",
              borderRadius: 8, border: "1px solid #f1f5f9", overflow: "hidden" }}>
              {hdr?.type === "image" && hdr.image?.link && (
                <div style={{ borderRadius: 5, overflow: "hidden", height: 34, marginBottom: 6 }}>
                  <img src={hdr.image.link} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              {hdr?.type === "video" && (
                <div style={{ height: 34, marginBottom: 6, borderRadius: 5, background: "#0f172a",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <Play size={9} color="#94a3b8" />
                  <span style={{ fontSize: 10, color: "#64748b" }}>Video</span>
                </div>
              )}
              <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, margin: 0,
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as any}>
                {previewText || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>No body text yet…</span>}
              </p>
              {node.kind === "cta_url" && (
                <div style={{ marginTop: 5, paddingTop: 5, borderTop: "1px solid #f1f5f9",
                  display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <ExternalLink size={9} color={th.accent} />
                  <span style={{ fontSize: 10, color: th.accent, fontWeight: 600 }}>{node.cta_label || "Open Link"}</span>
                </div>
              )}
              {node.kind === "list_msg" && (
                <div style={{ marginTop: 5, paddingTop: 5, borderTop: "1px solid #f1f5f9",
                  display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <List size={9} color={th.accent} />
                  <span style={{ fontSize: 10, color: th.accent, fontWeight: 600 }}>{node.button_text || "Select option"}</span>
                </div>
              )}
            </div>
          )}
        </div>
        {hlist.length > 0 && (
          <div style={{ borderTop: `${HDL_BORDER}px solid #f1f5f9`,
            padding: `${HDL_PAD}px 14px`, display: "flex", flexDirection: "column", gap: CHIP_GAP }}>
            {hlist.map((hd, idx) => (
              <div key={hd.id || idx} style={{
                height: CHIP_H, display: "flex", alignItems: "center",
                paddingLeft: 10, paddingRight: 32,
                background: "#f8fafc", border: "1px solid #e8edf2", borderRadius: 8, boxSizing: "border-box",
              }}>
                {node.kind === "list_msg"
                  ? <List size={10} color={th.accent} style={{ flexShrink: 0, marginRight: 7 }} />
                  : <MousePointer2 size={10} color={th.accent} style={{ flexShrink: 0, marginRight: 7 }} />}
                <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#374151",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hd.label}</span>
                {hd.targetId && (
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: "#94a3b8",
                    flexShrink: 0, maxWidth: 52, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {hd.targetId}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {hlist.map((hd, idx) => (
        <div key={`dot-out-${hd.id || idx}`}
          onMouseDown={e => { e.stopPropagation(); onHandleDown(node.id, hd.id, e); }}
          style={{
            position: "absolute", left: NW - DOT_R, top: chipDotY(idx) - DOT_R,
            width: DOT_D, height: DOT_D, borderRadius: "50%", background: th.accent,
            border: "2.5px solid #fff", cursor: "crosshair", zIndex: 30,
            boxShadow: `0 1px 4px ${th.accent}55`, transition: "transform 0.1s, box-shadow 0.1s",
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "scale(1.35)"; el.style.boxShadow = `0 2px 8px ${th.accent}80`; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "scale(1)"; el.style.boxShadow = `0 1px 4px ${th.accent}55`; }}
        />
      ))}

      {node.kind === "trigger" && (
        <div
          onMouseDown={e => { e.stopPropagation(); onHandleDown(node.id, "__out__", e); }}
          style={{
            position: "absolute", left: NW / 2 - DOT_R, top: nodeH(node) - DOT_R,
            width: DOT_D, height: DOT_D, borderRadius: "50%", background: th.accent,
            border: "2.5px solid #fff", cursor: "crosshair", zIndex: 30,
            boxShadow: `0 2px 8px ${th.accent}60`, transition: "transform 0.1s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.35)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EDITOR
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onBack(): void;
  flowId?: string;
  flowName?: string;
  onFlowNameChange?(n: string): void;
  onFlowIdChange?(id: string): void;
}

export default function WaBotEditor({
  onBack,
  flowId: fIdProp,
  flowName: fNameProp,
  onFlowNameChange,
  onFlowIdChange,
}: Props) {
  const api = useApi();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [nodes,       setNodes]       = useState<CNode[]>([
    { id: "trigger", kind: "trigger", x: 80, y: 220, trigger_messages: "hi,hey,hello,menu" },
  ]);
  const [edges,       setEdges]       = useState<CEdge[]>([]);
  const [selId,       setSelId]       = useState<string | null>(null);
  const [pan,         setPan]         = useState({ x: 0, y: 0 });
  const [zoom,        setZoom]        = useState(0.9);
  const [isPanning,   setIsPanning]   = useState(false);
  const [dragId,      setDragId]      = useState<string | null>(null);
  const [dragOff,     setDragOff]     = useState({ x: 0, y: 0 });
  const [liveDrag,    setLiveDrag]    = useState<{ srcId: string; handleId: string; cx: number; cy: number } | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [saveStatus,  setSave]        = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loading,     setLoading]     = useState(false);
  const [flowId,      setFlowId]      = useState<string | null>(fIdProp && fIdProp !== "new" ? fIdProp : null);
  const [nameLocal,   setNameLocal]   = useState(fNameProp || "Untitled Bot Flow");
  const flowName = fNameProp || nameLocal;
  const setFlowName = (v: string) => { setNameLocal(v); onFlowNameChange?.(v); };

  // ── LOAD EXISTING FLOW ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!fIdProp || fIdProp === "new") return;
    setLoading(true);
    api.get(`/api/wa_bot_flows/${fIdProp}`)
      .then(res => {
        const raw  = res.data?.flow || res.data;
        const data: any = raw?.flow_data || raw;
        if (!data) return;

        const ui: Record<string, { x: number; y: number }> = data.ui_config?.nodes || {};
        const hasSavedPos = Object.keys(ui).length > 0;
        const rawNodes: Record<string, any> = data.nodes || {};

        const savedEdges: CEdge[] | null = data.ui_config?.edges?.length
          ? data.ui_config.edges : null;

        // ── DEDUP GUARD ────────────────────────────────────────────────────
        // buildSchema writes each canvas node under ALL schema keys that route
        // to it (e.g. both "parent" and "student" keys when two welcome buttons
        // point to the same canvas node).  On reload rawNodes contains every
        // key, so without this guard each key would spawn a separate canvas
        // node — producing the phantom duplicates visible in the screenshots.
        //
        // A schema key is a REAL canvas node if it is:
        //   (a) referenced as srcId or tgtId in the saved edges, OR
        //   (b) has a saved position in ui_config.nodes (covers intentional
        //       orphan nodes that have no edges yet)
        //
        // Any rawNodes key that fails both tests was written purely for webhook
        // routing (the multi-key duplicate) and must be skipped.
        const referencedIds = savedEdges
          ? new Set(savedEdges.flatMap(e => [e.srcId, e.tgtId]))
          : null; // legacy path — no dedup possible, accepted limitation

        const isRealCanvasNode = (nid: string): boolean => {
          if (!savedEdges) return true; // legacy: trust rawNodes as-is
          return referencedIds!.has(nid) || Boolean(ui[nid]);
        };
        // ──────────────────────────────────────────────────────────────────

        const lN: CNode[] = [];
        const lE: CEdge[] = [];

        lN.push({ id: "trigger", kind: "trigger", x: 0, y: 0, trigger_messages: data.trigger_messages || "" });

        const wmRaw = data.welcome_message;
        let wmInteractive: any = null;
        if (wmRaw?.type === "interactive")  wmInteractive = wmRaw.interactive;
        else if (wmRaw?.interactive)        wmInteractive = wmRaw.interactive;
        else if (rawNodes["welcome"]?.type === "button") {
          const wn = rawNodes["welcome"];
          wmInteractive = { type: "button", header: wn.header, body_text: wn.body_text, buttons: wn.buttons || [] };
        }

        if (wmInteractive) {
          const cleanBtns = (wmInteractive.buttons || []).filter((b: any) => b?.reply?.id && b?.reply?.title);
          lN.push({
            id: "welcome", kind: "welcome", x: 0, y: 0,
            welcomeHeader: wmInteractive.header, welcomeBodyText: wmInteractive.body_text || "", welcomeButtons: cleanBtns,
          });
          if (!savedEdges) {
            lE.push({ srcId: "trigger", handleId: "__out__", tgtId: "welcome" });
            cleanBtns.forEach((b: any, idx: number) => {
              if (rawNodes[b.reply.id]) lE.push({ srcId: "welcome", handleId: `btn_${idx}`, tgtId: b.reply.id });
            });
          }
        }

        for (const [nid, nd] of Object.entries(rawNodes)) {
          if (nid === "welcome") continue;

          // Skip multi-key duplicates — not real canvas nodes.
          if (!isRealCanvasNode(nid)) continue;

          if (nd.type === "button") {
            const cleanBtns = (nd.buttons || []).filter((b: any) => b?.reply?.id && b?.reply?.title);
            lN.push({ id: nid, kind: "button_msg", x: 0, y: 0, body_text: nd.body_text, header: nd.header, buttons: cleanBtns });
            if (!savedEdges)
              cleanBtns.forEach((b: any, idx: number) => {
                if (rawNodes[b.reply.id]) lE.push({ srcId: nid, handleId: `btn_${idx}`, tgtId: b.reply.id });
              });
          } else if (nd.type === "list") {
            lN.push({ id: nid, kind: "list_msg", x: 0, y: 0, body_text: nd.body_text, button_text: nd.button_text, sections: nd.sections || [] });
            if (!savedEdges)
              for (const [si, sec] of (nd.sections || []).entries())
                for (const [ri, r] of (sec.rows || []).entries())
                  if (r.id && rawNodes[r.id]) lE.push({ srcId: nid, handleId: `row_${si}_${ri}`, tgtId: r.id });
          } else if (nd.type === "cta_url") {
            lN.push({ id: nid, kind: "cta_url", x: 0, y: 0, body_text: nd.body_text, cta_label: nd.button_text, url: nd.url });
          }
        }

        if (savedEdges) {
          const nodeIds = new Set(lN.map(n => n.id));
          for (const e of savedEdges)
            if (nodeIds.has(e.srcId) && nodeIds.has(e.tgtId)) lE.push(e);
        }

        if (hasSavedPos) {
          for (const n of lN) if (ui[n.id]) { n.x = ui[n.id].x; n.y = ui[n.id].y; }
          lN.filter(n => n.x === 0 && n.y === 0 && !ui[n.id])
            .forEach((n, i) => { n.x = 80 + (Object.keys(ui).length + i) * 420; n.y = 160 + i * 240; });
        } else {
          const COL_W = 420;
          const colMap: Record<string, number> = { trigger: 0 };
          const q = ["trigger"]; const visited = new Set(["trigger"]);
          while (q.length) {
            const cur = q.shift()!;
            for (const e of lE.filter(e => e.srcId === cur))
              if (!visited.has(e.tgtId)) { visited.add(e.tgtId); colMap[e.tgtId] = colMap[cur] + 1; q.push(e.tgtId); }
          }
          let orphanCol = Math.max(0, ...Object.values(colMap)) + 1;
          for (const n of lN) if (colMap[n.id] === undefined) colMap[n.id] = orphanCol++;
          const colGroups: Record<number, string[]> = {};
          for (const n of lN) { const c = colMap[n.id]; if (!colGroups[c]) colGroups[c] = []; colGroups[c].push(n.id); }
          const nMap = Object.fromEntries(lN.map(n => [n.id, n]));
          for (const [colStr, ids] of Object.entries(colGroups)) {
            const col = Number(colStr);
            const GAP = 24;
            const heights = ids.map(id => nodeH(nMap[id]) + GAP);
            const totalH = heights.reduce((a, b) => a + b, 0);
            let y = Math.max(60, 420 - totalH / 2);
            for (let i = 0; i < ids.length; i++) { nMap[ids[i]].x = 80 + col * COL_W; nMap[ids[i]].y = y; y += heights[i]; }
          }
        }

        setNodes(lN); setEdges(lE);
        setFlowName(raw?.name || fNameProp || "Untitled Bot Flow");
        setFlowId(raw?.flow_id || raw?._id || fIdProp || null);
        setTimeout(() => fitViewFor(lN), 180);
      })
      .catch(err => { console.error("Load error:", err); toast.error("Failed to load flow"); })
      .finally(() => setLoading(false));
  }, [fIdProp]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SAVE / PUBLISH ──────────────────────────────────────────────────────────

  const handleSave = useCallback(async (publish = false) => {
    setSave("saving");
    const { schema, canvasToPrimaryKey } = buildSchema(nodes, edges, flowName);
    const ui: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) ui[canvasToPrimaryKey[n.id] || n.id] = { x: n.x, y: n.y };
    try {
      const payload = {
        flow_type:    "wabot",
        trigger_type: "whatsapp_message_received",
        ...schema,
        name:   flowName,
        status: publish ? "active" : "draft",
        ui_config: {
          nodes: ui,
          edges: edges.map(e => ({
            srcId:    canvasToPrimaryKey[e.srcId]    || e.srcId,
            handleId: e.handleId,
            tgtId:    canvasToPrimaryKey[e.tgtId]    || e.tgtId,
          })),
        },
      };
      const isEx = flowId && flowId !== "new";
      const res = isEx
        ? await api.patch(`/api/wa_bot_flows/${flowId}`, payload)
        : await api.post("/api/wa_bot_flows", payload);
      const saved = res.data?.flow || res.data;
      const sid = saved?.flow_id || saved?._id;
      if (sid && !isEx) { setFlowId(sid); onFlowIdChange?.(sid); }
      setSave("saved");
      toast.success(publish ? "Flow published and live!" : "Flow saved");
      if (publish) setTimeout(onBack, 1200);
    } catch (err: any) {
      setSave("error");
      toast.error(err?.response?.data?.detail || "Save failed");
    } finally {
      setTimeout(() => setSave("idle"), 3000);
    }
  }, [nodes, edges, flowName, flowId, api, onBack, onFlowIdChange]);

  // ── CANVAS INTERACTION ──────────────────────────────────────────────────────

  const onCanvasMD = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.canvas) { setIsPanning(true); setSelId(null); }
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) { setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY })); return; }
    if (dragId) {
      const r = canvasRef.current?.getBoundingClientRect(); if (!r) return;
      setNodes(ns => ns.map(n => n.id === dragId
        ? { ...n, x: (e.clientX - r.left - pan.x) / zoom - dragOff.x, y: (e.clientY - r.top - pan.y) / zoom - dragOff.y }
        : n));
      return;
    }
    if (liveDrag) setLiveDrag(d => d ? { ...d, cx: e.clientX, cy: e.clientY } : null);
  }, [isPanning, dragId, dragOff, pan, zoom, liveDrag]);

  const endInteraction = useCallback(() => {
    setIsPanning(false);
    setDragId(null);
    setLiveDrag(null);
  }, []);
  const onMouseUp = () => {
    endInteraction();
  };
  
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const r = canvasRef.current?.getBoundingClientRect(); if (!r) return;
    const nz = Math.min(Math.max(zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.18), 2.5);
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    setZoom(nz); setPan({ x: mx - (mx - pan.x) / zoom * nz, y: my - (my - pan.y) / zoom * nz });
  }, [zoom, pan]);

  const startDrag = (e: React.MouseEvent, id: string) => {
    const n = nodes.find(n => n.id === id); if (!n) return;
    const r = canvasRef.current?.getBoundingClientRect(); if (!r) return;
    e.stopPropagation();
    setDragId(id);
    setDragOff({ x: (e.clientX - r.left - pan.x) / zoom - n.x, y: (e.clientY - r.top - pan.y) / zoom - n.y });
  };

  const onHandleDown = (nid: string, hid: string, e: React.MouseEvent) =>
    setLiveDrag({ srcId: nid, handleId: hid, cx: e.clientX, cy: e.clientY });

  const onInputUp = (tgtId: string) => {
    if (!liveDrag || liveDrag.srcId === tgtId) return;
    const { srcId, handleId } = liveDrag;
    setEdges(es => {
      const filtered = es.filter(e => !(e.srcId === srcId && e.handleId === handleId));
      return [...filtered, { srcId, handleId, tgtId }];
    });
    setLiveDrag(null);
  };

  // ── NODE CRUD ──────────────────────────────────────────────────────────────

  const addNode = (kind: NodeKind) => {
    const id = kind === "welcome" ? "welcome"
      : kind === "button_msg" ? uid("btn")
      : kind === "list_msg"   ? uid("list")
      : uid("cta");
    const maxX = Math.max(...nodes.map(n => n.x), 80);
    const newN: CNode = {
      id, kind, x: maxX + 420, y: 220,
      ...(kind === "welcome"    ? { welcomeButtons: [{ type: "reply", reply: { id: "", title: "" } }, { type: "reply", reply: { id: "", title: "" } }] } : {}),
      ...(kind === "button_msg" ? { buttons:        [{ type: "reply", reply: { id: "", title: "" } }, { type: "reply", reply: { id: "", title: "" } }] } : {}),
      ...(kind === "list_msg"   ? { button_text: "Select Option", sections: [{ title: "Options", rows: [{ id: "", title: "" }, { id: "", title: "" }] }] } : {}),
    };
    setNodes(ns => [...ns, newN]); setSelId(id);
  };

  const updateNode = (id: string, p: Partial<CNode>) =>
    setNodes(ns => ns.map(n => n.id === id ? { ...n, ...p } : n));

  const deleteNode = (id: string) => {
    if (id === "trigger") return;
    setNodes(ns => ns.filter(n => n.id !== id));
    setEdges(es => es.filter(e => e.srcId !== id && e.tgtId !== id));
    setSelId(null);
  };

  // ── FIT VIEW ────────────────────────────────────────────────────────────────

  const fitViewFor = useCallback((ns: CNode[]) => {
    const el = canvasRef.current; if (!el || !ns.length) return;
    const cw = el.clientWidth, ch = el.clientHeight;
    const xs = ns.flatMap(n => [n.x, n.x + NW]);
    const ys = ns.flatMap(n => [n.y, n.y + nodeH(n)]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad = 80;
    const nz = Math.min(0.92, Math.max(0.22, Math.min(
      (cw - pad * 2) / Math.max(maxX - minX, 1),
      (ch - pad * 2) / Math.max(maxY - minY, 1),
    )));
    setZoom(nz);
    setPan({ x: cw / 2 - (minX + (maxX - minX) / 2) * nz, y: ch / 2 - (minY + (maxY - minY) / 2) * nz });
  }, []);

  const fitView = useCallback(() => fitViewFor(nodes), [nodes, fitViewFor]);

  // ── SVG EDGE PATHS ──────────────────────────────────────────────────────────

  const svgPaths = useMemo(() => {
    const paths: Array<{ d: string; color: string; key: string; dash: boolean }> = [];
    for (const e of edges) {
      const src = nodes.find(n => n.id === e.srcId);
      const tgt = nodes.find(n => n.id === e.tgtId);
      if (!src || !tgt || !e.handleId) continue;
      const sp = outPos(src, e.handleId);
      const tp = inPos(tgt);
      const startDown = e.handleId === "__out__";
      paths.push({ d: makePath(sp.x, sp.y, tp.x, tp.y, startDown), color: TH[src.kind].accent, key: `${e.srcId}-${e.handleId}-${e.tgtId}`, dash: false });
    }
    if (liveDrag && canvasRef.current) {
      const src = nodes.find(n => n.id === liveDrag.srcId);
      if (src) {
        const cr = canvasRef.current.getBoundingClientRect();
        const sp = outPos(src, liveDrag.handleId);
        const tx = (liveDrag.cx - cr.left - pan.x) / zoom;
        const ty = (liveDrag.cy - cr.top  - pan.y) / zoom;
        const startDown = liveDrag.handleId === "__out__";
        paths.push({ d: makePath(sp.x, sp.y, tx, ty, startDown), color: TH[src.kind].accent, key: "live", dash: true });
      }
    }
    return paths;
  }, [edges, nodes, liveDrag, pan, zoom]);

  const selNode = nodes.find(n => n.id === selId) || null;

  // ── RENDER ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "2.5px solid #e2e8f0", borderTopColor: "#4f46e5",
            borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Loading flow…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column",
      overflow: "hidden", background: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* TOP BAR */}
      <div style={{ height: 52, flexShrink: 0, background: "#fff", borderBottom: "1.5px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0",
            background: "#fff", cursor: "pointer", color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.12s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#f8fafc"; el.style.color = "#0f172a"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fff"; el.style.color = "#64748b"; }}>
            <ArrowLeft size={15} />
          </button>
          <div style={{ width: 1, height: 18, background: "#e2e8f0", flexShrink: 0 }} />
          <input value={flowName} onChange={e => setFlowName(e.target.value)}
            style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", background: "transparent",
              border: "none", outline: "none", minWidth: 0, width: 190 }}
            placeholder="Flow name…" />
          <span style={{ padding: "3px 9px", borderRadius: 6, background: "#d1fae5", color: "#065f46",
            fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
            WA Bot
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 6, height: 34,
            padding: "0 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff",
            fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", transition: "all 0.12s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#f8fafc"; el.style.borderColor = "#c7d2fe"; el.style.color = "#4f46e5"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fff"; el.style.borderColor = "#e2e8f0"; el.style.color = "#374151"; }}>
            <Plus size={14} /> Add Node
          </button>
          <button onClick={() => setShowJsonPreview(true)} style={{ display: "flex", alignItems: "center", gap: 6,
            height: 34, padding: "0 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff",
            fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", transition: "all 0.12s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0f172a"; el.style.borderColor = "#0f172a"; el.style.color = "#60a5fa"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fff"; el.style.borderColor = "#e2e8f0"; el.style.color = "#374151"; }}>
            <Code size={13} /> Preview JSON
          </button>
          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
          {saveStatus === "saving" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
              <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />Saving…
            </span>
          ) : saveStatus === "saved" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#059669", fontWeight: 600 }}>
              <CheckCircle2 size={14} />Saved
            </span>
          ) : (
            <button onClick={() => handleSave(false)} style={{ display: "flex", alignItems: "center", gap: 6,
              height: 34, padding: "0 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff",
              fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
              <Save size={13} /> Save
            </button>
          )}
          <button onClick={() => handleSave(true)} disabled={saveStatus === "saving"}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 16px",
              borderRadius: 8, background: "#16a34a", color: "#fff", border: "none",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: saveStatus === "saving" ? 0.6 : 1, transition: "background 0.12s" }}
            onMouseEnter={e => { if (saveStatus !== "saving") (e.currentTarget as HTMLElement).style.background = "#15803d"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#16a34a"; }}>
            <Play size={12} />Publish
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div ref={canvasRef} data-canvas="1"
          style={{ flex: 1, position: "relative", overflow: "hidden",
            backgroundImage: "radial-gradient(circle, #c8d4e0 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
            backgroundPosition: `${((pan.x % 24) + 24) % 24}px ${((pan.y % 24) + 24) % 24}px`,
            cursor: isPanning ? "grabbing" : "default" }}
          onMouseDown={onCanvasMD} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onWheel={onWheel}>

          <div data-canvas="1" style={{ position: "absolute", inset: 0, zIndex: 0 }} />

          <div style={{ position: "absolute", inset: 0,
            transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0", pointerEvents: "none" }}>
            <svg style={{ position: "absolute", inset: 0, width: "12000px", height: "12000px", overflow: "visible", zIndex: 1 }}>
              <defs>
                <marker id="wabot-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 2 L 9 5 L 0 8 Z" fill="#94a3b8" />
                </marker>
                <marker id="wabot-arrow-live" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 2 L 9 5 L 0 8 Z" fill="#6366f1" />
                </marker>
              </defs>
              {svgPaths.map(p => (
                <path key={p.key} d={p.d} fill="none" stroke={p.color}
                  strokeWidth={p.dash ? 1.8 : 2} strokeDasharray={p.dash ? "7 5" : undefined}
                  strokeLinecap="round" opacity={p.dash ? 0.65 : 0.85}
                  markerEnd={p.dash ? "url(#wabot-arrow-live)" : "url(#wabot-arrow)"}
                />
              ))}
            </svg>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
              {nodes.map(n => (
                <div key={n.id} style={{ pointerEvents: "all" }}>
                  <NodeCard node={n} selected={selId === n.id}
                    onMouseDown={e => startDrag(e, n.id)} onSelect={() => setSelId(n.id)}
                    onHandleDown={onHandleDown} onInputUp={onInputUp} />
                </div>
              ))}
            </div>
          </div>

          {nodes.length <= 1 && (
            <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
                background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)", whiteSpace: "nowrap" }}>
                <Plus size={13} color="#94a3b8" />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Click <strong style={{ color: "#374151" }}>Add Node</strong> to build your flow
                </span>
              </div>
            </div>
          )}

          {/* ZOOM CONTROLS */}
          <div style={{ position: "absolute", bottom: 20, right: 20, display: "flex", flexDirection: "column",
            background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            {[
              { icon: <ZoomIn  size={14} />, fn: () => setZoom(z => Math.min(z + 0.12, 2.5)) },
              { icon: <span style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b", fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>, fn: null },
              { icon: <ZoomOut size={14} />, fn: () => setZoom(z => Math.max(z - 0.12, 0.18)) },
              { icon: <Maximize2 size={13} />, fn: fitView },
            ].map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ height: 1, background: "#f1f5f9" }} />}
                <button onClick={b.fn ?? undefined} disabled={!b.fn}
                  style={{ width: 36, height: 36, display: "flex", alignItems: "center",
                    justifyContent: "center", background: "transparent", border: "none",
                    cursor: b.fn ? "pointer" : "default", color: "#64748b", transition: "background 0.1s" }}
                  onMouseEnter={e => { if (b.fn) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  {b.icon}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {selNode && (
          <RightPanel node={selNode} onChange={p => updateNode(selNode.id, p)}
            onDelete={() => deleteNode(selNode.id)} onClose={() => setSelId(null)} />
        )}
      </div>

      {showAdd && <AddMenu onAdd={addNode} onClose={() => setShowAdd(false)} />}
      {showJsonPreview && (
        <JsonPreviewModal nodes={nodes} edges={edges} flowName={flowName} onClose={() => setShowJsonPreview(false)} />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}