import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone,
  Video,
  Mail,
  Calendar,
  FileText,
  Tag,
  Flag,
  UserPlus,
  MessageSquare,
  Clock,
} from "lucide-react";

interface QuickAction {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  action: () => void;
  variant?: "default" | "secondary" | "outline" | "ghost";
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

const QuickActions = ({
  actions = [
    {
      id: "call",
      icon: Phone,
      label: "Call",
      action: () => console.log("Initiating call..."),
      variant: "outline",
    },
    {
      id: "video",
      icon: Video,
      label: "Video Call",
      action: () => console.log("Starting video call..."),
      variant: "outline",
    },
    {
      id: "email",
      icon: Mail,
      label: "Send Email",
      action: () => console.log("Composing email..."),
      variant: "outline",
    },
    {
      id: "schedule",
      icon: Calendar,
      label: "Schedule",
      action: () => console.log("Opening scheduler..."),
      variant: "outline",
    },
    {
      id: "note",
      icon: FileText,
      label: "Add Note",
      action: () => console.log("Adding note..."),
      variant: "outline",
    },
    {
      id: "tag",
      icon: Tag,
      label: "Add Tag",
      action: () => console.log("Adding tag..."),
      variant: "outline",
    },
    {
      id: "flag",
      icon: Flag,
      label: "Flag",
      action: () => console.log("Flagging conversation..."),
      variant: "outline",
    },
    {
      id: "transfer",
      icon: UserPlus,
      label: "Transfer",
      action: () => console.log("Transferring conversation..."),
      variant: "outline",
    },
    {
      id: "template",
      icon: MessageSquare,
      label: "Template",
      action: () => console.log("Opening templates..."),
      variant: "outline",
    },
    {
      id: "reminder",
      icon: Clock,
      label: "Reminder",
      action: () => console.log("Setting reminder..."),
      variant: "outline",
    },
  ],
}: QuickActionsProps) => {
  return (
    <Card className="p-2 bg-white">
      <ScrollArea className="w-full">
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "default"}
              size="sm"
              onClick={action.action}
              className="flex-shrink-0"
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default QuickActions;
