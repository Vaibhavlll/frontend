import React, { useState, useEffect } from "react";
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
  customer_username?: string;
  last_message: string;
  last_message_timestamp?: string;
  timestamp?: string;
  unread_count: number;
  status?: string;
}

interface ConnectedSheet {
  sheet_id: string;
  sheet_name: string;
  last_synced_at: string | null;
  last_sync_rows: number;
  polling_enabled: boolean;
  last_processed_row_number: number;
}

// Helper: get the actual conversation ID
const getConvId = (conv: WhatsAppConversation): string =>
  conv.conversation_id || conv.id || "";

interface SidebarSettingsProps {
  node: EditorNode | null | undefined;
  onClose: () => void;
  onUpdateNode?: (
    nodeId: string,
    dataPartial: Partial<EditorNode["data"]>
  ) => void;
}

export default function SidebarSettings({
  node,
  onClose,
  onUpdateNode,
}: SidebarSettingsProps) {
  const api = useApi();
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [triggerPosts, setTriggerPosts] = useState<InstagramPost[]>([]);
  const [loadingTriggerPosts, setLoadingTriggerPosts] = useState(false);

  // WhatsApp state
  const [whatsappConversations, setWhatsappConversations] = useState<
    WhatsAppConversation[]
  >([]);
  const [loadingWhatsAppConversations, setLoadingWhatsAppConversations] =
    useState(false);
  const [whatsappSearchQuery, setWhatsappSearchQuery] = useState("");

  // ─── GOOGLE SHEET state ───────────────────────────────────────────────────
  const [connectedSheets, setConnectedSheets] = useState<ConnectedSheet[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [sheetColumns, setSheetColumns] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const [sheetSearchQuery, setSheetSearchQuery] = useState("");

  // Fetch connected Google Sheets for trigger nodes
  useEffect(() => {
    if (
      !node ||
      node.type !== "trigger" ||
      (node.data?.triggerType !== "google_sheet" &&
        node.data?.stepId !== "trigger_google_sheet")
    ) {
      setConnectedSheets([]);
      setSheetColumns([]);
      return;
    }

    const loadSheets = async () => {
      setLoadingSheets(true);
      try {
        const res = await api.get("/api/google-sheets/connections");
        const sheets: ConnectedSheet[] = res.data?.connections ?? [];
        setConnectedSheets(sheets);
      } catch (error) {
        console.error("Error fetching connected sheets:", error);
        setConnectedSheets([]);
      } finally {
        setLoadingSheets(false);
      }
    };

    loadSheets();
  }, [node?.id, node?.type, node?.data?.triggerType, node?.data?.stepId, api]);

  // Fetch columns whenever a sheet is selected
  useEffect(() => {
    const sheetId = node?.data?.triggerConfig?.sheet_id as string | undefined;
    if (
      !sheetId ||
      node?.data?.triggerType !== "google_sheet" &&
      node?.data?.stepId !== "trigger_google_sheet"
    ) {
      setSheetColumns([]);
      return;
    }

    const loadColumns = async () => {
      setLoadingColumns(true);
      try {
        const res = await api.get(
          `/api/google-sheets/columns?sheet_id=${sheetId}`
        );
        // Backend should return { columns: ["Name", "Email", "Phone", ...] }
        const cols: string[] = res.data?.columns ?? [];
        setSheetColumns(cols);
      } catch (error) {
        console.error("Error fetching sheet columns:", error);
        setSheetColumns([]);
      } finally {
        setLoadingColumns(false);
      }
    };

    loadColumns();
  }, [node?.data?.triggerConfig?.sheet_id, api]);

  // Fetch WhatsApp conversations for trigger nodes
  useEffect(() => {
    if (
      !node ||
      node.type !== "trigger" ||
      (node.data?.triggerType !== "whatsapp_followup" &&
        node.data?.stepId !== "trigger_whatsapp_followup")
    ) {
      setWhatsappConversations([]);
      return;
    }

    const loadWhatsAppConversations = async () => {
      setLoadingWhatsAppConversations(true);
      try {
        const response = await api.get("/api/whatsapp/conversations");
        if (response.status === 200 && response.data) {
          const conversations =
            response.data.conversations || response.data.data || response.data;
          setWhatsappConversations(
            Array.isArray(conversations) ? conversations : []
          );
        } else {
          setWhatsappConversations([]);
        }
      } catch (error) {
        console.error("Error fetching WhatsApp conversations:", error);
        setWhatsappConversations([]);
      } finally {
        setLoadingWhatsAppConversations(false);
      }
    };

    loadWhatsAppConversations();
  }, [
    node?.id,
    node?.type,
    node?.data?.triggerType,
    node?.data?.stepId,
    api,
  ]);

  // Fetch Instagram posts for trigger nodes
  useEffect(() => {
    if (!node || node.type !== "trigger") {
      setTriggerPosts([]);
      return;
    }
    if (
      node.data?.triggerType === "whatsapp_followup" ||
      node.data?.stepId === "trigger_whatsapp_followup" ||
      node.data?.triggerType === "google_sheet" ||
      node.data?.stepId === "trigger_google_sheet"
    ) {
      setTriggerPosts([]);
      return;
    }
    const loadTriggerPosts = async () => {
      setLoadingTriggerPosts(true);
      try {
        const data = await getData<{ posts: InstagramPost[] }>(
          "integrations",
          DB_KEYS.INTEGRATIONS.INSTAGRAM_POSTS
        );
        setTriggerPosts(data?.posts ?? []);
      } catch {
        setTriggerPosts([]);
      } finally {
        setLoadingTriggerPosts(false);
      }
    };
    loadTriggerPosts();
  }, [
    node?.id,
    node?.type,
    node?.data?.triggerType,
    node?.data?.stepId,
  ]);

  // Fetch Instagram media for action nodes
  useEffect(() => {
    if (!node || node.app !== "instagram" || !showMediaPicker) return;
    const load = async () => {
      setLoadingMedia(true);
      try {
        const data = await getData<{ posts: InstagramPost[] }>(
          "integrations",
          DB_KEYS.INTEGRATIONS.INSTAGRAM_POSTS
        );
        setInstagramPosts(data?.posts ?? []);
      } catch {
        setInstagramPosts([]);
      } finally {
        setLoadingMedia(false);
      }
    };
    load();
  }, [node?.id, node?.app, showMediaPicker]);

  if (!node) return null;

  const update = (partial: Partial<EditorNode["data"]>) => {
    onUpdateNode?.(node.id, partial);
  };

  // Determine node category
  const stepId = node.data?.stepId;
  const isTrigger = node.type === "trigger";
  const isContentNode = stepId?.startsWith("content_");
  const isActionNode = stepId?.startsWith("action_");
  const isLogicNode = node.type === "logic";
  const isWhatsAppFollowUpTrigger =
    stepId === "trigger_whatsapp_followup" ||
    node.data?.triggerType === "whatsapp_followup";
  const isGoogleSheetTrigger =
    stepId === "trigger_google_sheet" ||
    node.data?.triggerType === "google_sheet";
  const isWhatsAppMessage = stepId === "content_whatsapp_message";

  const filteredWhatsAppConversations = whatsappConversations.filter(
    (conv) =>
      conv.customer_name
        .toLowerCase()
        .includes(whatsappSearchQuery.toLowerCase()) ||
      getConvId(conv)
        .toLowerCase()
        .includes(whatsappSearchQuery.toLowerCase())
  );

  const filteredSheets = connectedSheets.filter((s) =>
    s.sheet_name.toLowerCase().includes(sheetSearchQuery.toLowerCase())
  );

  // Current Google Sheet trigger config values
  const selectedSheetId = node.data?.triggerConfig?.sheet_id as
    | string
    | undefined;
  const selectedSheetName = node.data?.triggerConfig?.sheet_name as
    | string
    | undefined;
  const selectedColumn = node.data?.triggerConfig?.column_name as
    | string
    | undefined;
  const rowStart = node.data?.triggerConfig?.row_start as number | undefined;
  const rowEnd = node.data?.triggerConfig?.row_end as number | undefined;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div
        className={`h-14 flex items-center justify-between px-5 border-b shrink-0 rounded-t-xl ${
          isTrigger
            ? "bg-blue-100 text-blue-900"
            : isLogicNode
            ? "bg-amber-100 text-amber-900"
            : isActionNode
            ? "bg-emerald-100 text-emerald-900"
            : "bg-purple-100 text-purple-900"
        }`}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base">{node.label}</h3>
          <Pencil className="w-4 h-4 opacity-70" />
        </div>
        <button
          onClick={onClose}
          className="text-xs font-bold px-3 py-1.5 bg-white/80 rounded-lg hover:bg-white transition-colors"
        >
          Done
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* ─── GOOGLE SHEET TRIGGER ─────────────────────────────────────────── */}
        {isGoogleSheetTrigger && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Google Sheet Configuration
              </h4>
            </div>

            {/* How it works */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-900 font-semibold mb-2">
                📋 How it works:
              </p>
              <ol className="text-xs text-green-800 space-y-1 ml-4 list-decimal leading-relaxed">
                <li>Select a connected Google Sheet below</li>
                <li>Choose the column containing phone numbers</li>
                <li>Optionally set a row range (default: all rows)</li>
                <li>Connect a WhatsApp Message node to define the message</li>
                <li>Messages are sent once per phone number — no duplicates</li>
                <li>New rows added to the sheet trigger messages automatically</li>
              </ol>
            </div>

            {/* ── STEP 1: Sheet Selection ── */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Step 1 — Select Google Sheet *
              </label>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search sheets..."
                  value={sheetSearchQuery}
                  onChange={(e) => setSheetSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              {loadingSheets ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                </div>
              ) : filteredSheets.length === 0 ? (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">
                    {sheetSearchQuery
                      ? "No sheets match your search."
                      : "No connected Google Sheets found."}
                  </p>
                  {!sheetSearchQuery && (
                    <p className="text-xs text-slate-400 mt-1">
                      Go to Settings → Integrations → Google to connect a sheet first.
                    </p>
                  )}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                  {filteredSheets.map((sheet) => {
                    const isSelected = selectedSheetId === sheet.sheet_id;
                    return (
                      <button
                        key={sheet.sheet_id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            // Deselect
                            update({
                              triggerConfig: {
                                ...node.data?.triggerConfig,
                                sheet_id: undefined,
                                sheet_name: undefined,
                                column_name: undefined,
                              },
                              triggerSubtitle: undefined,
                            });
                            setSheetColumns([]);
                          } else {
                            update({
                              triggerConfig: {
                                ...node.data?.triggerConfig,
                                sheet_id: sheet.sheet_id,
                                sheet_name: sheet.sheet_name,
                                column_name: undefined, // reset column when sheet changes
                              },
                              triggerSubtitle: `Sheet: ${sheet.sheet_name}`,
                            });
                          }
                        }}
                        className={`w-full p-3 flex items-center gap-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-all text-left ${
                          isSelected
                            ? "bg-green-50 border-l-4 border-l-green-500"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-green-500" : "bg-green-100"
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isSelected ? "text-green-900" : "text-slate-900"
                            }`}
                          >
                            {sheet.sheet_name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {sheet.last_sync_rows > 0
                              ? `${sheet.last_sync_rows} rows synced`
                              : "No sync yet"}{" "}
                            ·{" "}
                            {sheet.polling_enabled ? (
                              <span className="text-green-600">Auto-sync on</span>
                            ) : (
                              <span className="text-amber-600">Auto-sync paused</span>
                            )}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── STEP 2: Column Selection (only after sheet is selected) ── */}
            {selectedSheetId && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Step 2 — Select Phone Number Column *
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Choose the column that contains phone numbers. Messages will be sent to each number in this column.
                </p>

                {loadingColumns ? (
                  <div className="flex items-center gap-2 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                    <span className="text-xs text-slate-500">Loading columns...</span>
                  </div>
                ) : sheetColumns.length === 0 ? (
                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      Could not load columns. Make sure the sheet has headers in the first row and is properly synced.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setColumnDropdownOpen((v) => !v)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition-all ${
                        selectedColumn
                          ? "border-green-400 bg-green-50 text-green-900"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">
                          {selectedColumn ?? "Select column..."}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          columnDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {columnDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setColumnDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 max-h-48 overflow-y-auto">
                          {sheetColumns.map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => {
                                update({
                                  triggerConfig: {
                                    ...node.data?.triggerConfig,
                                    column_name: col,
                                  },
                                  triggerSubtitle: `${selectedSheetName} → ${col}`,
                                });
                                setColumnDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                                selectedColumn === col
                                  ? "bg-green-50 text-green-900 font-semibold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {col}
                              {selectedColumn === col && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 ml-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {selectedColumn && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    WhatsApp messages will be sent to numbers in the{" "}
                    <strong>"{selectedColumn}"</strong> column
                  </p>
                )}
              </div>
            )}

            {/* ── STEP 3: Row Range (optional) ── */}
            {selectedSheetId && selectedColumn && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Step 3 — Row Range{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Leave blank to process all rows. Row numbers start from 1 (first data row after the header).
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                      From Row
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 1"
                      value={rowStart ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined;
                        update({
                          triggerConfig: {
                            ...node.data?.triggerConfig,
                            row_start: val,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>

                  <div className="pt-4 text-slate-400 text-sm font-medium">to</div>

                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                      To Row
                    </label>
                    <input
                      type="number"
                      min={rowStart ?? 1}
                      placeholder="e.g. 50"
                      value={rowEnd ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined;
                        update({
                          triggerConfig: {
                            ...node.data?.triggerConfig,
                            row_end: val,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                {(rowStart !== undefined || rowEnd !== undefined) && (
                  <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-600">
                      📊 Will process rows{" "}
                      <strong>{rowStart ?? "1"}</strong> to{" "}
                      <strong>{rowEnd ?? "end"}</strong>
                    </p>
                    {rowStart !== undefined &&
                      rowEnd !== undefined &&
                      rowEnd < rowStart && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          End row must be greater than or equal to start row
                        </p>
                      )}
                  </div>
                )}

                {!rowStart && !rowEnd && (
                  <p className="text-xs text-slate-400 mt-2">
                    ✓ All rows will be processed (default)
                  </p>
                )}
              </div>
            )}

            {/* ── STEP 4: Next step hint ── */}
            {selectedSheetId && selectedColumn && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900 font-semibold mb-1">
                  ✅ Sheet configured!
                </p>
                <p className="text-xs text-blue-800">
                  Next: Connect a <strong>WhatsApp Message</strong> node and write your message. Use{" "}
                  <code className="bg-blue-100 px-1 py-0.5 rounded">
                    {"{{phone_number}}"}
                  </code>{" "}
                  or{" "}
                  <code className="bg-blue-100 px-1 py-0.5 rounded">
                    {"{{row.ColumnName}}"}
                  </code>{" "}
                  to reference sheet data.
                </p>
              </div>
            )}

            {/* Important notes */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
              <p className="text-xs font-semibold text-amber-900">⚠️ Important:</p>
              <ul className="text-xs text-amber-800 space-y-1 ml-3 list-disc">
                <li>Each phone number receives the message <strong>only once</strong></li>
                <li>New rows added to the sheet will trigger messages automatically</li>
                <li>Phone numbers must include country code (e.g. +91XXXXXXXXXX)</li>
                <li>Messages are sent immediately when the flow goes live</li>
              </ul>
            </div>
          </div>
        )}

        {/* ─── WHATSAPP FOLLOW-UP TRIGGER ──────────────────────────────────────── */}
        {isWhatsAppFollowUpTrigger && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                WhatsApp Follow-Up Configuration
              </h4>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-900 font-medium mb-1">
                📋 How it works:
              </p>
              <ol className="text-xs text-emerald-800 space-y-1 ml-4 list-decimal">
                <li>Select a WhatsApp conversation below</li>
                <li>Connect a Smart Delay node to set timing</li>
                <li>Add a WhatsApp Message node with your text</li>
                <li>Publish the flow to activate</li>
              </ol>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">
                Select WhatsApp Conversation *
              </label>

              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={whatsappSearchQuery}
                  onChange={(e) => setWhatsappSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {loadingWhatsAppConversations ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : filteredWhatsAppConversations.length === 0 ? (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    {whatsappSearchQuery
                      ? "No conversations match your search."
                      : "No WhatsApp conversations found. Start a conversation first in the inbox."}
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  {filteredWhatsAppConversations.map((conv) => {
                    const convId = getConvId(conv);
                    const isSelected =
                      node.data?.triggerConfig?.conversation_id === convId;
                    return (
                      <button
                        key={convId || conv.customer_name}
                        type="button"
                        onClick={() => {
                          update({
                            triggerConfig: {
                              ...node.data?.triggerConfig,
                              conversation_id: isSelected ? undefined : convId,
                              conversation_name: isSelected
                                ? undefined
                                : conv.customer_name,
                            },
                            triggerSubtitle: isSelected
                              ? undefined
                              : `To: ${conv.customer_name}`,
                          });
                        }}
                        className={`w-full p-3 flex items-center gap-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-all text-left ${
                          isSelected
                            ? "bg-emerald-50 border-l-4 border-l-emerald-500"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        >
                          {isSelected ? (
                            <span className="text-white text-lg">✓</span>
                          ) : (
                            <User className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isSelected ? "text-emerald-900" : "text-slate-900"
                            }`}
                          >
                            {conv.customer_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {conv.last_message || "No messages yet"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            ID: {convId}
                          </p>
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {node.data?.triggerConfig?.conversation_id && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <span className="font-semibold">✓ Selected:</span>
                  {node.data.triggerConfig.conversation_name ||
                    node.data.triggerConfig.conversation_id}
                </p>
              )}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                Next: Connect a Smart Delay node, then a WhatsApp Message node
              </p>
            </div>
          </div>
        )}

        {/* ─── WHATSAPP MESSAGE NODE ────────────────────────────────────────── */}
        {isWhatsAppMessage && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                WhatsApp Message Content
              </h4>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">
                Message Text *
              </label>
              <textarea
                className="w-full h-40 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                placeholder={`Enter your message...\n\nFor Google Sheet flows:\nHi {{row.Name}}, your number {{phone_number}} is registered!\n\nFor follow-up flows:\nHi {{customer_name}}, just checking in!`}
                value={node.data?.text ?? ""}
                onChange={(e) => update({ text: e.target.value })}
              />
              <div className="mt-1 space-y-1">
                <p className="text-xs text-slate-500">
                  Google Sheet variables:{" "}
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-green-700">
                    {"{{phone_number}}"}
                  </code>{" "}
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-green-700">
                    {"{{row.ColumnName}}"}
                  </code>
                </p>
                <p className="text-xs text-slate-500">
                  Follow-up variable:{" "}
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">
                    {"{{customer_name}}"}
                  </code>
                </p>
              </div>
            </div>

            {/* Message Preview */}
            {node.data?.text && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  📱 Preview:
                </p>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-900 whitespace-pre-wrap">
                    {node.data.text}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Templates */}
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">
                Quick Templates:
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "Sheet — Welcome",
                    text: "Hi {{row.Name}}! Welcome aboard. We have your details registered. Feel free to reach out if you need help!",
                  },
                  {
                    label: "Sheet — Offer",
                    text: "Hi {{row.Name}}! We have a special offer just for you. Reply YES to claim your discount!",
                  },
                  {
                    label: "Follow-up — Check-In",
                    text: "Hi {{customer_name}}! Just checking in — are you still interested in what we discussed? Happy to answer any questions!",
                  },
                  {
                    label: "Follow-up — Reminder",
                    text: "Hi {{customer_name}}! This is a friendly reminder about our previous conversation. Let us know if you need any help!",
                  },
                ].map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => update({ text: template.text })}
                    className="w-full text-left p-2 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all text-xs"
                  >
                    <p className="font-semibold text-slate-900">
                      {template.label}
                    </p>
                    <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                      {template.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── INSTAGRAM TRIGGER NODES ──────────────────────────────────────── */}
        {isTrigger && !isWhatsAppFollowUpTrigger && !isGoogleSheetTrigger && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                Trigger Configuration
              </h4>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">
                Select Instagram Post (Optional)
              </label>
              {loadingTriggerPosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : triggerPosts.length === 0 ? (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <p className="text-xs text-slate-500">
                    No Instagram posts available. Connect Instagram first.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {triggerPosts.map((post) => {
                    const isSelected =
                      node.data?.triggerConfig?.post_id === post.id;
                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => {
                          update({
                            triggerConfig: {
                              ...node.data?.triggerConfig,
                              post_id: isSelected ? undefined : post.id,
                            },
                            triggerSubtitle: isSelected
                              ? undefined
                              : `Post: ${post.caption?.substring(0, 30)}...`,
                          });
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <img
                          src={
                            post.media_type === "VIDEO"
                              ? post.thumbnail_url || post.media_url
                              : post.media_url
                          }
                          alt={post.caption || "Post"}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {node.data?.triggerType !== "instagram_ads" && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Keywords (optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={(node.data?.triggerConfig?.keywords ?? []).join(", ")}
                  onChange={(e) =>
                    update({
                      triggerConfig: {
                        ...node.data?.triggerConfig,
                        keywords: e.target.value
                          .split(",")
                          .map((k) => k.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g. price, discount, info"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Trigger only when comment contains these keywords
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── INSTAGRAM CONTENT NODES ──────────────────────────────────────── */}
        {isContentNode && !isWhatsAppMessage && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                Message Content
              </h4>
            </div>

            {(stepId === "content_text" || stepId === "content_card") && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Message Text
                </label>
                <textarea
                  className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                  placeholder="Enter your message..."
                  value={node.data?.text ?? ""}
                  onChange={(e) => update({ text: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Supports variables:{" "}
                  <code className="bg-slate-100 px-1 py-0.5 rounded">
                    {"{{trigger_data.customer_name}}"}
                  </code>
                </p>
              </div>
            )}

            {(stepId === "content_image" || stepId === "content_card") && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Media (Image/Video)
                </label>
                {node.data?.media_url ? (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 mb-2">
                    <img
                      src={node.data.media_url}
                      alt="Selected"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="text-xs text-slate-600 truncate flex-1">
                      Image attached
                    </span>
                    <button
                      type="button"
                      onClick={() => update({ media_url: null })}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowMediaPicker((v) => !v)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  {showMediaPicker
                    ? "Hide Instagram media"
                    : "Pick from Instagram"}
                </button>
                {showMediaPicker && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto mt-2">
                    {loadingMedia ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                      </div>
                    ) : instagramPosts.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">
                        No Instagram posts found. Connect Instagram first.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {instagramPosts.map((post) => (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => {
                              update({ media_url: post.media_url });
                              setShowMediaPicker(false);
                            }}
                            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-400 focus:border-purple-400"
                          >
                            <img
                              src={
                                post.media_type === "VIDEO"
                                  ? post.thumbnail_url || post.media_url
                                  : post.media_url
                              }
                              alt={post.caption || "Post"}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {stepId === "content_card" && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Card Title
                </label>
                <input
                  type="text"
                  value={node.data?.cardTitle ?? ""}
                  onChange={(e) => update({ cardTitle: e.target.value })}
                  placeholder="Enter card title"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            )}

            {stepId === "content_audio" && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Audio URL
                </label>
                <input
                  type="url"
                  value={node.data?.audioUrl ?? ""}
                  onChange={(e) => update({ audioUrl: e.target.value })}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  update({
                    buttons: [
                      ...(node.data?.buttons ?? []),
                      { type: "reply", label: "Option", save_to_field: "" },
                    ],
                  })
                }
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300"
              >
                + Add Button
              </button>
            </div>
          </div>
        )}

        {/* ─── INSTAGRAM ACTION NODES ──────────────────────────────────────── */}
        {isActionNode && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                Action Configuration
              </h4>
            </div>

            {stepId === "action_reply_comment" && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Reply Text
                </label>
                <textarea
                  className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  placeholder="Thank you for your comment!"
                  value={node.data?.text ?? ""}
                  onChange={(e) => update({ text: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  This will appear as a reply under the comment
                </p>
              </div>
            )}

            {stepId === "action_send_dm" && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    DM Message
                  </label>
                  <textarea
                    className="w-full h-32 px-4 py-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    placeholder="Hi! Thanks for your comment..."
                    value={node.data?.text ?? ""}
                    onChange={(e) => update({ text: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={node.data?.linkUrl ?? ""}
                    onChange={(e) => update({ linkUrl: e.target.value })}
                    placeholder="https://example.com/offer"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    Button Title
                  </label>
                  <input
                    type="text"
                    value={node.data?.buttonTitle ?? "View Link"}
                    onChange={(e) => update({ buttonTitle: e.target.value })}
                    placeholder="View Offer"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </>
            )}

            {stepId === "action_tag" && (
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={node.data?.tagName ?? ""}
                  onChange={(e) => update({ tagName: e.target.value })}
                  placeholder="e.g. VIP, Lead, Interested"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}

            {stepId === "action_field" && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={node.data?.fieldName ?? ""}
                    onChange={(e) => update({ fieldName: e.target.value })}
                    placeholder="e.g. email, phone, preference"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    Field Value
                  </label>
                  <input
                    type="text"
                    value={node.data?.fieldValue ?? ""}
                    onChange={(e) => update({ fieldValue: e.target.value })}
                    placeholder="Value or {{trigger_data.field}}"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </>
            )}

            {stepId === "action_api" && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={node.data?.apiUrl ?? ""}
                    onChange={(e) => update({ apiUrl: e.target.value })}
                    placeholder="https://api.example.com/webhook"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    Method
                  </label>
                  <select
                    value={node.data?.apiMethod ?? "POST"}
                    onChange={(e) => update({ apiMethod: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">
                    JSON Body (Optional)
                  </label>
                  <textarea
                    value={node.data?.apiBody ?? ""}
                    onChange={(e) => update({ apiBody: e.target.value })}
                    placeholder='{"key": "value"}'
                    rows={3}
                    className="w-full px-3 py-2 text-sm font-mono text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── LOGIC NODES ─────────────────────────────────────────────────── */}
        {isLogicNode && (
          <div className="space-y-4">
            {node.data?.logicType === "delay" && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-3">
                <p className="text-xs font-bold text-amber-900">
                  Delay Configuration
                </p>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={1}
                    value={node.data?.delayAmount ?? 5}
                    onChange={(e) =>
                      update({ delayAmount: Number(e.target.value) || 1 })
                    }
                    className="w-20 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <select
                    value={node.data?.delayUnit ?? "minutes"}
                    onChange={(e) =>
                      update({
                        delayUnit: e.target.value as
                          | "seconds"
                          | "minutes"
                          | "hours"
                          | "days",
                      })
                    }
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
                <p className="text-xs text-amber-700">
                  For WhatsApp follow-ups, use hours or days for realistic timing.
                </p>
              </div>
            )}

            {node.data?.logicType === "condition" && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-3">
                <p className="text-xs font-bold text-amber-900">Condition</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={node.data?.conditionVariable ?? ""}
                    onChange={(e) =>
                      update({ conditionVariable: e.target.value })
                    }
                    placeholder="Variable (e.g. trigger_data.message_text)"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <select
                    value={node.data?.conditionOperator ?? "includes"}
                    onChange={(e) =>
                      update({ conditionOperator: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="includes">Includes</option>
                    <option value="not_includes">Does not include</option>
                    <option value="equals">Equals</option>
                    <option value="not_equals">Not equals</option>
                  </select>
                  <input
                    type="text"
                    value={node.data?.conditionValue ?? ""}
                    onChange={(e) => update({ conditionValue: e.target.value })}
                    placeholder="Value"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            )}

            {node.data?.logicType === "randomizer" && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                <p className="text-xs font-bold text-amber-900 mb-2">
                  A/B Split
                </p>
                <p className="text-xs text-slate-600">
                  Randomly sends user down one of the connected paths. Connect
                  two or more steps from this block.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2" />
    </div>
  );
}