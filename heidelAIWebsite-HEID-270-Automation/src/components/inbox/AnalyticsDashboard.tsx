import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  LineChart,
  Clock,
  Users,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  Bot,
  Target,
  Zap,
} from "lucide-react";

interface AnalyticsDashboardProps {
  metrics?: {
    responseTime: string;
    resolutionRate: string;
    customerSatisfaction: string;
    totalConversations: number;
    activeAgents: number;
    averageHandleTime: string;
    slaCompliance: number;
    aiMetrics: {
      automationRate: number;
      accuracyScore: number;
      handoffRate: number;
    };
    performance: {
      efficiency: number;
      quality: number;
      satisfaction: number;
    };
  };
  trends?: {
    daily: Array<{ date: string; conversations: number }>;
    channels: Array<{ name: string; count: number }>;
    sentiment: Array<{ type: string; percentage: number }>;
    aiPerformance: Array<{ metric: string; value: number }>;
  };
}

const AnalyticsDashboard = ({
  metrics = {
    responseTime: "2m 30s",
    resolutionRate: "94%",
    customerSatisfaction: "4.8/5",
    totalConversations: 1234,
    activeAgents: 12,
    averageHandleTime: "15m",
    slaCompliance: 96,
    aiMetrics: {
      automationRate: 45,
      accuracyScore: 92,
      handoffRate: 15,
    },
    performance: {
      efficiency: 87,
      quality: 92,
      satisfaction: 89,
    },
  },
  trends = {
    daily: [
      { date: "2024-01-15", conversations: 150 },
      { date: "2024-01-16", conversations: 165 },
      { date: "2024-01-17", conversations: 145 },
    ],
    channels: [
      { name: "WhatsApp", count: 450 },
      { name: "Telegram", count: 320 },
      { name: "Instagram", count: 280 },
    ],
    sentiment: [
      { type: "Positive", percentage: 65 },
      { type: "Neutral", percentage: 25 },
      { type: "Negative", percentage: 10 },
    ],
    aiPerformance: [
      { metric: "Automation Rate", value: 45 },
      { metric: "Accuracy Score", value: 92 },
      { metric: "Handoff Rate", value: 15 },
    ],
  },
}: AnalyticsDashboardProps) => {
  return (
    <Card className="w-full h-full bg-white p-6">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Total Conversations</h3>
          </div>
          <p className="text-2xl font-bold">{metrics.totalConversations}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">AI Automation Rate</h3>
          </div>
          <p className="text-2xl font-bold">
            {metrics.aiMetrics.automationRate}%
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium">Resolution Rate</h3>
          </div>
          <p className="text-2xl font-bold">{metrics.resolutionRate}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium">Efficiency Score</h3>
          </div>
          <p className="text-2xl font-bold">
            {metrics.performance.efficiency}%
          </p>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="overview">
            <BarChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-performance">
            <Bot className="h-4 w-4 mr-2" />
            AI Performance
          </TabsTrigger>
          <TabsTrigger value="channels">
            <MessageCircle className="h-4 w-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[400px]">
          <TabsContent value="overview" className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium mb-4">Performance Overview</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Efficiency</span>
                    <span className="text-sm font-medium">
                      {metrics.performance.efficiency}%
                    </span>
                  </div>
                  <Progress value={metrics.performance.efficiency} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Quality</span>
                    <span className="text-sm font-medium">
                      {metrics.performance.quality}%
                    </span>
                  </div>
                  <Progress value={metrics.performance.quality} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Satisfaction</span>
                    <span className="text-sm font-medium">
                      {metrics.performance.satisfaction}%
                    </span>
                  </div>
                  <Progress value={metrics.performance.satisfaction} />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ai-performance" className="space-y-4">
            {trends.aiPerformance.map((metric) => (
              <Card key={metric.metric} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{metric.metric}</h4>
                  <Badge variant="secondary">{metric.value}%</Badge>
                </div>
                <Progress value={metric.value} />
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            {trends.channels.map((channel) => (
              <Card key={channel.name} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{channel.name}</h4>
                  <span>{channel.count}</span>
                </div>
                <Progress value={(channel.count / 1000) * 100} />
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Team Performance</h4>
                <Badge variant="outline">
                  {metrics.activeAgents} Active Agents
                </Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Average Response Time</span>
                    <span className="text-sm font-medium">
                      {metrics.responseTime}
                    </span>
                  </div>
                  <Progress value={75} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">SLA Compliance</span>
                    <span className="text-sm font-medium">
                      {metrics.slaCompliance}%
                    </span>
                  </div>
                  <Progress value={metrics.slaCompliance} />
                </div>
              </div>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};

export default AnalyticsDashboard;
