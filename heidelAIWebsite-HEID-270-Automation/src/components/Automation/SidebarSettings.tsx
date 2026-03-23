import React, { useState, useEffect, useRef } from "react";
import {
  Info,
  ImageIcon,
  Loader2,
  Pencil,
  Search,
  MessageSquare,
  User,
  Clock,
  FileSpreadsheet,
  ChevronDown,
  Hash,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  List,
  MousePointer2,
  Star,
  Video,
  Image,
  Type,
  Link,
  ChevronRight,
  ChevronUp,
  X,
} from "lucide-react";
import { useApi } from "@/lib/session_api";
import { getData, DB_KEYS } from "@/lib/indexedDB";
import type { EditorNode } from "./flowExport";

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption: string;
  media_type: string;
  thumbnail_url?: string;
  timestamp: string;
}

interface WhatsAppConversation {
  id?: string;
  conversation_id?: string;
  customer_name: string;
  last_message: string;
  unread_count: number;
}

interface ConnectedSheet {
  sheet_id: string;
  sheet_name: string;
  last_sync_rows: number;
  polling_enabled: boolean;
  last_processed_row_number: number;
}

const getConvId = (conv: WhatsAppConversation): string =>
  conv.conversation_id || conv.id || "";

interface SidebarSettingsProps {
  node: EditorNode | null | undefined;
  onClose: () => void;
  onUpdateNode?: (nodeId: string, dataPartial: Partial<EditorNode["data"]>) => void;
}

// ─── WA Node ID Helper ────────────────────────────────────────────────────────
// Generates a clean node ID from a button title
function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').substring(0, 40);
}

