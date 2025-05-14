import { useEffect, useRef } from "react";

export function useSocket(url: string, onMessage: (data: unknown) => void) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      // Connection established
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        // ignore
      }
    };

    socket.onerror = () => {
      // Optionally handle error
    };

    socket.onclose = () => {
      // Optionally handle close
    };

    return () => {
      socket.close();
    };
  }, [url, onMessage]);

  const send = (data: unknown) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  };

  return { send };
}
