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
};

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io(SOCKET_BASE_URL, { 
          auth: {
              token: localStorage.getItem('accessToken'),
          },
      });

      setSocket(newSocket);
      
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
