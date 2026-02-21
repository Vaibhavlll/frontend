import type { FlowDocument } from './flowExport';
import { exportFlowToJSON } from './flowExport';
import type { EditorNode, EditorEdge } from './flowExport';

export type FlowStatusEnum = 'draft' | 'published' | 'archived';

export type TriggerTypeEnum = 
  | 'manual' 
  | 'webhook' 
  | 'schedule' 
  | 'event' 
  | 'instagram_comment' 
  | 'story_reply'
  | 'instagram_message'
  | 'keyword' 
  | 'default';

export interface AutomationFlowDetails {
  flow_id?: string; 
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
  const flowName = options.flowName ?? 'Untitled';
  const status = options.status ?? 'draft';
  const now = new Date().toISOString();

  const flowDocument: FlowDocument = exportFlowToJSON(nodes, edges, {
    flowName,
    status: status === 'published' ? 'published' : 'draft',
    includeUiConfig: true,
  });

  const triggerType = inferTriggerType(nodes);

  const flowDetails: AutomationFlowDetails = {
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

  // Only include flow_id if it's a valid existing flow ID
  // (not a temporary client-side ID like "flow_xxx")
  if (options.flowId && !options.flowId.startsWith('flow_')) {
    flowDetails.flow_id = options.flowId;
  }

  return flowDetails;
}

function inferTriggerType(nodes: EditorNode[]): TriggerTypeEnum {
  const trigger = nodes.find((n) => n.type === 'trigger');
  const t = trigger?.data?.triggerType as string | undefined;
  
  // Map frontend trigger IDs to backend trigger types
  if (t === 'trigger_comment' || t === 'instagram_post_comment' || t === 'instagram_comment') return 'instagram_comment';
  if (t === 'story_reply') return 'story_reply';
  if (t === 'instagram_message') return 'instagram_message';
  if (t === 'keyword') return 'keyword';
  if (t === 'default') return 'default';
  if (t === 'webhook') return 'webhook';
  if (t === 'schedule') return 'schedule';
  if (t === 'manual') return 'manual';
  
  return 'event';
}