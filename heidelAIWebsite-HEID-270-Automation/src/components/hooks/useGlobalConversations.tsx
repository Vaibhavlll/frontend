// "use client";
// import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
// import { Conversation } from '@/components/types/conversation';
// import { conversationService } from '../services/api';

// interface ConversationCache {
//   conversations: Conversation[];
//   loading: boolean;
//   error: Error | null;
//   lastFetched: number;
//   isStale: boolean;
// }

// interface ConversationContextType extends ConversationCache {
//   refetch: () => Promise<void>;
//   clearCache: () => void;
//   retry: () => Promise<void>;
//   updateConversation: (id: string, updates: Partial<Conversation>) => void;
//   addConversation: (conversation: Conversation) => void;
// }

// const ConversationContext = createContext<ConversationContextType | null>(null);

// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// const STORAGE_KEY = 'conversation_cache_v2';
// const RETRY_DELAY = 2000;
// const MAX_RETRIES = 3;

// // WebSocket URLs 
// const WS_BASE_URL = 'wss://heidelai-backend2.koyeb.app';
// const WS_INSTAGRAM_ENDPOINT = `${WS_BASE_URL}/ws2/instagram`;

// function normalizeConversation(conv: any): Conversation {
//   return {
//     id: conv.id || conv.conversation_id || '',
//     platform: conv.platform,
//     customer_id: conv.customer_id || '',
//     customer_name: conv.customer_name || 'Unknown',
//     last_message: conv.last_message || '',
//     timestamp: conv.timestamp || conv.last_message_timestamp || new Date().toISOString(),
//     unread_count: conv.unread_count || 0,
//     is_ai_enabled: conv.is_ai_enabled ?? true,
//     assigned_agent_id: conv.assigned_agent_id || null,
//     priority: ['high', 'low'].includes(conv.priority) ? conv.priority : 'medium',
//     sentiment: ['positive', 'negative'].includes(conv.sentiment) ? conv.sentiment : 'neutral',
//     email: conv.email || '',
//     billingAddress: conv.billingAddress || '',
//     shippingAddress: conv.shippingAddress || '',
//     gstin: conv.gstin || '',
//     avatar_url: conv.avatar_url || ''
//   };
// }

// const generateAndStoreClientId = (): string => {
//   let clientId = localStorage.getItem('client_id');
//   if (!clientId) {
//     clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
//     localStorage.setItem('client_id', clientId);
//   }
//   return clientId;
// };

// export function ConversationProvider({ children }: { children: ReactNode }) {
//   const [cache, setCache] = useState<ConversationCache>({
//     conversations: [],
//     loading: false,
//     error: null,
//     lastFetched: 0,
//     isStale: false,
//   });

//   const [retryCount, setRetryCount] = useState(0);
//   const [hasInitialized, setHasInitialized] = useState(false);
//   const wsRef = useRef<WebSocket | null>(null);
//   const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
//   const isConnectingRef = useRef(false);

//   // Load from cache and initialize
//   useEffect(() => {
//     if (!hasInitialized) {
//       console.log('🔄 ConversationProvider: Initializing...');
//       loadFromCache();
//       setHasInitialized(true);
//     }
//   }, [hasInitialized]);

//   // Save to localStorage when successful data is received
//   useEffect(() => {
//     if (cache.conversations.length > 0 && !cache.error && cache.lastFetched > 0) {
//       console.log('💾 ConversationProvider: Saving to localStorage', cache.conversations.length, 'conversations');
//       localStorage.setItem(STORAGE_KEY, JSON.stringify({
//         conversations: cache.conversations,
//         lastFetched: cache.lastFetched,
//       }));
//     }
//   }, [cache.conversations, cache.lastFetched, cache.error]);

//   // Setup WebSocket when conversations are loaded
//   useEffect(() => {
//     if (cache.conversations.length > 0) {
//       setupWebSocket();
//     }
//     return () => {
//       cleanup();
//     };
//   }, [cache.conversations.length > 0]);

//   const loadFromCache = () => {
//     console.log('📂 ConversationProvider: Loading from cache...');
//     const savedCache = localStorage.getItem(STORAGE_KEY);
    
//     if (savedCache) {
//       try {
//         const parsedCache = JSON.parse(savedCache);
//         const now = Date.now();
//         const isStale = now - parsedCache.lastFetched > CACHE_DURATION;
        
//         console.log('📂 ConversationProvider: Found cached data:', {
//           conversationCount: parsedCache.conversations?.length || 0,
//           lastFetched: new Date(parsedCache.lastFetched),
//           isStale,
//           cacheAge: Math.round((now - parsedCache.lastFetched) / 1000 / 60) + ' minutes'
//         });

//         if (parsedCache.conversations && parsedCache.conversations.length > 0) {
//           // Load cached data immediately
//           setCache(prev => ({
//             ...prev,
//             conversations: parsedCache.conversations,
//             lastFetched: parsedCache.lastFetched,
//             isStale,
//             loading: false,
//           }));

