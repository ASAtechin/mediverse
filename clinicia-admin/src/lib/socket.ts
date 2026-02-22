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
            // Will reconnect automatically via socket.io reconnection config
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

// Generic hook for real-time updates on any event
function useSocketUpdates(eventName: string, onUpdate: () => void, roomJoin?: string) {
    const [isConnected, setIsConnected] = useState(false);
    const onUpdateRef = useRef(onUpdate);
    
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        let socket: Socket | null = null;

        const handleConnect = () => {
            setIsConnected(true);
            if (roomJoin) socket?.emit(roomJoin);
        };
        const handleDisconnect = () => setIsConnected(false);
        const handleUpdate = () => onUpdateRef.current();

        getSocket().then((s) => {
            socket = s;
            setIsConnected(s.connected);
            s.on("connect", handleConnect);
            s.on("disconnect", handleDisconnect);
            s.on(eventName, handleUpdate);

            if (s.connected && roomJoin) {
                s.emit(roomJoin);
            }
        });

        return () => {
            socket?.off("connect", handleConnect);
            socket?.off("disconnect", handleDisconnect);
            socket?.off(eventName, handleUpdate);
        };
    }, [eventName, roomJoin]);

    return { isConnected };
}

// Hook for tenant/clinic updates with real-time refresh
export function useTenantUpdates(onUpdate: () => void) {
    return useSocketUpdates("tenant-updated", onUpdate, "join-admin");
}

// Hook for patient updates
export function usePatientUpdates(onUpdate: () => void) {
    return useSocketUpdates("patient-updated", onUpdate);
}

// Hook for appointment updates
export function useAppointmentUpdates(onUpdate: () => void) {
    return useSocketUpdates("appointment-updated", onUpdate);
}

// Hook for user updates
export function useUserUpdates(onUpdate: () => void) {
    return useSocketUpdates("user-updated", onUpdate);
}
