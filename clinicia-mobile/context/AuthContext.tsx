import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import api from '../lib/api';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { app } from '../lib/firebase';

const auth = getAuth(app);

type User = {
    id: string; // We will use firebase uid
    name: string;
    email: string | null;
    role: string;
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false,
    login: async () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Set up request interceptor to always use fresh token
        const interceptorId = api.interceptors.request.use(async (config) => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const token = await currentUser.getIdToken(); // auto-refreshes if expired
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get Token for initial setup
                const token = await firebaseUser.getIdToken();
                // Set API Header (will be refreshed by interceptor on each request)
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                let userId = firebaseUser.uid;

                try {
                    // Fetch Patient Profile to get real MongoDB ID
                    const { data: profile } = await api.get('/patient/profile');
                    if (profile && profile.id) {
                        console.log("Found Patient Profile:", profile.id);
                        userId = profile.id;
                    }
                } catch (err) {
                    console.log("Could not fetch patient profile, using Firebase UID");
                }

                setUser({
                    id: userId,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    email: firebaseUser.email,
                    role: 'PATIENT' // Default for mobile app
                });
            } else {
                delete api.defaults.headers.common['Authorization'];
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => {
            unsubscribe();
            api.interceptors.request.eject(interceptorId);
        };
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true); // Manually set loading for UI feedback
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error(error);
            const msg = error.message || 'Login Failed';
            Alert.alert('Login Failed', msg);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            router.replace('/login');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