//           // If cache is stale, fetch fresh data in background
//           if (isStale) {
//             console.log('🔄 ConversationProvider: Cache is stale, fetching fresh data...');
//             setTimeout(() => fetchConversations(false), 100);
//           }
//           return;
//         }
//       } catch (error) {
//         console.error('📂 ConversationProvider: Failed to parse cached data:', error);
//         localStorage.removeItem(STORAGE_KEY);
//       }
//     }
    
//     // No valid cache found, fetch with loading state
//     console.log('📂 ConversationProvider: No valid cache, fetching fresh data...');
//     fetchConversations(true);
//   };

//   const fetchConversations = useCallback(async (showLoading = true) => {
//     if (showLoading && cache.conversations.length === 0) {
//       console.log('⏳ ConversationProvider: Showing loading state');
//       setCache(prev => ({ ...prev, loading: true, error: null }));
//     } else {
//       console.log('🔄 ConversationProvider: Background fetch (no loading state)');
//       setCache(prev => ({ ...prev, error: null }));
//     }

//     try {
//       console.log('🌐 ConversationProvider: Fetching conversations from service...');
      
//       let allConversations: Conversation[] = [];

//       // Use your existing conversation service
//       try {
//         const allres = await conversationService.getAllConversations();
//         console.log('🌐 ConversationProvider: getAllConversations response:', allres);
        
//         if (allres.status === "success" && Array.isArray(allres.data)) {
//           allConversations = allres.data.map((conv: any) => normalizeConversation({ ...conv }));
//           console.log('✅ ConversationProvider: Normalized conversations:', allConversations.length);
//         } else {
//           console.warn('🌐 ConversationProvider: Unexpected response format:', allres);
//         }
//       } catch (error) {
//         console.error('❌ ConversationProvider: Error in getAllConversations:', error);
//         throw error; // Re-throw to be caught by outer try-catch
//       }

//       console.log('✅ ConversationProvider: Successfully fetched', allConversations.length, 'conversations');
      
//       setCache({
//         conversations: allConversations,
//         loading: false,
//         error: null,
//         lastFetched: Date.now(),
//         isStale: false,
//       });
      
//       setRetryCount(0);
//     } catch (error) {
//       console.error('❌ ConversationProvider: Fetch error:', error);
      
//       setCache(prev => ({
//         ...prev,
//         loading: false,
//         error: error as Error,
//         isStale: true,
//       }));
      
//       // Auto-retry with exponential backoff if no cached data
//       if (retryCount < MAX_RETRIES && cache.conversations.length === 0) {
//         const delay = RETRY_DELAY * Math.pow(2, retryCount);
//         console.log(`🔄 ConversationProvider: Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
//         setTimeout(() => {
//           setRetryCount(prev => prev + 1);
//           fetchConversations(false);
//         }, delay);
//       }
//     }
//   }, [cache.conversations.length, retryCount]);

//   const setupWebSocket = useCallback(async () => {
//     if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
//       return;
//     }

//     const sessionId = localStorage.getItem('sessionId');
//     if (!sessionId) {
//       console.log('🔌 ConversationProvider: No session ID found, skipping WebSocket connection');
//       return;
//     }

//     isConnectingRef.current = true;

//     try {
//       console.log('🔌 ConversationProvider: Setting up WebSocket connection...');
      
//       // Get session token
//       const tokenResponse = await fetch("/api/session-token", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({ sessionId })
//       });
//       const { token: sessionToken } = await tokenResponse.json();

//       const clientId = generateAndStoreClientId();
//       const wsUrl = `${WS_INSTAGRAM_ENDPOINT}/${clientId}`;
      
//       console.log('🔌 ConversationProvider: Connecting to WebSocket:', wsUrl);
      
//       const ws = new WebSocket(wsUrl, [sessionToken]);
//       wsRef.current = ws;

//       ws.onopen = () => {
//         console.log('✅ ConversationProvider: WebSocket connected');
//         isConnectingRef.current = false;
//       };

//       ws.onmessage = (event) => {
//         console.log('📨 ConversationProvider: WebSocket message:', event.data);
//         handleWebSocketMessage(event);
//       };

//       ws.onerror = (error) => {
//         console.error('❌ ConversationProvider: WebSocket error:', error);
//         isConnectingRef.current = false;
//       };

//       ws.onclose = (event) => {
//         console.log('🔌 ConversationProvider: WebSocket closed:', event.code);
//         isConnectingRef.current = false;
        
//         // Attempt reconnection if not manually closed
//         if (event.code !== 1000 && cache.conversations.length > 0) {
//           reconnectTimeoutRef.current = setTimeout(() => {
//             setupWebSocket();
//           }, RETRY_DELAY);
//         }
//       };
//     } catch (error) {
//       console.error('❌ ConversationProvider: WebSocket setup error:', error);
//       isConnectingRef.current = false;
//     }
//   }, [cache.conversations.length]);

