import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, AlertCircle, CreditCard } from "lucide-react";

interface UsageMetricsProps {
  usage?: {
    whatsapp: {
      used: number;
      total: number;
      cost_per_message: number;
    };
    ai_chatbot: {
      conversations: number;
      tokens_used: number;
      cost_per_token: number;
    };
    current_plan: {
      name: string;
      price: string;
      billing_cycle: string;
    };
    billing: {
      current_usage: number;
      next_billing_date: string;
    };
  };
}

const UsageMetrics = ({
  usage = {
    whatsapp: {
      used: 15000,
      total: 20000,
      cost_per_message: 0.005,
    },
    ai_chatbot: {
      conversations: 1200,
      tokens_used: 500000,
      cost_per_token: 0.00002,
    },
    current_plan: {
      name: "Business Pro",
      price: "$199/month",
      billing_cycle: "Monthly",
    },
    billing: {
      current_usage: 156.78,
      next_billing_date: "2024-02-15",
    },
  },
}: UsageMetricsProps) => {
  const whatsappUsagePercentage =
    (usage.whatsapp.used / usage.whatsapp.total) * 100;
  const whatsappCost = usage.whatsapp.used * usage.whatsapp.cost_per_message;
  const aiCost = usage.ai_chatbot.tokens_used * usage.ai_chatbot.cost_per_token;

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Usage & Billing</h3>
          <Badge variant="outline">{usage.current_plan.name}</Badge>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <h4 className="font-medium">WhatsApp Messages</h4>
              </div>
              <Badge variant="secondary">
                {usage.whatsapp.used.toLocaleString()} /{" "}
                {usage.whatsapp.total.toLocaleString()}
              </Badge>
            </div>
            <Progress value={whatsappUsagePercentage} className="mb-2" />
            <p className="text-sm text-gray-500">
              Estimated cost: ${whatsappCost.toFixed(2)}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">AI Chatbot Usage</h4>
              </div>
              <Badge variant="secondary">
                {usage.ai_chatbot.conversations.toLocaleString()} conversations
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {usage.ai_chatbot.tokens_used.toLocaleString()} tokens used
            </p>
            <p className="text-sm text-gray-500">
              Estimated cost: ${aiCost.toFixed(2)}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium">Current Billing</h4>
              </div>
              <Badge variant="secondary">{usage.current_plan.price}</Badge>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Next billing date: {usage.billing.next_billing_date}
            </p>
            <p className="text-sm text-gray-500">
              Current usage: ${usage.billing.current_usage.toFixed(2)}
            </p>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">Upgrade Plan</Button>
          <Button variant="outline" className="flex-1">
            Billing History
          </Button>
        </div>

        {whatsappUsagePercentage > 80 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-700">
              You&apos;re approaching your WhatsApp message limit. Consider upgrading
              your plan.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UsageMetrics;
