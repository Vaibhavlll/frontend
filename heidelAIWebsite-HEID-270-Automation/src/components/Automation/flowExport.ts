// ============================================================
// flowExport.ts
// Dual-schema export for:
//   1. Automation flows (instagram, whatsapp_followup, google_sheet)
//   2. Interactive WhatsApp bot flows (button/list/cta_url nodes)
// ============================================================

export interface FlowTriggerConfig {
  keyword?: string;
  keywords?: string[];
  trigger_messages?: string;  // comma-separated, for WA bot flows
  post_id?: string;
  // WhatsApp follow-up fields
  conversation_id?: string;
  conversation_name?: string;
  // Google Sheet fields
  sheet_id?: string;
  sheet_name?: string;
  column_name?: string;    // The phone number column header
  row_start?: number;      // Optional: start row (1-indexed, inclusive)
  row_end?: number;        // Optional: end row (1-indexed, inclusive)
  [key: string]: unknown;
}

export interface FlowTrigger {
  type: string;
  config: FlowTriggerConfig;
  start_node_id: string | null;
}

export interface MessageContent {
  text?: string;
  media_url?: string | null;
  buttons?: Array<{
    type: string;
    label: string;
    save_to_field?: string;
    url?: string;
  }>;
}

export interface SmartDelayConfig {
  amount: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface ConditionConfig {
  variable: string;
  operator: string;
  value: string;
}

export interface ConditionPaths {
  true: string;
  false: string;
}

export interface ActionConfig {
  action_type?: 'add_tag' | 'set_field' | 'api' | 'reply_to_comment' | 'send_dm' | 'whatsapp_message';
  tag_name?: string;
  field_name?: string;
  field_value?: string;
  api_url?: string;
  api_method?: string;
  api_body?: string;
  text?: string;
  link_url?: string;
  button_title?: string;
}

// ─── WA Interactive node payload types ────────────────────────────────────

export interface WaButtonReply {
  id: string;      // target node ID
  title: string;
}

export interface WaInteractiveHeader {
  type: 'image' | 'video' | 'text' | 'document';
  image?: { link: string };
  video?: { link: string };
  text?: string;
}

export interface WaListRow {
  id: string;       // target node ID
  title: string;
  description?: string;
}

export interface WaListSection {
  title: string;
  rows: WaListRow[];
}

// ─── Unified FlowNodePayload (covers both schemas) ────────────────────────

export interface FlowNodePayload {
  id: string;
  type: 'message' | 'smart_delay' | 'condition' | 'randomizer' | 'action'
      | 'button' | 'list' | 'cta_url' | 'welcome_message';
  app?: string;
  actionType?: string;
  name: string;
  next_node_id?: string | null;
  paths?: ConditionPaths;
  // Original automation schema
  content?: MessageContent;
  config?: SmartDelayConfig | ConditionConfig | ActionConfig | Record<string, unknown>;
  // Interactive bot schema
  body_text?: string;
  header?: WaInteractiveHeader;
  buttons?: Array<{ type: 'reply'; reply: WaButtonReply }>;
  button_text?: string;   // list message CTA button label
  sections?: WaListSection[];
  url?: string;           // cta_url
}

// ─── FlowDocument — dual-schema ───────────────────────────────────────────

export interface FlowDocument {
  name: string;
  description?: string;
  status: 'draft' | 'published';
  version?: number;
  created_at?: string;
  updated_at?: string;
  ui_config?: {
    nodes: Record<string, { x: number; y: number }>;
  };
  triggers: FlowTrigger[];
  nodes: Record<string, FlowNodePayload>;
  connections: Array<{ source: string; target: string }>;
  // Interactive bot schema extras
  trigger_event?: string;
  trigger_from?: string;
  trigger_messages?: string;
  welcome_message?: {
    type: string;
    interactive: {
      type: string;
      header?: WaInteractiveHeader;
      body_text: string;
      buttons: Array<{ type: 'reply'; reply: WaButtonReply }>;
    };
  };
}

// ─── EditorNode ────────────────────────────────────────────────────────────

export interface EditorNode {
  id: string;
  type: 'trigger' | 'action' | 'logic';
  app?: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  data: {
    // Common
    text?: string;
    stepId?: string;
    stepName?: string;
    // Trigger
    triggerType?: string;
    triggerConfig?: FlowTriggerConfig;
    triggerSubtitle?: string;
    // Logic
    logicType?: 'delay' | 'condition' | 'randomizer' | 'ai' | 'actions';
    delayAmount?: number;
    delayUnit?: 'seconds' | 'minutes' | 'hours' | 'days';
    conditionVariable?: string;
    conditionOperator?: string;
    conditionValue?: string;
    // Action
    actionType?: string;
    tagName?: string;
    fieldName?: string;
    fieldValue?: string;
    apiUrl?: string;
    apiMethod?: string;
    apiBody?: string;
    linkUrl?: string;
    buttonTitle?: string;
    contentKind?: 'text' | 'image' | 'card' | 'audio';
    cardTitle?: string;
    audioUrl?: string;
    // Instagram content
    media_url?: string | null;
    buttons?: Array<{
      type: string;
      label: string;
      save_to_field?: string;
      url?: string;
    }>;
    // ─── NEW: WhatsApp Interactive fields ──────────────────────────────────
    // wa_welcome_message & wa_interactive_button & wa_interactive_list
    waBodyText?: string;                    // main body text
    waHeaderType?: 'none' | 'image' | 'video' | 'text';
    waHeaderMediaUrl?: string;              // image or video URL
    waHeaderText?: string;                  // text header
    waButtons?: Array<{                     // up to 3 quick-reply buttons
      id: string;                           // target node ID
      title: string;
    }>;
    // wa_interactive_list
    waButtonText?: string;                  // the list CTA button label e.g. "Select Class"
    waSections?: Array<{
      title: string;
      rows: Array<{
        id: string;         // target node ID
        title: string;
        description?: string;
      }>;
    }>;
    // wa_cta_url
    waCtaUrl?: string;
    waCtaButtonText?: string;
    // welcome_message flag (first node in bot flow)
    isWelcomeMessage?: boolean;
    [key: string]: unknown;
  };
}

export interface EditorEdge {
  from: string;
  to: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function findNextNodeId(sourceId: string, edges: EditorEdge[]): string | null {
  const edge = edges.find((e) => e.from === sourceId);
  return edge ? edge.to : null;
}

function findConditionPaths(sourceId: string, edges: EditorEdge[]): ConditionPaths | undefined {
  const outEdges = edges.filter((e) => e.from === sourceId);
  if (outEdges.length < 2) return undefined;
  return { true: outEdges[0].to, false: outEdges[1].to };
}

/**
 * Detect if this set of nodes is an interactive WhatsApp bot flow
 * (has welcome_message node or wa_interactive_button / wa_interactive_list / wa_cta_url nodes)
 */
function isInteractiveBotFlow(nodes: EditorNode[]): boolean {
  return nodes.some((n) =>
    n.data?.stepId === 'wa_welcome_message' ||
    n.data?.stepId === 'wa_interactive_button' ||
    n.data?.stepId === 'wa_interactive_list' ||
    n.data?.stepId === 'wa_cta_url' ||
    n.data?.triggerType === 'whatsapp_message_received'
  );
}

// ─── Main export ──────────────────────────────────────────────────────────

export function exportFlowToJSON(
  nodes: EditorNode[],
  edges: EditorEdge[],
  options: {
    flowId?: string;
    flowName?: string;
    status?: 'draft' | 'published';
    includeUiConfig?: boolean;
  } = {}
): FlowDocument {
  const flowName = options.flowName ?? 'Untitled Flow';
  const status = options.status ?? 'draft';
  const includeUiConfig = options.includeUiConfig !== false;

  const flowDocument: FlowDocument = {
    name: flowName,
    status,
    version: 1,
    updated_at: new Date().toISOString(),
    triggers: [],
    nodes: {},
    connections: [],
  };

  if (includeUiConfig) {
    flowDocument.ui_config = { nodes: {} };
  }

  const isBotFlow = isInteractiveBotFlow(nodes);

  if (isBotFlow) {
    return exportInteractiveBotFlow(nodes, edges, flowDocument, includeUiConfig);
  } else {
    return exportAutomationFlow(nodes, edges, flowDocument, includeUiConfig);
  }
}

// ─── Interactive Bot Flow Export ──────────────────────────────────────────

function exportInteractiveBotFlow(
  nodes: EditorNode[],
  edges: EditorEdge[],
  doc: FlowDocument,
  includeUiConfig: boolean
): FlowDocument {

  for (const node of nodes) {
    const stepId = node.data?.stepId;

    if (includeUiConfig && doc.ui_config) {
      doc.ui_config.nodes[node.id] = { x: node.x, y: node.y };
    }

    // ── TRIGGER NODE ────────────────────────────────────────────────────────
    if (node.type === 'trigger') {
      const triggerConfig = node.data.triggerConfig || {};
      const startNodeId = findNextNodeId(node.id, edges);

      let triggerType = node.data.triggerType || 'whatsapp_message_received';
      if (triggerType === 'trigger_whatsapp_message' || triggerType === 'whatsapp_message_received') {
        triggerType = 'whatsapp_message_received';
      }

      // Set bot-flow fields
      doc.trigger_event = 'message_received';
      doc.trigger_from = 'webhook';
      if (triggerConfig.trigger_messages) {
        doc.trigger_messages = triggerConfig.trigger_messages as string;
      } else if (triggerConfig.keywords && Array.isArray(triggerConfig.keywords)) {
        doc.trigger_messages = triggerConfig.keywords.join(',');
      }

      doc.triggers.push({
        type: triggerType,
        config: triggerConfig,
        start_node_id: startNodeId,
      });
      continue;
    }

    // ── WELCOME MESSAGE ─────────────────────────────────────────────────────
    if (stepId === 'wa_welcome_message') {
      const buttons = (node.data.waButtons || []).map((btn: { id: string; title: string }) => ({
        type: 'reply' as const,
        reply: { id: btn.id, title: btn.title },
      }));

      const header = buildWaHeader(node);

      // const interactiveNode = {
      //   type: 'button' as const,
      //   header,
      //   body_text: node.data.waBodyText || '',
      //   buttons,
      // };

      // Store as welcome_message at doc root
      doc.welcome_message = {
        type: 'interactive',
        interactive: {
          type: 'button',
          ...(header ? { header } : {}),
          body_text: node.data.waBodyText || '',
          buttons,
        },
      };

      // Also store as a node for the flow graph
      doc.nodes[node.id] = {
        id: node.id,
        type: 'welcome_message',
        name: node.label || 'Welcome Message',
        body_text: node.data.waBodyText || '',
        ...(header ? { header } : {}),
        buttons,
      };

      // Connections: each button.reply.id is the target node
      for (const btn of node.data.waButtons || []) {
        if (btn.id) {
          doc.connections.push({ source: node.id, target: btn.id });
        }
      }
      continue;
    }

    // ── INTERACTIVE BUTTON MESSAGE ──────────────────────────────────────────
    if (stepId === 'wa_interactive_button') {
      const buttons = (node.data.waButtons || []).map((btn: { id: string; title: string }) => ({
        type: 'reply' as const,
        reply: { id: btn.id, title: btn.title },
      }));
      const header = buildWaHeader(node);

      doc.nodes[node.id] = {
        id: node.id,
        type: 'button',
        name: node.label || 'Button Message',
        body_text: node.data.waBodyText || '',
        ...(header ? { header } : {}),
        buttons,
      };

      for (const btn of node.data.waButtons || []) {
        if (btn.id) {
          doc.connections.push({ source: node.id, target: btn.id });
        }
      }
      continue;
    }

    // ── INTERACTIVE LIST MESSAGE ────────────────────────────────────────────
    if (stepId === 'wa_interactive_list') {
      const sections = (node.data.waSections || []).map((sec: { title: string; rows: Array<{ id: string; title: string; description?: string }> }) => ({
        title: sec.title,
        rows: sec.rows.map((row) => ({
          id: row.id,
          title: row.title,
          ...(row.description ? { description: row.description } : {}),
        })),
      }));

      doc.nodes[node.id] = {
        id: node.id,
        type: 'list',
        name: node.label || 'List Message',
        body_text: node.data.waBodyText || '',
        button_text: node.data.waButtonText || 'Select Option',
        sections,
      };

      // Connect all row IDs
      for (const sec of node.data.waSections || []) {
        for (const row of sec.rows || []) {
          if (row.id) {
            doc.connections.push({ source: node.id, target: row.id });
          }
        }
      }
      continue;
    }

    // ── CTA URL ────────────────────────────────────────────────────────────
    if (stepId === 'wa_cta_url') {
      doc.nodes[node.id] = {
        id: node.id,
        type: 'cta_url',
        name: node.label || 'CTA URL',
        body_text: node.data.waBodyText || '',
        button_text: node.data.waCtaButtonText || 'Open Link',
        url: node.data.waCtaUrl || '',
      };
      // No outgoing connections (terminal node)
      continue;
    }

    // Fallback for any other node types
    doc.nodes[node.id] = {
      id: node.id,
      type: 'action',
      name: node.label || 'Step',
      next_node_id: findNextNodeId(node.id, edges),
      config: {},
    };
  }

  return doc;
}

function buildWaHeader(node: EditorNode): WaInteractiveHeader | undefined {
  if (!node.data.waHeaderType || node.data.waHeaderType === 'none') return undefined;
  if (node.data.waHeaderType === 'image' && node.data.waHeaderMediaUrl) {
    return { type: 'image', image: { link: node.data.waHeaderMediaUrl } };
  }
  if (node.data.waHeaderType === 'video' && node.data.waHeaderMediaUrl) {
    return { type: 'video', video: { link: node.data.waHeaderMediaUrl } };
  }
  if (node.data.waHeaderType === 'text' && node.data.waHeaderText) {
    return { type: 'text', text: node.data.waHeaderText };
  }
  return undefined;
}

// ─── Standard Automation Flow Export ──────────────────────────────────────

function exportAutomationFlow(
  nodes: EditorNode[],
  edges: EditorEdge[],
  doc: FlowDocument,
  includeUiConfig: boolean
): FlowDocument {
  const triggerNodeIds = new Set<string>();

  for (const node of nodes) {
    const stepId = node.data?.stepId;
    const nextNodeId = findNextNodeId(node.id, edges);

    if (includeUiConfig && doc.ui_config) {
      doc.ui_config.nodes[node.id] = { x: node.x, y: node.y };
    }

    // ── TRIGGER NODE ────────────────────────────────────────────────────────
    if (node.type === 'trigger') {
      triggerNodeIds.add(node.id);
      const startNodeId = findNextNodeId(node.id, edges);
      let triggerType = node.data.triggerType || 'instagram_comment';

      if (triggerType === 'trigger_comment' || triggerType === 'instagram_comment') triggerType = 'instagram_comment';
      else if (triggerType === 'trigger_story_reply' || triggerType === 'story_reply') triggerType = 'story_reply';
      else if (triggerType === 'trigger_instagram_message' || triggerType === 'instagram_message') triggerType = 'instagram_message';
      else if (triggerType === 'whatsapp_followup' || triggerType === 'trigger_whatsapp_followup') triggerType = 'whatsapp_followup';
      else if (triggerType === 'google_sheet' || triggerType === 'trigger_google_sheet') triggerType = 'google_sheet';

      const triggerConfig: FlowTriggerConfig = { ...(node.data.triggerConfig || {}) };
      if (triggerConfig.keywords && Array.isArray(triggerConfig.keywords)) {
        triggerConfig.keyword = triggerConfig.keywords.join('|');
        delete triggerConfig.keywords;
      }

      doc.triggers.push({ type: triggerType, config: triggerConfig, start_node_id: startNodeId });
      continue;
    }

    // ── WA PLAIN TEXT MESSAGE ───────────────────────────────────────────────
    if (stepId === 'content_whatsapp_message') {
      const messageText = node.data.text || '';
      doc.nodes[node.id] = {
        id: node.id,
        type: 'message',
        app: 'whatsapp',
        actionType: 'whatsapp_message',
        name: (node.data.stepName ?? node.label) || 'WhatsApp Message',
        next_node_id: nextNodeId,
        config: { content: { text: messageText } },
        content: { text: messageText },
      };
      continue;
    }

    // ── DELAY ───────────────────────────────────────────────────────────────
    if (node.type === 'logic' && node.data.logicType === 'delay') {
      doc.nodes[node.id] = {
        id: node.id,
        type: 'smart_delay',
        name: (node.data.stepName ?? node.label) || 'Delay',
        next_node_id: nextNodeId,
        config: { amount: node.data.delayAmount ?? 5, unit: node.data.delayUnit ?? 'minutes' },
      };
      continue;
    }

    // ── CONDITION ────────────────────────────────────────────────────────────
    if (node.type === 'logic' && node.data.logicType === 'condition') {
      const paths = findConditionPaths(node.id, edges);
      doc.nodes[node.id] = {
        id: node.id,
        type: 'condition',
        name: (node.data.stepName ?? node.label) || 'Condition',
        paths: paths ?? { true: '', false: '' },
        config: {
          variable: node.data.conditionVariable || '',
          operator: node.data.conditionOperator || 'includes',
          value: node.data.conditionValue || '',
        },
      };
      continue;
    }

    // ── RANDOMIZER ───────────────────────────────────────────────────────────
    if (node.type === 'logic' && node.data.logicType === 'randomizer') {
      doc.nodes[node.id] = {
        id: node.id,
        type: 'randomizer',
        name: (node.data.stepName ?? node.label) || 'A/B Split',
        next_node_id: nextNodeId,
        config: {},
      };
      continue;
    }

    // ── INSTAGRAM CONTENT ────────────────────────────────────────────────────
    if (['content_text', 'content_image', 'content_card', 'content_audio'].includes(stepId || '')) {
      doc.nodes[node.id] = {
        id: node.id,
        type: 'message',
        app: 'instagram',
        name: (node.data.stepName ?? node.label) || 'Send Message',
        next_node_id: nextNodeId,
        content: { text: node.data.text || '', media_url: node.data.media_url || null, buttons: node.data.buttons || [] },
      };
      continue;
    }

    // ── INSTAGRAM ACTIONS ────────────────────────────────────────────────────
    if (stepId === 'action_reply_comment') {
      doc.nodes[node.id] = { id: node.id, type: 'action', name: 'Reply to Comment', next_node_id: nextNodeId, config: { action_type: 'reply_to_comment', text: node.data.text || '' } };
      continue;
    }
    if (stepId === 'action_send_dm') {
      const config: ActionConfig = { action_type: 'send_dm', text: node.data.text || '' };
      if (node.data.linkUrl) { config.link_url = node.data.linkUrl; config.button_title = node.data.buttonTitle || 'View Link'; }
      doc.nodes[node.id] = { id: node.id, type: 'action', name: 'Send DM', next_node_id: nextNodeId, config };
      continue;
    }
    if (stepId === 'action_tag') {
      doc.nodes[node.id] = { id: node.id, type: 'action', name: 'Add Tag', next_node_id: nextNodeId, config: { action_type: 'add_tag', tag_name: node.data.tagName || '' } };
      continue;
    }
    if (stepId === 'action_field') {
      doc.nodes[node.id] = { id: node.id, type: 'action', name: 'Set Field', next_node_id: nextNodeId, config: { action_type: 'set_field', field_name: node.data.fieldName || '', field_value: node.data.fieldValue || '' } };
      continue;
    }
    if (stepId === 'action_api') {
      doc.nodes[node.id] = { id: node.id, type: 'action', name: 'HTTP Request', next_node_id: nextNodeId, config: { action_type: 'api', api_url: node.data.apiUrl || '', api_method: node.data.apiMethod || 'POST', api_body: node.data.apiBody || '' } };
      continue;
    }

    // ── FALLBACK ────────────────────────────────────────────────────────────
    doc.nodes[node.id] = {
      id: node.id,
      type: 'action',
      name: (node.data.stepName ?? node.label) || 'Step',
      next_node_id: nextNodeId,
      config: {},
    };
  }

  doc.connections = edges
    .filter((e) => !triggerNodeIds.has(e.from))
    .map((e) => ({ source: e.from, target: e.to }));

  return doc;
}

// ─── Validation ───────────────────────────────────────────────────────────

export interface FlowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFlowBeforeSave(
  nodes: EditorNode[],
  edges: EditorEdge[]
): FlowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ── Guard: empty canvas ──────────────────────────────────────────────────
  if (nodes.length === 0) {
    errors.push('Flow has no nodes.');
    return { valid: false, errors, warnings };
  }

