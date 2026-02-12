
export interface FlowTriggerConfig {
  post_id?: string;
  keywords?: string[];
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
  buttons?: Array<{ type: string; label: string; save_to_field?: string }>;
}

export interface SmartDelayConfig {
  amount: number;
  unit: 'seconds' | 'minutes' | 'hours';
}

export interface ConditionPaths {
  true: string;
  false: string;
}

export interface FlowNodePayload {
  id: string;
  type: 'message' | 'smart_delay' | 'condition' | 'randomizer' | 'action' | 'api';
  name: string;
  next_node_id?: string | null;
  paths?: ConditionPaths;
  content?: MessageContent;
  config?: SmartDelayConfig | Record<string, unknown>;
}

export interface FlowDocument {
  _id: string;
  name: string;
  status: 'draft' | 'published';
  version?: number;
  created_at?: string;
  updated_at?: string;
  ui_config?: { nodes: Record<string, { x: number; y: number }> };
  triggers: FlowTrigger[];
  nodes: Record<string, FlowNodePayload>;
}

export interface EditorNode {
  id: string;
  type: 'trigger' | 'action' | 'logic';
  app?: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  data: {
    text?: string;
    media_url?: string | null;
    buttons?: Array<{ type: string; label: string; save_to_field?: string }>;
    stepName?: string;
    logicType?: 'delay' | 'condition' | 'randomizer' | 'ai' | 'actions';
    triggerType?: string;
    triggerConfig?: FlowTriggerConfig;
    delayAmount?: number;
    delayUnit?: 'seconds' | 'minutes' | 'hours';
    conditionVariable?: string;
    conditionOperator?: string;
    conditionValue?: string;
    [key: string]: unknown;
  };
}

export interface EditorEdge {
  from: string;
  to: string;
}

// HELPER: Find target node for a source (single output = next_node_id)

function findNextNodeId(sourceId: string, edges: EditorEdge[]): string | null {
  const edge = edges.find((e) => e.from === sourceId);
  return edge ? edge.to : null;
}

// For condition nodes: two outputs -> paths.true / paths.false
function findConditionPaths(sourceId: string, edges: EditorEdge[]): ConditionPaths | undefined {
  const outEdges = edges.filter((e) => e.from === sourceId);
  if (outEdges.length < 2) return undefined;
  // Assume order: first = true, second = false (or use edge sourceHandle if you add handles)
  const trueEdge = outEdges[0];
  const falseEdge = outEdges[1];
  return { true: trueEdge.to, false: falseEdge.to };
}

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
  const flowId = options.flowId ?? `flow_${Date.now().toString(36)}`;
  const flowName = options.flowName ?? 'Untitled Flow';
  const status = options.status ?? 'draft';
  const includeUiConfig = options.includeUiConfig !== false;

  const flowDocument: FlowDocument = {
    _id: flowId,
    name: flowName,
    status,
    version: 1,
    updated_at: new Date().toISOString(),
    triggers: [],
    nodes: {},
  };

  if (includeUiConfig) {
    flowDocument.ui_config = { nodes: {} };
  }

  for (const node of nodes) {
    // CASE A: Trigger (entry point) -> triggers array
    if (node.type === 'trigger') {
      const startNodeId = findNextNodeId(node.id, edges);
      const triggerType =
        (node.data.triggerType as string) ||
        node.label.replace(/^Trigger:\s*/i, '').replace(/\s+/g, '_').toLowerCase() ||
        'instagram_comment';
      flowDocument.triggers.push({
        type: triggerType,
        config: node.data.triggerConfig ?? { keywords: [] },
        start_node_id: startNodeId,
      });
      continue;
    }

    // CASE B: Logic node – delay
    if (node.type === 'logic' && node.data.logicType === 'delay') {
      const nextNodeId = findNextNodeId(node.id, edges);
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'smart_delay',
        name: (node.data.stepName ?? node.label) || 'Wait',
        next_node_id: nextNodeId,
        config: {
          amount: node.data.delayAmount ?? 5,
          unit: node.data.delayUnit ?? 'minutes',
        },
      };
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      continue;
    }

    // CASE C: Logic node – condition (If/Else)
    if (node.type === 'logic' && node.data.logicType === 'condition') {
      const paths = findConditionPaths(node.id, edges);
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'condition',
        name: (node.data.stepName ?? node.label) || 'Condition',
        paths: paths ?? { true: '', false: '' },
        config: {
          variable: node.data.conditionVariable,
          operator: node.data.conditionOperator,
          value: node.data.conditionValue,
        },
      };
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      continue;
    }

    // CASE D: Action – message (Instagram, WhatsApp, etc.)
    if (node.type === 'action' && (node.app === 'instagram' || node.app === 'whatsapp' || node.app === 'email')) {
      const nextNodeId = findNextNodeId(node.id, edges);
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'message',
        name: (node.data.stepName ?? node.label) || 'Send Message',
        next_node_id: nextNodeId,
        content: {
          text: node.data.text ?? '',
          media_url: node.data.media_url ?? null,
          buttons: node.data.buttons ?? [],
        },
      };
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      continue;
    }

    // CASE E: Generic logic (e.g. randomizer, AI) – treat as single next
    if (node.type === 'logic') {
      const nextNodeId = findNextNodeId(node.id, edges);
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: (node.data.logicType as FlowNodePayload['type']) ?? 'action',
        name: (node.data.stepName ?? node.label) || 'Step',
        next_node_id: nextNodeId,
        config: node.data as Record<string, unknown>,
      };
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      continue;
    }

    // Fallback: any other action node
    const nextNodeId = findNextNodeId(node.id, edges);
    flowDocument.nodes[node.id] = {
      id: node.id,
      type: 'message',
      name: (node.data.stepName ?? node.label) || 'Step',
      next_node_id: nextNodeId,
      content: { text: node.data.text ?? '', buttons: node.data.buttons ?? [] },
    };
    if (includeUiConfig) {
      flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
    }
  }

  return flowDocument;
}

// VALIDATION: Prevent saving "broken" flows

export interface FlowValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateFlowBeforeSave(nodes: EditorNode[], edges: EditorEdge[]): FlowValidationResult {
  const errors: string[] = [];

  if (nodes.length === 0) {
    errors.push('Flow has no nodes.');
    return { valid: false, errors };
  }

  const triggerNodes = nodes.filter((n) => n.type === 'trigger');
  if (triggerNodes.length === 0) {
    errors.push('Flow must have at least one Trigger node.');
  }

  for (const node of nodes) {
    if (node.type === 'trigger') continue;
    const isCondition = node.type === 'logic' && node.data.logicType === 'condition';
    const outgoingCount = edges.filter((e) => e.from === node.id).length;
    if (isCondition && outgoingCount < 2) {
      errors.push(`Condition node "${node.label || node.id}" must have both True and False connections.`);
    }
    // Non-trigger nodes with no outgoing are allowed (end nodes; next_node_id: null in export)
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
