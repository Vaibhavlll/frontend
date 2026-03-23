/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  ArrowLeft, Save, Loader2, Plus, X, Trash2, ExternalLink,
  List, MousePointer2, ZoomIn, ZoomOut, Maximize2, Hash, Link2,
  CheckCircle2, MessageSquare, ChevronRight, Video, Image, Type,
  Play, Star, Copy, Eye, Code, EyeOff,
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
// LAYOUT CONSTANTS
// These MUST match the pixel sizes in NodeCard's render output exactly.
// If you change any padding/height below, update the card render to match.
// ─────────────────────────────────────────────────────────────────────────────

const NW          = 272;   // card width
const STRIPE_H    = 3;     // top accent stripe
const HDR_H       = 70;    // header content height (badge + title + vertical padding)
const PRE_H       = 84;    // preview section height
const NH_BASE     = STRIPE_H + HDR_H + PRE_H;  // = 157 — card height with no handles
const HDL_BORDER  = 1;     // border-top before handle rows
const HDL_PAD     = 10;    // vertical padding above & below handle rows
const CHIP_H      = 34;    // height of each handle chip
const CHIP_GAP    = 6;     // gap between chips (flex gap)
const SLOT        = CHIP_H + CHIP_GAP; // = 40 — height per handle slot (chip + gap)
const DOT_D       = 14;    // connection dot diameter
const DOT_R       = DOT_D / 2; // = 7

// First chip's top edge, from node top
const CHIPS_TOP = NH_BASE + HDL_BORDER + HDL_PAD;

// Center Y of chip[idx] dot from node top
function chipDotY(idx: number): number {
  return CHIPS_TOP + idx * SLOT + CHIP_H / 2;
}

// Total node height
function nodeH(n: CNode): number {
  const hs = getHandles(n);
  if (!hs.length) return NH_BASE;
  return CHIPS_TOP + hs.length * CHIP_H + Math.max(0, hs.length - 1) * CHIP_GAP + HDL_PAD;
}

