import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from '@/components/ui/card';

interface ChatMessage {
  type: 'incoming' | 'outgoing';
  content: string;
}

const STORAGE_KEY = 'talkToData_messages';

const typingIndicatorStyles = `
  .typing-indicator {
    margin-top: 2.8%;
    display: flex;
    align-items: center;
    background: #2e2e2e00;
    border-radius: 10px;
    width: 60px;
    height: 47px;
    padding-left: 12px;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    background-color: #b2b2b2;
    border-radius: 50%;
    margin-right: 4px;
    animation: typing 1.5s infinite;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
`;

function formatBotMessage(output: string) {
  // Replace specific headings with bold and newlines for spacing
  let formatted = output.replace(/\*\*(.*?)\*\*:/g, `<strong>$1:</strong><br>`);

  // Replace bold text with <strong> tags
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`);

  // Add spacing for list-like items using tabs
  formatted = formatted.replace(/\* (.*?)\n/g, `<span style="margin-left:16px;display: block;height: fit-content;width: 100%;text-align: start;margin-bottom: 0;">&#8226;&nbsp;&nbsp;$1</span>`);

  // Replace double newlines with a single <br> for better spacing
  formatted = formatted.replace(/\n\n/g, "<br> <br>");

  // Ensure single newlines are rendered as <br>
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
}

const TalkToDataTab = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    
    // Create observer for content changes
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    // Start observing
    observer.observe(container, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  // Add scroll to bottom function
  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    initializeWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const initializeWebSocket = () => {
    ws.current = new WebSocket('wss://backend-chatbot.koyeb.app/ws');
    
    ws.current.onopen = () => {
      // console.log('WebSocket connection opened');
    };

    ws.current.onmessage = (event) => {
      try {
        setIsTyping(false);
        const formattedMessage = formatBotMessage(event.data);
        const newMessage: ChatMessage = {
          type: 'incoming',
          content: formattedMessage
        };
        setMessages(prev => [...prev, newMessage]);
        // Use a slight delay to ensure content is rendered
        setTimeout(scrollToBottom, 50);
      } catch (error) {
        console.error('Error handling websocket message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      // console.log('WebSocket connection closed');
      setTimeout(initializeWebSocket, 5000);
    };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
  
    try {
      const newMessage: ChatMessage = { 
        type: 'outgoing', 
        content: inputMessage 
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(true);
      
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(inputMessage);
      }
  
      setInputMessage('');
      // Scroll after sending message
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

return (
    <div className="h-full w-full flex flex-col p-0 bg-white">
      <style>{typingIndicatorStyles}</style>
      
      <Card className="h-full w-full border-0 shadow-none rounded-none overflow-hidden flex flex-col">
        <CardContent className="p-0 flex flex-col h-full w-full">
          <div className="flex flex-col h-full w-full bg-white">
            
            {/* Header */}
            <div className="border-b border-gray-100 p-4 lg:p-6 bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Talk to Data
                </h2>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-hidden relative bg-white">
              <ScrollArea
                className="h-full w-full"
                ref={scrollContainerRef}
              >
                <div className="p-4 lg:p-6 w-full">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                      <MessageSquare className="h-16 w-16 text-gray-200 mb-6" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Start a conversation
                      </h3>
                      <p className="text-base text-gray-500 max-w-md">
                        Ask me anything about your data. I can help you analyze trends, 
                        find insights, and answer questions.
                      </p>
                      <div className="mt-8 flex flex-wrap gap-2 justify-center">
                        <button
                          onClick={() => setInputMessage("Show me recent trends in my data")}
                          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors font-medium"
                        >
                          Recent trends
                        </button>
                        <button
                          onClick={() => setInputMessage("What are my top performing metrics?")}
                          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors font-medium"
                        >
                          Top metrics
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.type === "outgoing"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-5 py-3.5 max-w-[85%] lg:max-w-[75%] shadow-sm ${
                            message.type === "outgoing"
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-100 text-gray-800"
                          }`}
                        >
                          <div
                            className="text-base leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: message.content }}
                          />
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="typing-indicator bg-white border border-gray-100 shadow-sm">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    )}
                    <div ref={lastMessageRef} />
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className=" bg-white p-3 lg:p-4 flex-shrink-0">
              <div className="flex gap-3 lg:gap-4 items-end w-full">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask me anything about your data..."
                    className="w-full resize-none rounded-xl border border-gray-200 p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all min-h-[50px] placeholder:text-gray-400"
                    rows={1}
                    style={{ maxHeight: '120px' }}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="h-[50px] w-[50px] rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-sm flex-shrink-0 transition-all"
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );};

export default TalkToDataTab;