// ─── Button Row Editor ────────────────────────────────────────────────────────
function WaButtonEditor({
  buttons,
  onChange,
  maxButtons = 3,
  label = "Quick Reply Buttons",
}: {
  buttons: Array<{ id: string; title: string }>;
  onChange: (btns: Array<{ id: string; title: string }>) => void;
  maxButtons?: number;
  label?: string;
}) {
  const addBtn = () => {
    if (buttons.length >= maxButtons) return;
    onChange([...buttons, { id: '', title: '' }]);
  };
  const removeBtn = (i: number) => onChange(buttons.filter((_, idx) => idx !== i));
  const updateBtn = (i: number, field: 'id' | 'title', val: string) => {
    const next = [...buttons];
    next[i] = { ...next[i], [field]: val };
    // Auto-set ID from title if ID is empty or was auto-generated
    if (field === 'title') {
      const autoId = slugify(val);
      if (!next[i].id || next[i].id === slugify(buttons[i]?.title || '')) {
        next[i].id = autoId;
      }
    }
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        <span className="text-[10px] text-slate-400">{buttons.length}/{maxButtons}</span>
      </div>
      <div className="space-y-2">
        {buttons.map((btn, i) => (
          <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg group">
            <div className="flex-1 space-y-1.5">
              <input
                type="text"
                placeholder="Button label (e.g. Class 9th)"
                value={btn.title}
                onChange={(e) => updateBtn(i, 'title', e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white"
                maxLength={20}
              />
              <input
                type="text"
                placeholder="Target node ID (auto-set from label)"
                value={btn.id}
                onChange={(e) => updateBtn(i, 'id', e.target.value)}
                className="w-full text-[10px] px-2.5 py-1.5 border border-dashed border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white font-mono text-slate-500"
              />
            </div>
            <button
              type="button"
              onClick={() => removeBtn(i)}
              className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      {buttons.length < maxButtons && (
        <button
          type="button"
          onClick={addBtn}
          className="mt-2 w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Button
        </button>
      )}
      <p className="text-[10px] text-slate-400 mt-1.5">
        ⓘ The Target Node ID links this button to the next message node
      </p>
    </div>
  );
}

// ─── WA Header Editor ─────────────────────────────────────────────────────────
function WaHeaderEditor({
  headerType,
  mediaUrl,
  headerText,
  onChangeType,
  onChangeMediaUrl,
  onChangeHeaderText,
}: {
  headerType: 'none' | 'image' | 'video' | 'text';
  mediaUrl: string;
  headerText: string;
  onChangeType: (t: 'none' | 'image' | 'video' | 'text') => void;
  onChangeMediaUrl: (url: string) => void;
  onChangeHeaderText: (t: string) => void;
}) {
  const types: Array<{ value: 'none' | 'image' | 'video' | 'text'; icon: React.ReactNode; label: string }> = [
    { value: 'none', icon: <X className="w-3.5 h-3.5" />, label: 'None' },
    { value: 'image', icon: <Image className="w-3.5 h-3.5" />, label: 'Image' },
    { value: 'video', icon: <Video className="w-3.5 h-3.5" />, label: 'Video' },
    { value: 'text', icon: <Type className="w-3.5 h-3.5" />, label: 'Text' },
  ];

  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 block mb-2">Header (Optional)</label>
      <div className="flex gap-1.5 mb-3">
        {types.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChangeType(t.value)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-medium transition-all ${
              headerType === t.value
                ? 'border-green-400 bg-green-50 text-green-700'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      {(headerType === 'image' || headerType === 'video') && (
        <div className="space-y-1.5">
          <input
            type="url"
            placeholder={`${headerType === 'image' ? 'Image' : 'Video'} URL (Cloudinary, etc.)`}
            value={mediaUrl}
            onChange={(e) => onChangeMediaUrl(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
          {mediaUrl && headerType === 'image' && (
            <div className="relative rounded-lg overflow-hidden bg-slate-100 h-24">
              <img src={mediaUrl} alt="Header preview" className="w-full h-full object-cover" />
            </div>
          )}
          {mediaUrl && headerType === 'video' && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />
              Video URL set
            </p>
          )}
        </div>
      )}
      {headerType === 'text' && (
        <input
          type="text"
          placeholder="Header text (max 60 chars)"
          value={headerText}
          onChange={(e) => onChangeHeaderText(e.target.value)}
          maxLength={60}
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
        />
      )}
    </div>
  );
}

// ─── WA List Section Editor ───────────────────────────────────────────────────
function WaListSectionEditor({
  sections,
  onChange,
}: {
  sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>;
  onChange: (sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>) => void;
}) {
  const addSection = () => {
    onChange([...sections, { title: 'Section', rows: [{ id: '', title: '' }] }]);
  };
  const removeSection = (si: number) => onChange(sections.filter((_, i) => i !== si));
  const updateSection = (si: number, title: string) => {
    const next = [...sections];
    next[si] = { ...next[si], title };
    onChange(next);
  };
  const addRow = (si: number) => {
    const next = [...sections];
    next[si].rows.push({ id: '', title: '' });
    onChange(next);
  };
  const removeRow = (si: number, ri: number) => {
    const next = [...sections];
    next[si].rows = next[si].rows.filter((_, i) => i !== ri);
    onChange(next);
  };
  const updateRow = (si: number, ri: number, field: 'id' | 'title' | 'description', val: string) => {
    const next = [...sections];
    const row = { ...next[si].rows[ri], [field]: val };
    if (field === 'title') {
      const autoId = slugify(val);
      if (!row.id || row.id === slugify(next[si].rows[ri]?.title || '')) {
        row.id = autoId;
      }
    }
    next[si].rows[ri] = row;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {sections.map((sec, si) => (
        <div key={si} className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border-b border-slate-200">
            <List className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <input
              type="text"
              value={sec.title}
              onChange={(e) => updateSection(si, e.target.value)}
              placeholder="Section title"
              className="flex-1 text-xs font-semibold bg-transparent focus:outline-none text-slate-700"
            />
            {sections.length > 1 && (
              <button type="button" onClick={() => removeSection(si)} className="p-0.5 text-slate-300 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="p-2 space-y-2">
            {sec.rows.map((row, ri) => (
              <div key={ri} className="flex items-start gap-2 p-2 bg-white border border-slate-100 rounded-lg group">
                <div className="flex-1 space-y-1.5 min-w-0">
                  <input
                    type="text"
                    placeholder="Row title (e.g. Class 9th)"
                    value={row.title}
                    onChange={(e) => updateRow(si, ri, 'title', e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400"
                    maxLength={24}
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={row.description || ''}
                    onChange={(e) => updateRow(si, ri, 'description', e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 text-slate-500"
                    maxLength={72}
                  />
                  <input
                    type="text"
                    placeholder="Target node ID (auto-set)"
                    value={row.id}
                    onChange={(e) => updateRow(si, ri, 'id', e.target.value)}
                    className="w-full text-[10px] px-2.5 py-1.5 border border-dashed border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono text-slate-400"
                  />
                </div>
                <button type="button" onClick={() => removeRow(si, ri)} className="p-1 mt-0.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addRow(si)}
              className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-[11px] font-medium text-slate-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Row
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addSection}
        className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-400 hover:border-teal-400 hover:text-teal-600 transition-all flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Section
      </button>
    </div>
  );
}

// ─── WA Message Preview ────────────────────────────────────────────────────────
function WaMessagePreview({ node }: { node: EditorNode }) {
  const stepId = node.data?.stepId;
  const bodyText = node.data?.waBodyText || '';

  if (!bodyText) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-[#e5ddd5]">
      <div className="px-3 py-2 bg-[#128C7E]/10 border-b border-slate-200">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          WhatsApp Preview
        </p>
      </div>
      <div className="p-3">
        <div className="bg-white rounded-xl rounded-tl-sm shadow-sm overflow-hidden max-w-[240px]">
          {/* Header */}
          {node.data?.waHeaderType && node.data.waHeaderType !== 'none' && node.data?.waHeaderMediaUrl && (
            <div className="relative bg-slate-200 h-28">
              {node.data.waHeaderType === 'image' && (
                <img src={node.data.waHeaderMediaUrl} alt="" className="w-full h-full object-cover" />
              )}
              {node.data.waHeaderType === 'video' && (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-slate-400" />
                  <p className="text-xs text-slate-500 mt-1 absolute bottom-2 left-0 right-0 text-center">Video</p>
                </div>
              )}
            </div>
          )}
          {/* Body */}
          <div className="p-3">
            <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">{bodyText}</p>
            <p className="text-[10px] text-slate-400 mt-1.5 text-right">now ✓✓</p>
          </div>
          {/* Buttons */}
          {(stepId === 'wa_welcome_message' || stepId === 'wa_interactive_button') && node.data?.waButtons?.length > 0 && (
            <div className="border-t border-slate-100">
              {node.data.waButtons.map((btn: { id: string; title: string }, i: number) => (
                <div key={i} className={`px-3 py-2 text-center ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                  <span className="text-xs font-medium text-[#128C7E]">{btn.title || 'Button'}</span>
                </div>
              ))}
            </div>
          )}
          {/* List button */}
          {stepId === 'wa_interactive_list' && (
            <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-center gap-1.5">
              <List className="w-3.5 h-3.5 text-[#128C7E]" />
              <span className="text-xs font-medium text-[#128C7E]">{node.data?.waButtonText || 'Select Option'}</span>
            </div>
          )}
          {/* CTA URL */}
          {stepId === 'wa_cta_url' && (
            <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-[#128C7E]" />
              <span className="text-xs font-medium text-[#128C7E]">{node.data?.waCtaButtonText || 'Open Link'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN SIDEBAR ─────────────────────────────────────────────────────────────
export default function SidebarSettings({ node, onClose, onUpdateNode }: SidebarSettingsProps) {
  const api = useApi();
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [triggerPosts, setTriggerPosts] = useState<InstagramPost[]>([]);
  const [loadingTriggerPosts, setLoadingTriggerPosts] = useState(false);
  const [whatsappConversations, setWhatsappConversations] = useState<WhatsAppConversation[]>([]);
  const [loadingWaConversations, setLoadingWaConversations] = useState(false);
  const [waSearchQuery, setWaSearchQuery] = useState('');
  const [connectedSheets, setConnectedSheets] = useState<ConnectedSheet[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [sheetColumns, setSheetColumns] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const [sheetSearchQuery, setSheetSearchQuery] = useState('');

  // ── Fetch based on node type ────────────────────────────────────────────────
  useEffect(() => {
    if (!node || node.type !== 'trigger') return;
    const tid = node.data?.triggerType;
    const sid = node.data?.stepId;

    if (tid === 'google_sheet' || sid === 'trigger_google_sheet') {
      setLoadingSheets(true);
      api.get('/api/google-sheets/connections')
        .then((r) => setConnectedSheets(r.data?.connections ?? []))
        .catch(() => setConnectedSheets([]))
        .finally(() => setLoadingSheets(false));
    }
    if (tid === 'whatsapp_followup' || sid === 'trigger_whatsapp_followup') {
      setLoadingWaConversations(true);
      api.get('/api/whatsapp/conversations')
        .then((r) => { const d = r.data?.conversations || r.data?.data || r.data; setWhatsappConversations(Array.isArray(d) ? d : []); })
        .catch(() => setWhatsappConversations([]))
        .finally(() => setLoadingWaConversations(false));
    }
    if (!['whatsapp_followup', 'google_sheet', 'whatsapp_message_received'].includes(tid || '') &&
        !['trigger_whatsapp_followup', 'trigger_google_sheet', 'trigger_whatsapp_message'].includes(sid || '')) {
      setLoadingTriggerPosts(true);
      getData<{ posts: InstagramPost[] }>('integrations', DB_KEYS.INTEGRATIONS.INSTAGRAM_POSTS)
        .then((d) => setTriggerPosts(d?.posts ?? []))
        .catch(() => setTriggerPosts([]))
        .finally(() => setLoadingTriggerPosts(false));
    }
  }, [node?.id, node?.type, node?.data?.triggerType, node?.data?.stepId]);

  useEffect(() => {
    const sheetId = node?.data?.triggerConfig?.sheet_id as string | undefined;
    if (!sheetId) { setSheetColumns([]); return; }
    setLoadingColumns(true);
    api.get(`/api/google-sheets/columns?sheet_id=${sheetId}`)
      .then((r) => setSheetColumns(r.data?.columns ?? []))
      .catch(() => setSheetColumns([]))
      .finally(() => setLoadingColumns(false));
  }, [node?.data?.triggerConfig?.sheet_id]);

  useEffect(() => {
    if (!node?.app || node.app !== 'instagram' || !showMediaPicker) return;
    setLoadingMedia(true);
    getData<{ posts: InstagramPost[] }>('integrations', DB_KEYS.INTEGRATIONS.INSTAGRAM_POSTS)
      .then((d) => setInstagramPosts(d?.posts ?? []))
      .catch(() => setInstagramPosts([]))
      .finally(() => setLoadingMedia(false));
  }, [node?.id, node?.app, showMediaPicker]);

  if (!node) return null;

  const update = (partial: Partial<EditorNode['data']>) => onUpdateNode?.(node.id, partial);

  const stepId = node.data?.stepId;
  const isTrigger = node.type === 'trigger';
  const isLogicNode = node.type === 'logic';
  const isWaWelcome = stepId === 'wa_welcome_message';
  const isWaButton = stepId === 'wa_interactive_button';
  const isWaList = stepId === 'wa_interactive_list';
  const isWaCta = stepId === 'wa_cta_url';
  const isWaInteractiveNode = isWaWelcome || isWaButton || isWaList || isWaCta;
  const isWaPlainText = stepId === 'content_whatsapp_message';
  const isContentNode = stepId?.startsWith('content_');
  const isActionNode = stepId?.startsWith('action_');
  const isWhatsAppFollowUpTrigger = stepId === 'trigger_whatsapp_followup' || node.data?.triggerType === 'whatsapp_followup';
  const isWhatsAppMsgTrigger = stepId === 'trigger_whatsapp_message' || node.data?.triggerType === 'whatsapp_message_received';
  const isGoogleSheetTrigger = stepId === 'trigger_google_sheet' || node.data?.triggerType === 'google_sheet';

  const headerColor = isWaInteractiveNode
    ? 'bg-gradient-to-r from-[#128C7E] to-[#075E54] text-white'
    : isTrigger ? 'bg-blue-100 text-blue-900'
    : isLogicNode ? 'bg-amber-100 text-amber-900'
    : isActionNode ? 'bg-emerald-100 text-emerald-900'
    : 'bg-purple-100 text-purple-900';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className={`h-14 flex items-center justify-between px-5 border-b shrink-0 ${headerColor}`}>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base">{node.label}</h3>
          <Pencil className="w-4 h-4 opacity-60" />
        </div>
        <button onClick={onClose} className="text-xs font-bold px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
          Done
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* ═══════════════════════════════════════════════════════════════════
            WHATSAPP INTERACTIVE NODES
        ═══════════════════════════════════════════════════════════════════ */}

        {/* ── WELCOME MESSAGE ──────────────────────────────────────────────── */}
        {isWaWelcome && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Star className="w-4 h-4 text-violet-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Welcome Message</h4>
            </div>
            <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-900">
              <p className="font-semibold mb-1">📲 This is the first message users receive</p>
              <p>Sent automatically when someone messages with your trigger keywords. It's also stored as the <code className="bg-violet-100 px-1 rounded">welcome_message</code> in the flow.</p>
            </div>

            <WaHeaderEditor
              headerType={(node.data?.waHeaderType as 'none' | 'image' | 'video' | 'text') || 'none'}
              mediaUrl={node.data?.waHeaderMediaUrl || ''}
              headerText={node.data?.waHeaderText || ''}
              onChangeType={(t) => update({ waHeaderType: t })}
              onChangeMediaUrl={(u) => update({ waHeaderMediaUrl: u })}
              onChangeHeaderText={(t) => update({ waHeaderText: t })}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Body Text *</label>
              <textarea
                className="w-full h-36 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                placeholder={"*Welcome to Cognisive*\n\nHello {customer_name}👋🏻\n\nPlease select who is exploring admission:"}
                value={node.data?.waBodyText || ''}
                onChange={(e) => update({ waBodyText: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 mt-1">Supports WhatsApp formatting: *bold*, _italic_, ~strikethrough~</p>
            </div>

            <WaButtonEditor
              buttons={node.data?.waButtons || []}
              onChange={(btns) => update({ waButtons: btns })}
              maxButtons={3}
              label="Reply Buttons *"
            />

            <WaMessagePreview node={node} />
          </div>
        )}

        {/* ── BUTTON MESSAGE ───────────────────────────────────────────────── */}
        {isWaButton && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MousePointer2 className="w-4 h-4 text-green-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Button Message</h4>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-900">
              <p>Interactive message with up to <strong>3 quick reply buttons</strong>. Each button routes to a different node.</p>
            </div>

            <WaHeaderEditor
              headerType={(node.data?.waHeaderType as 'none' | 'image' | 'video' | 'text') || 'none'}
              mediaUrl={node.data?.waHeaderMediaUrl || ''}
              headerText={node.data?.waHeaderText || ''}
              onChangeType={(t) => update({ waHeaderType: t })}
              onChangeMediaUrl={(u) => update({ waHeaderMediaUrl: u })}
              onChangeHeaderText={(t) => update({ waHeaderText: t })}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Body Text *</label>
              <textarea
                className="w-full h-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                placeholder="What is the primary goal for the student?"
                value={node.data?.waBodyText || ''}
                onChange={(e) => update({ waBodyText: e.target.value })}
              />
            </div>

            <WaButtonEditor
              buttons={node.data?.waButtons || []}
              onChange={(btns) => update({ waButtons: btns })}
              maxButtons={3}
              label="Reply Buttons (up to 3) *"
            />

            <WaMessagePreview node={node} />
          </div>
        )}

        {/* ── LIST MESSAGE ─────────────────────────────────────────────────── */}
        {isWaList && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <List className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">List Message</h4>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900">
              <p>Scrollable list with sections and rows. Each row routes to a different node. Great for class selection, goal selection, etc.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Body Text *</label>
              <textarea
                className="w-full h-28 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                placeholder="Thanks for sharing!\n\nPlease select your child's current class from below options:"
                value={node.data?.waBodyText || ''}
                onChange={(e) => update({ waBodyText: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">List Button Label *</label>
              <input
                type="text"
                placeholder="e.g. Select Class"
                value={node.data?.waButtonText || ''}
                onChange={(e) => update({ waButtonText: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                maxLength={20}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-3">Sections & Rows *</label>
              <WaListSectionEditor
                sections={node.data?.waSections || [{ title: 'Class', rows: [{ id: '', title: '' }] }]}
                onChange={(s) => update({ waSections: s })}
              />
            </div>

            <WaMessagePreview node={node} />
          </div>
        )}

        {/* ── CTA URL ──────────────────────────────────────────────────────── */}
        {isWaCta && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">CTA URL Button</h4>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              <p>Message with a single external URL button. Terminal node — no routing needed.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Body Text *</label>
              <textarea
                className="w-full h-32 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                placeholder="Cognisive conducts a Merit Scholarship Test for students seeking admission..."
                value={node.data?.waBodyText || ''}
                onChange={(e) => update({ waBodyText: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Button Label *</label>
              <input
                type="text"
                placeholder="e.g. Register for test"
                value={node.data?.waCtaButtonText || ''}
                onChange={(e) => update({ waCtaButtonText: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                maxLength={20}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">URL *</label>
              <div className="relative">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://forms.gle/..."
                  value={node.data?.waCtaUrl || ''}
                  onChange={(e) => update({ waCtaUrl: e.target.value })}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              {node.data?.waCtaUrl && (
                <a href={node.data.waCtaUrl} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline mt-1 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Test URL
                </a>
              )}
            </div>

            <WaMessagePreview node={node} />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TRIGGER: WhatsApp Message Received (Bot trigger)
        ═══════════════════════════════════════════════════════════════════ */}
        {isWhatsAppMsgTrigger && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">WhatsApp Bot Trigger</h4>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-900">
              <p className="font-semibold mb-1">🤖 Interactive Bot Flow</p>
              <p>When someone sends a message matching your keywords, the bot sends the Welcome Message and starts the conversation flow.</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Trigger Keywords *</label>
              <p className="text-[11px] text-slate-500 mb-2">Comma-separated. The bot activates when any of these are received.</p>
              <input
                type="text"
                placeholder="hi, hey, hello, menu, start"
                value={node.data?.triggerConfig?.trigger_messages as string || ''}
                onChange={(e) => update({
                  triggerConfig: { ...node.data?.triggerConfig, trigger_messages: e.target.value },
                  triggerSubtitle: e.target.value ? `Keywords: ${e.target.value}` : undefined,
                })}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <p>⚡ <strong>Next:</strong> Connect a <strong>Welcome Message</strong> node from this trigger. That node becomes both the welcome_message and the first flow node.</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TRIGGER: WhatsApp Follow-Up
        ═══════════════════════════════════════════════════════════════════ */}
        {isWhatsAppFollowUpTrigger && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">WhatsApp Follow-Up</h4>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <ol className="text-xs text-emerald-800 space-y-1 ml-4 list-decimal">
                <li>Select a WhatsApp conversation below</li>
                <li>Connect a Smart Delay node to set timing</li>
                <li>Add a WhatsApp Message node</li>
                <li>Publish the flow to activate</li>
              </ol>
            </div>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={waSearchQuery}
                onChange={(e) => setWaSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            {loadingWaConversations ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                {whatsappConversations
                  .filter((c) => c.customer_name.toLowerCase().includes(waSearchQuery.toLowerCase()))
                  .map((conv) => {
                    const convId = getConvId(conv);
                    const isSelected = node.data?.triggerConfig?.conversation_id === convId;
                    return (
                      <button
                        key={convId}
                        type="button"
                        onClick={() => update({ triggerConfig: { ...node.data?.triggerConfig, conversation_id: isSelected ? undefined : convId, conversation_name: isSelected ? undefined : conv.customer_name }, triggerSubtitle: isSelected ? undefined : `To: ${conv.customer_name}` })}
                        className={`w-full p-3 flex items-center gap-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-all text-left ${isSelected ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          {isSelected ? <span className="text-white text-sm">✓</span> : <User className="w-4 h-4 text-slate-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>{conv.customer_name}</p>
                          <p className="text-xs text-slate-400 truncate">{conv.last_message}</p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TRIGGER: Google Sheet
        ═══════════════════════════════════════════════════════════════════ */}
        {isGoogleSheetTrigger && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Google Sheet Trigger</h4>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sheets..."
                value={sheetSearchQuery}
                onChange={(e) => setSheetSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            {loadingSheets ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-green-500" /></div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {connectedSheets.filter((s) => s.sheet_name.toLowerCase().includes(sheetSearchQuery.toLowerCase())).map((sheet) => {
                  const isSelected = node.data?.triggerConfig?.sheet_id === sheet.sheet_id;
                  return (
                    <button
                      key={sheet.sheet_id}
                      type="button"
                      onClick={() => update({ triggerConfig: { ...node.data?.triggerConfig, sheet_id: isSelected ? undefined : sheet.sheet_id, sheet_name: isSelected ? undefined : sheet.sheet_name, column_name: undefined }, triggerSubtitle: isSelected ? undefined : `Sheet: ${sheet.sheet_name}` })}
                      className={`w-full p-3 flex items-center gap-3 border-b border-slate-100 last:border-b-0 text-left transition-all hover:bg-slate-50 ${isSelected ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                    >
                      <FileSpreadsheet className={`w-4 h-4 shrink-0 ${isSelected ? 'text-green-600' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-green-900' : 'text-slate-800'}`}>{sheet.sheet_name}</p>
                        <p className="text-xs text-slate-400">{sheet.last_sync_rows} rows synced</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
            {node.data?.triggerConfig?.sheet_id && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Phone Number Column *</label>
                {loadingColumns ? (
                  <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-green-500" /><span className="text-xs text-slate-500">Loading columns...</span></div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setColumnDropdownOpen((v) => !v)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm ${node.data?.triggerConfig?.column_name ? 'border-green-400 bg-green-50' : 'border-slate-200'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <span>{node.data?.triggerConfig?.column_name as string || 'Select column...'}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${columnDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {columnDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setColumnDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 max-h-48 overflow-y-auto">
                          {sheetColumns.map((col) => (
                            <button key={col} type="button" onClick={() => { update({ triggerConfig: { ...node.data?.triggerConfig, column_name: col }, triggerSubtitle: `${node.data?.triggerConfig?.sheet_name} → ${col}` }); setColumnDropdownOpen(false); }} className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 ${node.data?.triggerConfig?.column_name === col ? 'bg-green-50 text-green-900 font-semibold' : 'text-slate-700'}`}>
                              <Hash className="w-3.5 h-3.5 text-slate-400" />
                              {col}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            Instagram Trigger
        ═══════════════════════════════════════════════════════════════════ */}
        {isTrigger && !isWhatsAppFollowUpTrigger && !isGoogleSheetTrigger && !isWhatsAppMsgTrigger && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Trigger Configuration</h4>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Select Instagram Post (Optional)</label>
              {loadingTriggerPosts ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div> : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {triggerPosts.map((post) => {
                    const isSelected = node.data?.triggerConfig?.post_id === post.id;
                    return (
                      <button key={post.id} type="button" onClick={() => update({ triggerConfig: { ...node.data?.triggerConfig, post_id: isSelected ? undefined : post.id }, triggerSubtitle: isSelected ? undefined : `Post: ${post.caption?.substring(0, 30)}...` })} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'}`}>
                        <img src={post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url} alt={post.caption || 'Post'} className="w-full h-full object-cover" />
                        {isSelected && <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"><span className="text-white text-xs">✓</span></div></div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Keywords (optional, comma-separated)</label>
              <input type="text" value={(node.data?.triggerConfig?.keywords ?? []).join(', ')} onChange={(e) => update({ triggerConfig: { ...node.data?.triggerConfig, keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) } })} placeholder="e.g. price, discount, info" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            WA Plain Text Message
        ═══════════════════════════════════════════════════════════════════ */}
        {isWaPlainText && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">WhatsApp Plain Text</h4>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Message Text *</label>
              <textarea
                className="w-full h-40 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                placeholder={"Hi {{row.Name}}, welcome!\n\nFor follow-up: Hi {{customer_name}}, checking in!"}
                value={node.data?.text ?? ''}
                onChange={(e) => update({ text: e.target.value })}
              />
              <div className="mt-1 space-y-1">
                <p className="text-xs text-slate-500">Sheet variables: <code className="bg-slate-100 px-1 py-0.5 rounded text-green-700">{"{{phone_number}}"}</code> <code className="bg-slate-100 px-1 py-0.5 rounded text-green-700">{"{{row.ColumnName}}"}</code></p>
                <p className="text-xs text-slate-500">Follow-up: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">{"{{customer_name}}"}</code></p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            Instagram Content Nodes
        ═══════════════════════════════════════════════════════════════════ */}
        {isContentNode && !isWaPlainText && !isWaInteractiveNode && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Message Content</h4>
            {(stepId === 'content_text' || stepId === 'content_card') && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">Message Text</label>
                <textarea className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none" placeholder="Enter your message..." value={node.data?.text ?? ''} onChange={(e) => update({ text: e.target.value })} />
              </div>
            )}
            {(stepId === 'content_image' || stepId === 'content_card') && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">Media</label>
                {node.data?.media_url && <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 mb-2"><img src={node.data.media_url} alt="Selected" className="w-12 h-12 object-cover rounded" /><button type="button" onClick={() => update({ media_url: null })} className="text-xs font-bold text-rose-500">Remove</button></div>}
                <button type="button" onClick={() => setShowMediaPicker((v) => !v)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  <ImageIcon className="w-4 h-4" />
                  {showMediaPicker ? 'Hide media picker' : 'Pick from Instagram'}
                </button>
                {showMediaPicker && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto mt-2">
                    {loadingMedia ? <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div> : (
                      <div className="grid grid-cols-3 gap-2">
                        {instagramPosts.map((post) => (
                          <button key={post.id} type="button" onClick={() => { update({ media_url: post.media_url }); setShowMediaPicker(false); }} className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-400">
                            <img src={post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            Instagram Action Nodes
        ═══════════════════════════════════════════════════════════════════ */}
        {isActionNode && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Action Configuration</h4>
            {stepId === 'action_reply_comment' && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">Reply Text</label>
                <textarea className="w-full h-28 px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none resize-none" placeholder="Thank you for your comment!" value={node.data?.text ?? ''} onChange={(e) => update({ text: e.target.value })} />
              </div>
            )}
            {stepId === 'action_send_dm' && (
              <>
                <div><label className="text-xs font-medium text-slate-600 block mb-2">DM Message</label><textarea className="w-full h-28 px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none resize-none" placeholder="Hi! Thanks for your comment..." value={node.data?.text ?? ''} onChange={(e) => update({ text: e.target.value })} /></div>
                <div><label className="text-xs font-medium text-slate-600 block mb-2">Link URL</label><input type="url" value={node.data?.linkUrl ?? ''} onChange={(e) => update({ linkUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-slate-600 block mb-2">Button Title</label><input type="text" value={node.data?.buttonTitle ?? 'View Link'} onChange={(e) => update({ buttonTitle: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" /></div>
              </>
            )}
            {stepId === 'action_tag' && <div><label className="text-xs font-medium text-slate-600 block mb-2">Tag Name</label><input type="text" value={node.data?.tagName ?? ''} onChange={(e) => update({ tagName: e.target.value })} placeholder="VIP, Lead, Interested" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" /></div>}
            {stepId === 'action_field' && (
              <>
                <div><label className="text-xs font-medium text-slate-600 block mb-2">Field Name</label><input type="text" value={node.data?.fieldName ?? ''} onChange={(e) => update({ fieldName: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-slate-600 block mb-2">Field Value</label><input type="text" value={node.data?.fieldValue ?? ''} onChange={(e) => update({ fieldValue: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" /></div>
              </>
            )}
            {stepId === 'action_api' && (
              <>
                <div><label className="text-xs font-medium text-slate-600 block mb-2">URL</label><input type="url" value={node.data?.apiUrl ?? ''} onChange={(e) => update({ apiUrl: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-slate-600 block mb-2">Method</label><select value={node.data?.apiMethod ?? 'POST'} onChange={(e) => update({ apiMethod: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option></select></div>
                <div><label className="text-xs font-medium text-slate-600 block mb-2">JSON Body</label><textarea value={node.data?.apiBody ?? ''} onChange={(e) => update({ apiBody: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none resize-none" /></div>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            Logic Nodes
        ═══════════════════════════════════════════════════════════════════ */}
        {isLogicNode && (
          <div className="space-y-4">
            {node.data?.logicType === 'delay' && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-3">
                <p className="text-xs font-bold text-amber-900">Delay Configuration</p>
                <div className="flex gap-2 items-center">
                  <input type="number" min={1} value={node.data?.delayAmount ?? 5} onChange={(e) => update({ delayAmount: Number(e.target.value) || 1 })} className="w-20 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                  <select value={node.data?.delayUnit ?? 'minutes'} onChange={(e) => update({ delayUnit: e.target.value as 'seconds' | 'minutes' | 'hours' | 'days' })} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            )}
            {node.data?.logicType === 'condition' && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-2">
                <p className="text-xs font-bold text-amber-900">Condition</p>
                <input type="text" value={node.data?.conditionVariable ?? ''} onChange={(e) => update({ conditionVariable: e.target.value })} placeholder="Variable (e.g. trigger_data.message_text)" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
                <select value={node.data?.conditionOperator ?? 'includes'} onChange={(e) => update({ conditionOperator: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none">
                  <option value="includes">Includes</option>
                  <option value="not_includes">Does not include</option>
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not equals</option>
                </select>
                <input type="text" value={node.data?.conditionValue ?? ''} onChange={(e) => update({ conditionValue: e.target.value })} placeholder="Value" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
              </div>
            )}
            {node.data?.logicType === 'randomizer' && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                <p className="text-xs font-bold text-amber-900 mb-2">A/B Split</p>
                <p className="text-xs text-slate-600">Randomly sends user down one of the connected paths.</p>
              </div>
            )}
          </div>
        )}

      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
        <p className="text-[10px] text-slate-400 text-center">Node ID: <span className="font-mono">{node.id}</span></p>
      </div>
    </div>
  );
}