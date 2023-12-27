import React, { createContext, useState, useEffect, useContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_BASE_URL;

interface ISocketProviderProps {
  children: React.ReactNode;
}

interface ISocketContext {
  socket: Socket | null;
  roomId?: string | null;
  updateRoomId?: (newRoomId: string) => void;
}


const SocketContext = createContext<ISocketContext>({
  socket: null,
  roomId: null,
  updateRoomId: () => {},
});


export const SocketProvider: React.FC<ISocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null); 
  const {isAuthenticated, checkTokenAndRefresh} = useAuth();

  const updateRoomId = (newRoomId: string) => {
    setRoomId(newRoomId);
    localStorage.setItem('gameRoomId', newRoomId);
  };

  const initializeWebSocket = async () => {
    try {
      await checkTokenAndRefresh();

      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('No valid access token available for WebSocket connection');
      }

      const newSocket = io(SOCKET_BASE_URL, { 
        auth: {
          token: localStorage.getItem('accessToken'),
        },
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        const onLobbyPage = localStorage.getItem('onLobbyPage');
        const userId = localStorage.getItem('user_id');
        const roomId = localStorage.getItem('gameRoomId');
        
        if (onLobbyPage && userId) {
            newSocket.emit('join_pvp_lobby', { userId });
        }

        if (roomId && userId) {
          newSocket.emit('rejoin_game_room', { userId, roomId });
        }
      });

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
        // Handle WebSocket errors
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        // Handle disconnection
      });


    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      initializeWebSocket();

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{socket, roomId, updateRoomId}}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;
