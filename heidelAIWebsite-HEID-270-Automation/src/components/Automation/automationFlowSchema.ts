import type { FlowDocument } from './flowExport';
import { exportFlowToJSON } from './flowExport';
import type { EditorNode, EditorEdge } from './flowExport';

export type FlowStatusEnum = 'draft' | 'active' | 'archived' | 'published';

export type TriggerTypeEnum = 'manual' | 'webhook' | 'schedule' | 'event' | 'instagram_comment' | 'keyword' | 'default';

export interface AutomationFlowDetails {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  flow_data: FlowDocument;
  version: number;
  status: FlowStatusEnum;
  trigger_type?: TriggerTypeEnum;
  user_id?: string | number;
  created_at?: string;
  updated_at: string;
  last_executed_at?: string | null;
  execution_count?: number;
  is_active?: boolean;
  tags?: string[];
  record_type?: 'automation_flow';
}

export interface BuildFlowDetailsOptions {
  flowId?: string;
  flowName?: string;
  description?: string;
  status?: FlowStatusEnum;
  triggerType?: TriggerTypeEnum;
  version?: number;
  tags?: string[];
}

export function buildFlowDetails(
  nodes: EditorNode[],
  edges: EditorEdge[],
  options: BuildFlowDetailsOptions = {}
): AutomationFlowDetails {
  const flowId = options.flowId ?? `flow_${Date.now().toString(36)}`;
  const flowName = options.flowName ?? 'Untitled';
  const status = options.status ?? 'draft';
  const now = new Date().toISOString();

  const flowDocument: FlowDocument = exportFlowToJSON(nodes, edges, {
    flowId,
    flowName,
    status: status === 'published' ? 'published' : 'draft',
    includeUiConfig: true,
  });

  const triggerType = inferTriggerType(nodes);

  return {
    _id: flowId,
    name: flowName,
    description: options.description ?? undefined,
    flow_data: flowDocument,
    version: options.version ?? 1,
    status,
    trigger_type: options.triggerType ?? triggerType,
    updated_at: now,
    created_at: now,
    last_executed_at: null,
    execution_count: 0,
    is_active: false,
    tags: options.tags ?? [],
    record_type: 'automation_flow',
  };
}

function inferTriggerType(nodes: EditorNode[]): TriggerTypeEnum {
  const trigger = nodes.find((n) => n.type === 'trigger');
  const t = trigger?.data?.triggerType as string | undefined;
  if (t === 'instagram_comment' || t === 'keyword' || t === 'default') return t as TriggerTypeEnum;
  if (t) return t as TriggerTypeEnum;
  return 'event';
}
