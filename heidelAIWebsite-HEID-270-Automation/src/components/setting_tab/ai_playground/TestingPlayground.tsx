"use client";

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Send } from 'lucide-react';
import { Message } from './types';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export function TestingPlayground() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, userId, getToken } = useAuth();

  // 1. Create a reference for the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Function to scroll to the referenced element
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 3. Trigger scroll whenever messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isLoaded || !userId) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const token = await getToken()

      if (!token) {
        throw new Error("User authentication failed.")
      }

      // API call to your Next.js endpoint
      const response = await fetch('https://heidelai-chatbot-2.koyeb.app/api/v1/chat',{
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
          },
        body: JSON.stringify({ 
          conversation_id: userId,
          message: userMsg.content,
          source: "ai_playground"
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      const agentMsg: Message = { id: Date.now().toString(), role: 'agent', content: data.final_response };
      
      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Failed to fetch response:", errorMessage);
      // Optional: Add an error message to the chat
      toast.error("Failed to fetch response", { description: errorMessage});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8faff] border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
        <h3 className="font-semibold text-gray-800">Testing Playground</h3>
        {/* <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
           <RefreshCw className="w-4 h-4" />
         </button> */}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-10">
            <p className="mb-2">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
              msg.role === 'user' 
                ? 'bg-[#eef2f9] text-gray-800 rounded-tr-none' 
                : msg.role === 'system'
                  ? 'bg-white border border-gray-200 text-gray-500 w-full rounded-xl whitespace-pre-line'
                  : 'bg-gradient-to-tl from-blue-200 to-blue-100 text-gray-900 rounded-tl-none'
            }`}>
              {/* {msg.role === 'agent' && <div className="font-semibold text-xs text-gray-700 mb-1">HeidelAI Agent</div>} */}
              {msg.content}
            </div>
          </div>
        ))}
        
        {/* Shimmering Loading State */}
        {isLoading && (
          <div className="flex py-4 justify-start">
              <style>{`
                @keyframes shimmer {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
                .shimmer-text {
                  background: linear-gradient(
                    90deg,
                    #1f2937 0%,     /* Gray-800 */
                    #9ca3af 40%,    /* Gray-400 (The shine) */
                    #1f2937 80%     /* Gray-800 */
                  );
                  background-size: 200% auto;
                  color: transparent;
                  -webkit-background-clip: text;
                  background-clip: text;
                  animation: shimmer 1.5s linear infinite;
                }
              `}</style>
              <span className="shimmer-text font-medium text-sm tracking-wide">Thinking...</span>
          </div>
        )}
        
        {/* 4. Invisible div attached to the ref to anchor the scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#f8faff]">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your AI agent anything"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm shadow-sm"
            //   disabled={isLoading}
            />
            <button 
                type="submit" /* Changed to submit to allow Enter key to trigger form submission naturally */
                disabled={!inputValue.trim() || isLoading}
                className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-blue-600 to-blue-300 text-white rounded-lg hover:from-blue-700 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}