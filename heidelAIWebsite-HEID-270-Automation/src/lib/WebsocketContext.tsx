/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";

interface WSPayload {
    type: WSClientEvent;
    data: any;
}

type WSClientEvent =
    | "new_message"
    | "new_conversation"
    | "conversation_updated"
    | "typing_indicator"
    | "message_reaction"
    | "message_deleted"
    | "message_status_update";

export const WebSocketContext = createContext<any>(null);

const generateClientId = () => {
    if (typeof window === "undefined") return "server"; // SSR safety
    let id = localStorage.getItem("client_id");
    if (!id) {
        id = `client_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem("client_id", id);
    }
    return id;
};

export const WebSocketProvider = ({ children }: any) => {
    const { getToken } = useAuth()

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Store timeout ID

    const handlersRef = useRef<Record<WSClientEvent, Array<(data: any) => void>>>({
        new_message: [],
        new_conversation: [],
        conversation_updated: [],
        typing_indicator: [],
        message_reaction: [],
        message_deleted: [],
        message_status_update: [],
    });

    const addEventHandler = (event: WSClientEvent, fn: (data: any) => void) => {
        handlersRef.current[event].push(fn);
        return () => {
            handlersRef.current[event] = handlersRef.current[event].filter((h) => h !== fn);
        };
    };

    const sendWsMessage = useCallback((payload: Record<string, unknown>) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify(payload);
            wsRef.current.send(msg);
        } else {
            console.warn("WebSocket is not open. Payload not sent:", payload);
        }
    }, []);

    // Defined as useCallback so we can call it recursively
    const connect = useCallback(async () => {
        // 1. If already connected/connecting, don't do anything
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
            return;
        }

        try {
            const token = await getToken();
            const clientId = generateClientId();

            const ws = new WebSocket(
                `${process.env.NEXT_PUBLIC_WS_URL}/main-ws/${clientId}`,
                token!
            );

            ws.onopen = () => {
                // console.log("✅ WS Connected");
            };

            ws.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data) as WSPayload;
                    const { type, data } = payload;
                    if (handlersRef.current[type]) {
                        handlersRef.current[type].forEach((cb) => cb(data));
                    }
                } catch (e) {
                    console.error("Error parsing WS message", e);
                }
            };

            ws.onclose = () => {
                // console.log("❌ WS Closed. Attempting to reconnect in 3s...");
                wsRef.current = null;

                // 2. Schedule reconnection
                if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000); // 3 seconds delay
            };

            ws.onerror = (error) => {
                console.error("WS Error:", error);
                ws.close(); // This will trigger onclose, which triggers reconnect
            };

            wsRef.current = ws;

        } catch (error) {
            console.error("WS Connection Setup Error:", error);
            // If fetchToken fails, we still want to retry
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 5000); // Wait a bit longer if API is down
        }
    }, [getToken]); // Add getToken to dependencies


    //   Handle "Tab Focus" Reconnection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // If tab becomes visible and WS is dead, reconnect immediately
                if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
                    // console.log("👀 Tab focused: Reconnecting WebSocket...");
                    connect();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [connect]);

    useEffect(() => {
        connect();

        // Cleanup on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close(); // Close connection
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current); // Stop trying to reconnect
            }
        };
    }, [connect]);

    return (
        <WebSocketContext.Provider value={{ wsRef, addEventHandler, sendWsMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);