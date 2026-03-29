// ─────────────────────────────────────────────────────────────────────────────
// WaBot — shared types
// ─────────────────────────────────────────────────────────────────────────────

export interface WaHeader {
  type: "image" | "video" | "text";
  image?: { link: string };
  video?: { link: string };
  text?: string;
}

export interface WaButton  { type: "reply"; reply: { id: string; title: string } }
export interface WaRow     { id: string; title: string; description?: string }
export interface WaSection { title: string; rows: WaRow[] }

export type NodeKind = "trigger" | "welcome" | "button_msg" | "list_msg" | "cta_url";

export interface CNode {
  id: string; kind: NodeKind; x: number; y: number;
  trigger_messages?: string;
  welcomeHeader?: WaHeader; welcomeBodyText?: string; welcomeButtons?: WaButton[];
  body_text?: string; header?: WaHeader; buttons?: WaButton[];
  button_text?: string; sections?: WaSection[];
  url?: string; cta_label?: string;
}

export interface CEdge { srcId: string; handleId: string; tgtId: string }