// Ordered list of handles exposed by the node.
// IMPORTANT: IDs are positional ("btn_0", "row_1_2") not the reply.id.
// This lets multiple handles route to the same target node independently.
function getHandles(n: CNode): Array<{ id: string; label: string; targetId: string }> {
  if (n.kind === "welcome")
    return (n.welcomeButtons || [])
      .map((b, i) => ({ id: `btn_${i}`, label: b.reply.title, targetId: b.reply.id }))
      .filter(h => h.label?.trim());
  if (n.kind === "button_msg")
    return (n.buttons || [])
      .map((b, i) => ({ id: `btn_${i}`, label: b.reply.title, targetId: b.reply.id }))
      .filter(h => h.label?.trim());
  if (n.kind === "list_msg") {
    const r: Array<{ id: string; label: string; targetId: string }> = [];
    for (let si = 0; si < (n.sections || []).length; si++)
      for (let ri = 0; ri < (n.sections![si].rows || []).length; ri++) {
        const row = n.sections![si].rows[ri];
        if (row.title?.trim()) r.push({ id: `row_${si}_${ri}`, label: row.title, targetId: row.id || "" });
      }
    return r;
  }
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// EDGE POSITION MATH
// Output dot center in world space.
// ─────────────────────────────────────────────────────────────────────────────

function outPos(n: CNode, handleId: string): { x: number; y: number } {
  // Trigger special: single dot centered at the card's bottom edge
  if (handleId === "__out__")
    return { x: n.x + NW / 2, y: n.y + nodeH(n) };

  const hs = getHandles(n);
  const idx = hs.findIndex(h => h.id === handleId);
  // Dot CSS: left: NW - DOT_R → center at n.x + NW
  return {
    x: n.x + NW,
    y: n.y + (idx >= 0 ? chipDotY(idx) : NH_BASE / 2),
  };
}

// Input dot center in world space
// Dot CSS: left: -DOT_D → top-left at n.x - DOT_D → center at n.x - DOT_R
// We connect TO this dot from the right, so path endpoint = n.x - DOT_R
// which visually meets the dot's right hemisphere tangentially
function inPos(n: CNode): { x: number; y: number } {
  return {
    x: n.x - DOT_R,
    y: n.y + STRIPE_H + HDR_H / 2,
  };
}

// Universal bezier path — one formula for every connection type.
//
// startDown=true  → trigger bottom dot exits DOWNWARD then curves to left-entry
// everything else → exits RIGHTWARD from source, enters from LEFT at target
//
// The single cubic formula "exit right / enter left" works for all cases:
//   forward (tx > sx) : clean S-curve
//   upward  (ty < sy) : swings right then up to target
//   backward (tx < sx): swings right past source, arcs over to target — no elbows
//
// offset = generous horizontal pull on both control points, scaled to
// both dx and dy so the curve stays round regardless of angle.
function makePath(sx: number, sy: number, tx: number, ty: number, startDown = false): string {
  if (startDown) {
    // Trigger bottom dot: exits downward, arrives from the left
    const dy  = Math.abs(ty - sy);
    const dx  = Math.abs(tx - sx);
    const cpV = Math.max(60, dy * 0.55, dx * 0.3);
    const cpH = Math.max(60, dx * 0.55, dy * 0.3);
    return `M${sx},${sy} C${sx},${sy + cpV} ${tx - cpH},${ty} ${tx},${ty}`;
  }

  // For all right-side handle → left-side input connections:
  const absDx = Math.abs(tx - sx);
  const absDy = Math.abs(ty - sy);
  // offset grows with both horizontal and vertical distance for consistent roundness
  const offset = Math.max(absDx * 0.45 + absDy * 0.15, 80);
  return `M${sx},${sy} C${sx + offset},${sy} ${tx - offset},${ty} ${tx},${ty}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const TH: Record<NodeKind, { accent: string; bg: string; fg: string; label: string }> = {
  trigger:    { accent: "#4f46e5", bg: "#eef2ff", fg: "#4338ca", label: "Trigger"         },
  welcome:    { accent: "#7c3aed", bg: "#f5f3ff", fg: "#6d28d9", label: "Welcome Message" },
  button_msg: { accent: "#059669", bg: "#ecfdf5", fg: "#047857", label: "Button Message"  },
  list_msg:   { accent: "#0891b2", bg: "#ecfeff", fg: "#0e7490", label: "List Message"    },
  cta_url:    { accent: "#2563eb", bg: "#eff6ff", fg: "#1d4ed8", label: "CTA URL"         },
};

const KIND_ICON: Record<NodeKind, React.ReactNode> = {
  trigger:    <MessageSquare size={10} />,
  welcome:    <Star size={10} />,
  button_msg: <MousePointer2 size={10} />,
  list_msg:   <List size={10} />,
  cta_url:    <ExternalLink size={10} />,
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA BUILDER — output exactly matches the expected DB JSON format
// ─────────────────────────────────────────────────────────────────────────────

// buildSchema uses the edges array to derive schema.nodes keys from button reply.id
// values (title slugs) rather than opaque canvas UIDs.
//
// How it works:
//   1. Walk every source node's buttons / list-rows.
//   2. Find the edge whose handleId matches that button/row's positional handle.
//   3. The target canvas node (edge.tgtId) should be stored in schema.nodes under
//      the button's reply.id (e.g. "parent", "student") — NOT the canvas UID.
//   4. If a node has no incoming edge yet, fall back to its canvas id as the key.
//
// This guarantees that when WhatsApp sends back reply.id="parent", the webhook can
// find nodes["parent"] in the saved document and route correctly.
function buildSchema(nodes: CNode[], edges: CEdge[], name: string) {
  const tr = nodes.find(n => n.kind === "trigger");
  const wm = nodes.find(n => n.kind === "welcome");

  // ── PASS 1: sanitize all buttons/rows, collect ALL schema keys per canvas node ──
  //
  // KEY INVARIANT:
  //   button.reply.id  ===  schema.nodes key for the node that button leads to
  //   row.id           ===  schema.nodes key for the node that row leads to
  //
  // MULTI-KEY: When multiple buttons/rows from different nodes point to the same
  // canvas node, that canvas node must appear in schema.nodes under EVERY key
  // (one per button that leads to it). Otherwise the webhook can't find the node
  // when it receives the other button's reply.id.
  //
  // e.g. "Parent" button (reply.id="parent") and "Student" button (reply.id="student")
  // both connect to canvas node btn_abc → schema.nodes must have BOTH "parent" and
  // "student" entries with identical content.
  //
  // canvasToAllKeys: canvas node id → every schema key pointing to it
  // canvasToPrimaryKey: canvas node id → first key (used for ui_config positions)

  const canvasToAllKeys:    Record<string, string[]> = {};  // canvas id → [key1, key2, ...]
  const canvasToPrimaryKey: Record<string, string>   = {};  // canvas id → first key

  const addKey = (canvasId: string, key: string) => {
    if (!canvasToAllKeys[canvasId]) canvasToAllKeys[canvasId] = [];
    if (!canvasToAllKeys[canvasId].includes(key)) {
      canvasToAllKeys[canvasId].push(key);
      if (!canvasToPrimaryKey[canvasId]) canvasToPrimaryKey[canvasId] = key;
    }
  };

  // Sanitized button/section arrays keyed by canvas node id
  const sanitizedBtnsMap: Record<string, WaButton[]>  = {};
  const sanitizedSecsMap: Record<string, WaSection[]> = {};

  // Welcome buttons
  let wmBtns: WaButton[] = [];
  if (wm) {
    wmBtns = sanitizeButtons((wm.welcomeButtons || []).filter(b => b.reply.title));
    wmBtns.forEach((b, i) => {
      const edge = edges.find(e => e.srcId === "welcome" && e.handleId === `btn_${i}`);
      if (edge) addKey(edge.tgtId, b.reply.id);
    });
  }

  // All other nodes
  for (const n of nodes) {
    if (n.kind === "trigger" || n.kind === "welcome") continue;
    if (n.kind === "button_msg") {
      const cb = sanitizeButtons((n.buttons || []).filter(b => b.reply.title));
      sanitizedBtnsMap[n.id] = cb;
      cb.forEach((b, i) => {
        const edge = edges.find(e => e.srcId === n.id && e.handleId === `btn_${i}`);
        if (edge) addKey(edge.tgtId, b.reply.id);
      });
    } else if (n.kind === "list_msg") {
      const cs = sanitizeSections(n.sections || []);
      sanitizedSecsMap[n.id] = cs;
      cs.forEach((sec, si) => {
        sec.rows.forEach((row, ri) => {
          const edge = edges.find(e => e.srcId === n.id && e.handleId === `row_${si}_${ri}`);
          if (edge) addKey(edge.tgtId, row.id);
        });
      });
    }
  }

  // Nodes not reached by any edge fall back to their canvas id as the sole key
  for (const n of nodes) {
    if (!canvasToAllKeys[n.id]) addKey(n.id, n.id);
  }

  // ── PASS 2: write schema — each canvas node appears under ALL its keys ──

  const schema: any = {
    name,
    // NOTE: status is intentionally omitted here — the caller sets it based on
    // whether they are saving a draft or publishing, and spreads it into the payload
    // AFTER this schema. Including it here would overwrite the caller's value.
    trigger_event: "message_received",
    trigger_from: "webhook",
    trigger_messages: tr?.trigger_messages || "",
    nodes: {},
  };

  if (wm) {
    schema.welcome_message = {
      type: "interactive",
      interactive: {
        type: "button",
        ...(wm.welcomeHeader ? { header: wm.welcomeHeader } : {}),
        body_text: wm.welcomeBodyText || "",
        buttons: wmBtns,
      },
    };
  }

  for (const n of nodes) {
    if (n.kind === "trigger" || n.kind === "welcome") continue;
    const keys = canvasToAllKeys[n.id] || [n.id];
    let nodeData: any;
    if (n.kind === "button_msg") {
      nodeData = {
        type: "button",
        body_text: n.body_text || "",
        ...(n.header ? { header: n.header } : {}),
        buttons: sanitizedBtnsMap[n.id] || [],
      };
    } else if (n.kind === "list_msg") {
      nodeData = {
        type: "list",
        body_text: n.body_text || "",
        button_text: n.button_text || "Select",
        sections: sanitizedSecsMap[n.id] || [],
      };
    } else if (n.kind === "cta_url") {
      nodeData = {
        type: "cta_url",
        body_text: n.body_text || "",
        button_text: n.cta_label || "Open",
        url: n.url || "",
      };
    }
    // Write the same node data under every key that points to this canvas node.
    // This ensures webhook routing works regardless of which button/row was tapped.
    if (nodeData) for (const key of keys) schema.nodes[key] = nodeData;
  }
  return { schema, canvasToPrimaryKey };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function uid(p = "n") { return `${p}_${Math.random().toString(36).slice(2, 8)}`; }
function toId(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "item";
}
// Ensures the generated ID is unique among a list of already-used IDs.
// e.g. makeUniqueId("parent", ["parent"]) → "parent_2"
function makeUniqueId(base: string, used: string[]): string {
  const safe = base || "item";
  if (!used.includes(safe)) return safe;
  let n = 2;
  while (used.includes(`${safe}_${n}`)) n++;
  return `${safe}_${n}`;
}

// ─── ID SANITIZERS ────────────────────────────────────────────────────────────
// These run at save-time AND load-time to guarantee:
//   • Every button / row has a non-empty reply.id / row.id
//   • All IDs within the same node are UNIQUE
//   • Canvas UIDs (btn_xxxxxx / list_xxxxxx / n_xxxxxx) are never used as
//     reply.id — they are meaningless to the webhook; only title-slugs work.
//
// If the user never explicitly edited the ID field, the auto-slug from their
// title is the canonical value.  If they DID edit it we keep their value but
// still guarantee uniqueness.
//
// A string looks like a canvas UID when it matches the uid() output pattern:
//   (btn|list|cta|n)_[a-z0-9]{6}
const CANVAS_UID_RE = /^(?:btn|list|cta|n)_[a-z0-9]{5,8}$/;
function looksLikeCanvasUid(s: string) { return CANVAS_UID_RE.test(s); }

/** Sanitize reply buttons so every entry has a unique, meaningful reply.id. */
function sanitizeButtons(buttons: WaButton[]): WaButton[] {
  const used: string[] = [];
  return buttons.map(b => {
    // If id is missing or looks like a canvas UID, re-derive from title
    let id = b.reply.id?.trim();
    if (!id || looksLikeCanvasUid(id)) id = toId(b.reply.title);
    id = makeUniqueId(id || "btn", used);
    used.push(id);
    return { type: "reply", reply: { id, title: b.reply.title } };
  });
}

/** Sanitize list sections so every row has a unique, meaningful id. */
function sanitizeSections(sections: WaSection[]): WaSection[] {
  const usedGlobal: string[] = [];         // IDs must be unique across ALL sections
  return sections.map(sec => ({
    ...sec,
    rows: sec.rows.map(row => {
      let id = row.id?.trim();
      if (!id || looksLikeCanvasUid(id)) id = toId(row.title);
      id = makeUniqueId(id || "row", usedGlobal);
      usedGlobal.push(id);
      return { ...row, id };
    }),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// PANEL PRIMITIVES — shared across right-panel editors
// ─────────────────────────────────────────────────────────────────────────────

function PLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: "#94a3b8", marginBottom: 6, margin: "0 0 6px" }}>
      {children}
    </p>
  );
}

function PInput({ value, onChange, placeholder, maxLength, mono }: {
  value: string; onChange(v: string): void;
  placeholder?: string; maxLength?: number; mono?: boolean;
}) {
  return (
    <input
      type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} maxLength={maxLength}
      style={{
        width: "100%", height: 38, padding: "0 12px",
        border: "1.5px solid #e2e8f0", borderRadius: 9,
        fontSize: mono ? 12 : 13, fontFamily: mono ? "monospace" : "inherit",
        color: "#0f172a", background: "#fff", outline: "none",
        boxSizing: "border-box", transition: "border-color 0.15s",
      }}
      onFocus={e => { (e.target as HTMLElement).style.borderColor = "#6366f1"; }}
      onBlur={e => { (e.target as HTMLElement).style.borderColor = "#e2e8f0"; }}
    />
  );
}

function PTA({ value, onChange, rows = 4, placeholder }: {
  value: string; onChange(v: string): void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea
      rows={rows} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "10px 12px",
        border: "1.5px solid #e2e8f0", borderRadius: 9,
        fontSize: 13, color: "#0f172a", background: "#fff",
        outline: "none", resize: "none", lineHeight: 1.6,
        boxSizing: "border-box", transition: "border-color 0.15s",
        fontFamily: "inherit",
      }}
      onFocus={e => { (e.target as HTMLElement).style.borderColor = "#6366f1"; }}
      onBlur={e => { (e.target as HTMLElement).style.borderColor = "#e2e8f0"; }}
    />
  );
}

function PField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><PLabel>{label}</PLabel>{children}</div>;
}

function PInfo({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "violet" | "green" | "amber" }) {
  const map = {
    blue:   { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
    violet: { bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6" },
    green:  { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
    amber:  { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  }[color];
  return (
    <div style={{ padding: "10px 13px", borderRadius: 9, border: `1.5px solid ${map.border}`,
      background: map.bg, color: map.text, fontSize: 12, lineHeight: 1.55 }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER EDITOR
// ─────────────────────────────────────────────────────────────────────────────

function HeaderEditor({ value, onChange }: { value?: WaHeader; onChange(v?: WaHeader): void }) {
  const cur = value?.type || "none";
  const opts = [
    { k: "none"  as const, icon: <X size={11}     />, label: "None"  },
    { k: "image" as const, icon: <Image size={11} />, label: "Image" },
    { k: "video" as const, icon: <Video size={11} />, label: "Video" },
    { k: "text"  as const, icon: <Type size={11}  />, label: "Text"  },
  ];
  return (
    <PField label="Header (optional)">
      <div style={{ display: "flex", gap: 6 }}>
        {opts.map(o => (
          <button key={o.k} type="button"
            onClick={() => onChange(o.k === "none" ? undefined : { type: o.k } as WaHeader)}
            style={{
              flex: 1, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 4, borderRadius: 8, border: `1.5px solid ${cur === o.k ? "#6366f1" : "#e2e8f0"}`,
              background: cur === o.k ? "#eef2ff" : "#fff",
              color: cur === o.k ? "#4f46e5" : "#64748b",
              fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
            }}>
            {o.icon}{o.label}
          </button>
        ))}
      </div>
      {(cur === "image" || cur === "video") && (
        <PInput
          value={cur === "image" ? (value?.image?.link || "") : (value?.video?.link || "")}
          onChange={v => onChange({ type: cur, ...(cur === "image" ? { image: { link: v } } : { video: { link: v } }) } as WaHeader)}
          placeholder={`${cur === "image" ? "Image" : "Video"} URL`}
        />
      )}
      {cur === "text" && (
        <PInput value={value?.text || ""} onChange={v => onChange({ type: "text", text: v })}
          placeholder="Header text (max 60 chars)" maxLength={60} />
      )}
    </PField>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTONS EDITOR — Meta hard limit: 3 reply buttons per message
// For 4+ options, use List Message (up to 10 rows)
// ─────────────────────────────────────────────────────────────────────────────

const WA_MAX_BUTTONS = 3; // Meta WhatsApp Business API hard limit

function ButtonsEditor({ value, onChange, max = WA_MAX_BUTTONS }: {
  value: WaButton[]; onChange(v: WaButton[]): void; max?: number;
}) {
  const upd = (i: number, title: string) => {
    const n = [...value];
    // Strip makeUniqueId suffix (_2, _3...) before comparing so a deduped ID like
    // "parent_2" is still recognized as auto-derived from title "Parent" and will
    // follow the title when the user renames the button.
    const currentId = n[i]?.reply.id || "";
    const idBase    = currentId.replace(/_\d+$/, "");
    const wasAuto   = !currentId || idBase === toId(n[i]?.reply.title || "");
    if (wasAuto) {
      // Collect IDs already used by other buttons in this node to avoid collisions
      const existingIds = n.filter((_, j) => j !== i).map(b => b.reply.id).filter(Boolean);
      const newId = makeUniqueId(toId(title), existingIds);
      n[i] = { type: "reply", reply: { id: newId, title } };
    } else {
      n[i] = { type: "reply", reply: { id: currentId, title } };
    }
    onChange(n);
  };
  const updId = (i: number, id: string) => {
    const n = [...value]; n[i] = { ...n[i], reply: { ...n[i].reply, id } }; onChange(n);
  };
  const rem = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add = () => { if (value.length < max) onChange([...value, { type: "reply", reply: { id: "", title: "" } }]); };
  const atMax = value.length >= max;

  return (
    <PField label={`Reply Buttons — ${value.length} / ${max}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {value.map((b, i) => (
          <div key={i} style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#f1f5f9",
                fontSize: 10, fontWeight: 700, color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {i + 1}
              </span>
              <input type="text" maxLength={20} placeholder="Button label"
                value={b.reply.title} onChange={e => upd(i, e.target.value)}
                style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#0f172a",
                  background: "transparent", border: "none", outline: "none" }} />
              <button type="button" onClick={() => rem(i)}
                style={{ color: "#cbd5e1", background: "none", border: "none", cursor: "pointer", padding: 2,
                  display: "flex", alignItems: "center" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#cbd5e1"; }}>
                <X size={13} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px" }}>
              <Hash size={10} color="#cbd5e1" style={{ flexShrink: 0 }} />
              <input type="text" placeholder="target_node_id (auto-set)"
                value={b.reply.id} onChange={e => updId(i, e.target.value)}
                style={{ flex: 1, fontSize: 11, fontFamily: "monospace", color: "#64748b",
                  background: "transparent", border: "none", outline: "none" }} />
            </div>
          </div>
        ))}
      </div>

      {!atMax ? (
        <button type="button" onClick={add} style={{
          width: "100%", height: 36, border: "2px dashed #e2e8f0", borderRadius: 10,
          fontSize: 12, fontWeight: 600, color: "#94a3b8", background: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          transition: "all 0.15s", marginTop: 2,
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#059669"; el.style.color = "#059669"; el.style.background = "#f0fdf4"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#e2e8f0"; el.style.color = "#94a3b8"; el.style.background = "#fff"; }}>
          <Plus size={13} /> Add Button
        </button>
      ) : (
        <div style={{ marginTop: 4, padding: "8px 12px", background: "#fffbeb",
          border: "1.5px solid #fde68a", borderRadius: 9,
          fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>
          <strong>Meta limit reached (3/3).</strong> WhatsApp only allows 3 reply buttons per message.
          Need more options? Use a <strong>List Message</strong> instead — supports up to 10 rows.
        </div>
      )}

      <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0", lineHeight: 1.5 }}>
        Meta limit: max {WA_MAX_BUTTONS} buttons. Target Node ID routes to the next message.
      </p>
    </PField>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTIONS EDITOR — Meta hard limit: 10 rows total across all sections
// Max 10 sections, each section max 10 rows, but total rows ≤ 10
// ─────────────────────────────────────────────────────────────────────────────

const WA_MAX_LIST_ROWS = 10;    // Meta WhatsApp Business API hard limit
const WA_MAX_SECTIONS  = 10;    // Meta section limit

function SectionsEditor({ value, onChange }: { value: WaSection[]; onChange(v: WaSection[]): void }) {
  const totalRows = value.reduce((sum, s) => sum + s.rows.length, 0);
  const atRowMax  = totalRows >= WA_MAX_LIST_ROWS;
  const atSecMax  = value.length >= WA_MAX_SECTIONS;

  const updSec = (si: number, t: string) => { const n=[...value]; n[si]={...n[si],title:t}; onChange(n); };
  const remSec = (si: number) => onChange(value.filter((_,i)=>i!==si));
  const addSec = () => { if (!atSecMax) onChange([...value, { title: "Section", rows: [] }]); };
  const addRow = (si: number) => {
    if (atRowMax) return;
    const n=[...value]; n[si]={...n[si],rows:[...n[si].rows,{id:"",title:""}]}; onChange(n);
  };
  const remRow = (si: number, ri: number) => { const n=[...value]; n[si]={...n[si],rows:n[si].rows.filter((_,i)=>i!==ri)}; onChange(n); };
  const updRow = (si: number, ri: number, f: keyof WaRow, v: string) => {
    const n = [...value]; const row = { ...n[si].rows[ri], [f]: v };
    if (f === "title") {
      const currentId = n[si].rows[ri]?.id || "";
      const idBase    = currentId.replace(/_\d+$/, "");
      const wasAuto   = !currentId || idBase === toId(n[si].rows[ri]?.title || "");
      if (wasAuto) {
        // Collect IDs already used by all other rows across all sections to avoid collisions
        const existingIds = n.flatMap((s, s2) =>
          s.rows.filter((_, r2) => !(s2 === si && r2 === ri)).map(r => r.id).filter(Boolean)
        );
        row.id = makeUniqueId(toId(v), existingIds);
      }
    }
    n[si].rows[ri] = row; onChange(n);
  };
  const updRowId = (si: number, ri: number, id: string) => {
    const n=[...value]; n[si].rows[ri]={...n[si].rows[ri],id}; onChange(n);
  };

  return (
    <PField label={`Sections & Rows — ${totalRows} / ${WA_MAX_LIST_ROWS} rows`}>
      {/* Row usage bar */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ height: 4, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4, transition: "width 0.2s",
            background: totalRows >= WA_MAX_LIST_ROWS ? "#ef4444"
              : totalRows >= 7 ? "#f59e0b" : "#0891b2",
            width: `${(totalRows / WA_MAX_LIST_ROWS) * 100}%`,
          }} />
        </div>
        <p style={{ fontSize: 10, color: "#94a3b8", margin: "3px 0 0" }}>
          {WA_MAX_LIST_ROWS - totalRows} row{WA_MAX_LIST_ROWS - totalRows !== 1 ? "s" : ""} remaining
          {atRowMax && <span style={{ color: "#ef4444", fontWeight: 600 }}> · Meta limit reached</span>}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {value.map((sec, si) => (
          <div key={si} style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
              background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <List size={11} color="#0891b2" style={{ flexShrink: 0 }} />
              <input value={sec.title} onChange={e => updSec(si, e.target.value)} placeholder="Section title"
                style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#374151",
                  background: "transparent", border: "none", outline: "none" }} />
              <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0, marginRight: 4 }}>
                {sec.rows.length} rows
              </span>
              {value.length > 1 && (
                <button type="button" onClick={() => remSec(si)} style={{ color: "#cbd5e1", background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}><X size={13} /></button>
              )}
            </div>
            <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: 6 }}>
              {sec.rows.map((row, ri) => (
                <div key={ri} style={{ border: "1px solid #f1f5f9", borderRadius: 8, padding: "8px", background: "#fff", display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input placeholder="Row title (max 24)" maxLength={24} value={row.title}
                      onChange={e => updRow(si, ri, "title", e.target.value)}
                      style={{ flex: 1, height: 30, padding: "0 10px", border: "1.5px solid #e2e8f0",
                        borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}
                      onFocus={e => { (e.target as HTMLElement).style.borderColor = "#0891b2"; }}
                      onBlur={e => { (e.target as HTMLElement).style.borderColor = "#e2e8f0"; }} />
                    <button type="button" onClick={() => remRow(si, ri)} style={{ color: "#cbd5e1", background: "none", border: "none", cursor: "pointer", padding: "0 4px", display: "flex", alignItems: "center" }}><X size={13} /></button>
                  </div>
                  <input placeholder="Description (optional, max 72)" value={row.description || ""} maxLength={72}
                    onChange={e => updRow(si, ri, "description", e.target.value)}
                    style={{ height: 26, padding: "0 10px", border: "1px solid #f1f5f9",
                      borderRadius: 6, fontSize: 11, color: "#64748b", outline: "none", background: "#fff" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Hash size={9} color="#cbd5e1" style={{ flexShrink: 0 }} />
                    <input placeholder="target_node_id" value={row.id}
                      onChange={e => updRowId(si, ri, e.target.value)}
                      style={{ flex: 1, height: 26, padding: "0 8px", border: "1px dashed #e2e8f0",
                        borderRadius: 6, fontSize: 10, fontFamily: "monospace", color: "#64748b", outline: "none", background: "#fff" }} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addRow(si)}
                disabled={atRowMax}
                style={{
                  height: 30, border: `1px dashed ${atRowMax ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 8,
                  fontSize: 11, fontWeight: 600,
                  color: atRowMax ? "#fca5a5" : "#94a3b8",
                  background: "transparent",
                  cursor: atRowMax ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  opacity: atRowMax ? 0.6 : 1,
                }}>
                <Plus size={12} />
                {atRowMax ? "Row limit reached (10)" : "Add Row"}
              </button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addSec}
          disabled={atSecMax || atRowMax}
          style={{
            height: 34, border: `2px dashed ${atRowMax ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 10,
            fontSize: 12, fontWeight: 600,
            color: atRowMax ? "#fca5a5" : "#94a3b8",
            background: "transparent",
            cursor: (atSecMax || atRowMax) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            opacity: (atSecMax || atRowMax) ? 0.6 : 1,
          }}>
          <Plus size={13} />
          {atRowMax ? "10 row limit reached" : "Add Section"}
        </button>
      </div>
    </PField>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE CARD
// KEY FIX: Output handle dots and input dot are rendered as siblings of the
// overflow:hidden card — they cannot be clipped. Positions are computed
// mathematically and match outPos() / inPos() exactly.
// ─────────────────────────────────────────────────────────────────────────────

function NodeCard({
  node, selected,
  onMouseDown, onSelect,
  onHandleDown, onInputUp,
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
      {/* ── INPUT DOT (left side) — sibling of card, never clipped ── */}
      {node.kind !== "trigger" && (
        <div
          onMouseUp={e => { e.stopPropagation(); onInputUp(node.id); }}
          style={{
            position: "absolute",
            left: -DOT_D,                                   // left edge at node.x - DOT_D → center at node.x - DOT_R ✓
            top:  STRIPE_H + HDR_H / 2 - DOT_R,            // matches inPos y
            width: DOT_D, height: DOT_D, borderRadius: "50%",
            background: "#fff",
            border: `2.5px solid ${th.accent}`,
            cursor: "crosshair", zIndex: 30,
            boxShadow: `0 0 0 3px ${th.accent}22`,
            transition: "box-shadow 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 0 0 6px ${th.accent}28`; el.style.transform = "scale(1.2)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 0 0 3px ${th.accent}22`; el.style.transform = "scale(1)"; }}
        />
      )}

      {/* ── CARD BODY — overflow:hidden for clean border-radius ── */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 13, overflow: "hidden",
        background: "#fff",
        border: selected ? `2px solid ${th.accent}` : "1.5px solid #e2e8f0",
        boxShadow: selected
          ? `0 0 0 4px ${th.accent}18, 0 8px 32px rgba(0,0,0,0.10)`
          : "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}>
        {/* Accent stripe — STRIPE_H = 3px */}
        <div style={{ height: STRIPE_H, background: th.accent }} />

        {/* Header — HDR_H = 70px */}
        <div style={{ height: HDR_H, padding: "10px 14px 8px", boxSizing: "border-box" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 8px 3px 6px", borderRadius: 6, marginBottom: 8,
            background: th.bg, color: th.fg,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
          }}>
            {KIND_ICON[node.kind]}
            {th.label}
          </div>
          <p style={{
            fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0,
            lineHeight: 1.35, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
          }}>
            {node.kind === "trigger"
              ? (node.trigger_messages ? `Keys: ${node.trigger_messages}` : "Set trigger keywords…")
              : (previewText.slice(0, 48) || "Click to configure…")}
          </p>
        </div>

        {/* Preview — PRE_H = 84px */}
        <div style={{ height: PRE_H, padding: "0 14px 12px", boxSizing: "border-box" }}>
          {node.kind === "trigger" ? (
            <div style={{ height: "100%", padding: "8px 10px", background: "#f8fafc",
              borderRadius: 8, border: "1px solid #f1f5f9",
              display: "flex", alignItems: "center" }}>
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
                  <span style={{ fontSize: 10, color: th.accent, fontWeight: 600 }}>
                    {node.cta_label || "Open Link"}
                  </span>
                </div>
              )}
              {node.kind === "list_msg" && (
                <div style={{ marginTop: 5, paddingTop: 5, borderTop: "1px solid #f1f5f9",
                  display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <List size={9} color={th.accent} />
                  <span style={{ fontSize: 10, color: th.accent, fontWeight: 600 }}>
                    {node.button_text || "Select option"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Handle chips (text-only, no dots here — dots are siblings outside) */}
        {hlist.length > 0 && (
          <div style={{ borderTop: `${HDL_BORDER}px solid #f1f5f9`,
            padding: `${HDL_PAD}px 14px ${HDL_PAD}px 14px`,
            display: "flex", flexDirection: "column", gap: CHIP_GAP }}>
            {hlist.map((hd, idx) => (
              <div key={hd.id || idx} style={{
                height: CHIP_H, display: "flex", alignItems: "center",
                paddingLeft: 10, paddingRight: 32, // 32 leaves room where the dot sits visually
                background: "#f8fafc", border: "1px solid #e8edf2", borderRadius: 8,
                boxSizing: "border-box",
              }}>
                {node.kind === "list_msg"
                  ? <List size={10} color={th.accent} style={{ flexShrink: 0, marginRight: 7 }} />
                  : <MousePointer2 size={10} color={th.accent} style={{ flexShrink: 0, marginRight: 7 }} />}
                <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#374151",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {hd.label}
                </span>
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

      {/* ── OUTPUT DOTS (right side, per handle) — siblings of card, never clipped ── */}
      {hlist.map((hd, idx) => (
        <div
          key={`dot-out-${hd.id || idx}`}
          onMouseDown={e => { e.stopPropagation(); onHandleDown(node.id, hd.id, e); }}
          style={{
            position: "absolute",
            left: NW - DOT_R,               // center at NW → world: n.x + NW ✓ matches outPos x
            top:  chipDotY(idx) - DOT_R,    // center at chipDotY(idx) ✓ matches outPos y
            width: DOT_D, height: DOT_D, borderRadius: "50%",
            background: th.accent,
            border: "2.5px solid #fff",
            cursor: "crosshair", zIndex: 30,
            boxShadow: `0 1px 4px ${th.accent}55`,
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "scale(1.35)"; el.style.boxShadow = `0 2px 8px ${th.accent}80`; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "scale(1)";    el.style.boxShadow = `0 1px 4px ${th.accent}55`; }}
        />
      ))}

      {/* ── TRIGGER BOTTOM OUTPUT DOT — sibling of card ── */}
      {node.kind === "trigger" && (
        <div
          onMouseDown={e => { e.stopPropagation(); onHandleDown(node.id, "__out__", e); }}
          style={{
            position: "absolute",
            left: NW / 2 - DOT_R,           // center at NW/2 ✓
            top:  nodeH(node) - DOT_R,       // center sits exactly at bottom edge of card → matches outPos y = n.y + nodeH(n)
            width: DOT_D, height: DOT_D, borderRadius: "50%",
            background: th.accent,
            border: "2.5px solid #fff",
            cursor: "crosshair", zIndex: 30,
            boxShadow: `0 2px 8px ${th.accent}60`,
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
// JSON PREVIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────

function JsonPreviewModal({ nodes, edges, flowName, onClose }: {
  nodes: CNode[]; edges: CEdge[]; flowName: string; onClose(): void;
}) {
  const { schema } = buildSchema(nodes, edges, flowName);
  const json   = JSON.stringify(schema, null, 2);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Simple syntax colouring: strings, numbers, booleans, keys, null
  const highlight = (raw: string) =>
    raw
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (m) => {
        let cls = "color:#60a5fa";                     // number
        if (/^"/.test(m)) {
          cls = /:$/.test(m) ? "color:#f472b6" : "color:#86efac"; // key / string
        } else if (/true|false/.test(m)) cls = "color:#fb923c";  // boolean
        else if (/null/.test(m))          cls = "color:#94a3b8";  // null
        return `<span style="${cls}">${m}</span>`;
      });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div style={{ background: "#0f172a", borderRadius: 16,
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)", border: "1.5px solid #1e293b",
        width: "100%", maxWidth: 740, maxHeight: "82vh",
        display: "flex", flexDirection: "column", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1e293b",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Code size={13} color="#60a5fa" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Flow JSON</p>
              <p style={{ fontSize: 10, color: "#475569", margin: "1px 0 0" }}>
                {Object.keys(schema.nodes || {}).length + (schema.welcome_message ? 1 : 0)} nodes · ready to save
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={copy} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 7,
              border: "1px solid #334155", background: copied ? "#134e4a" : "#1e293b",
              color: copied ? "#34d399" : "#94a3b8", fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <Copy size={12} />
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7,
              border: "none", background: "#1e293b", cursor: "pointer", color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Code body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <pre style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
            color: "#cbd5e1", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            dangerouslySetInnerHTML={{ __html: highlight(json) }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP MESSAGE PREVIEW
// Renders a pixel-accurate phone mockup of the message
// ─────────────────────────────────────────────────────────────────────────────

function formatWaBody(text: string): string {
  return text
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g,   "<em>$1</em>")
    .replace(/~(.*?)~/g,   "<s>$1</s>")
    .replace(/\n/g,        "<br/>");
}

function WaMessagePreview({ node }: { node: CNode }) {
  const body   = node.kind === "welcome" ? node.welcomeBodyText   : node.body_text;
  const header = node.kind === "welcome" ? node.welcomeHeader     : node.header;
  const btns   = node.kind === "welcome" ? (node.welcomeButtons || []).filter(b => b.reply.title)
               : node.kind === "button_msg" ? (node.buttons || []).filter(b => b.reply.title)
               : [];
  const rows   = node.kind === "list_msg"
    ? (node.sections || []).flatMap(s => s.rows.filter(r => r.title))
    : [];

  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {/* Phone frame */}
      <div style={{
        width: 280, background: "#e5ddd5",
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        border: "1px solid #d1d5db",
      }}>
        {/* WA header bar */}
        <div style={{ background: "#075e54", padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#128c7e",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MessageSquare size={16} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Cognisive</p>
            <p style={{ margin: 0, fontSize: 10, color: "#b2dfdb" }}>online</p>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column",
          gap: 2, minHeight: 80 }}>
          {/* Bubble */}
          <div style={{ alignSelf: "flex-start", maxWidth: "90%" }}>
            <div style={{ background: "#fff", borderRadius: "0px 10px 10px 10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.13)", overflow: "hidden" }}>

              {/* Header */}
              {header?.type === "image" && header.image?.link && (
                <div style={{ height: 120, overflow: "hidden" }}>
                  <img src={header.image.link} alt="header"
                    style={{ width: "100%", height: "100%", objectFit: "cover",
                      display: "block" }} />
                </div>
              )}
              {header?.type === "video" && (
                <div style={{ height: 100, background: "#1e293b",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Play size={14} color="#fff" />
                  </div>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>Video</span>
                </div>
              )}
              {header?.type === "text" && header.text && (
                <div style={{ padding: "8px 10px 4px", borderBottom: "1px solid #f1f5f9" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    {header.text}
                  </p>
                </div>
              )}

              {/* Body */}
              <div style={{ padding: "8px 10px 4px" }}>
                {body ? (
                  <p style={{ margin: 0, fontSize: 13, color: "#111827", lineHeight: 1.55 }}
                    dangerouslySetInnerHTML={{ __html: formatWaBody(body) }} />
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: "#9ca3af", fontStyle: "italic" }}>
                    No body text yet…
                  </p>
                )}
                <p style={{ margin: "4px 0 0", fontSize: 10, color: "#9ca3af",
                  textAlign: "right" }}>{now} ✓✓</p>
              </div>

              {/* Button message buttons */}
              {btns.length > 0 && (
                <div style={{ borderTop: "1px solid #f1f5f9" }}>
                  {btns.map((b, i) => (
                    <div key={i} style={{
                      padding: "9px 10px", textAlign: "center",
                      borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
                      cursor: "pointer",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#128c7e" }}>
                        {b.reply.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* List message CTA row */}
              {node.kind === "list_msg" && (
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "9px 10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <List size={13} color="#128c7e" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#128c7e" }}>
                    {node.button_text || "Select Option"}
                  </span>
                </div>
              )}

              {/* CTA URL button */}
              {node.kind === "cta_url" && (
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "9px 10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ExternalLink size={13} color="#128c7e" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#128c7e" }}>
                    {node.cta_label || "Open Link"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List rows preview (shown below bubble for list nodes) */}
        {rows.length > 0 && (
          <div style={{ margin: "0 10px 12px", background: "#fff", borderRadius: 10,
            overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9",
              background: "#f9fafb" }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#6b7280",
                textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {node.sections?.[0]?.title || "Options"}
              </p>
            </div>
            {rows.slice(0, 6).map((r, i) => (
              <div key={i} style={{ padding: "9px 12px",
                borderBottom: i < rows.length - 1 ? "1px solid #f9fafb" : "none",
                display: "flex", flexDirection: "column", gap: 2 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#111827" }}>{r.title}</p>
                {r.description && (
                  <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{r.description}</p>
                )}
              </div>
            ))}
            {rows.length > 6 && (
              <div style={{ padding: "7px 12px", background: "#f9fafb" }}>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
                  +{rows.length - 6} more rows…
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, textAlign: "center" }}>
        WhatsApp preview · actual rendering may vary
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT PANEL
// ─────────────────────────────────────────────────────────────────────────────

function RightPanel({ node, onChange, onDelete, onClose }: {
  node: CNode;
  onChange(p: Partial<CNode>): void;
  onDelete(): void;
  onClose(): void;
}) {
  const th = TH[node.kind];
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const canPreview = node.kind !== "trigger";

  // Reset to edit tab when node changes
  useEffect(() => { setTab("edit"); }, [node.id]);

  const copyId = () => {
    navigator.clipboard.writeText(node.id).then(() => toast.success("Node ID copied"));
  };

  const NodeIdRow = () => (
    <PField label="Node ID">
      <div style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 12px",
        background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 9 }}>
        <Hash size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12, fontFamily: "monospace", color: "#475569",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.id}</span>
        <button onClick={copyId} style={{ background: "none", border: "none", cursor: "pointer",
          color: "#94a3b8", padding: 0, display: "flex", alignItems: "center" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#4f46e5"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
          <Copy size={13} />
        </button>
      </div>
      <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0" }}>
        Parent buttons/rows must reference this ID to route here.
      </p>
    </PField>
  );

  return (
    <div style={{ width: 332, flexShrink: 0, height: "100%", background: "#fff",
      borderLeft: "1.5px solid #e2e8f0", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "12px 16px 0", borderBottom: "1.5px solid #f1f5f9",
        borderLeft: `3px solid ${th.accent}`, flexShrink: 0 }}>
        {/* Top row: icon + label + actions */}
        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: th.bg, color: th.fg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {KIND_ICON[node.kind]}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{th.label}</p>
              <button onClick={copyId} style={{ background: "none", border: "none", cursor: "pointer",
                padding: 0, display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#94a3b8",
                  maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {node.id}
                </span>
                <Copy size={9} color="#cbd5e1" />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
            {node.kind !== "trigger" && (
              <button onClick={onDelete} style={{ width: 28, height: 28, borderRadius: 7, border: "none",
                background: "none", cursor: "pointer", color: "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fef2f2"; el.style.color = "#ef4444"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "none"; el.style.color = "#94a3b8"; }}>
                <Trash2 size={13} />
              </button>
            )}
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: "none",
              background: "none", cursor: "pointer", color: "#94a3b8",
              display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tab switcher — only for non-trigger nodes */}
        {canPreview && (
          <div style={{ display: "flex", gap: 0, marginBottom: -1 }}>
            {(["edit", "preview"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 5, border: "none", background: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                color: tab === t ? th.accent : "#94a3b8",
                borderBottom: tab === t ? `2px solid ${th.accent}` : "2px solid transparent",
                transition: "all 0.15s",
              }}>
                {t === "edit"
                  ? <><Code size={11} />{" "}Edit</>
                  : <><Eye size={11} />{" "}Preview</>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content — Edit or Preview */}
      {tab === "preview" && canPreview ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px",
          display: "flex", flexDirection: "column", alignItems: "center", background: "#f8fafc" }}>
          <WaMessagePreview node={node} />
        </div>
      ) : (
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px",
        display: "flex", flexDirection: "column", gap: 22 }}>

        {/* ── TRIGGER ── */}
        {node.kind === "trigger" && <>
          <PInfo color="blue">
            Fires when a customer sends a message containing one of these keywords.
          </PInfo>
          <PField label="Trigger Keywords">
            <PInput
              value={node.trigger_messages || ""}
              onChange={v => onChange({ trigger_messages: v })}
              placeholder="hi, hey, hello, menu"
            />
            <p style={{ fontSize: 10, color: "#94a3b8", margin: "5px 0 0", lineHeight: 1.5 }}>
              Comma-separated. e.g.&nbsp;<code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>hi,hey,hello,menu</code>
            </p>
          </PField>
          <PInfo color="amber">
            Connect the bottom output to a <strong>Welcome Message</strong> node.
          </PInfo>
        </>}

        {/* ── WELCOME MESSAGE ── */}
        {node.kind === "welcome" && <>
          <PInfo color="violet">
            First message sent when the flow fires. Stored as <code style={{ fontFamily: "monospace", fontWeight: 700 }}>welcome_message</code> in the saved flow.
          </PInfo>
          <HeaderEditor value={node.welcomeHeader} onChange={h => onChange({ welcomeHeader: h })} />
          <PField label="Body Text">
            <PTA rows={5} value={node.welcomeBodyText || ""}
              onChange={v => onChange({ welcomeBodyText: v })}
              placeholder={"*Welcome to Cognisive*\n\nHello {customer_name}👋\n\nPlease select who is exploring:"} />
            <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0" }}>
              *bold*, _italic_, ~strikethrough~ supported.
            </p>
          </PField>
          <ButtonsEditor value={node.welcomeButtons || []} onChange={v => onChange({ welcomeButtons: v })} max={3} />
        </>}

        {/* ── BUTTON MESSAGE ── */}
        {node.kind === "button_msg" && <>
          <NodeIdRow />
          <HeaderEditor value={node.header} onChange={h => onChange({ header: h })} />
          <PField label="Body Text">
            <PTA rows={4} value={node.body_text || ""} onChange={v => onChange({ body_text: v })}
              placeholder="What is the primary goal for the student?" />
          </PField>
          <ButtonsEditor value={node.buttons || []} onChange={v => onChange({ buttons: v })} max={3} />
        </>}

        {/* ── LIST MESSAGE ── */}
        {node.kind === "list_msg" && <>
          <NodeIdRow />
          <PField label="Body Text">
            <PTA rows={4} value={node.body_text || ""} onChange={v => onChange({ body_text: v })}
              placeholder={"Thanks for sharing!\n\nPlease select your class:"} />
          </PField>
          <PField label="List Button Label">
            <PInput value={node.button_text || ""} onChange={v => onChange({ button_text: v })}
              placeholder="Select Class" maxLength={20} />
          </PField>
          <SectionsEditor
            value={node.sections || [{ title: "Options", rows: [{ id: "", title: "" }] }]}
            onChange={v => onChange({ sections: v })}
          />
        </>}

        {/* ── CTA URL ── */}
        {node.kind === "cta_url" && <>
          <NodeIdRow />
          <PInfo color="blue">
            Terminal node — user taps the button to open an external URL. No outgoing connections needed.
          </PInfo>
          <PField label="Body Text">
            <PTA rows={5} value={node.body_text || ""} onChange={v => onChange({ body_text: v })}
              placeholder="Cognisive conducts a Merit Scholarship Test…" />
          </PField>
          <PField label="Button Label">
            <PInput value={node.cta_label || ""} onChange={v => onChange({ cta_label: v })}
              placeholder="Register for test" maxLength={20} />
          </PField>
          <PField label="URL">
            <div style={{ position: "relative" }}>
              <Link2 size={13} style={{ position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              <input type="url" placeholder="https://forms.gle/…"
                value={node.url || ""} onChange={e => onChange({ url: e.target.value })}
                style={{ width: "100%", height: 38, padding: "0 12px 0 36px",
                  border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, outline: "none",
                  boxSizing: "border-box", color: "#0f172a", background: "#fff" }}
                onFocus={e => { (e.target as HTMLElement).style.borderColor = "#6366f1"; }}
                onBlur={e => { (e.target as HTMLElement).style.borderColor = "#e2e8f0"; }}
              />
            </div>
            {node.url && (
              <a href={node.url} target="_blank" rel="noreferrer"
                style={{ fontSize: 11, color: "#4f46e5", textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <ExternalLink size={11} /> Test link
              </a>
            )}
          </PField>
        </>}
      </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD NODE MENU
// ─────────────────────────────────────────────────────────────────────────────

function AddMenu({ onAdd, onClose }: { onAdd(k: NodeKind): void; onClose(): void }) {
  const opts: Array<{ k: NodeKind; desc: string }> = [
    { k: "welcome",    desc: "Opening message with header & reply buttons — maps to welcome_message" },
    { k: "button_msg", desc: "Up to 3 quick-reply buttons, optional image/video header"             },
    { k: "list_msg",   desc: "Scrollable list with sections and rows (for 4+ options)"              },
    { k: "cta_url",    desc: "Body text + single external URL button (terminal node)"               },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(15,23,42,0.12)", backdropFilter: "blur(2px)",
      display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
        border: "1.5px solid #e2e8f0", width: 360, overflow: "hidden" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Add Node</p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Select a message type</p>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8,
            border: "none", background: "none", cursor: "pointer", color: "#94a3b8",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {opts.map(o => {
            const th = TH[o.k];
            return (
              <button key={o.k} type="button" onClick={() => { onAdd(o.k); onClose(); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px",
                  borderRadius: 10, border: "1.5px solid transparent", background: "#fff",
                  cursor: "pointer", textAlign: "left", transition: "all 0.12s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#f8fafc"; el.style.borderColor = "#e2e8f0"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fff"; el.style.borderColor = "transparent"; }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: th.bg, color: th.accent,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {KIND_ICON[o.k]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0 }}>{th.label}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", lineHeight: 1.4 }}>{o.desc}</p>
                </div>
                <ChevronRight size={14} color="#cbd5e1" />
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
        // wa_bot_flows uses FLAT schema — no flow_data wrapper.
        // raw IS the document: {trigger_messages, welcome_message, nodes, ui_config, ...}
        const raw  = res.data?.flow || res.data;
        const data: any = raw?.flow_data || raw;  // fallback keeps old flows working
        if (!data) return;

        const ui: Record<string, { x: number; y: number }> = data.ui_config?.nodes || {};
        const hasSavedPos = Object.keys(ui).length > 0;
        const rawNodes: Record<string, any> = data.nodes || {};

        // Saved edges (schema-key IDs). Saved since the edges-in-ui_config fix.
        // For old documents without this field we fall back to derivation below.
        const savedEdges: CEdge[] | null = data.ui_config?.edges?.length
          ? data.ui_config.edges
          : null;

        const lN: CNode[] = [];
        const lE: CEdge[] = [];

        // Trigger
        lN.push({
          id: "trigger", kind: "trigger", x: 0, y: 0,
          trigger_messages: data.trigger_messages || "",
        });

        // Welcome message
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
            welcomeHeader:     wmInteractive.header,
            welcomeBodyText:   wmInteractive.body_text || "",
            welcomeButtons:    cleanBtns,
          });
          if (!savedEdges) {
            // Legacy derivation: build edges from button reply.id → rawNodes key lookup.
            // This CANNOT restore multi-button → same-node connections, but keeps old
            // flows (saved before the ui_config.edges field was introduced) working.
            lE.push({ srcId: "trigger", handleId: "__out__", tgtId: "welcome" });
            cleanBtns.forEach((b: any, idx: number) => {
              if (rawNodes[b.reply.id]) lE.push({ srcId: "welcome", handleId: `btn_${idx}`, tgtId: b.reply.id });
            });
          }
        }

        // All other nodes
        for (const [nid, nd] of Object.entries(rawNodes)) {
          if (nid === "welcome") continue;
          if (nd.type === "button") {
            const cleanBtns = (nd.buttons || []).filter((b: any) => b?.reply?.id && b?.reply?.title);
            lN.push({ id: nid, kind: "button_msg", x: 0, y: 0,
              body_text: nd.body_text, header: nd.header, buttons: cleanBtns });
            if (!savedEdges) {
              cleanBtns.forEach((b: any, idx: number) => {
                if (rawNodes[b.reply.id]) lE.push({ srcId: nid, handleId: `btn_${idx}`, tgtId: b.reply.id });
              });
            }
          } else if (nd.type === "list") {
            lN.push({ id: nid, kind: "list_msg", x: 0, y: 0,
              body_text: nd.body_text, button_text: nd.button_text, sections: nd.sections || [] });
            if (!savedEdges) {
              for (const [si, sec] of (nd.sections || []).entries())
                for (const [ri, r] of (sec.rows || []).entries())
                  if (r.id && rawNodes[r.id]) lE.push({ srcId: nid, handleId: `row_${si}_${ri}`, tgtId: r.id });
            }
          } else if (nd.type === "cta_url") {
            lN.push({ id: nid, kind: "cta_url", x: 0, y: 0,
              body_text: nd.body_text, cta_label: nd.button_text, url: nd.url });
          }
        }

        // Primary edge restoration path — uses saved edges where every ID is a
        // schema key, which matches the canvas node IDs created above.
        // Filters out any stale edges pointing to nodes that no longer exist.
        if (savedEdges) {
          const nodeIds = new Set(lN.map(n => n.id));
          for (const e of savedEdges) {
            if (nodeIds.has(e.srcId) && nodeIds.has(e.tgtId)) lE.push(e);
          }
        }

        // Assign positions
        if (hasSavedPos) {
          for (const n of lN) if (ui[n.id]) { n.x = ui[n.id].x; n.y = ui[n.id].y; }
          lN.filter(n => n.x === 0 && n.y === 0 && !ui[n.id])
            .forEach((n, i) => { n.x = 80 + (Object.keys(ui).length + i) * 420; n.y = 160 + i * 240; });
        } else {
          // BFS column layout
          const COL_W = 420;
          const colMap: Record<string, number> = { trigger: 0 };
          const q = ["trigger"]; const visited = new Set(["trigger"]);
          while (q.length) {
            const cur = q.shift()!;
            for (const e of lE.filter(e => e.srcId === cur)) {
              if (!visited.has(e.tgtId)) { visited.add(e.tgtId); colMap[e.tgtId] = colMap[cur] + 1; q.push(e.tgtId); }
            }
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
            for (let i = 0; i < ids.length; i++) {
              nMap[ids[i]].x = 80 + col * COL_W;
              nMap[ids[i]].y = y;
              y += heights[i];
            }
          }
        }

        setNodes(lN); setEdges(lE);
        setFlowName(raw?.name || fNameProp || "Untitled Bot Flow");
        setFlowId(raw?.flow_id || raw?._id || fIdProp || null);

        // Auto-fit after layout
        setTimeout(() => fitViewFor(lN), 180);
      })
      .catch(err => { console.error("Load error:", err); toast.error("Failed to load flow"); })
      .finally(() => setLoading(false));
  }, [fIdProp]);

  // ── SAVE / PUBLISH ──────────────────────────────────────────────────────────

  const handleSave = useCallback(async (publish = false) => {
    setSave("saving");
    // buildSchema returns the same canvasToKey it used for schema.nodes,
    // so ui_config positions are stored under the exact same keys — no drift.
    const { schema, canvasToPrimaryKey } = buildSchema(nodes, edges, flowName);
    const ui: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) {
      ui[canvasToPrimaryKey[n.id] || n.id] = { x: n.x, y: n.y };
    }
    try {
      // ── FLAT payload — matches the DB schema the webhook reads directly ────
      // The webhook does: flow_collection.find_one({
      //   "trigger_from": "webhook", "trigger_event": "message_received", "status": "active"
      // }) and then reads flow["welcome_message"], flow["nodes"], flow["trigger_messages"]
      // So ALL these fields must be at the document root, NOT inside flow_data.
      //
      // IMPORTANT: status and name are placed AFTER ...schema so they win.
      // buildSchema intentionally omits status to avoid overwriting the publish flag.
      const payload = {
        flow_type:      "wabot",
        trigger_type:   "whatsapp_message_received",
        // Spread schema fields (trigger_from, trigger_event, trigger_messages, welcome_message, nodes)
        ...schema,
        // These must come AFTER ...schema so they are never overwritten by schema fields:
        name:           flowName,
        status:         publish ? "active" : "draft",  // webhook looks for "active"
        // Save edges translated to schema keys so all connections restore on reload.
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
    if ((e.target as HTMLElement).dataset.canvas) {
      setIsPanning(true); setSelId(null);
    }
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

  const onMouseUp = () => { setIsPanning(false); setDragId(null); setLiveDrag(null); };

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

  // When mouse is released over an input dot, form an edge.
  // handleId is positional ("btn_0", "row_1_2", "__out__") — NOT the reply.id.
  //
  // ⚠️  reply.id / row.id are derived from the button/row TITLE (auto-slugified in
  //     ButtonsEditor / SectionsEditor).  We must NOT overwrite them here with the
  //     random canvas node UID, otherwise two buttons get the same opaque id when
  //     they point to the same target, and the webhook cannot distinguish replies.
  //
  // buildSchema uses the edges array + each button's reply.id to key schema.nodes
  // correctly, so we only need to record the edge here.
  const onInputUp = (tgtId: string) => {
    if (!liveDrag || liveDrag.srcId === tgtId) return;
    const { srcId, handleId } = liveDrag;

    // Edge uses positional handleId — multiple edges can share the same tgtId
    setEdges(es => {
      const filtered = es.filter(e => !(e.srcId === srcId && e.handleId === handleId));
      return [...filtered, { srcId, handleId, tgtId }];
    });
    setLiveDrag(null);
  };

  // ── ADD NODE ────────────────────────────────────────────────────────────────

  const addNode = (kind: NodeKind) => {
    const id = kind === "welcome" ? "welcome"
      : kind === "button_msg" ? uid("btn")
      : kind === "list_msg"   ? uid("list")
      : uid("cta");
    const maxX = Math.max(...nodes.map(n => n.x), 80);
    const newN: CNode = {
      id, kind,
      x: maxX + 420, y: 220,
      ...(kind === "welcome"    ? { welcomeButtons: [{ type: "reply", reply: { id: "", title: "" } }, { type: "reply", reply: { id: "", title: "" } }] } : {}),
      ...(kind === "button_msg" ? { buttons: [{ type: "reply", reply: { id: "", title: "" } }, { type: "reply", reply: { id: "", title: "" } }] } : {}),
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

      {/* ═══════════ TOP BAR ═══════════ */}
      <div style={{
        height: 52, flexShrink: 0, background: "#fff",
        borderBottom: "1.5px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", gap: 12,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button onClick={onBack} style={{
            width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0",
            background: "#fff", cursor: "pointer", color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transition: "all 0.12s",
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#f8fafc"; el.style.color = "#0f172a"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fff"; el.style.color = "#64748b"; }}>
            <ArrowLeft size={15} />
          </button>
          <div style={{ width: 1, height: 18, background: "#e2e8f0", flexShrink: 0 }} />
          <input value={flowName} onChange={e => setFlowName(e.target.value)}
            style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", background: "transparent",
              border: "none", outline: "none", minWidth: 0, width: 190 }}
            placeholder="Flow name…" />
          <span style={{
            padding: "3px 9px", borderRadius: 6, background: "#d1fae5",
            color: "#065f46", fontSize: 10, fontWeight: 800,
            letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0,
          }}>
            WA Bot
          </span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button onClick={() => setShowAdd(true)} style={{
            display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px",
            borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff",
            fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer",
            transition: "all 0.12s",
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#f8fafc"; el.style.borderColor = "#c7d2fe"; el.style.color = "#4f46e5"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fff"; el.style.borderColor = "#e2e8f0"; el.style.color = "#374151"; }}>
            <Plus size={14} /> Add Node
          </button>
          <button onClick={() => setShowJsonPreview(true)} style={{
            display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px",
            borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff",
            fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer",
            transition: "all 0.12s",
          }}
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
            <button onClick={() => handleSave(false)} style={{
              display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px",
              borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff",
              fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer",
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#f8fafc"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fff"; }}>
              <Save size={13} /> Save
            </button>
          )}
          <button
            onClick={() => handleSave(true)}
            disabled={saveStatus === "saving"}
            style={{
              display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 16px",
              borderRadius: 8, background: "#16a34a", color: "#fff",
              border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: saveStatus === "saving" ? 0.6 : 1, transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (saveStatus !== "saving") (e.currentTarget as HTMLElement).style.background = "#15803d"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#16a34a"; }}>
            <Play size={12} />Publish
          </button>
        </div>
      </div>

      {/* ═══════════ MAIN AREA ═══════════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── CANVAS ── */}
        <div
          ref={canvasRef}
          data-canvas="1"
          style={{
            flex: 1, position: "relative", overflow: "hidden",
            backgroundImage: "radial-gradient(circle, #c8d4e0 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
            backgroundPosition: `${((pan.x % 24) + 24) % 24}px ${((pan.y % 24) + 24) % 24}px`,
            cursor: isPanning ? "grabbing" : "default",
          }}
          onMouseDown={onCanvasMD}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onWheel={onWheel}
        >
          {/* Transparent catch-all for canvas panning */}
          <div data-canvas="1" style={{ position: "absolute", inset: 0, zIndex: 0 }} />

          {/* World-transform layer */}
          <div style={{
            position: "absolute", inset: 0,
            transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            pointerEvents: "none",
          }}>
            {/* SVG Edges — z:1 so they render BEHIND node cards (z:2) */}
            <svg style={{ position: "absolute", inset: 0, width: "12000px", height: "12000px", overflow: "visible", zIndex: 1 }}>
              <defs>
                <marker id="wabot-arrow" viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 2 L 9 5 L 0 8 Z" fill="#94a3b8" />
                </marker>
                <marker id="wabot-arrow-live" viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 2 L 9 5 L 0 8 Z" fill="#6366f1" />
                </marker>
              </defs>
              {svgPaths.map(p => (
                <path key={p.key} d={p.d} fill="none"
                  stroke={p.dash ? p.color : p.color}
                  strokeWidth={p.dash ? 1.8 : 2}
                  strokeDasharray={p.dash ? "7 5" : undefined}
                  strokeLinecap="round"
                  opacity={p.dash ? 0.65 : 0.85}
                  markerEnd={p.dash ? "url(#wabot-arrow-live)" : "url(#wabot-arrow)"}
                />
              ))}
            </svg>

            {/* Nodes — z:2 so they paint ON TOP of SVG edges */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
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

          {/* Empty hint */}
          {nodes.length <= 1 && (
            <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
                background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)", whiteSpace: "nowrap",
              }}>
                <Plus size={13} color="#94a3b8" />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Click <strong style={{ color: "#374151" }}>Add Node</strong> to build your flow
                </span>
              </div>
            </div>
          )}

          {/* Zoom controls */}
          <div style={{
            position: "absolute", bottom: 20, right: 20,
            display: "flex", flexDirection: "column",
            background: "#fff", border: "1.5px solid #e2e8f0",
            borderRadius: 10, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}>
            {[
              { icon: <ZoomIn  size={14} />, fn: () => setZoom(z => Math.min(z + 0.12, 2.5)) },
              { icon: <span style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b", fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>, fn: null },
              { icon: <ZoomOut size={14} />, fn: () => setZoom(z => Math.max(z - 0.12, 0.18)) },
              { icon: <Maximize2 size={13} />, fn: fitView },
            ].map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ height: 1, background: "#f1f5f9" }} />}
                <button onClick={b.fn ?? undefined} disabled={!b.fn}
                  style={{
                    width: 36, height: 36, display: "flex", alignItems: "center",
                    justifyContent: "center", background: "transparent", border: "none",
                    cursor: b.fn ? "pointer" : "default", color: "#64748b",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (b.fn) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  {b.icon}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
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
      {showJsonPreview && (
        <JsonPreviewModal
          nodes={nodes}
          edges={edges}
          flowName={flowName}
          onClose={() => setShowJsonPreview(false)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}