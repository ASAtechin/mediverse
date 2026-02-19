"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { auth } from "./firebase";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:4000";

// Singleton socket instance
let globalSocket: Socket | null = null;

async function getSocket(): Promise<Socket> {
    if (!globalSocket) {
        // Get the current Firebase user token for socket authentication
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : undefined;

        globalSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            auth: { token },
        });

        globalSocket.on("connect", () => {
            globalSocket?.emit("join-admin");
        });

        globalSocket.on("disconnect", () => {
            // Socket disconnected
        });

        globalSocket.on("connect_error", (error) => {
            // If auth fails, destroy socket so it can reconnect with fresh token
            if (error.message.includes("Authentication") || error.message.includes("token")) {
                globalSocket?.close();
                globalSocket = null;
            }
        });
    }
    return globalSocket;
}

// Initialize socket on module load (deferred to allow auth to resolve)
if (typeof window !== 'undefined') {
    // Wait for auth state before connecting
    const { onAuthStateChanged } = require("firebase/auth");
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
        if (user) {
            getSocket();
        }
        unsubscribe();
    });
}

// Hook for tenant/clinic updates with real-time refresh
export function useTenantUpdates(onUpdate: () => void) {
    const [isConnected, setIsConnected] = useState(false);
    const onUpdateRef = useRef(onUpdate);
    
    // Keep the callback ref updated
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        let socket: Socket | null = null;

        const handleConnect = () => {
            setIsConnected(true);
            socket?.emit("join-admin");
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        const handleTenantUpdate = (data: any) => {
            onUpdateRef.current();
        };

        getSocket().then((s) => {
            socket = s;
            setIsConnected(s.connected);
            s.on("connect", handleConnect);
            s.on("disconnect", handleDisconnect);
            s.on("tenant-updated", handleTenantUpdate);

            if (s.connected) {
                s.emit("join-admin");
            }
        });

        return () => {
            socket?.off("connect", handleConnect);
            socket?.off("disconnect", handleDisconnect);
            socket?.off("tenant-updated", handleTenantUpdate);
        };
    }, []);

    return { isConnected };
}

// Hook for patient updates
export function usePatientUpdates(onUpdate: () => void) {
    const [isConnected, setIsConnected] = useState(false);
    const onUpdateRef = useRef(onUpdate);
    
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        let socket: Socket | null = null;

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);
        const handlePatientUpdate = (data: any) => {
            onUpdateRef.current();
        };

        getSocket().then((s) => {
            socket = s;
            setIsConnected(s.connected);
            s.on("connect", handleConnect);
            s.on("disconnect", handleDisconnect);
            s.on("patient-updated", handlePatientUpdate);
        });

        return () => {
            socket?.off("connect", handleConnect);
            socket?.off("disconnect", handleDisconnect);
            socket?.off("patient-updated", handlePatientUpdate);
        };
    }, []);

    return { isConnected };
}

// Hook for appointment updates
export function useAppointmentUpdates(onUpdate: () => void) {
    const [isConnected, setIsConnected] = useState(false);
    const onUpdateRef = useRef(onUpdate);
    
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        let socket: Socket | null = null;

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);
        const handleAppointmentUpdate = (data: any) => {
            onUpdateRef.current();
        };

        getSocket().then((s) => {
            socket = s;
            setIsConnected(s.connected);
            s.on("connect", handleConnect);
            s.on("disconnect", handleDisconnect);
            s.on("appointment-updated", handleAppointmentUpdate);
        });

        return () => {
            socket?.off("connect", handleConnect);
            socket?.off("disconnect", handleDisconnect);
            socket?.off("appointment-updated", handleAppointmentUpdate);
        };
    }, []);

    return { isConnected };
}

// Hook for user updates
export function useUserUpdates(onUpdate: () => void) {
    const [isConnected, setIsConnected] = useState(false);
    const onUpdateRef = useRef(onUpdate);
    
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        let socket: Socket | null = null;

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);
        const handleUserUpdate = (data: any) => {
            onUpdateRef.current();
        };

        getSocket().then((s) => {
            socket = s;
            setIsConnected(s.connected);
            s.on("connect", handleConnect);
            s.on("disconnect", handleDisconnect);
            s.on("user-updated", handleUserUpdate);
        });

        return () => {
            socket?.off("connect", handleConnect);
            socket?.off("disconnect", handleDisconnect);
            socket?.off("user-updated", handleUserUpdate);
        };
    }, []);

    return { isConnected };
}
