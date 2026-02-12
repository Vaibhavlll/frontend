import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: string;
  billing: "monthly" | "yearly";
  features: string[];
  limits: {
    whatsapp_messages: number;
    ai_conversations: number;
    agents: number;
    channels: string[];
  };
  recommended?: boolean;
}

interface BillingPlansProps {
  plans?: Plan[];
  currentPlan?: string;
  onPlanSelect?: (plan: Plan) => void;
}

const BillingPlans = ({
  plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$49",
      billing: "monthly",
      features: [
        "5,000 WhatsApp messages",
        "1,000 AI conversations",
        "2 team members",
        "Basic analytics",
      ],
      limits: {
        whatsapp_messages: 5000,
        ai_conversations: 1000,
        agents: 2,
        channels: ["whatsapp", "web"],
      },
    },
    {
      id: "professional",
      name: "Professional",
      price: "$199",
      billing: "monthly",
      features: [
        "20,000 WhatsApp messages",
        "5,000 AI conversations",
        "10 team members",
        "Advanced analytics",
        "Priority support",
        "Custom templates",
      ],
      limits: {
        whatsapp_messages: 20000,
        ai_conversations: 5000,
        agents: 10,
        channels: ["whatsapp", "web", "telegram", "instagram"],
      },
      recommended: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      billing: "yearly",
      features: [
        "Unlimited WhatsApp messages",
        "Unlimited AI conversations",
        "Unlimited team members",
        "Custom analytics",
        "24/7 priority support",
        "Custom integration",
        "Dedicated account manager",
      ],
      limits: {
        whatsapp_messages: Infinity,
        ai_conversations: Infinity,
        agents: Infinity,
        channels: ["whatsapp", "web", "telegram", "instagram", "custom"],
      },
    },
  ],
  currentPlan = "starter",
  onPlanSelect = () => {},
}: BillingPlansProps) => {
  return (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold">Choose Your Plan</h2>
      <p className="text-gray-500">
        Select the plan that best fits your needs
      </p>
    </div>

    <div className="max-w-[1000px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 ${plan.recommended ? "border-2 border-blue-500" : ""}`}
          >
            {plan.recommended && (
              <Badge className="mb-4" variant="secondary">
                Recommended
              </Badge>
            )}

            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div className="mt-2 mb-6">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-gray-500">/{plan.billing}</span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={plan.id === currentPlan ? "outline" : "default"}
              onClick={() => onPlanSelect(plan)}
            >
              {plan.id === currentPlan ? "Current Plan" : "Select Plan"}
            </Button>

            {plan.id === currentPlan && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                  <p className="text-sm text-blue-700">
                    You are currently on this plan
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>

    <div className="text-center text-sm text-gray-500">
      <p>All plans include 24/7 support and a 14-day money-back guarantee</p>
      <p>Need a custom plan? Contact our sales team</p>
    </div>
  </div>
);}

export default BillingPlans;
