"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getWebSocketManager, WebSocketManager } from "@/lib/websocket";

interface UseWebSocketOptions {
  autoConnect?: boolean;
  events?: Record<string, (data: unknown) => void>;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  send: (type: string, data: unknown) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, events = {} } = options;
  const [isConnected, setIsConnected] = useState(false);
  const managerRef = useRef<WebSocketManager | null>(null);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const manager = getWebSocketManager();
    managerRef.current = manager;

    const unsubConnected = manager.on("connected", () => setIsConnected(true));
    const unsubDisconnected = manager.on("disconnected", () => setIsConnected(false));

    // Subscribe to all specified events
    const unsubs: (() => void)[] = [unsubConnected, unsubDisconnected];
    for (const [event, handler] of Object.entries(eventsRef.current)) {
      unsubs.push(manager.on(event, handler));
    }

    if (autoConnect) {
      manager.connect();
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [autoConnect]);

  const send = useCallback((type: string, data: unknown) => {
    managerRef.current?.send(type, data);
  }, []);

  const connect = useCallback(() => {
    managerRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
  }, []);

  return { isConnected, send, connect, disconnect };
}

export default useWebSocket;
