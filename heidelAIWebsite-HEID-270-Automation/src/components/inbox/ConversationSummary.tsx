import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/lib/session_api";

const WS_URL = "wss://egenie-whatsapp.koyeb.app/cs";

interface ConversationSummaryProps {
  selectedConversationId?: string;
}

interface ConversationData {
  conversation_id: string;
  priority: "low" | "medium" | "high";
  summary: string[];
  sentiment: "positive" | "neutral" | "negative";
  suggestions: string[];
  last_analyzed: string;
}

const LoadingState = () => (
  <Card className="p-4 bg-white">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-xs text-gray-800 leading-relaxed font-semibold">
            Conversation Summary
          </h3>
        </div>
        <Skeleton className="h-6 w-20" />
      </div>

      {/* <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-32" />
      </div> */}

      <div>
        <h4 className="font-sans text-xs text-gray-800 leading-relaxed font-semibold mb-2">
          Summary Points
        </h4>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-sans text-xs text-gray-800 leading-relaxed font-semibold mb-2">
          AI suggestions
        </h4>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </Card>
);

const ConversationSummary = ({
  selectedConversationId,
}: ConversationSummaryProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationData | null>(
    null,
  );
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [retries, setRetries] = useState(0);
  const api = useApi();

  const maxRetries = 5;
  const retryDelay = 3000;

  //  fetch function
  const fetchConversation = async (conversationId: string) => {
    if (!conversationId) {
      // console.log('No conversation ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = `/api/ai/chat-analysis/${conversationId}`;
      // console.log('endpoint:', endpoint);

      const response = await api.get(endpoint);

      // console.log('API Response:', response);
      // console.log('Response data:', response.data);

      if (response.data) {
        setConversation(response.data);
        setError(null);
      } else {
        console.error(" No data in response");
        setError("No data received from API");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(" Full Error Object:", err);

      if (err.response?.status === 404) {
        setError(
          `Conversation not found (404). Check if ID "${conversationId}" exists.`,
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load conversation",
        );
      }
      setConversation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedConversationId) {
      // console.log(' No conversation ID selected');
      return;
    }

    // console.log(' Selected conversation ID:', selectedConversationId);
    fetchConversation(selectedConversationId);

    const connectWebSocket = () => {
      const wsConnection = new WebSocket(`${WS_URL}/client-${Date.now()}`);

      wsConnection.onopen = () => {
        // console.log(' WebSocket connected');
        setError(null);
        setRetries(0);
      };

      wsConnection.onmessage = (event) => {
        // console.log(' WebSocket message:', event.data);
        try {
          const data = JSON.parse(event.data);
          // console.log(' Parsed data:', data);

          if (
            data.type === "summary_updated" &&
            data.conversation_id === selectedConversationId
          ) {
            // console.log(' Summary updated, refetching...');
            fetchConversation(selectedConversationId);
          }
        } catch (err) {
          console.error(" Error parsing WebSocket message:", err);
        }
      };

      wsConnection.onerror = (error) => {
        console.error(" WebSocket error:", error);
        if (retries < maxRetries) {
          setRetries((prevRetries) => prevRetries + 1);
          setTimeout(() => {
            connectWebSocket();
          }, retryDelay);
        }
      };

      wsConnection.onclose = () => {
        // console.log('🔌 WebSocket closed');
        if (retries < maxRetries) {
          setRetries((prevRetries) => prevRetries + 1);
          setTimeout(() => {
            connectWebSocket();
          }, retryDelay);
        }
      };

      setWs(wsConnection);
    };

    connectWebSocket();

    return () => {
      // console.log('🧹 Cleaning up WebSocket');
      if (ws) {
        ws.close();
      }
    };
  }, [selectedConversationId]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-600";
      case "negative":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-600";
      case "medium":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-green-100 text-green-600";
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Card className="p-4 bg-white">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Failed to load conversation summary
            </p>
          </div>
          <p className="text-xs text-gray-500">{error}</p>
          <button
            onClick={() =>
              selectedConversationId &&
              fetchConversation(selectedConversationId)
            }
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  // Check if conversation data exists and has summary
  if (!conversation) {
    return (
      <Card className="p-4 bg-white">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">No conversation data available</p>
        </div>
      </Card>
    );
  }

  // Check if summary exists and is an array
  if (
    !conversation.summary ||
    !Array.isArray(conversation.summary) ||
    conversation.summary.length === 0
  ) {
    return (
      <Card className="p-4 bg-white">
        <div className="flex items-center gap-2 text-amber-500">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">No summary available yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white h-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-xs text-gray-800 leading-relaxed font-semibold">
              Conversation Summary
            </h3>

            <div className="flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className={`text-xs h-4 px-1.5 py-px ${getSentimentColor(conversation.sentiment)}`}
              >
                {conversation.sentiment.charAt(0).toUpperCase() +
                  conversation.sentiment.slice(1)}
              </Badge>

              <Badge
                variant="outline"
                className={`text-xs h-4 px-1.5 py-px ${getUrgencyColor(conversation.priority)}`}
              >
                {conversation.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="px-4">
          <h4 className="font-sans text-xs text-gray-800 leading-relaxed font-semibold mb-2">
            Summary Points
          </h4>
          <ul className="space-y-1">
            {conversation.summary.map((point, index) => (
              <li
                key={index}
                className="font-sans text-xs text-gray-600 leading-relaxed"
              >
                • {point}
              </li>
            ))}
          </ul>
        </div>

        {conversation.suggestions && conversation.suggestions.length > 0 && (
          <div className="px-4">
            <h4 className="font-sans text-xs text-gray-800 leading-relaxed font-semibold mb-2">
              AI Suggestions
            </h4>
            <ul className="space-y-1">
              {conversation.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="font-sans text-xs text-gray-600 leading-relaxed"
                >
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ConversationSummary;
