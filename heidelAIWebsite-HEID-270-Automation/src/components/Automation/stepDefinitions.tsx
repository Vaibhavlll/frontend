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
  Calendar,
  FileSpreadsheet,
  List,
  MousePointer2,
  ExternalLink,
  Video,
  Star,
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
  actionType?: 'add_tag' | 'set_field' | 'api' | 'reply_to_comment' | 'send_dm' | 'whatsapp_message';
  triggerType?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  pro?: boolean;
}

export const STEP_SECTIONS: { title: string; category: StepCategory; steps: StepDef[] }[] = [
  // ─── TRIGGER SECTIONS ─────────────────────────────────────────────────────
  {
    title: 'Google Sheets',
    category: 'trigger',
    steps: [
      {
        id: 'trigger_google_sheet',
        label: 'Google Sheet Row',
        description: 'Send WhatsApp message to phone numbers in a connected Google Sheet column',
        type: 'trigger',
        triggerType: 'google_sheet',
        icon: FileSpreadsheet,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
    ],
  },
  {
    title: 'WhatsApp',
    category: 'trigger',
    steps: [
      {
        id: 'trigger_whatsapp_message',
        label: 'WhatsApp Message Received',
        description: 'Trigger when a WhatsApp message is received (supports keyword matching)',
        type: 'trigger',
        triggerType: 'whatsapp_message_received',
        icon: MessageSquare,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        id: 'trigger_whatsapp_followup',
        label: 'Follow-Up Message',
        description: 'Send scheduled follow-up to WhatsApp conversation',
        type: 'trigger',
        triggerType: 'whatsapp_followup',
        icon: Calendar,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      },
    ],
  },
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
        bgColor: 'bg-blue-50',
      },
      {
        id: 'trigger_story_reply',
        label: 'Story Reply',
        description: 'User replies to your Story',
        type: 'trigger',
        triggerType: 'story_reply',
        icon: MessageSquare,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        id: 'trigger_instagram_message',
        label: 'Instagram Message',
        description: 'User sends a message',
        type: 'trigger',
        triggerType: 'instagram_message',
        icon: MessageSquare,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
    ],
  },

  // ─── WHATSAPP INTERACTIVE MESSAGES ────────────────────────────────────────
  {
    title: 'WhatsApp Interactive',
    category: 'content',
    steps: [
      {
        id: 'wa_welcome_message',
        label: 'Welcome Message',
        description: 'Opening message with video/image header and reply buttons — sent on trigger',
        type: 'action',
        app: 'whatsapp',
        contentKind: 'text',
        icon: Star,
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
      },
      {
        id: 'wa_interactive_button',
        label: 'Button Message',
        description: 'Message with up to 3 quick reply buttons (with optional image/video header)',
        type: 'action',
        app: 'whatsapp',
        contentKind: 'text',
        icon: MousePointer2,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
      },
      {
        id: 'wa_interactive_list',
        label: 'List Message',
        description: 'Message with a scrollable list menu (sections + rows)',
        type: 'action',
        app: 'whatsapp',
        contentKind: 'text',
        icon: List,
        color: 'text-teal-700',
        bgColor: 'bg-teal-50',
      },
      {
        id: 'wa_cta_url',
        label: 'CTA URL Button',
        description: 'Message with a single call-to-action URL button',
        type: 'action',
        app: 'whatsapp',
        contentKind: 'text',
        icon: ExternalLink,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
      },
      {
        id: 'content_whatsapp_message',
        label: 'Plain Text Message',
        description: 'Send a plain WhatsApp text message (for follow-up / sheet flows)',
        type: 'action',
        app: 'whatsapp',
        contentKind: 'text',
        actionType: 'whatsapp_message',
        icon: MessageSquare,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      },
    ],
  },

  // ─── INSTAGRAM CONTENT ────────────────────────────────────────────────────
  {
    title: 'Instagram Content',
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
        bgColor: 'bg-purple-50',
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
        bgColor: 'bg-purple-50',
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
        bgColor: 'bg-purple-50',
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
        bgColor: 'bg-purple-50',
      },
      {
        id: 'action_reply_comment',
        label: 'Reply to Comment',
        description: 'Reply directly to Instagram comment',
        type: 'action',
        app: 'instagram',
        actionType: 'reply_to_comment',
        icon: MessageCircle,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        id: 'action_send_dm',
        label: 'Send DM',
        description: 'Send direct message to user',
        type: 'action',
        app: 'instagram',
        actionType: 'send_dm',
        icon: Send,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
    ],
  },

  // ─── LOGIC ────────────────────────────────────────────────────────────────
  {
    title: 'Logic',
    category: 'logic',
    steps: [
      {
        id: 'logic_condition',
        label: 'Condition',
        description: 'If/Else branch',
        type: 'logic',
        logicType: 'condition',
        icon: GitBranch,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        pro: false,
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
        pro: false,
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
        pro: false,
      },
    ],
  },

  // ─── ACTIONS ──────────────────────────────────────────────────────────────
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
        bgColor: 'bg-emerald-50',
      },
      {
        id: 'action_field',
        label: 'Set Custom Field',
        description: 'Set a user field',
        type: 'action',
        actionType: 'set_field',
        icon: FileInput,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      },
      {
        id: 'action_api',
        label: 'HTTP Request',
        description: 'Call external API (webhook)',
        type: 'action',
        actionType: 'api',
        icon: Globe,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
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