  const triggerNodes = nodes.filter((n) => n.type === 'trigger');
  if (triggerNodes.length === 0) {
    errors.push('Flow must have at least one Trigger node.');
    return { valid: false, errors, warnings };
  }

  // ── Determine flow type once ─────────────────────────────────────────────
  const isBotFlow = isInteractiveBotFlow(nodes);
  const isGSFlow  = triggerNodes.some(
    (t) => t.data?.triggerType === 'google_sheet' || t.data?.stepId === 'trigger_google_sheet'
  );
  const isWAFlow  = triggerNodes.some(
    (t) => t.data?.triggerType === 'whatsapp_followup' || t.data?.stepId === 'trigger_whatsapp_followup'
  );

  // ── Branch: Interactive WA bot flow ──────────────────────────────────────
  if (isBotFlow) {
    const hasWelcome = nodes.some((n) => n.data?.stepId === 'wa_welcome_message');
    if (!hasWelcome) {
      warnings.push('Interactive bot flows should have a Welcome Message node as the starting node.');
    }

    for (const node of nodes) {
      const stepId = node.data?.stepId;

      if (stepId === 'wa_welcome_message' || stepId === 'wa_interactive_button') {
        if (!node.data?.waBodyText) {
          errors.push(`"${node.label}" must have body text.`);
        }
        if (!node.data?.waButtons?.length) {
          errors.push(`"${node.label}" must have at least one button.`);
        }
        for (const btn of node.data?.waButtons || []) {
          if (!btn.title) errors.push(`A button in "${node.label}" has no title.`);
          if (!btn.id)    errors.push(`A button in "${node.label}" has no target node ID.`);
        }
      }

      if (stepId === 'wa_interactive_list') {
        if (!node.data?.waBodyText)       errors.push(`List message "${node.label}" must have body text.`);
        if (!node.data?.waButtonText)     errors.push(`List message "${node.label}" must have a button label.`);
        if (!node.data?.waSections?.length) errors.push(`List message "${node.label}" must have at least one section.`);
      }

      if (stepId === 'wa_cta_url') {
        if (!node.data?.waBodyText)       errors.push(`CTA URL "${node.label}" must have body text.`);
        if (!node.data?.waCtaUrl)         errors.push(`CTA URL "${node.label}" must have a URL.`);
        if (!node.data?.waCtaButtonText)  errors.push(`CTA URL "${node.label}" must have a button label.`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  // ── Branch: Google Sheet flow ─────────────────────────────────────────────
  if (isGSFlow) {
    for (const trigger of triggerNodes) {
      if (
        trigger.data?.triggerType === 'google_sheet' ||
        trigger.data?.stepId === 'trigger_google_sheet'
      ) {
        if (!trigger.data?.triggerConfig?.sheet_id) {
          errors.push('Google Sheet trigger must have a sheet selected.');
        }
        if (!trigger.data?.triggerConfig?.column_name) {
          errors.push('Google Sheet trigger must have a phone number column selected.');
        }
        const rowStart = trigger.data?.triggerConfig?.row_start as number | undefined;
        const rowEnd   = trigger.data?.triggerConfig?.row_end   as number | undefined;
        if (rowStart !== undefined && rowStart < 1) {
          errors.push('Row range start must be at least 1.');
        }
        if (rowEnd !== undefined && rowEnd < 1) {
          errors.push('Row range end must be at least 1.');
        }
        if (rowStart !== undefined && rowEnd !== undefined && rowEnd < rowStart) {
          errors.push('Row range end must be greater than or equal to start.');
        }
      }
    }

    if (!nodes.some((n) => n.data?.stepId === 'content_whatsapp_message')) {
      errors.push('Google Sheet flow must include a WhatsApp Message node to send messages.');
    }
    for (const node of nodes) {
      if (node.data?.stepId === 'content_whatsapp_message' && !node.data?.text) {
        errors.push(`WhatsApp Message node "${node.label}" must have message text.`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  // ── Branch: WhatsApp follow-up flow ──────────────────────────────────────
  if (isWAFlow) {
    for (const trigger of triggerNodes) {
      if (
        trigger.data?.triggerType === 'whatsapp_followup' ||
        trigger.data?.stepId === 'trigger_whatsapp_followup'
      ) {
        if (!trigger.data?.triggerConfig?.conversation_id) {
          errors.push('WhatsApp Follow-Up trigger must have a conversation selected.');
        }
      }
    }

    if (!nodes.some((n) => n.type === 'logic' && n.data?.logicType === 'delay')) {
      errors.push('WhatsApp Follow-Up flow must include a Smart Delay node.');
    }
    if (!nodes.some((n) => n.data?.stepId === 'content_whatsapp_message')) {
      errors.push('WhatsApp Follow-Up flow must include a WhatsApp Message node.');
    }
    for (const node of nodes) {
      if (node.data?.stepId === 'content_whatsapp_message' && !node.data?.text) {
        errors.push(`WhatsApp Message node "${node.label}" must have message text.`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  // ── Branch: Instagram / default flow ─────────────────────────────────────
  for (const trigger of triggerNodes) {
    const triggerType = trigger.data.triggerType;
    if (triggerType === 'instagram_comment' || triggerType === 'trigger_comment') {
      const hasKeyword = trigger.data.triggerConfig?.keyword || trigger.data.triggerConfig?.keywords;
      const hasPostId  = trigger.data.triggerConfig?.post_id;
      if (!hasKeyword && !hasPostId) {
        warnings.push(
          `Trigger "${trigger.label}" should have either a keyword or post_id configured.`
        );
      }
    }
  }

  for (const node of nodes) {
    const stepId = node.data?.stepId;

    if (node.type === 'logic' && node.data.logicType === 'condition') {
      if (edges.filter((e) => e.from === node.id).length < 2) {
        errors.push(`Condition node "${node.label}" must have both True and False connections.`);
      }
    }
    if (stepId === 'action_send_dm' && !node.data.text) {
      errors.push(`Send DM "${node.label}" must have message text.`);
    }
    if (stepId === 'action_reply_comment' && !node.data.text) {
      errors.push(`Reply to Comment "${node.label}" must have reply text.`);
    }
    if (stepId === 'action_tag' && !node.data.tagName) {
      errors.push(`Add Tag "${node.label}" must have a tag name.`);
    }
    if (stepId === 'action_field' && (!node.data.fieldName || !node.data.fieldValue)) {
      errors.push(`Set Field action "${node.label}" must have field name and value.`);
    }
    if (stepId === 'action_api' && !node.data.apiUrl) {
      errors.push(`HTTP Request action "${node.label}" must have a URL.`);
    }
    if (stepId === 'content_text' && !node.data.text) {
      warnings.push(`Send Text action "${node.label}" has no message text.`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}