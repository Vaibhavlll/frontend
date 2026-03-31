// ─────────────────────────────────────────────────────────────────────────────
// wa-bot-constants.ts
// Layout constants, math helpers, design tokens, schema builder, utilities
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  MessageSquare, Star, MousePointer2, List, ExternalLink,
} from "lucide-react";
import type { WaButton, WaRow, WaSection, NodeKind, CNode, CEdge } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT CONSTANTS
// These MUST match the pixel sizes in NodeCard's render output exactly.
// If you change any padding/height below, update the card render to match.
// ─────────────────────────────────────────────────────────────────────────────

export const NW         = 272;  // card width
export const STRIPE_H   = 3;    // top accent stripe
export const HDR_H      = 70;   // header content height (badge + title + vertical padding)
export const PRE_H      = 84;   // preview section height
export const NH_BASE    = STRIPE_H + HDR_H + PRE_H; // = 157 — card height with no handles
export const HDL_BORDER = 1;    // border-top before handle rows
export const HDL_PAD    = 10;   // vertical padding above & below handle rows
export const CHIP_H     = 34;   // height of each handle chip
export const CHIP_GAP   = 6;    // gap between chips (flex gap)
export const SLOT       = CHIP_H + CHIP_GAP; // = 40 — height per handle slot (chip + gap)
export const DOT_D      = 14;   // connection dot diameter
export const DOT_R      = DOT_D / 2; // = 7

// First chip's top edge, from node top
export const CHIPS_TOP = NH_BASE + HDL_BORDER + HDL_PAD;

// Center Y of chip[idx] dot from node top
export function chipDotY(idx: number): number {
  return CHIPS_TOP + idx * SLOT + CHIP_H / 2;
}

// Total node height
export function nodeH(n: CNode): number {
  const hs = getHandles(n);
  if (!hs.length) return NH_BASE;
  return CHIPS_TOP + hs.length * CHIP_H + Math.max(0, hs.length - 1) * CHIP_GAP + HDL_PAD;
}

// Ordered list of handles exposed by the node.
// IMPORTANT: IDs are positional ("btn_0", "row_1_2") not the reply.id.
export function getHandles(n: CNode): Array<{ id: string; label: string; targetId: string }> {
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
// ─────────────────────────────────────────────────────────────────────────────

export function outPos(n: CNode, handleId: string): { x: number; y: number } {
  if (handleId === "__out__")
    return { x: n.x + NW / 2, y: n.y + nodeH(n) };
  const hs = getHandles(n);
  const idx = hs.findIndex(h => h.id === handleId);
  return { x: n.x + NW, y: n.y + (idx >= 0 ? chipDotY(idx) : NH_BASE / 2) };
}

export function inPos(n: CNode): { x: number; y: number } {
  return { x: n.x - DOT_R, y: n.y + STRIPE_H + HDR_H / 2 };
}

export function makePath(sx: number, sy: number, tx: number, ty: number, startDown = false): string {
  if (startDown) {
    const dy  = Math.abs(ty - sy);
    const dx  = Math.abs(tx - sx);
    const cpV = Math.max(60, dy * 0.55, dx * 0.3);
    const cpH = Math.max(60, dx * 0.55, dy * 0.3);
    return `M${sx},${sy} C${sx},${sy + cpV} ${tx - cpH},${ty} ${tx},${ty}`;
  }
  const absDx = Math.abs(tx - sx);
  const absDy = Math.abs(ty - sy);
  const offset = Math.max(absDx * 0.45 + absDy * 0.15, 80);
  return `M${sx},${sy} C${sx + offset},${sy} ${tx - offset},${ty} ${tx},${ty}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

export const TH: Record<NodeKind, { accent: string; bg: string; fg: string; label: string }> = {
  trigger:    { accent: "#4f46e5", bg: "#eef2ff", fg: "#4338ca", label: "Trigger"         },
  welcome:    { accent: "#7c3aed", bg: "#f5f3ff", fg: "#6d28d9", label: "Welcome Message" },
  button_msg: { accent: "#059669", bg: "#ecfdf5", fg: "#047857", label: "Button Message"  },
  list_msg:   { accent: "#0891b2", bg: "#ecfeff", fg: "#0e7490", label: "List Message"    },
  cta_url:    { accent: "#2563eb", bg: "#eff6ff", fg: "#1d4ed8", label: "CTA URL"         },
};

export const KIND_ICON: Record<NodeKind, React.ReactNode> = {
  trigger:    React.createElement(MessageSquare, { size: 10 }),
  welcome:    React.createElement(Star,          { size: 10 }),
  button_msg: React.createElement(MousePointer2, { size: 10 }),
  list_msg:   React.createElement(List,          { size: 10 }),
  cta_url:    React.createElement(ExternalLink,  { size: 10 }),
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export function uid(p = "n") { return `${p}_${Math.random().toString(36).slice(2, 8)}`; }

export function toId(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "item";
}

export function makeUniqueId(base: string, used: string[]): string {
  const safe = base || "item";
  if (!used.includes(safe)) return safe;
  let n = 2;
  while (used.includes(`${safe}_${n}`)) n++;
  return `${safe}_${n}`;
}

const CANVAS_UID_RE = /^(?:btn|list|cta|n)_[a-z0-9]{5,8}$/;
export function looksLikeCanvasUid(s: string) { return CANVAS_UID_RE.test(s); }

export function sanitizeButtons(buttons: WaButton[]): WaButton[] {
  const used: string[] = [];
  return buttons.map(b => {
    let id = b.reply.id?.trim();
    if (!id || looksLikeCanvasUid(id)) id = toId(b.reply.title);
    id = makeUniqueId(id || "btn", used);
    used.push(id);
    return { type: "reply", reply: { id, title: b.reply.title } };
  });
}

export function sanitizeSections(sections: WaSection[]): WaSection[] {
  const usedGlobal: string[] = [];
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
// SCHEMA BUILDER
// ─────────────────────────────────────────────────────────────────────────────

export function buildSchema(nodes: CNode[], edges: CEdge[], name: string) {
  const tr = nodes.find(n => n.kind === "trigger");
  const wm = nodes.find(n => n.kind === "welcome");

  const canvasToAllKeys:    Record<string, string[]> = {};
  const canvasToPrimaryKey: Record<string, string>   = {};

  const addKey = (canvasId: string, key: string) => {
    if (!canvasToAllKeys[canvasId]) canvasToAllKeys[canvasId] = [];
    if (!canvasToAllKeys[canvasId].includes(key)) {
      canvasToAllKeys[canvasId].push(key);
      if (!canvasToPrimaryKey[canvasId]) canvasToPrimaryKey[canvasId] = key;
    }
  };

  const sanitizedBtnsMap: Record<string, WaButton[]>  = {};
  const sanitizedSecsMap: Record<string, WaSection[]> = {};

  let wmBtns: WaButton[] = [];
  if (wm) {
    wmBtns = sanitizeButtons((wm.welcomeButtons || []).filter(b => b.reply.title));
    wmBtns.forEach((b, i) => {
      const edge = edges.find(e => e.srcId === "welcome" && e.handleId === `btn_${i}`);
      if (edge) addKey(edge.tgtId, b.reply.id);
    });
  }

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

  for (const n of nodes) {
    if (!canvasToAllKeys[n.id]) addKey(n.id, n.id);
  }

  const schema: any = {
    name,
    trigger_event:    "message_received",
    trigger_from:     "webhook",
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
    if (nodeData) for (const key of keys) schema.nodes[key] = nodeData;
  }
  return { schema, canvasToPrimaryKey };
}