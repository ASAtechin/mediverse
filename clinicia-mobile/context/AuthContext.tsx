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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                let userId = firebaseUser.uid;

                try {
                    // Fetch Patient Profile to get real MongoDB ID
                    const { data: profile } = await api.get('/patient/profile');
                    if (profile && profile.id) {
                        userId = profile.id;
                    }
                } catch {
                    // Patient profile not found — using Firebase UID as fallback
                }

                setUser({
                    id: userId,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    email: firebaseUser.email,
                    role: 'PATIENT' // Default for mobile app
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true); // Manually set loading for UI feedback
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            const code = error?.code || '';
            const messages: Record<string, string> = {
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password. Please try again.',
                'auth/too-many-requests': 'Too many attempts. Please try again later.',
                'auth/invalid-credential': 'Invalid email or password.',
            };
            Alert.alert('Login Failed', messages[code] || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            router.replace('/login');
        } catch {
            // Logout failed silently — user will be redirected regardless
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
