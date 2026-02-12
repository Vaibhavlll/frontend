import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Plus, Settings2, AlertTriangle } from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: "high" | "medium" | "low";
  status: "active" | "inactive";
  triggers: string[];
  executionCount: number;
}

interface AutomationRulesProps {
  rules?: AutomationRule[];
  onRuleToggle?: (id: string) => void;
  onRuleEdit?: (rule: AutomationRule) => void;
}

const AutomationRules = ({
  rules = [
    {
      id: "1",
      name: "Priority Customer Router",
      condition: "Customer segment is VIP",
      action: "Route to senior support team",
      priority: "high",
      status: "active",
      triggers: ["New conversation", "Customer identified"],
      executionCount: 156,
    },
    {
      id: "2",
      name: "After Hours Auto-Reply",
      condition: "Outside business hours",
      action: "Send automated response",
      priority: "medium",
      status: "active",
      triggers: ["New message", "Business hours check"],
      executionCount: 432,
    },
  ],
  onRuleToggle = () => {},
  onRuleEdit = () => {},
}: AutomationRulesProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-600";
      case "medium":
        return "bg-yellow-100 text-yellow-600";
      case "low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Automation Rules</h3>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <Input
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rules</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge
                        variant="secondary"
                        className={getPriorityColor(rule.priority)}
                      >
                        {rule.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-500">
                      When <span className="font-medium">{rule.condition}</span>
                      , then <span className="font-medium">{rule.action}</span>
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {rule.triggers.map((trigger, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {trigger}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        Executed {rule.executionCount} times
                      </span>
                      {rule.status === "inactive" && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">Rule inactive</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.status === "active"}
                      onCheckedChange={() => onRuleToggle(rule.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRuleEdit(rule)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};

export default AutomationRules;
