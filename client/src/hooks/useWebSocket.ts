import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

type MessageHandler = (data: any) => void;

export function useWebSocket() {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [messageHandlers] = useState<Map<string, MessageHandler[]>>(new Map());

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    // Setup event listeners
    newSocket.onopen = () => {
      setIsConnected(true);
      // Authenticate the connection with user ID
      newSocket.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));
    };

    newSocket.onclose = () => {
      setIsConnected(false);
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        
        // Call registered handlers for this message type
        if (message.type && messageHandlers.has(message.type)) {
          const handlers = messageHandlers.get(message.type);
          if (handlers) {
            handlers.forEach(handler => handler(message));
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, user, messageHandlers]);

  // Register a handler for a specific message type
  const addMessageHandler = useCallback((type: string, handler: MessageHandler) => {
    if (!messageHandlers.has(type)) {
      messageHandlers.set(type, []);
    }
    
    const handlers = messageHandlers.get(type);
    if (handlers) {
      handlers.push(handler);
    }
    
    // Return a function to remove this handler
    return () => {
      const currentHandlers = messageHandlers.get(type);
      if (currentHandlers) {
        const index = currentHandlers.indexOf(handler);
        if (index !== -1) {
          currentHandlers.splice(index, 1);
        }
      }
    };
  }, [messageHandlers]);

  // Send a message through the WebSocket
  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [socket, isConnected]);

  return {
    isConnected,
    lastMessage,
    addMessageHandler,
    sendMessage
  };
}