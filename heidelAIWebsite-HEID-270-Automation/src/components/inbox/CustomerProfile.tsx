import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Timeline } from "@/components/ui/timeline";
import {
  User,
  Clock,
  ShoppingBag,
  MessageCircle,
  TrendingUp,
  Tag,
} from "lucide-react";

interface CustomerProfileProps {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    tags: string[];
    sentiment: "positive" | "neutral" | "negative";
    lifetime_value: string;
    last_contact: string;
    journey: Array<{
      id: string;
      type: string;
      title: string;
      timestamp: string;
      description: string;
    }>;
  };
}

const CustomerProfile = ({
  customer = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    tags: ["VIP", "Premium", "Early Adopter"],
    sentiment: "positive",
    lifetime_value: "$1,234.56",
    last_contact: "2 hours ago",
    journey: [
      {
        id: "1",
        type: "purchase",
        title: "Premium Package Purchase",
        timestamp: "2024-01-15 14:30",
        description: "Purchased Premium Package for $99.99",
      },
      {
        id: "2",
        type: "support",
        title: "Technical Support",
        timestamp: "2024-01-14 10:15",
        description: "Requested help with installation",
      },
    ],
  },
}: CustomerProfileProps) => {
  return (
    <Card className="w-[400px] h-full bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <img src={customer.avatar} alt={customer.name} />
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{customer.name}</h3>
            <p className="text-sm text-gray-500">{customer.email}</p>
            <p className="text-sm text-gray-500">{customer.phone}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {customer.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="journey" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="journey">
            <Clock className="h-4 w-4 mr-2" />
            Journey
          </TabsTrigger>
          <TabsTrigger value="interactions">
            <MessageCircle className="h-4 w-4 mr-2" />
            Interactions
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[500px]">
          <TabsContent value="journey" className="p-4">
            <div className="space-y-4">
              {customer.journey.map((event) => (
                <Card key={event.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {event.type === "purchase" ? (
                      <ShoppingBag className="h-5 w-5 text-green-500" />
                    ) : (
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-500">
                        {event.description}
                      </p>
                      <span className="text-xs text-gray-400">
                        {event.timestamp}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interactions" className="p-4">
            {/* Add interaction history here */}
          </TabsContent>

          <TabsContent value="analytics" className="p-4">
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Lifetime Value</h4>
                  </div>
                  <span className="text-xl font-bold">
                    {customer.lifetime_value}
                  </span>
                </div>
              </Card>
              {/* Add more analytics cards here */}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};

export default CustomerProfile;
