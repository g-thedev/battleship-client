import React, { createContext, useState, useEffect, useContext } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_BASE_URL = 'ws://localhost:3000';

interface ISocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<ISocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    const newSocket = io(SOCKET_BASE_URL, { 
        auth: {
            token: localStorage.getItem('accessToken'),
        },
    });

    setSocket(newSocket);
    
    return () => {
        newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;
