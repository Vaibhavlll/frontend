import React from 'react';
import {
  Zap,
  MessageSquare,
  Image as ImageIcon,
  LayoutGrid,
  Music,
  GitBranch,
  Shuffle,
  Clock,
  Tag,
  FileInput,
  Globe,
  Send,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';

export type StepCategory = 'trigger' | 'content' | 'logic' | 'action';

export interface StepDef {
  id: string;
  label: string;
  description: string;
  type: 'trigger' | 'action' | 'logic';
  app?: string;
  logicType?: string;
  contentKind?: 'text' | 'image' | 'card' | 'audio';
  actionType?: 'add_tag' | 'set_field' | 'api' | 'reply_to_comment' | 'send_dm';
  triggerType?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  pro?: boolean;
}

export const STEP_SECTIONS: { title: string; category: StepCategory; steps: StepDef[] }[] = [
  {
    title: 'Instagram',
    category: 'trigger',
    steps: [
      { 
        id: 'trigger_comment', 
        label: 'Post or Reel Comments', 
        description: 'User comments on your Post or Reel', 
        type: 'trigger', 
        triggerType: 'instagram_comment', 
        icon: Zap, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
      { 
        id: 'trigger_story_reply', 
        label: 'Story Reply', 
        description: 'User replies to your Story', 
        type: 'trigger', 
        triggerType: 'story_reply', 
        icon: MessageSquare, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
      { 
        id: 'trigger_instagram_message', 
        label: 'Instagram Message', 
        description: 'User sends a message', 
        type: 'trigger', 
        triggerType: 'instagram_message', 
        icon: MessageSquare, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
      { 
        id: 'trigger_instagram_ads', 
        label: 'Instagram Ads', 
        description: 'User clicks an Instagram Ad', 
        type: 'trigger', 
        triggerType: 'instagram_ads', 
        icon: Zap, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50', 
        pro: true 
      },
      { 
        id: 'trigger_live_comments', 
        label: 'Live Comments', 
        description: 'User comments on your Live', 
        type: 'trigger', 
        triggerType: 'live_comments', 
        icon: MessageSquare, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
      { 
        id: 'trigger_ref_url', 
        label: 'Instagram Ref URL', 
        description: 'User clicks a referral link', 
        type: 'trigger', 
        triggerType: 'ref_url', 
        icon: Zap, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
      { 
        id: 'trigger_keyword', 
        label: 'Keyword in DM', 
        description: 'Message contains a keyword', 
        type: 'trigger', 
        triggerType: 'keyword', 
        icon: MessageSquare, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
      { 
        id: 'trigger_default', 
        label: 'Default Reply', 
        description: 'When no other trigger matches', 
        type: 'trigger', 
        triggerType: 'default', 
        icon: Zap, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
    ],
  },
  {
    title: 'Contact Events',
    category: 'trigger',
    steps: [
      { 
        id: 'trigger_webhook', 
        label: 'Webhook', 
        description: 'Trigger via HTTP request', 
        type: 'trigger', 
        triggerType: 'webhook', 
        icon: Globe, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
      { 
        id: 'trigger_schedule', 
        label: 'Schedule / Timer', 
        description: 'Time-based triggers', 
        type: 'trigger', 
        triggerType: 'schedule', 
        icon: Clock, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
      { 
        id: 'trigger_form', 
        label: 'Form Submission', 
        description: 'When user submits a form', 
        type: 'trigger', 
        triggerType: 'form', 
        icon: FileInput, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
      { 
        id: 'trigger_manual', 
        label: 'Manual Trigger', 
        description: 'Manually initiated flows', 
        type: 'trigger', 
        triggerType: 'manual', 
        icon: Zap, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50' 
      },
    ],
  },
  {
    title: 'Content',
    category: 'content',
    steps: [
      { 
        id: 'content_text', 
        label: 'Send Text', 
        description: 'Send a text message', 
        type: 'action', 
        app: 'instagram', 
        contentKind: 'text', 
        icon: MessageSquare, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50' 
      },
      { 
        id: 'content_image', 
        label: 'Send Image', 
        description: 'Send an image', 
        type: 'action', 
        app: 'instagram', 
        contentKind: 'image', 
        icon: ImageIcon, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50' 
      },
      { 
        id: 'content_card', 
        label: 'Send Card', 
        description: 'Send a card with buttons', 
        type: 'action', 
        app: 'instagram', 
        contentKind: 'card', 
        icon: LayoutGrid, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50' 
      },
      { 
        id: 'content_audio', 
        label: 'Send Audio', 
        description: 'Send an audio message', 
        type: 'action', 
        app: 'instagram', 
        contentKind: 'audio', 
        icon: Music, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50' 
      },
      { 
        id: 'content_whatsapp', 
        label: 'WhatsApp Message', 
        description: 'Send WhatsApp message', 
        type: 'action', 
        app: 'whatsapp', 
        contentKind: 'text', 
        icon: MessageSquare, 
        color: 'text-emerald-600', 
        bgColor: 'bg-emerald-50' 
      },
      // NEW: Reply to Comment Action
      { 
        id: 'action_reply_comment', 
        label: 'Reply to Comment', 
        description: 'Reply directly to Instagram comment', 
        type: 'action', 
        app: 'instagram', 
        actionType: 'reply_to_comment', 
        icon: MessageCircle, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50' 
      },
      // NEW: Send DM Action
      { 
        id: 'action_send_dm', 
        label: 'Send DM', 
        description: 'Send direct message to user', 
        type: 'action', 
        app: 'instagram', 
        actionType: 'send_dm', 
        icon: Send, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50' 
      },
    ],
  },
  {
    title: 'Logic',
    category: 'logic',
    steps: [
      { 
        id: 'logic_actions', 
        label: 'Actions', 
        description: 'Perform multiple actions', 
        type: 'logic', 
        logicType: 'actions', 
        icon: Zap, 
        color: 'text-amber-600', 
        bgColor: 'bg-amber-50', 
        pro: false 
      },
      { 
        id: 'logic_condition', 
        label: 'Condition', 
        description: 'If/Else branch', 
        type: 'logic', 
        logicType: 'condition', 
        icon: GitBranch, 
        color: 'text-amber-600', 
        bgColor: 'bg-amber-50', 
        pro: true 
      },
      { 
        id: 'logic_randomizer', 
        label: 'Randomizer', 
        description: 'Random path (A/B)', 
        type: 'logic', 
        logicType: 'randomizer', 
        icon: Shuffle, 
        color: 'text-amber-600', 
        bgColor: 'bg-amber-50', 
        pro: true 
      },
      { 
        id: 'logic_delay', 
        label: 'Smart Delay', 
        description: 'Wait before next step', 
        type: 'logic', 
        logicType: 'delay', 
        icon: Clock, 
        color: 'text-amber-600', 
        bgColor: 'bg-amber-50', 
        pro: true 
      },
    ],
  },
  {
    title: 'Actions',
    category: 'action',
    steps: [
      { 
        id: 'action_tag', 
        label: 'Add Tag', 
        description: 'Add tag to contact', 
        type: 'action', 
        actionType: 'add_tag', 
        icon: Tag, 
        color: 'text-emerald-600', 
        bgColor: 'bg-emerald-50' 
      },
      { 
        id: 'action_field', 
        label: 'Set Custom Field', 
        description: 'Set a user field', 
        type: 'action', 
        actionType: 'set_field', 
        icon: FileInput, 
        color: 'text-emerald-600', 
        bgColor: 'bg-emerald-50' 
      },
      { 
        id: 'action_api', 
        label: 'HTTP Request', 
        description: 'Call external API (webhook)', 
        type: 'action', 
        actionType: 'api', 
        icon: Globe, 
        color: 'text-emerald-600', 
        bgColor: 'bg-emerald-50' 
      },
    ],
  },
];

// Flatten for lookup by id
export const STEP_BY_ID: Record<string, StepDef> = {};
STEP_SECTIONS.forEach((section) => {
  section.steps.forEach((s) => {
    STEP_BY_ID[s.id] = s;
  });
});

export function StepIcon({ step, size = 'w-5 h-5' }: { step: StepDef; size?: string }) {
  const Icon = step.icon;
  return <Icon className={`${size} ${step.color}`} />;
}