//   const handleWebSocketMessage = useCallback((event: MessageEvent) => {
//     try {
//       const data = JSON.parse(event.data);
//       console.log("📨 ConversationProvider: Handling WebSocket message:", data);

//       const ensureValidConversation = (conv: any): Conversation => normalizeConversation(conv);

//       if (data.type === 'new_conversation' && data.conversation) {
//         setCache(prev => {
//           const exists = prev.conversations.some(conv => conv.id === data.conversation.id);
//           if (exists) return prev;
          
//           console.log('➕ ConversationProvider: Adding new conversation:', data.conversation.id);
//           return {
//             ...prev,
//             conversations: [...prev.conversations, ensureValidConversation(data.conversation)]
//           };
//         });
//       } 
//       else if (data.type === 'conversation_updated' && data.conversation) {
//         setCache(prev => ({
//           ...prev,
//           conversations: prev.conversations.map(conv => 
//             conv.id === data.conversation.id ? ensureValidConversation(data.conversation) : conv
//           )
//         }));
//       } 
//       else if (
//         ['new_message', 'new_whatsapp_message', 'instagram_message', 'new_instagram_message'].includes(data.type)
//         && data.message
//       ) {
//         const conversationId = data.message.conversation_id;
//         const messageContent = data.message.content || '';
//         const messageTimestamp = data.message.timestamp || new Date().toISOString();

//         setCache(prev => {
//           const conversationExists = prev.conversations.some(conv => conv.id === conversationId);

//           if (!conversationExists) {
//             // Fetch single conversation if it doesn't exist
//             fetchSingleConversation(conversationId);
//             return prev;
//           }

//           console.log('📝 ConversationProvider: Updating conversation message:', conversationId);
//           return {
//             ...prev,
//             conversations: prev.conversations.map(conv => {
//               if (conv.id === conversationId) {
//                 return {
//                   ...conv,
//                   last_message: messageContent,
//                   timestamp: messageTimestamp,
//                   unread_count: (conv.unread_count || 0) + 1
//                 };
//               }
//               return conv;
//             })
//           };
//         });
//       }
//     } catch (error) {
//       console.error('❌ ConversationProvider: Error handling WebSocket message:', error);
//     }
//   }, []);

//   const fetchSingleConversation = useCallback(async (conversationId: string) => {
//     try {
//       console.log('🔍 ConversationProvider: Fetching single conversation:', conversationId);
//       const response = await conversationService.getConversation(conversationId);
      
//       if (response.status === "success" && response.data) {
//         setCache(prev => {
//           const exists = prev.conversations.some(conv => conv.id === conversationId);
//           if (exists) return prev;
          
//           console.log('➕ ConversationProvider: Adding fetched conversation:', conversationId);
//           return {
//             ...prev,
//             conversations: [...prev.conversations, normalizeConversation(response.data)]
//           };
//         });
//       }
//     } catch (error) {
//       console.error(`❌ ConversationProvider: Error fetching conversation ${conversationId}:`, error);
//     }
//   }, []);

//   const cleanup = () => {
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//     }
//     if (wsRef.current) {
//       wsRef.current.close(1000, 'Provider cleanup');
//     }
//     isConnectingRef.current = false;
//   };

//   const retry = async () => {
//     console.log('🔄 ConversationProvider: Manual retry triggered');
//     setRetryCount(0);
//     await fetchConversations(true);
//   };

//   const clearCache = () => {
//     console.log('🗑️ ConversationProvider: Clearing cache');
//     localStorage.removeItem(STORAGE_KEY);
//     cleanup();
//     setCache({
//       conversations: [],
//       loading: false,
//       error: null,
//       lastFetched: 0,
//       isStale: false,
//     });
//     setRetryCount(0);
//   };

//   const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
//     setCache(prev => ({
//       ...prev,
//       conversations: prev.conversations.map(conv => 
//         conv.id === id ? { ...conv, ...updates } : conv
//       )
//     }));
//   }, []);

//   const addConversation = useCallback((conversation: Conversation) => {
//     setCache(prev => {
//       const exists = prev.conversations.some(conv => conv.id === conversation.id);
//       if (exists) return prev;
      
//       return {
//         ...prev,
//         conversations: [...prev.conversations, conversation]
//       };
//     });
//   }, []);

//   return (
//     <ConversationContext.Provider 
//       value={{
//         ...cache,
//         refetch: () => fetchConversations(true),
//         clearCache,
//         retry,
//         updateConversation,
//         addConversation,
//       }}
//     >
//       {children}
//     </ConversationContext.Provider>
//   );
// }

// export const useGlobalConversations = () => {
//   const context = useContext(ConversationContext);
//   if (!context) {
//     throw new Error('useGlobalConversations must be used within ConversationProvider');
//   }
//   return context;
// };
