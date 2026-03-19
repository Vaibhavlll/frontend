/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  ArrowLeft, Save, Loader2, Plus, X, Trash2, ExternalLink,
  List, MousePointer2, ZoomIn, ZoomOut, Maximize2, Hash, Link2,
  CheckCircle2, MessageSquare, ChevronRight, Video, Image, Type,
  Play, AlignLeft,
} from "lucide-react";
import { useApi } from "@/lib/session_api";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface WaHeader {
  type: "image" | "video" | "text";
  image?: { link: string };
  video?: { link: string };
  text?: string;
}
interface WaButton  { type: "reply"; reply: { id: string; title: string } }
interface WaRow     { id: string; title: string; description?: string }
interface WaSection { title: string; rows: WaRow[] }
type NodeKind = "trigger" | "welcome" | "button_msg" | "list_msg" | "cta_url";

interface CNode {
  id: string; kind: NodeKind; x: number; y: number;
  trigger_messages?: string;
  welcomeHeader?: WaHeader; welcomeBodyText?: string; welcomeButtons?: WaButton[];
  body_text?: string; header?: WaHeader; buttons?: WaButton[];
  button_text?: string; sections?: WaSection[];
  url?: string; cta_label?: string;
}
interface CEdge { srcId: string; handleId: string; tgtId: string }

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT CONSTANTS — all positions derived from these, no DOM reads needed
// ─────────────────────────────────────────────────────────────────────────────
const NW         = 280;   // node card width
const TOP_BAR    = 84;    // kind badge row + title  (px)
const PREVIEW    = 80;    // body preview section    (px)
const HDL_H      = 40;    // height per handle row   (px)
const HDL_PAD    = 12;    // padding above/below handles section (px)
const TRIG_EXTRA = 46;    // extra height for trigger keyword chip

function nodeH(n: CNode): number {
  const hs = nodeHandles(n);
  const extra = n.kind === "trigger" ? TRIG_EXTRA : 0;
  const handlesH = hs.length > 0 ? hs.length * HDL_H + HDL_PAD * 2 : 0;
  return TOP_BAR + PREVIEW + extra + handlesH;
}

function nodeHandles(n: CNode): Array<{ id: string; label: string }> {
  // Only show handles that have a label (title) — skip empty/unconfigured buttons
  if (n.kind === "welcome")    return (n.welcomeButtons || []).filter(b => b.reply.title?.trim()).map(b => ({ id: b.reply.id, label: b.reply.title }));
  if (n.kind === "button_msg") return (n.buttons || []).filter(b => b.reply.title?.trim()).map(b => ({ id: b.reply.id, label: b.reply.title }));
  if (n.kind === "list_msg") {
    const r: Array<{ id: string; label: string }> = [];
    for (const s of n.sections || []) for (const row of s.rows) { if (row.title?.trim()) r.push({ id: row.id, label: row.title }); }
    return r;
  }
  return [];
}

// World position of an output handle (right edge)
function outPos(n: CNode, handleId: string): { x: number; y: number } {
  // Trigger: bottom-center dot (bottom:-12, left:NW/2-8 -> center = NW/2)
  if (handleId === "__out__") return { x: n.x + NW / 2, y: n.y + nodeH(n) - 4 };
  // Handle rows: dot at right:-13 inside padding:12px 14px section
  // handle-row.right = node.x + NW - 14; dot center.x = handle-row.right + 13 - 12/2 = node.x + NW - 7
  const hs  = nodeHandles(n);
  const idx = hs.findIndex(h => h.id === handleId);
  const topOffset = TOP_BAR + PREVIEW + (n.kind === "trigger" ? TRIG_EXTRA : 0) + HDL_PAD;
  const CHIP_SLOT = 38; // chip height (32px) + gap (6px) = 38px per row
  const y = n.y + topOffset + (idx < 0 ? 0 : idx) * CHIP_SLOT + 16; // 16 = chip_height/2
  return { x: n.x + NW - 7, y };
}

// World position of an input handle (left edge)
function inPos(n: CNode): { x: number; y: number } {
  // Input dot: left:-8 on outer wrapper -> dot.center.x = node.x - 8 + 8 = node.x
  return { x: n.x, y: n.y + TOP_BAR / 2 };
}

// SVG edge path — smooth bezier, handles wrap-around
function makePath(sx: number, sy: number, tx: number, ty: number): string {
  const dx = tx - sx;
  const dy = Math.abs(ty - sy);
  // Forward connection: smooth S-curve
  if (dx > 60) {
    const cp = Math.min(Math.max(dx * 0.5, 80), 240);
    return `M${sx},${sy} C${sx + cp},${sy} ${tx - cp},${ty} ${tx},${ty}`;
  }
  // Backward/tight: elbow out to the right, then curve back
  const ox = Math.max(80, Math.abs(dx) * 0.5 + 60);
  const iy = (sy + ty) / 2;
  return `M${sx},${sy} C${sx + ox},${sy} ${sx + ox},${iy} ${sx + ox},${iy} C${sx + ox},${iy} ${tx - ox},${iy} ${tx - ox},${ty} C${tx - ox},${ty} ${tx},${ty} ${tx},${ty}`;
}

function uid(p = "n") { return `${p}_${Math.random().toString(36).slice(2, 7)}`; }
function toId(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/, "").slice(0, 40) || "item"; }

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const TH: Record<NodeKind, { accent: string; tagBg: string; tagFg: string; label: string }> = {
  trigger:    { accent: "#2563eb", tagBg: "#eff6ff", tagFg: "#1d4ed8", label: "Trigger"  },
  welcome:    { accent: "#7c3aed", tagBg: "#f5f3ff", tagFg: "#5b21b6", label: "Welcome"  },
  button_msg: { accent: "#16a34a", tagBg: "#f0fdf4", tagFg: "#14532d", label: "Buttons"  },
  list_msg:   { accent: "#0f766e", tagBg: "#f0fdfa", tagFg: "#134e4a", label: "List"     },
  cta_url:    { accent: "#2563eb", tagBg: "#eff6ff", tagFg: "#1e40af", label: "CTA Link" },
};

