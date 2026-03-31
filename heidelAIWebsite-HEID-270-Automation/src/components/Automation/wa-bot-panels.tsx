// ─────────────────────────────────────────────────────────────────────────────
// wa-bot-panels.tsx
// Panel primitives, field editors, RightPanel, AddMenu,
// JsonPreviewModal, WaMessagePreview
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  X, Plus, Trash2, ExternalLink, List, MousePointer2,
  Hash, Link2, ChevronRight, Video, Image, Type,
  Play, Star, Copy, Eye, Code, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import type { WaHeader, WaButton, WaRow, WaSection, NodeKind, CNode, CEdge } from "./types";
import { TH, KIND_ICON, buildSchema, toId, makeUniqueId } from "./wa-bot-constants";

// ─────────────────────────────────────────────────────────────────────────────
// PANEL PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

export function PLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: "#94a3b8", marginBottom: 6, margin: "0 0 6px" }}>
      {children}
    </p>
  );
}

export function PInput({ value, onChange, placeholder, maxLength, mono }: {
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

export function PTA({ value, onChange, rows = 4, placeholder }: {
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

export function PField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><PLabel>{label}</PLabel>{children}</div>;
}

export function PInfo({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "violet" | "green" | "amber" }) {
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

export function HeaderEditor({ value, onChange }: { value?: WaHeader; onChange(v?: WaHeader): void }) {
  const cur = value?.type || "none";
  const opts = [
    { k: "none"  as const, icon: <X size={11} />,     label: "None"  },
    { k: "image" as const, icon: <Image size={11} />, label: "Image" },
    { k: "video" as const, icon: <Video size={11} />, label: "Video" },
    { k: "text"  as const, icon: <Type size={11} />,  label: "Text"  },
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
// BUTTONS EDITOR
// ─────────────────────────────────────────────────────────────────────────────

const WA_MAX_BUTTONS = 3;

export function ButtonsEditor({ value, onChange, max = WA_MAX_BUTTONS }: {
  value: WaButton[]; onChange(v: WaButton[]): void; max?: number;
}) {
  const upd = (i: number, title: string) => {
    const n = [...value];
    const currentId = n[i]?.reply.id || "";
    const idBase    = currentId.replace(/_\d+$/, "");
    const wasAuto   = !currentId || idBase === toId(n[i]?.reply.title || "");
    if (wasAuto) {
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
          border: "1.5px solid #fde68a", borderRadius: 9, fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>
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
// SECTIONS EDITOR
// ─────────────────────────────────────────────────────────────────────────────

const WA_MAX_LIST_ROWS = 10;
const WA_MAX_SECTIONS  = 10;

export function SectionsEditor({ value, onChange }: { value: WaSection[]; onChange(v: WaSection[]): void }) {
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
      <div style={{ marginBottom: 4 }}>
        <div style={{ height: 4, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4, transition: "width 0.2s",
            background: totalRows >= WA_MAX_LIST_ROWS ? "#ef4444" : totalRows >= 7 ? "#f59e0b" : "#0891b2",
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
              <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0, marginRight: 4 }}>{sec.rows.length} rows</span>
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
              <button type="button" onClick={() => addRow(si)} disabled={atRowMax}
                style={{
                  height: 30, border: `1px dashed ${atRowMax ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 8,
                  fontSize: 11, fontWeight: 600, color: atRowMax ? "#fca5a5" : "#94a3b8",
                  background: "transparent", cursor: atRowMax ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4, opacity: atRowMax ? 0.6 : 1,
                }}>
                <Plus size={12} />{atRowMax ? "Row limit reached (10)" : "Add Row"}
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addSec} disabled={atSecMax || atRowMax}
          style={{
            height: 34, border: `2px dashed ${atRowMax ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 10,
            fontSize: 12, fontWeight: 600, color: atRowMax ? "#fca5a5" : "#94a3b8",
            background: "transparent", cursor: (atSecMax || atRowMax) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: (atSecMax || atRowMax) ? 0.6 : 1,
          }}>
          <Plus size={13} />{atRowMax ? "10 row limit reached" : "Add Section"}
        </button>
      </div>
    </PField>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON PREVIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────

export function JsonPreviewModal({ nodes, edges, flowName, onClose }: {
  nodes: CNode[]; edges: CEdge[]; flowName: string; onClose(): void;
}) {
  const { schema } = buildSchema(nodes, edges, flowName);
  const json = JSON.stringify(schema, null, 2);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(json).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const highlight = (raw: string) =>
    raw
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (m) => {
        let cls = "color:#60a5fa";
        if (/^"/.test(m)) { cls = /:$/.test(m) ? "color:#f472b6" : "color:#86efac"; }
        else if (/true|false/.test(m)) cls = "color:#fb923c";
        else if (/null/.test(m)) cls = "color:#94a3b8";
        return `<span style="${cls}">${m}</span>`;
      });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(15,23,42,0.55)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div style={{ background: "#0f172a", borderRadius: 16, boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        border: "1.5px solid #1e293b", width: "100%", maxWidth: 740, maxHeight: "82vh",
        display: "flex", flexDirection: "column", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}>
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
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 7,
              border: "1px solid #334155", background: copied ? "#134e4a" : "#1e293b",
              color: copied ? "#34d399" : "#94a3b8", fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <Copy size={12} />{copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: "none",
              background: "#1e293b", cursor: "pointer", color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={14} />
            </button>
          </div>
        </div>
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
// ─────────────────────────────────────────────────────────────────────────────

function formatWaBody(text: string): string {
  return text
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g,   "<em>$1</em>")
    .replace(/~(.*?)~/g,   "<s>$1</s>")
    .replace(/\n/g,        "<br/>");
}

export function WaMessagePreview({ node }: { node: CNode }) {
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
      <div style={{ width: 280, background: "#e5ddd5", borderRadius: 16, overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)", border: "1px solid #d1d5db" }}>
        <div style={{ background: "#075e54", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#128c7e",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MessageSquare size={16} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Cognisive</p>
            <p style={{ margin: 0, fontSize: 10, color: "#b2dfdb" }}>online</p>
          </div>
        </div>
        <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, minHeight: 80 }}>
          <div style={{ alignSelf: "flex-start", maxWidth: "90%" }}>
            <div style={{ background: "#fff", borderRadius: "0px 10px 10px 10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.13)", overflow: "hidden" }}>
              {header?.type === "image" && header.image?.link && (
                <div style={{ height: 120, overflow: "hidden" }}>
                  <img src={header.image.link} alt="header" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}
              {header?.type === "video" && (
                <div style={{ height: 100, background: "#1e293b",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Play size={14} color="#fff" />
                  </div>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>Video</span>
                </div>
              )}
              {header?.type === "text" && header.text && (
                <div style={{ padding: "8px 10px 4px", borderBottom: "1px solid #f1f5f9" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827" }}>{header.text}</p>
                </div>
              )}
              <div style={{ padding: "8px 10px 4px" }}>
                {body ? (
                  <p style={{ margin: 0, fontSize: 13, color: "#111827", lineHeight: 1.55 }}
                    dangerouslySetInnerHTML={{ __html: formatWaBody(body) }} />
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: "#9ca3af", fontStyle: "italic" }}>No body text yet…</p>
                )}
                <p style={{ margin: "4px 0 0", fontSize: 10, color: "#9ca3af", textAlign: "right" }}>{now} ✓✓</p>
              </div>
              {btns.length > 0 && (
                <div style={{ borderTop: "1px solid #f1f5f9" }}>
                  {btns.map((b, i) => (
                    <div key={i} style={{ padding: "9px 10px", textAlign: "center",
                      borderTop: i > 0 ? "1px solid #f1f5f9" : "none", cursor: "pointer" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#128c7e" }}>{b.reply.title}</span>
                    </div>
                  ))}
                </div>
              )}
              {node.kind === "list_msg" && (
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "9px 10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <List size={13} color="#128c7e" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#128c7e" }}>{node.button_text || "Select Option"}</span>
                </div>
              )}
              {node.kind === "cta_url" && (
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "9px 10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ExternalLink size={13} color="#128c7e" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#128c7e" }}>{node.cta_label || "Open Link"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {rows.length > 0 && (
          <div style={{ margin: "0 10px 12px", background: "#fff", borderRadius: 10,
            overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", background: "#f9fafb" }}>
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
                {r.description && <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{r.description}</p>}
              </div>
            ))}
            {rows.length > 6 && (
              <div style={{ padding: "7px 12px", background: "#f9fafb" }}>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>+{rows.length - 6} more rows…</p>
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

export function RightPanel({ node, onChange, onDelete, onClose }: {
  node: CNode; onChange(p: Partial<CNode>): void; onDelete(): void; onClose(): void;
}) {
  const th = TH[node.kind];
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const canPreview = node.kind !== "trigger";

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
      <div style={{ padding: "12px 16px 0", borderBottom: "1.5px solid #f1f5f9",
        borderLeft: `3px solid ${th.accent}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
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
        {canPreview && (
          <div style={{ display: "flex", gap: 0, marginBottom: -1 }}>
            {(["edit", "preview"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 5, border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                color: tab === t ? th.accent : "#94a3b8",
                borderBottom: tab === t ? `2px solid ${th.accent}` : "2px solid transparent",
                transition: "all 0.15s",
              }}>
                {t === "edit" ? <><Code size={11} />{" "}Edit</> : <><Eye size={11} />{" "}Preview</>}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "preview" && canPreview ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px",
          display: "flex", flexDirection: "column", alignItems: "center", background: "#f8fafc" }}>
          <WaMessagePreview node={node} />
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px",
          display: "flex", flexDirection: "column", gap: 22 }}>
          {node.kind === "trigger" && <>
            <PInfo color="blue">Fires when a customer sends a message containing one of these keywords.</PInfo>
            <PField label="Trigger Keywords">
              <PInput value={node.trigger_messages || ""} onChange={v => onChange({ trigger_messages: v })}
                placeholder="hi, hey, hello, menu" />
              <p style={{ fontSize: 10, color: "#94a3b8", margin: "5px 0 0", lineHeight: 1.5 }}>
                Comma-separated. e.g.&nbsp;<code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>hi,hey,hello,menu</code>
              </p>
            </PField>
            <PInfo color="amber">Connect the bottom output to a <strong>Welcome Message</strong> node.</PInfo>
          </>}
          {node.kind === "welcome" && <>
            <PInfo color="violet">
              First message sent when the flow fires. Stored as <code style={{ fontFamily: "monospace", fontWeight: 700 }}>welcome_message</code> in the saved flow.
            </PInfo>
            <HeaderEditor value={node.welcomeHeader} onChange={h => onChange({ welcomeHeader: h })} />
            <PField label="Body Text">
              <PTA rows={5} value={node.welcomeBodyText || ""} onChange={v => onChange({ welcomeBodyText: v })}
                placeholder={"*Welcome to Cognisive*\n\nHello {customer_name}👋\n\nPlease select who is exploring:"} />
              <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0" }}>*bold*, _italic_, ~strikethrough~ supported.</p>
            </PField>
            <ButtonsEditor value={node.welcomeButtons || []} onChange={v => onChange({ welcomeButtons: v })} max={3} />
          </>}
          {node.kind === "button_msg" && <>
            <NodeIdRow />
            <HeaderEditor value={node.header} onChange={h => onChange({ header: h })} />
            <PField label="Body Text">
              <PTA rows={4} value={node.body_text || ""} onChange={v => onChange({ body_text: v })}
                placeholder="What is the primary goal for the student?" />
            </PField>
            <ButtonsEditor value={node.buttons || []} onChange={v => onChange({ buttons: v })} max={3} />
          </>}
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
          {node.kind === "cta_url" && <>
            <NodeIdRow />
            <PInfo color="blue">Terminal node — user taps the button to open an external URL. No outgoing connections needed.</PInfo>
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

export function AddMenu({ onAdd, onClose }: { onAdd(k: NodeKind): void; onClose(): void }) {
  const opts: Array<{ k: NodeKind; desc: string }> = [
    { k: "welcome",    desc: "Opening message with header & reply buttons — maps to welcome_message" },
    { k: "button_msg", desc: "Up to 3 quick-reply buttons, optional image/video header"             },
    { k: "list_msg",   desc: "Scrollable list with sections and rows (for 4+ options)"              },
    { k: "cta_url",    desc: "Body text + single external URL button (terminal node)"               },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(15,23,42,0.12)",
      backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}
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