type EventHandler = (data: unknown) => void;

interface WSMessage {
  type: string;
  data: unknown;
}

class WebSocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 5000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionallyClosed = false;

  constructor(url?: string) {
    this.url =
      url ||
      process.env.NEXT_PUBLIC_WS_URL ||
      "ws://localhost:8000/ws";
  }

  connect(): void {
    if (typeof window === "undefined") return;
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.isIntentionallyClosed = false;

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.dispatch("connected", null);
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.dispatch(message.type, message.data);
        } catch {
          this.dispatch("raw", event.data);
        }
      };

      this.socket.onclose = () => {
        this.dispatch("disconnected", null);
        if (!this.isIntentionallyClosed) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = () => {
        this.dispatch("error", { message: "WebSocket connection error" });
      };
    } catch {
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.dispatch("max_reconnect_reached", null);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );

    this.dispatch("reconnecting", {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  private dispatch(event: string, data: unknown): void {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (err) {
        console.error(`Error in WebSocket handler for event "${event}":`, err);
      }
    });

    // Also dispatch to wildcard listeners
    this.handlers.get("*")?.forEach((handler) => {
      try {
        handler({ type: event, data });
      } catch (err) {
        console.error("Error in wildcard WebSocket handler:", err);
      }
    });
  }

  send(type: string, data: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    }
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager();
  }
  return wsManager;
}

export { WebSocketManager };
export default getWebSocketManager;
