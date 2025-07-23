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
    const host = window.location.hostname; // Just get the hostname
    
    // Get the port from environment or use default
    const wsPort = import.meta.env.VITE_WS_PORT || '4002';
    
    // Build the complete WebSocket URL with fallback
    const wsUrl = `${protocol}//${host}:${wsPort}/ws?token=${user.id}`;
    
    try {
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      const newSocket = new WebSocket(wsUrl);

      // Setup event listeners
      newSocket.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connection established');
        // Authenticate the connection with user ID
        newSocket.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }));
      };

      newSocket.onclose = (event) => {
        console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
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
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
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