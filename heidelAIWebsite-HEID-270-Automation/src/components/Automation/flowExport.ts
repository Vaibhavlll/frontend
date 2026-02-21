export interface FlowTriggerConfig {
  keyword?: string;
  keywords?: string[];
  post_id?: string;
  // WhatsApp follow-up fields
  conversation_id?: string;
  conversation_name?: string;
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
  unit: 'seconds' | 'minutes' | 'hours';
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
  action_type?: 'add_tag' | 'set_field' | 'api' | 'reply_to_comment' | 'send_dm';
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

export interface FlowNodePayload {
  id: string;
  type: 'message' | 'smart_delay' | 'condition' | 'randomizer' | 'action';
  name: string;
  next_node_id?: string | null;
  paths?: ConditionPaths;
  content?: MessageContent;
  config?: SmartDelayConfig | ConditionConfig | ActionConfig | Record<string, unknown>;
}

export interface FlowDocument {
  name: string;
  description?: string;
  status: 'draft' | 'published';
  version?: number;
  created_at?: string;
  updated_at?: string;
  ui_config?: { 
    nodes: Record<string, { x: number; y: number }> 
  };
  triggers: FlowTrigger[];
  nodes: Record<string, FlowNodePayload>;
  connections: Array<{ source: string; target: string }>;
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
    buttons?: Array<{ 
      type: string; 
      label: string; 
      save_to_field?: string;
      url?: string;
    }>;
    stepName?: string;
    stepId?: string;
    logicType?: 'delay' | 'condition' | 'randomizer' | 'ai' | 'actions';
    triggerType?: string;
    triggerConfig?: FlowTriggerConfig;
    triggerSubtitle?: string;
    delayAmount?: number;
    delayUnit?: 'seconds' | 'minutes' | 'hours';
    conditionVariable?: string;
    conditionOperator?: string;
    conditionValue?: string;
    actionType?: 'add_tag' | 'set_field' | 'api' | 'reply_to_comment' | 'send_dm';
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
    [key: string]: unknown;
  };
}

export interface EditorEdge {
  from: string;
  to: string;
}

// HELPER: Find target node for a source
function findNextNodeId(sourceId: string, edges: EditorEdge[]): string | null {
  const edge = edges.find((e) => e.from === sourceId);
  return edge ? edge.to : null;
}

