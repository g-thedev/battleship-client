import React, { createContext, useState, useEffect, useContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_BASE_URL = 'ws://localhost:3000';

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
  updateRoomId: () => {}, // Provide a default no-op function
});


export const SocketProvider: React.FC<ISocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null); 
  const {isAuthenticated} = useAuth();

  const updateRoomId = (newRoomId: string) => {
    setRoomId(newRoomId);
    localStorage.setItem('gameRoomId', newRoomId);
};

  useEffect(() => {
    if (isAuthenticated) {
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

        console.log('roomId', roomId);
        console.log('userId', userId);
        if (roomId && userId) {
          console.log('rejoining game room');
          newSocket.emit('rejoin_game_room', { userId, roomId });
      }
    });
      
      return () => {
          newSocket.disconnect();
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
