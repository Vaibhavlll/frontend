import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input2";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/components/supabase/client";
import { useToast } from "@/components/hooks/use-toast";
import { systemPrompt } from "@/components/config/chatSystemPrompt";
import { Message, storeMessage } from "@/components/services/chatService";
import ReactMarkdown from "react-markdown";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [visitorCompany, setVisitorCompany] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeChat = async () => {
      if (!sessionId) {
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);

        // Send initial greeting message
        const initialMessage: Message = {
          role: 'assistant',
          content: "Hello! I'm HeidelAI's AI Assistant. Before we begin, could you please tell me your name and the company you're representing?"
        };

        setMessages([initialMessage]);
        await storeMessage(initialMessage, null, null, newSessionId);
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    await storeMessage(userMessage, visitorName, visitorCompany, sessionId);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, userMessage],
          systemPrompt,
        },
      });

      if (error) throw error;

      const assistantMessage = {
        role: 'assistant' as const,
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);

      await storeMessage(assistantMessage, visitorName, visitorCompany, sessionId);

      // Only try to extract visitor info from the first user message
      if (!visitorName && !visitorCompany && messages.length === 1) {
        const nameMatch = userMessage.content.match(/(?:my name is|I'm|I am) ([^,.]+)/i);
        const companyMatch = userMessage.content.match(/(?:from|with|at) ([^,.]+)/i);

        if (nameMatch) setVisitorName(nameMatch[1].trim());
        if (companyMatch) setVisitorCompany(companyMatch[1].trim());
      }

    } catch (error) {
      console.error('Error calling chat function:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black/90 text-white relative">

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-heidel-turquoise/20 bg-black/40 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="/lovable-uploads/3c5019cf-602e-4a0e-84cc-18891e3dbcb0.png"
              alt="HeidelAI Logo"
              className="h-12 w-auto animate-float"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-heidel-turquoise to-heidel-blue bg-clip-text text-transparent text-center">
            HeidelAI Pitch Deck Assistant
          </h1>
          <p className="text-gray-400 text-center mt-2">
            Your AI companion for exploring HeidelAI&apos;s innovative solutions
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-grow p-6 relative z-10" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg backdrop-blur-sm ${message.role === 'user'
                ? 'bg-heidel-blue/20 border border-heidel-blue/30 ml-auto'
                : 'bg-heidel-turquoise/20 border border-heidel-turquoise/30'
                } max-w-[80%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
            >
              {message.role === 'user' ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <ReactMarkdown
                  className="prose prose-invert max-w-none"
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="bg-heidel-turquoise/20 border border-heidel-turquoise/30 p-4 rounded-lg max-w-[80%] animate-pulse backdrop-blur-sm">
              Thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative z-10 p-6 bg-black/40 backdrop-blur-sm border-t border-heidel-turquoise/20">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading || isInitializing}
            className="flex-grow bg-black/50 border-heidel-turquoise/30 text-white placeholder:text-gray-400"
          />
          <Button
            type="submit"
            disabled={isLoading || isInitializing}
            className="bg-gradient-to-r from-heidel-turquoise to-heidel-blue hover:opacity-90 transition-opacity"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;