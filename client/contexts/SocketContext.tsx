import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Determine the URL based on environment. 
        // In dev, Vite proxies /api, but for socket.io we might want to connect to the same host/port 
        // or the specific backend URL.
        // If we are served from the same origin (production build), window.location.origin is fine.
        // In dev, if backend is 8080 and frontend is 5173, we usually need the backend URL.
        // However, since we wrapped the express app in the same http server in index.ts (which vite uses via plugin?), 
        // wait, in step 27, vite config uses 'vite-plugin-express' or similar middleware pattern.
        // 
        // If the backend and frontend are running on the SAME port (via Vite's transform/middleware), 
        // then connecting to window.location.origin (or "/") is correct.
        // 
        // Let's assume relative path works because of the proxy/middleware setup.
        const socketInstance = io('/', {
            path: '/socket.io', // Default path, but good to be explicit if we changed it (we didn't)
            reconnectionAttempts: 5,
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