// For condition nodes: two outputs -> paths.true / paths.false
function findConditionPaths(sourceId: string, edges: EditorEdge[]): ConditionPaths | undefined {
  const outEdges = edges.filter((e) => e.from === sourceId);
  if (outEdges.length < 2) return undefined;
  return { 
    true: outEdges[0].to, 
    false: outEdges[1].to 
  };
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

  // Track trigger node IDs to exclude from connections
  const triggerNodeIds = new Set<string>();

  // console.log(' Starting flow export with', nodes.length, 'nodes');

  for (const node of nodes) {
    const stepId = node.data?.stepId;
    const nextNodeId = findNextNodeId(node.id, edges);
    
    // console.log(` Processing node ${node.id}:`, {
    //   type: node.type,
    //   stepId,
    //   label: node.label,
    //   app: node.app
    // });

    //  TRIGGER NODE
    if (node.type === 'trigger') {
      triggerNodeIds.add(node.id);
      
      const startNodeId = findNextNodeId(node.id, edges);
      
      let triggerType = node.data.triggerType || 'instagram_comment';
      
      // Map frontend trigger types to backend types
      if (triggerType === 'trigger_comment') {
        triggerType = 'instagram_comment';
      } else if (triggerType === 'trigger_story_reply') {
        triggerType = 'story_reply';
      } else if (triggerType === 'trigger_instagram_message') {
        triggerType = 'instagram_message';
      }
      else if (triggerType === 'whatsapp_followup') {
        triggerType = 'whatsapp_followup';
      }
      
      const triggerConfig: FlowTriggerConfig = {
        ...(node.data.triggerConfig || {}),
      };
      
      // Convert keywords array to pipe-separated string
      if (triggerConfig.keywords && Array.isArray(triggerConfig.keywords)) {
        triggerConfig.keyword = triggerConfig.keywords.join('|');
        delete triggerConfig.keywords;
      }
      
      flowDocument.triggers.push({
        type: triggerType,
        config: triggerConfig,
        start_node_id: startNodeId,
      });
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      // console.log('Added trigger:', triggerType);
      continue;
    }

    // WHATSAPP MESSAGE NODE
    if (stepId === 'content_whatsapp_message') {
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'action',
        name: (node.data.stepName ?? node.label) || 'WhatsApp Message',
        next_node_id: nextNodeId,
        config: {
          action_type: 'whatsapp_message',
          text: node.data.text || '',
        },
      };
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      continue;
    }

    // DELAY LOGIC NODE
    if (node.type === 'logic' && node.data.logicType === 'delay') {
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'smart_delay',
        name: (node.data.stepName ?? node.label) || 'Delay',
        next_node_id: nextNodeId,
        config: {
          amount: node.data.delayAmount ?? 5,
          unit: node.data.delayUnit ?? 'minutes',
        },
      };
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      // console.log('Added delay node');
      continue;
    }


    // CONDITION LOGIC NODE
    if (node.type === 'logic' && node.data.logicType === 'condition') {
      const paths = findConditionPaths(node.id, edges);
      flowDocument.nodes[node.id] = {
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
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      // console.log(' Added condition node');
      continue;
    }

    // RANDOMIZER LOGIC NODE
    if (node.type === 'logic' && node.data.logicType === 'randomizer') {
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'randomizer',
        name: (node.data.stepName ?? node.label) || 'A/B Split',
        next_node_id: nextNodeId,
        config: {},
      };
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      // console.log(' Added randomizer node');
      continue;
    }

    // CONTENT NODES (Send Text, Image, Card, Audio)
    
    if (stepId === 'content_text' || stepId === 'content_image' || 
        stepId === 'content_card' || stepId === 'content_audio') {
      
      const content: MessageContent = {
        text: node.data.text || '',
        media_url: node.data.media_url || null,
        buttons: node.data.buttons || [],
      };
      
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'message',
        name: (node.data.stepName ?? node.label) || 'Send Message',
        next_node_id: nextNodeId,
        content,
      };
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      // console.log(' Added message node:', stepId);
      continue;
    }

    // INSTAGRAM ACTIONS (Reply, Send DM)
    
    // F1: Reply to Comment
    if (stepId === 'action_reply_comment') {
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'action',
        name: (node.data.stepName ?? node.label) || 'Reply to Comment',
        next_node_id: nextNodeId,
        config: {
          action_type: 'reply_to_comment',
          text: node.data.text || '',
        },
      };
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      // console.log(' Added reply_to_comment action');
      continue;
    }
    
    // F2: Send DM
    if (stepId === 'action_send_dm') {
      const config: ActionConfig = {
        action_type: 'send_dm',
        text: node.data.text || '',
      };
      
      // Add optional link button
      if (node.data.linkUrl) {
        config.link_url = node.data.linkUrl;
        config.button_title = node.data.buttonTitle || 'View Link';
      }
      
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'action',
        name: (node.data.stepName ?? node.label) || 'Send DM',
        next_node_id: nextNodeId,
        config,
      };
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      // console.log(' Added send_dm action');
      continue;
    }

    //  CONTACT MANAGEMENT ACTIONS
    
    // G1: Add Tag
    if (stepId === 'action_tag') {
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'action',
        name: (node.data.stepName ?? node.label) || 'Add Tag',
        next_node_id: nextNodeId,
        config: {
          action_type: 'add_tag',
          tag_name: node.data.tagName || '',
        },
      };
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      // console.log(' Added add_tag action');
      continue;
    }

    // G2: Set Custom Field
    if (stepId === 'action_field') {
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'action',
        name: (node.data.stepName ?? node.label) || 'Set Field',
        next_node_id: nextNodeId,
        config: {
          action_type: 'set_field',
          field_name: node.data.fieldName || '',
          field_value: node.data.fieldValue || '',
        },
      };
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      // console.log(' Added set_field action');
      continue;
    }

    // G3: HTTP Request / Webhook
    if (stepId === 'action_api') {
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'action',
        name: (node.data.stepName ?? node.label) || 'HTTP Request',
        next_node_id: nextNodeId,
        config: {
          action_type: 'api',
          api_url: node.data.apiUrl || '',
          api_method: node.data.apiMethod || 'POST',
          api_body: node.data.apiBody || '',
        },
      };
      
      if (includeUiConfig) {
        flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
      }
      
      // console.log(' Added api action');
      continue;
    }
    
    console.warn(` Unknown node type: ${node.type}, stepId: ${stepId}, label: ${node.label}`);
    
    // Try to infer from app field
    if (node.app === 'instagram' || node.app === 'whatsapp') {
      // Assume it's a message node
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'message',
        name: (node.data.stepName ?? node.label) || 'Send Message',
        next_node_id: nextNodeId,
        content: {
          text: node.data.text || '',
          media_url: node.data.media_url || null,
          buttons: node.data.buttons || [],
        },
      };
      
      // console.log(' Added message node (fallback from app field)');
    } else {
      // Generic action node
      flowDocument.nodes[node.id] = {
        id: node.id,
        type: 'action',
        name: (node.data.stepName ?? node.label) || 'Step',
        next_node_id: nextNodeId,
        config: {
          ...(node.data as Record<string, unknown>)
        },
      };
      
      // console.log(' Added generic action node (fallback)');
    }
    
    if (includeUiConfig) {
      flowDocument.ui_config!.nodes[node.id] = { x: node.x, y: node.y };
    }
  }

  // Build connections array (excluding trigger connections)
  flowDocument.connections = edges
    .filter(edge => !triggerNodeIds.has(edge.from))
    .map(edge => ({ source: edge.from, target: edge.to }));

  // console.log(' Flow export completed:', {
  //   triggers: flowDocument.triggers.length,
  //   nodes: Object.keys(flowDocument.nodes).length,
  //   connections: flowDocument.connections.length,
  // });

  return flowDocument;
}


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

  if (nodes.length === 0) {
    errors.push('Flow has no nodes.');
    return { valid: false, errors, warnings };
  }

  const triggerNodes = nodes.filter((n) => n.type === 'trigger');
  if (triggerNodes.length === 0) {
    errors.push('Flow must have at least one Trigger node.');
  }

  // Validate triggers have config
  for (const trigger of triggerNodes) {
    const triggerType = trigger.data.triggerType;
    if (triggerType === 'instagram_comment' || triggerType === 'trigger_comment') {
      const hasKeyword = trigger.data.triggerConfig?.keyword || 
                        trigger.data.triggerConfig?.keywords;
      const hasPostId = trigger.data.triggerConfig?.post_id;
      
      if (!hasKeyword && !hasPostId) {
        warnings.push(`Trigger "${trigger.label}" should have either a keyword or post_id configured.`);
      }
    }
  }

  // Validate conditions have both paths
  for (const node of nodes) {
    if (node.type === 'logic' && node.data.logicType === 'condition') {
      const outgoingCount = edges.filter((e) => e.from === node.id).length;
      if (outgoingCount < 2) {
        errors.push(
          `Condition node "${node.label || node.id}" must have both True and False connections.`
        );
      }
    }
  }

  // Validate action nodes have required fields
  for (const node of nodes) {
    const stepId = node.data?.stepId;
    
    if (stepId === 'action_send_dm' && !node.data.text) {
      errors.push(`Send DM action "${node.label}" must have message text.`);
    }
    if (stepId === 'action_reply_comment' && !node.data.text) {
      errors.push(`Reply to Comment action "${node.label}" must have reply text.`);
    }
    if (stepId === 'action_tag' && !node.data.tagName) {
      errors.push(`Add Tag action "${node.label}" must have a tag name.`);
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

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}