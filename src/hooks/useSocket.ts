
import { useEffect } from 'react';
import { useSocket as useSocketContext } from '../context/SocketContext';

type EventHandlers = {
    [event: string]: (...args: any[]) => void;
};

const useSocket = (eventHandlers: EventHandlers) => {
    const { socket } = useSocketContext();

    useEffect(() => {
        if (!socket) return;

        
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            Object.keys(eventHandlers).forEach((event) => {
                socket.off(event);
            });
        };
    }, [socket, eventHandlers]);
};

export default useSocket;
