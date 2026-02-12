import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MessageCircle, BarChart } from "lucide-react";

interface StatusBarProps {
  agentMetrics?: {
    responseTime: number;
    resolvedChats: number;
    satisfaction: number;
  };
  queueStats?: {
    activeChats: number;
    waitingCustomers: number;
    avgWaitTime: string;
  };
}

const StatusBar = ({
  agentMetrics = {
    responseTime: 85,
    resolvedChats: 24,
    satisfaction: 92,
  },
  queueStats = {
    activeChats: 15,
    waitingCustomers: 5,
    avgWaitTime: "2m 30s",
  },
}: StatusBarProps) => {
  return (
    <Card className="w-full h-[60px] px-6 py-2 bg-white border-t flex items-center justify-between">
      {/* Agent Performance Metrics */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Response Time</span>
            <div className="flex items-center gap-2">
              <Progress
                value={agentMetrics.responseTime}
                className="w-20 h-2"
              />
              <span className="text-sm font-medium">
                {agentMetrics.responseTime}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-green-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Resolved</span>
            <span className="text-sm font-medium">
              {agentMetrics.resolvedChats} chats
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BarChart className="h-4 w-4 text-purple-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Satisfaction</span>
            <span className="text-sm font-medium">
              {agentMetrics.satisfaction}%
            </span>
          </div>
        </div>
      </div>

      {/* Queue Statistics */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Active Chats</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {queueStats.activeChats}
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-600">
                {queueStats.waitingCustomers} waiting
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Avg. Wait Time</span>
            <span className="text-sm font-medium">
              {queueStats.avgWaitTime}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatusBar;