const KIND_ICON: Record<NodeKind, React.ReactNode> = {
  trigger:    <MessageSquare size={11} />,
  welcome:    <MessageSquare size={11} />,
  button_msg: <MousePointer2 size={11} />,
  list_msg:   <List size={11} />,
  cta_url:    <ExternalLink size={11} />,
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA EXPORT — flat WaBot DB format
// ─────────────────────────────────────────────────────────────────────────────
function buildSchema(nodes: CNode[], name: string) {
  const tr = nodes.find(n => n.kind === "trigger");
  const wm = nodes.find(n => n.kind === "welcome");
  const out: any = { name, status: "draft", trigger_event: "message_received", trigger_from: "webhook", trigger_messages: tr?.trigger_messages || "", nodes: {} };
  if (wm) {
    out.welcome_message = { type: "interactive", interactive: { type: "button", ...(wm.welcomeHeader ? { header: wm.welcomeHeader } : {}), body_text: wm.welcomeBodyText || "", buttons: wm.welcomeButtons || [] } };
  }
  for (const n of nodes) {
    if (n.kind === "trigger" || n.kind === "welcome") continue;
    if (n.kind === "button_msg")  out.nodes[n.id] = { type: "button",  body_text: n.body_text || "", ...(n.header ? { header: n.header } : {}), buttons: n.buttons || [] };
    else if (n.kind === "list_msg")   out.nodes[n.id] = { type: "list",    body_text: n.body_text || "", button_text: n.button_text || "Select", sections: n.sections || [] };
    else if (n.kind === "cta_url")    out.nodes[n.id] = { type: "cta_url", body_text: n.body_text || "", button_text: n.cta_label  || "Open",   url: n.url || "" };
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// PANEL PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function PLabel({ c }: { c: string }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1.5">{c}</p>;
}
function PInput({ value, onChange, placeholder, maxLength, mono }: { value: string; onChange(v: string): void; placeholder?: string; maxLength?: number; mono?: boolean }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
      className={`w-full h-10 px-3.5 border border-slate-200 rounded-xl text-[13px] bg-white
        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all
        placeholder:text-slate-300 ${mono ? "font-mono text-[12px] text-slate-600" : "text-slate-800"}`}
    />
  );
}
function PTA({ value, onChange, rows = 4, placeholder }: { value: string; onChange(v: string): void; rows?: number; placeholder?: string }) {
  return (
    <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-[13px] text-slate-800 bg-white
        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none transition-all
        placeholder:text-slate-300 leading-relaxed"
    />
  );
}
function PRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><PLabel c={label} />{children}</div>;
}
function PInfo({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "violet" | "amber" }) {
  const cls = { blue: "bg-blue-50 border-blue-100 text-blue-700", violet: "bg-violet-50 border-violet-100 text-violet-700", amber: "bg-amber-50 border-amber-100 text-amber-700" }[color];
  return <div className={`px-4 py-3 rounded-xl border text-[12px] leading-relaxed ${cls}`}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER EDITOR
// ─────────────────────────────────────────────────────────────────────────────
function HeaderEditor({ value, onChange }: { value?: WaHeader; onChange(v?: WaHeader): void }) {
  const cur = value?.type || "none";
  const opts = [
    { k: "none"  as const, icon: <X size={11} />, label: "None"  },
    { k: "image" as const, icon: <Image size={11} />, label: "Image" },
    { k: "video" as const, icon: <Video size={11} />, label: "Video" },
    { k: "text"  as const, icon: <Type size={11} />, label: "Text"  },
  ];
  return (
    <PRow label="Header">
      <div className="flex gap-1.5">
        {opts.map(o => (
          <button key={o.k} type="button"
            onClick={() => onChange(o.k === "none" ? undefined : { type: o.k } as WaHeader)}
            className={`flex-1 flex items-center justify-center gap-1 h-9 rounded-xl border text-[11px] font-semibold transition-all
              ${cur === o.k ? "border-blue-400 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 bg-white"}`}>
            {o.icon}{o.label}
          </button>
        ))}
      </div>
      {(cur === "image" || cur === "video") && (
        <PInput
          value={cur === "image" ? value?.image?.link || "" : value?.video?.link || ""}
          onChange={v => onChange({ type: cur, ...(cur === "image" ? { image: { link: v } } : { video: { link: v } }) } as WaHeader)}
          placeholder={`${cur === "image" ? "Image" : "Video"} URL (Cloudinary, etc.)`}
        />
      )}
      {cur === "text" && (
        <PInput value={value?.text || ""} onChange={v => onChange({ type: "text", text: v })} placeholder="Header text (max 60 chars)" maxLength={60} />
      )}
    </PRow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTONS EDITOR
// ─────────────────────────────────────────────────────────────────────────────
function ButtonsEditor({ value, onChange, max = 3 }: { value: WaButton[]; onChange(v: WaButton[]): void; max?: number }) {
  const upd = (i: number, title: string) => {
    const n = [...value];
    const autoId = !n[i]?.reply.id || n[i].reply.id === toId(n[i]?.reply.title || "") ? toId(title) : n[i].reply.id;
    n[i] = { type: "reply", reply: { id: autoId, title } }; onChange(n);
  };
  const updId = (i: number, id: string) => { const n = [...value]; n[i] = { ...n[i], reply: { ...n[i].reply, id } }; onChange(n); };
  const rem = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add = () => onChange([...value, { type: "reply", reply: { id: "", title: "" } }]);
  return (
    <PRow label={`Buttons — ${value.length} / ${max}`}>
      <div className="space-y-2">
        {value.map((b, i) => (
          <div key={i} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <input type="text" maxLength={20} placeholder="Button label"
                value={b.reply.title} onChange={e => upd(i, e.target.value)}
                className="flex-1 text-[13px] font-medium text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-300" />
              <button type="button" onClick={() => rem(i)} className="p-0.5 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"><X size={13} /></button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2">
              <Hash size={10} className="text-slate-300 flex-shrink-0" />
              <input type="text" placeholder="target_node_id"
                value={b.reply.id} onChange={e => updId(i, e.target.value)}
                className="flex-1 text-[11px] font-mono text-slate-400 bg-transparent focus:outline-none placeholder:text-slate-300 focus:text-slate-700" />
            </div>
          </div>
        ))}
      </div>
      {value.length < max && (
        <button type="button" onClick={add}
          className="w-full h-10 border-2 border-dashed border-slate-200 rounded-xl text-[12px] font-semibold text-slate-400
            hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-1.5 bg-white">
          <Plus size={13} /> Add Button
        </button>
      )}
      <p className="text-[10px] text-slate-400 leading-relaxed">The Node ID routes this button to the matching node in the flow.</p>
    </PRow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST SECTIONS EDITOR
// ─────────────────────────────────────────────────────────────────────────────
function SectionsEditor({ value, onChange }: { value: WaSection[]; onChange(v: WaSection[]): void }) {
  const updSec   = (si: number, t: string) => { const n = [...value]; n[si] = { ...n[si], title: t }; onChange(n); };
  const remSec   = (si: number) => onChange(value.filter((_, i) => i !== si));
  const addSec   = () => onChange([...value, { title: "New Section", rows: [] }]);
  const addRow   = (si: number) => { const n = [...value]; n[si] = { ...n[si], rows: [...n[si].rows, { id: "", title: "" }] }; onChange(n); };
  const remRow   = (si: number, ri: number) => { const n = [...value]; n[si] = { ...n[si], rows: n[si].rows.filter((_, i) => i !== ri) }; onChange(n); };
  const updRow   = (si: number, ri: number, f: keyof WaRow, v: string) => {
    const n = [...value]; const row = { ...n[si].rows[ri], [f]: v };
    if (f === "title" && !row.id) row.id = toId(v);
    n[si].rows[ri] = row; onChange(n);
  };
  const updRowId = (si: number, ri: number, id: string) => { const n = [...value]; n[si].rows[ri] = { ...n[si].rows[ri], id }; onChange(n); };
  return (
    <PRow label="Sections & Rows">
      <div className="space-y-2">
        {value.map((sec, si) => (
          <div key={si} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border-b border-slate-100">
              <List size={11} className="text-slate-400 flex-shrink-0" />
              <input value={sec.title} onChange={e => updSec(si, e.target.value)} placeholder="Section title"
                className="flex-1 text-[12px] font-semibold text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-300" />
              {value.length > 1 && <button type="button" onClick={() => remSec(si)} className="text-slate-300 hover:text-red-400 transition-colors"><X size={13} /></button>}
            </div>
            <div className="p-2 space-y-1.5">
              {sec.rows.map((row, ri) => (
                <div key={ri} className="border border-slate-100 rounded-xl bg-white p-2.5 space-y-1.5">
                  <div className="flex gap-2">
                    <input placeholder="Row title (max 24)" maxLength={24} value={row.title}
                      onChange={e => updRow(si, ri, "title", e.target.value)}
                      className="flex-1 h-8 px-2.5 text-[12px] border border-slate-200 rounded-lg focus:outline-none focus:border-blue-300 placeholder:text-slate-300 bg-white" />
                    <button type="button" onClick={() => remRow(si, ri)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"><X size={13} /></button>
                  </div>
                  <input placeholder="Description (optional)" value={row.description || ""} maxLength={72}
                    onChange={e => updRow(si, ri, "description", e.target.value)}
                    className="w-full h-7 px-2.5 text-[11px] border border-slate-100 rounded-lg focus:outline-none text-slate-500 placeholder:text-slate-300 bg-white" />
                  <div className="flex items-center gap-1.5">
                    <Hash size={10} className="text-slate-300 flex-shrink-0" />
                    <input placeholder="node_id (target node)" value={row.id} onChange={e => updRowId(si, ri, e.target.value)}
                      className="flex-1 h-7 px-2 text-[11px] font-mono border border-dashed border-slate-200 rounded-lg focus:outline-none text-slate-400 placeholder:text-slate-300 bg-white" />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addRow(si)}
                className="w-full h-8 border border-dashed border-slate-200 rounded-xl text-[11px] font-semibold text-slate-400
                  hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all flex items-center justify-center gap-1 bg-white">
                <Plus size={12} /> Add Row
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addSec}
          className="w-full h-10 border-2 border-dashed border-slate-200 rounded-xl text-[12px] font-semibold text-slate-400
            hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all flex items-center justify-center gap-1.5 bg-white">
          <Plus size={13} /> Add Section
        </button>
      </div>
    </PRow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE CARD
// ─────────────────────────────────────────────────────────────────────────────
function NodeCard({ node, selected, onMouseDown, onSelect, onHandleDown, onInputUp }: {
  node: CNode; selected: boolean;
  onMouseDown(e: React.MouseEvent): void;
  onSelect(): void;
  onHandleDown(nodeId: string, handleId: string, e: React.MouseEvent): void;
  onInputUp(nodeId: string): void;
}) {
  const th    = TH[node.kind];
  const hlist = nodeHandles(node);
  const body  = node.kind === "welcome" ? node.welcomeBodyText : node.body_text;
  const hdr   = node.kind === "welcome" ? node.welcomeHeader : node.header;
  const h     = nodeH(node);

  // Title line: strip markdown markers, get first non-empty line
  const titleLine = body?.split("\n").map(l => l.replace(/\*/g, "").replace(/_/g, "").trim()).find(l => l) || "";

  return (
    <div
      onMouseDown={e => { onMouseDown(e); onSelect(); }}
      style={{ position: "absolute", left: node.x, top: node.y, width: NW, height: h, userSelect: "none" }}
    >
      {/* Input handle */}
      {node.kind !== "trigger" && (
        <div
          onMouseUp={e => { e.stopPropagation(); onInputUp(node.id); }}
          style={{
            position: "absolute", left: -8, top: TOP_BAR / 2 - 8,
            width: 16, height: 16, borderRadius: "50%",
            background: "#fff", border: `2px solid ${th.accent}`,
            cursor: "crosshair", zIndex: 20,
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
          }}
        />
      )}

      {/* Card */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 12, overflow: "hidden",
        background: "#fff",
        border: selected ? `1.5px solid ${th.accent}` : "1.5px solid #e2e8f0",
        boxShadow: selected
          ? `0 0 0 3px ${th.accent}15, 0 8px 24px rgba(0,0,0,0.09)`
          : "0 1px 6px rgba(0,0,0,0.05), 0 3px 12px rgba(0,0,0,0.03)",
        transition: "border-color 0.12s, box-shadow 0.12s",
      }}>
        {/* Top accent stripe */}
        <div style={{ height: 3, background: th.accent }} />

        {/* Kind badge + title */}
        <div style={{ padding: "12px 14px 10px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 8px", borderRadius: 6, marginBottom: 7,
            background: th.tagBg, color: th.tagFg,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
          }}>
            {KIND_ICON[node.kind]}
            <span style={{ textTransform: "uppercase" }}>{th.label}</span>
          </div>
          <p style={{
            fontSize: 13, fontWeight: 600, color: "#1e293b", lineHeight: 1.35,
            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
          }}>
            {node.kind === "trigger"
              ? (node.trigger_messages ? `${node.trigger_messages}` : "Set trigger keywords")
              : (titleLine || "Click to configure")}
          </p>
        </div>

        {/* Preview */}
        <div style={{ padding: "0 14px 12px" }}>
          {node.kind === "trigger" ? (
            <div style={{ padding: "8px 11px", borderRadius: 8, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: th.accent, fontWeight: 600, wordBreak: "break-all" }}>
                {node.trigger_messages || "hi,hey,hello,menu"}
              </span>
            </div>
          ) : (
            <div style={{ padding: "9px 11px", borderRadius: 8, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
              {hdr?.type === "image" && hdr.image?.link && (
                <div style={{ borderRadius: 6, overflow: "hidden", height: 48, marginBottom: 8 }}>
                  <img src={hdr.image.link} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              {hdr?.type === "video" && (
                <div style={{ borderRadius: 6, height: 48, marginBottom: 8, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <Play size={12} color="#94a3b8" />
                  <span style={{ fontSize: 11, color: "#64748b" }}>Video</span>
                </div>
              )}
              <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, maxHeight: 34, overflow: "hidden" }}>
                {body?.replace(/\*/g, "").replace(/_/g, "") || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>No message text yet</span>}
              </p>
              {node.kind === "cta_url" && (
                <div style={{ marginTop: 7, paddingTop: 7, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
                  <ExternalLink size={10} color={th.accent} />
                  <span style={{ fontSize: 11, color: th.accent, fontWeight: 600 }}>{node.cta_label || "Open Link"}</span>
                </div>
              )}
              {node.kind === "list_msg" && (
                <div style={{ marginTop: 7, paddingTop: 7, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
                  <List size={10} color={th.accent} />
                  <span style={{ fontSize: 11, color: th.accent, fontWeight: 600 }}>{node.button_text || "Select option"}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Handle rows */}
        {hlist.length > 0 && (
          <div style={{ borderTop: "1px solid #f1f5f9", padding: `${HDL_PAD}px 14px` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {hlist.map((h, idx) => (
                <div key={h.id || idx} style={{ display: "flex", alignItems: "center", position: "relative" }}>
                  <div style={{
                    flex: 1, display: "flex", alignItems: "center", gap: 7,
                    padding: "7px 10px", borderRadius: 7,
                    border: "1px solid #e2e8f0", background: "#f8fafc",
                    marginRight: 16, height: HDL_H - 8,
                  }}>
                    {node.kind === "list_msg"
                      ? <List size={10} color={th.accent} style={{ flexShrink: 0 }} />
                      : <MousePointer2 size={10} color={th.accent} style={{ flexShrink: 0 }} />}
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {h.label || `Option ${idx + 1}`}
                    </span>
                    {h.id && (
                      <span style={{ fontSize: 9, fontFamily: "monospace", color: "#94a3b8", flexShrink: 0, maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.id}
                      </span>
                    )}
                  </div>
                  {/* Output dot — position matches outPos() exactly */}
                  <div
                    onMouseDown={e => { e.stopPropagation(); onHandleDown(node.id, h.id, e); }}
                    style={{
                      position: "absolute", right: -13,
                      width: 12, height: 12, borderRadius: "50%",
                      background: th.accent, border: "2px solid #fff",
                      cursor: "crosshair", zIndex: 20,
                      boxShadow: `0 1px 4px ${th.accent}60`,
                      transition: "transform 0.1s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.4)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trigger: bottom output handle */}
      {node.kind === "trigger" && (
        <div
          onMouseDown={e => { e.stopPropagation(); onHandleDown(node.id, "__out__", e); }}
          style={{
            position: "absolute", bottom: -12, left: NW / 2 - 8,
            width: 16, height: 16, borderRadius: "50%",
            background: th.accent, border: "2px solid #fff",
            cursor: "crosshair", zIndex: 20,
            boxShadow: `0 2px 6px ${th.accent}60`,
            transition: "transform 0.1s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.35)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT PANEL
// ─────────────────────────────────────────────────────────────────────────────
function RightPanel({ node, onChange, onDelete, onClose }: {
  node: CNode; onChange(p: Partial<CNode>): void; onDelete(): void; onClose(): void;
}) {
  const th = TH[node.kind];
  const copyId = () => { navigator.clipboard.writeText(node.id); toast.success("Copied!"); };

  return (
    <div className="w-[340px] flex-shrink-0 flex flex-col h-full bg-white" style={{ borderLeft: "1px solid #e2e8f0" }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid #f1f5f9", borderLeft: `3px solid ${th.accent}` }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: th.tagBg, color: th.accent }}>
            {KIND_ICON[node.kind]}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-900 leading-none">{th.label}</p>
            <button onClick={copyId} className="flex items-center gap-1.5 mt-1 group">
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-500 transition-colors truncate max-w-[160px]">{node.id}</span>
              <span className="text-[9px] text-slate-300 group-hover:text-blue-400 transition-colors">copy</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {node.kind !== "trigger" && (
            <button onClick={onDelete} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={15} /></button>
          )}
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><X size={15} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {node.kind === "trigger" && <>
          <PInfo color="blue">Fires when a customer sends a message matching one of these keywords.</PInfo>
          <PRow label="Keywords">
            <PInput value={node.trigger_messages || ""} onChange={v => onChange({ trigger_messages: v })} placeholder="hi, hey, hello, menu" />
            <p className="text-[10px] text-slate-400 mt-1">Comma-separated. e.g. <code className="bg-slate-100 px-1 rounded font-mono">hi,hey,hello,menu</code></p>
          </PRow>
          <PInfo color="amber">Connect the handle below to a <strong>Welcome Message</strong> node.</PInfo>
        </>}

        {node.kind === "welcome" && <>
          <PInfo color="violet">First message sent when the flow fires. Stored as <code className="font-mono font-bold">welcome_message</code>.</PInfo>
          <HeaderEditor value={node.welcomeHeader} onChange={h => onChange({ welcomeHeader: h })} />
          <PRow label="Body Text">
            <PTA rows={6} value={node.welcomeBodyText || ""} onChange={v => onChange({ welcomeBodyText: v })}
              placeholder={"*Welcome to Cognisive*\n\nHello {customer_name}\n\nSelect who is exploring admission:"} />
            <p className="text-[10px] text-slate-400 mt-1">*bold*, _italic_ supported. Use {"{ customer_name }"} for personalisation.</p>
          </PRow>
          <ButtonsEditor value={node.welcomeButtons || []} onChange={v => onChange({ welcomeButtons: v })} max={3} />
        </>}

        {node.kind === "button_msg" && <>
          <PRow label="Node ID">
            <div className="flex items-center gap-2.5 h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <Hash size={12} className="text-slate-400 flex-shrink-0" />
              <span className="text-[12px] font-mono text-slate-600 flex-1 truncate">{node.id}</span>
              <button onClick={copyId} className="text-[10px] text-slate-400 hover:text-blue-500 transition-colors flex-shrink-0">copy</button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Must match the <code className="bg-slate-100 px-1 rounded font-mono">button.reply.id</code> that routes here.</p>
          </PRow>
          <HeaderEditor value={node.header} onChange={h => onChange({ header: h })} />
          <PRow label="Body Text">
            <PTA rows={4} value={node.body_text || ""} onChange={v => onChange({ body_text: v })} placeholder="What is the primary goal for the student?" />
          </PRow>
          <ButtonsEditor value={node.buttons || []} onChange={v => onChange({ buttons: v })} max={3} />
        </>}

        {node.kind === "list_msg" && <>
          <PRow label="Node ID">
            <div className="flex items-center gap-2.5 h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <Hash size={12} className="text-slate-400 flex-shrink-0" />
              <span className="text-[12px] font-mono text-slate-600 flex-1 truncate">{node.id}</span>
              <button onClick={copyId} className="text-[10px] text-slate-400 hover:text-blue-500 transition-colors flex-shrink-0">copy</button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Must match the row ID that routes here.</p>
          </PRow>
          <PRow label="Body Text">
            <PTA rows={4} value={node.body_text || ""} onChange={v => onChange({ body_text: v })}
              placeholder={"Thanks for sharing!\n\nPlease select your class:"} />
          </PRow>
          <PRow label="List Button Label">
            <PInput value={node.button_text || ""} onChange={v => onChange({ button_text: v })} placeholder="Select Class" maxLength={20} />
          </PRow>
          <SectionsEditor value={node.sections || [{ title: "Options", rows: [] }]} onChange={v => onChange({ sections: v })} />
        </>}

        {node.kind === "cta_url" && <>
          <PRow label="Node ID">
            <div className="flex items-center gap-2.5 h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <Hash size={12} className="text-slate-400 flex-shrink-0" />
              <span className="text-[12px] font-mono text-slate-600 flex-1 truncate">{node.id}</span>
              <button onClick={copyId} className="text-[10px] text-slate-400 hover:text-blue-500 transition-colors flex-shrink-0">copy</button>
            </div>
          </PRow>
          <PInfo color="blue">Terminal node — the user taps the button to open an external URL.</PInfo>
          <PRow label="Body Text">
            <PTA rows={5} value={node.body_text || ""} onChange={v => onChange({ body_text: v })} placeholder="Cognisive conducts a Merit Scholarship Test..." />
          </PRow>
          <PRow label="Button Label">
            <PInput value={node.cta_label || ""} onChange={v => onChange({ cta_label: v })} placeholder="Register for test" maxLength={20} />
          </PRow>
          <PRow label="URL">
            <div className="relative">
              <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="url" placeholder="https://forms.gle/..." value={node.url || ""} onChange={e => onChange({ url: e.target.value })}
                className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 placeholder:text-slate-300 text-slate-800" />
            </div>
            {node.url && (
              <a href={node.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 mt-1 text-[11px] text-blue-500 hover:underline">
                <ExternalLink size={11} /> Test link
              </a>
            )}
          </PRow>
        </>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD NODE MENU
// ─────────────────────────────────────────────────────────────────────────────
function AddMenu({ onAdd, onClose }: { onAdd(k: NodeKind): void; onClose(): void }) {
  const opts: Array<{ k: NodeKind; label: string; desc: string }> = [
    { k: "welcome",    label: "Welcome Message",  desc: "First message with header + reply buttons" },
    { k: "button_msg", label: "Button Message",   desc: "Up to 3 reply buttons, optional media header" },
    { k: "list_msg",   label: "List Message",     desc: "Scrollable menu with sections and rows" },
    { k: "cta_url",    label: "CTA URL",          desc: "Body text + single external link (terminal)" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.08)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[340px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="font-bold text-[14px] text-slate-900">Add Node</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Select a message type to add</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><X size={14} /></button>
        </div>
        <div className="p-3 space-y-1.5">
          {opts.map(o => {
            const th = TH[o.k];
            return (
              <button key={o.k} type="button" onClick={() => { onAdd(o.k); onClose(); }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-left group bg-white">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: th.tagBg, color: th.accent }}>
                  {KIND_ICON[o.k]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900">{o.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{o.desc}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EDITOR
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  onBack(): void; flowId?: string; flowName?: string;
  onFlowNameChange?(n: string): void; onFlowIdChange?(id: string): void;
}

export default function WaBotEditor({ onBack, flowId: fIdProp, flowName: fNameProp, onFlowNameChange, onFlowIdChange }: Props) {
  const api = useApi();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes]         = useState<CNode[]>([
    { id: "trigger", kind: "trigger", x: 80, y: 200, trigger_messages: "hi,hey,hello,menu" },
  ]);
  const [edges, setEdges]         = useState<CEdge[]>([]);
  const [selId, setSelId]         = useState<string | null>(null);
  const [pan, setPan]             = useState({ x: 0, y: 0 });
  const [zoom, setZoom]           = useState(0.9);
  const [isPanning, setIsPanning] = useState(false);
  const [dragId, setDragId]       = useState<string | null>(null);
  const [dragOff, setDragOff]     = useState({ x: 0, y: 0 });
  const [liveDrag, setLiveDrag]   = useState<{ srcId: string; handleId: string; cx: number; cy: number } | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [saveStatus, setSave]     = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loading, setLoading]     = useState(false);
  const [flowId, setFlowId]       = useState<string | null>(fIdProp && fIdProp !== "new" ? fIdProp : null);
  const [nameLocal, setNameLocal] = useState(fNameProp || "Untitled Bot Flow");
  const flowName = fNameProp || nameLocal;
  const setFlowName = (v: string) => { setNameLocal(v); onFlowNameChange?.(v); };

  // ── Auto-layout helpers ──────────────────────────────────────────────────────
  // BFS tree layout: assigns x/y based on depth (column) and sibling index (row)
  // COL_GAP = horizontal gap between columns, ROW_GAP = vertical gap between rows

  // Returns the column depth of each node id using BFS from trigger
  // colMap: nodeId -> depth (0=trigger, 1=welcome, 2=parent/student, ...)
  // rowMap: nodeId -> row index within that depth

  useEffect(() => {
    if (!fIdProp || fIdProp === "new") return;
    setLoading(true);
    api.get(`/api/automation_flows/${fIdProp}`)
      .then(res => {
        const raw = res.data?.flow || res.data;

        // ── Detect schema format ─────────────────────────────────────────────
        // Format A (editor-saved):  raw.flow_data = { welcome_message, nodes, ... }
        // Format B (flat DB doc):   raw = { welcome_message, nodes, ... }
        const isWrapped = !!(raw?.flow_data);
        const data: any = isWrapped ? raw.flow_data : raw;
        const flowName_ = raw?.name || fNameProp || "Untitled Bot Flow";
        const savedId   = raw?.flow_id || raw?._id || fIdProp;
        if (!data) return;

        const ui: Record<string, { x: number; y: number }> = data.ui_config?.nodes || {};
        const hasSavedPos = Object.keys(ui).length > 0;

        const lN: CNode[] = [];
        const lE: CEdge[] = [];
        const rawNodes: Record<string, any> = data.nodes || {};

        // ── Trigger ──────────────────────────────────────────────────────────
        lN.push({ id: "trigger", kind: "trigger", x: 0, y: 0,
          trigger_messages: data.trigger_messages || "" });

        // ── Welcome message ──────────────────────────────────────────────────
        // Try standard field first, then fallback to nodes["welcome"] (mis-saved)
        let wmInteractive: any = null;
        const wmRaw = data.welcome_message;
        if (wmRaw?.type === "interactive")  wmInteractive = wmRaw.interactive;
        else if (wmRaw?.interactive)         wmInteractive = wmRaw.interactive;
        // Fallback: editor may have saved welcome as a button node in nodes["welcome"]
        else if (rawNodes["welcome"]?.type === "button") {
          const wn = rawNodes["welcome"];
          wmInteractive = { type: "button", header: wn.header, body_text: wn.body_text, buttons: wn.buttons || [] };
        }

        if (wmInteractive) {
          const cleanBtns = (wmInteractive.buttons || [])
            .filter((b: any) => b?.reply?.id && b?.reply?.title);
          lN.push({ id: "welcome", kind: "welcome", x: 0, y: 0,
            welcomeHeader: wmInteractive.header,
            welcomeBodyText: wmInteractive.body_text || "",
            welcomeButtons: cleanBtns });
          lE.push({ srcId: "trigger", handleId: "__out__", tgtId: "welcome" });
          for (const b of cleanBtns) {
            // Edge only if a node with that id exists
            if (rawNodes[b.reply.id]) lE.push({ srcId: "welcome", handleId: b.reply.id, tgtId: b.reply.id });
          }
        }

        // ── All other nodes (skip "welcome" if we used it above) ─────────────
        for (const [nid, nd] of Object.entries(rawNodes)) {
          if (nid === "welcome") continue; // handled above as welcome node
          if (nd.type === "button") {
            const cleanBtns = (nd.buttons || []).filter((b: any) => b?.reply?.id && b?.reply?.title);
            lN.push({ id: nid, kind: "button_msg", x: 0, y: 0,
              body_text: nd.body_text, header: nd.header, buttons: cleanBtns });
            for (const b of cleanBtns) {
              if (rawNodes[b.reply.id]) lE.push({ srcId: nid, handleId: b.reply.id, tgtId: b.reply.id });
            }
          } else if (nd.type === "list") {
            lN.push({ id: nid, kind: "list_msg", x: 0, y: 0,
              body_text: nd.body_text, button_text: nd.button_text, sections: nd.sections || [] });
            for (const sec of nd.sections || []) {
              for (const r of sec.rows || []) {
                if (r.id && rawNodes[r.id]) lE.push({ srcId: nid, handleId: r.id, tgtId: r.id });
              }
            }
          } else if (nd.type === "cta_url") {
            lN.push({ id: nid, kind: "cta_url", x: 0, y: 0,
              body_text: nd.body_text, cta_label: nd.button_text, url: nd.url });
          }
        }

        // ── Assign positions ─────────────────────────────────────────────────
        if (hasSavedPos) {
          for (const n of lN) { if (ui[n.id]) { n.x = ui[n.id].x; n.y = ui[n.id].y; } }
          const unplaced = lN.filter(n => n.x === 0 && n.y === 0 && !ui[n.id]);
          unplaced.forEach((n, i) => { n.x = 80 + (Object.keys(ui).length + i) * 400; n.y = 100 + i * 220; });
        } else {
          // BFS tree layout: column = graph depth, rows spread vertically
          const COL_W = 400;
          const colMap: Record<string, number> = { trigger: 0 };
          const bfsQ: string[] = ["trigger"];
          const visited = new Set<string>(["trigger"]);
          while (bfsQ.length) {
            const cur = bfsQ.shift()!;
            const curCol = colMap[cur];
            for (const e of lE.filter(e => e.srcId === cur)) {
              if (!visited.has(e.tgtId)) {
                visited.add(e.tgtId); colMap[e.tgtId] = curCol + 1; bfsQ.push(e.tgtId);
              }
            }
          }
          // Nodes not reachable (orphans) go in last column+
          let orphanCol = Math.max(0, ...Object.values(colMap)) + 1;
          for (const n of lN) { if (colMap[n.id] === undefined) colMap[n.id] = orphanCol++; }

          // Group by column
          const colGroups: Record<number, string[]> = {};
          for (const n of lN) {
            const col = colMap[n.id];
            if (!colGroups[col]) colGroups[col] = [];
            colGroups[col].push(n.id);
          }
          const nodeMap = Object.fromEntries(lN.map(n => [n.id, n]));

          for (const [colStr, ids] of Object.entries(colGroups)) {
            const col = Number(colStr);
            const GAP = 24; // vertical gap between nodes
            const heights = ids.map(id => nodeH(nodeMap[id]) + GAP);
            const totalH = heights.reduce((a, b) => a + b, 0);
            let yOff = Math.max(60, 400 - totalH / 2); // center around y=400
            for (let i = 0; i < ids.length; i++) {
              nodeMap[ids[i]].x = 80 + col * COL_W;
              nodeMap[ids[i]].y = yOff;
              yOff += heights[i];
            }
          }
        }

        setNodes(lN);
        setEdges(lE);
        setFlowName(flowName_);
        setFlowId(savedId);

        // Auto-fit canvas after nodes are placed
        setTimeout(() => {
          const cw = canvasRef.current?.clientWidth || 1200;
          const ch = canvasRef.current?.clientHeight || 700;
          if (!lN.length) return;
          const xs = lN.flatMap(n => [n.x, n.x + NW]);
          const ys = lN.flatMap(n => [n.y, n.y + nodeH(n)]);
          const minX = Math.min(...xs), maxX = Math.max(...xs);
          const minY = Math.min(...ys), maxY = Math.max(...ys);
          const pad = 80;
          const nz = Math.min(0.85, Math.max(0.25, Math.min(
            (cw - pad * 2) / Math.max(maxX - minX, 1),
            (ch - pad * 2) / Math.max(maxY - minY, 1)
          )));
          setZoom(nz);
          setPan({ x: cw / 2 - (minX + (maxX - minX) / 2) * nz, y: ch / 2 - (minY + (maxY - minY) / 2) * nz });
        }, 150);
      })
      .catch(err => { console.error("Load error:", err); toast.error("Failed to load flow"); })
      .finally(() => setLoading(false));
  }, [fIdProp]);

  const handleSave = useCallback(async (publish = false) => {
    setSave("saving");
    const schema = buildSchema(nodes, flowName);
    const ui: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) ui[n.id] = { x: n.x, y: n.y };
    try {
      const payload = { name: flowName, status: publish ? "published" : "draft", trigger_type: "whatsapp_message_received", flow_data: { ...schema, ui_config: { nodes: ui } } };
      const isEx = flowId && flowId !== "new";
      const res  = isEx ? await api.patch(`/api/automation_flows/${flowId}`, payload) : await api.post("/api/automation_flows", payload);
      const saved = res.data?.flow || res.data;
      const sid   = saved?.flow_id || saved?._id;
      if (sid && !isEx) { setFlowId(sid); onFlowIdChange?.(sid); }
      setSave("saved");
      toast.success(publish ? "Flow published!" : "Flow saved");
      if (publish) setTimeout(onBack, 1200);
    } catch (err: any) {
      setSave("error");
      toast.error(err?.response?.data?.detail || "Save failed");
    } finally { setTimeout(() => setSave("idle"), 3000); }
  }, [nodes, flowName, flowId, api, onBack, onFlowIdChange]);

  const onCanvasMD  = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.canvas) { setIsPanning(true); setSelId(null); }
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) { setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY })); return; }
    if (dragId) {
      const r = canvasRef.current?.getBoundingClientRect(); if (!r) return;
      setNodes(ns => ns.map(n => n.id === dragId ? { ...n, x: (e.clientX - r.left - pan.x) / zoom - dragOff.x, y: (e.clientY - r.top - pan.y) / zoom - dragOff.y } : n));
      return;
    }
    if (liveDrag) setLiveDrag(d => d ? { ...d, cx: e.clientX, cy: e.clientY } : null);
  }, [isPanning, dragId, dragOff, pan, zoom, liveDrag]);

  const onMouseUp  = () => { setIsPanning(false); setDragId(null); setLiveDrag(null); };
  const onWheel    = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const r = canvasRef.current?.getBoundingClientRect(); if (!r) return;
    const nz = Math.min(Math.max(zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.2), 2.5);
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

  const onHandleDown = (nid: string, hid: string, e: React.MouseEvent) => setLiveDrag({ srcId: nid, handleId: hid, cx: e.clientX, cy: e.clientY });
  const onInputUp = (tgtId: string) => {
    if (!liveDrag || liveDrag.srcId === tgtId) return;
    const { srcId, handleId } = liveDrag;

    // Update button/row reply.id to the target node id (this IS the routing key in DB schema)
    // AND update the edge handleId to stay in sync
    let newHandleId = handleId; // will be updated to tgtId after node sync

    setNodes(ns => ns.map(n => {
      if (n.id !== srcId) return n;
      if (n.kind === "welcome" && n.welcomeButtons) {
        const idx = n.welcomeButtons.findIndex(b => b.reply.id === handleId);
        if (idx === -1) return n;
        const btns = [...n.welcomeButtons];
        btns[idx] = { ...btns[idx], reply: { ...btns[idx].reply, id: tgtId } };
        newHandleId = tgtId; // new reply.id becomes the edge handleId
        return { ...n, welcomeButtons: btns };
      }
      if (n.kind === "button_msg" && n.buttons) {
        const idx = n.buttons.findIndex(b => b.reply.id === handleId);
        if (idx === -1) return n;
        const btns = [...n.buttons];
        btns[idx] = { ...btns[idx], reply: { ...btns[idx].reply, id: tgtId } };
        newHandleId = tgtId;
        return { ...n, buttons: btns };
      }
      if (n.kind === "list_msg" && n.sections) {
        const secs = n.sections.map(sec => ({
          ...sec,
          rows: sec.rows.map(r => r.id === handleId ? { ...r, id: tgtId } : r),
        }));
        newHandleId = tgtId;
        return { ...n, sections: secs };
      }
      return n;
    }));

    // Add/replace the edge — handleId synced to new reply.id (= tgtId)
    setEdges(es => {
      const filtered = es.filter(e => !(e.srcId === srcId && e.handleId === handleId));
      return [...filtered, { srcId, handleId: newHandleId, tgtId }];
    });

    setLiveDrag(null);
  };

  const addNode = (kind: NodeKind) => {
    const id  = kind === "welcome" ? "welcome" : uid(kind === "button_msg" ? "btn" : kind === "list_msg" ? "list" : "cta");
    const maxX = Math.max(...nodes.map(n => n.x), 80);
    const newN: CNode = { id, kind, x: maxX + 400, y: 200,
      ...(kind === "welcome"    ? { welcomeButtons: [{ type: "reply" as const, reply: { id: "", title: "" } }, { type: "reply" as const, reply: { id: "", title: "" } }] }
        : kind === "button_msg" ? { buttons: [{ type: "reply" as const, reply: { id: "", title: "" } }, { type: "reply" as const, reply: { id: "", title: "" } }] }
        : kind === "list_msg"   ? { button_text: "Select Option", sections: [{ title: "Options", rows: [{ id: "", title: "" }, { id: "", title: "" }] }] }
        : {}),
    };
    setNodes(ns => [...ns, newN]); setSelId(id);
  };

  const updateNode = (id: string, p: Partial<CNode>) => setNodes(ns => ns.map(n => n.id === id ? { ...n, ...p } : n));
  const deleteNode = (id: string) => { if (id === "trigger") return; setNodes(ns => ns.filter(n => n.id !== id)); setEdges(es => es.filter(e => e.srcId !== id && e.tgtId !== id)); setSelId(null); };

  const fitView = useCallback(() => {
    if (!nodes.length || !canvasRef.current) return;
    const cw = canvasRef.current.clientWidth, ch = canvasRef.current.clientHeight;
    const xs = nodes.flatMap(n => [n.x, n.x + NW]);
    const ys = nodes.flatMap(n => [n.y, n.y + nodeH(n)]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad = 80, nz = Math.min(Math.max(Math.min((cw - pad * 2) / (maxX - minX || 1), (ch - pad * 2) / (maxY - minY || 1)), 0.3), 1.2);
    setZoom(nz);
    setPan({ x: cw / 2 - (minX + (maxX - minX) / 2) * nz, y: ch / 2 - (minY + (maxY - minY) / 2) * nz });
  }, [nodes]);

  // Edges — pure positional math, zero DOM reads, stable at any zoom/pan
  const svgPaths = useMemo(() => {
    const paths: Array<{ d: string; color: string; key: string; dash: boolean }> = [];
    for (const e of edges) {
      const src = nodes.find(n => n.id === e.srcId);
      const tgt = nodes.find(n => n.id === e.tgtId);
      if (!src || !tgt) continue; // skip if either node doesn't exist yet
      if (!e.handleId || e.handleId === '') continue; // skip edges with no handle
      const sp = outPos(src, e.handleId);
      const tp = inPos(tgt);
      paths.push({ d: makePath(sp.x, sp.y, tp.x, tp.y), color: TH[src.kind].accent, key: `${e.srcId}-${e.handleId}-${e.tgtId}`, dash: false });
    }
    if (liveDrag && canvasRef.current) {
      const src = nodes.find(n => n.id === liveDrag.srcId);
      if (src) {
        const cr = canvasRef.current.getBoundingClientRect();
        const sp = outPos(src, liveDrag.handleId);
        const tx = (liveDrag.cx - cr.left - pan.x) / zoom;
        const ty = (liveDrag.cy - cr.top  - pan.y) / zoom;
        paths.push({ d: makePath(sp.x, sp.y, tx, ty), color: TH[src.kind].accent, key: "live", dash: true });
      }
    }
    return paths;
  }, [edges, nodes, liveDrag, pan, zoom]);

  const selNode = nodes.find(n => n.id === selId) || null;

  if (loading) return (
    <div className="h-full flex items-center justify-center" style={{ background: "#f8fafc" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div className="w-9 h-9 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        <p style={{ fontSize: 13, color: "#94a3b8" }}>Loading flow…</p>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden" style={{ background: "#f8fafc" }}>

      {/* ── Top bar ── */}
      <div style={{ height: 52, background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button onClick={onBack}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#64748b", flexShrink: 0 }}>
            <ArrowLeft size={15} />
          </button>
          <div style={{ width: 1, height: 18, background: "#e2e8f0", flexShrink: 0 }} />
          <input value={flowName} onChange={e => setFlowName(e.target.value)}
            style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", background: "transparent", border: "none", outline: "none", minWidth: 0, width: 180 }}
            placeholder="Flow name…" />
          <span style={{ padding: "3px 10px", borderRadius: 6, background: "#dcfce7", color: "#166534", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
            WA Bot
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button onClick={() => setShowAdd(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
            <Plus size={13} /> Add Node
          </button>
          <div style={{ width: 1, height: 18, background: "#e2e8f0" }} />
          {saveStatus === "saving" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8" }}><Loader2 size={13} className="animate-spin" />Saving…</span>
          ) : saveStatus === "saved" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#16a34a", fontWeight: 600 }}><CheckCircle2 size={13} />Saved</span>
          ) : (
            <button onClick={() => handleSave(false)}
              style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
              <Save size={13} />Save
            </button>
          )}
          <button onClick={() => handleSave(true)} disabled={saveStatus === "saving"}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 16px", borderRadius: 8, background: "#075E54", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", opacity: saveStatus === "saving" ? 0.55 : 1 }}>
            <Play size={12} />Publish
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Canvas */}
        <div
          ref={canvasRef}
          data-canvas="1"
          style={{
            flex: 1, position: "relative", overflow: "hidden",
            backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            backgroundPosition: `${pan.x % 22}px ${pan.y % 22}px`,
            cursor: isPanning ? "grabbing" : "default",
          }}
          onMouseDown={onCanvasMD}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onWheel={onWheel}
        >
          <div data-canvas="1" style={{ position: "absolute", inset: 0, zIndex: 0 }} />

          {/* World transform layer */}
          <div style={{
            position: "absolute", inset: 0,
            transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            pointerEvents: "none",
          }}>
            {/* SVG edges */}
            <svg style={{ position: "absolute", inset: 0, width: "10000px", height: "10000px", overflow: "visible" }}>
              <defs>
                <marker id="wab-end" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 1.5 L 7 4 L 0 6.5 z" fill="#94a3b8" />
                </marker>
              </defs>
              {svgPaths.map(p => (
                <path key={p.key} d={p.d} fill="none"
                  stroke={p.dash ? p.color + "70" : p.color}
                  strokeWidth="2"
                  strokeDasharray={p.dash ? "7 4" : "none"}
                  strokeLinecap="round"
                  opacity={0.9}
                  markerEnd="url(#wab-end)"
                />
              ))}
            </svg>

            {/* Nodes */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {nodes.map(n => (
                <div key={n.id} style={{ pointerEvents: "all" }}>
                  <NodeCard
                    node={n}
                    selected={selId === n.id}
                    onMouseDown={e => startDrag(e, n.id)}
                    onSelect={() => setSelId(n.id)}
                    onHandleDown={onHandleDown}
                    onInputUp={onInputUp}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Empty state hint */}
          {nodes.length <= 1 && (
            <div style={{ position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", whiteSpace: "nowrap" }}>
                <Plus size={13} color="#94a3b8" />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Click <strong style={{ color: "#374151" }}>Add Node</strong> to build your flow</span>
              </div>
            </div>
          )}

          {/* Zoom controls */}
          <div style={{
            position: "absolute", bottom: 24, right: 24,
            display: "flex", flexDirection: "column",
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden",
            boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          }}>
            {[
              { icon: <ZoomIn size={14} />, fn: () => setZoom(z => Math.min(z + 0.1, 2.5)) },
              { icon: <span style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b" }}>{Math.round(zoom * 100)}%</span>, fn: null },
              { icon: <ZoomOut size={14} />, fn: () => setZoom(z => Math.max(z - 0.1, 0.2)) },
              { icon: <Maximize2 size={14} />, fn: fitView },
            ].map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ height: 1, background: "#f1f5f9" }} />}
                <button onClick={b.fn || undefined} disabled={!b.fn}
                  style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: b.fn ? "pointer" : "default", color: "#64748b" }}
                  onMouseEnter={e => { if (b.fn) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  {b.icon}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right panel */}
        {selNode && (
          <RightPanel
            node={selNode}
            onChange={p => updateNode(selNode.id, p)}
            onDelete={() => deleteNode(selNode.id)}
            onClose={() => setSelId(null)}
          />
        )}
      </div>

      {showAdd && <AddMenu onAdd={addNode} onClose={() => setShowAdd(false)} />}
    </div>
  );
}