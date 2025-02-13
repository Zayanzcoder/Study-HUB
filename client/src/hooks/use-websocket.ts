import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketHookOptions {
  userId: number;
  room: string;
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket({ userId, room }: WebSocketHookOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      // Join the room
      ws.send(JSON.stringify({
        type: 'join',
        userId,
        room
      }));
    };

    ws.onclose = () => {
      setIsConnected(false);
      setError('WebSocket connection closed');
    };

    ws.onerror = (event) => {
      setError('WebSocket error occurred');
      console.error('WebSocket error:', event);
    };

    return () => {
      ws.close();
    };
  }, [userId, room]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        room
      }));
    } else {
      setError('WebSocket is not connected');
    }
  }, [room]);

  const subscribe = useCallback((callback: (message: WebSocketMessage) => void) => {
    if (!wsRef.current) return;

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        callback(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }, []);

  return {
    isConnected,
    error,
    sendMessage,
    subscribe
  };
}
