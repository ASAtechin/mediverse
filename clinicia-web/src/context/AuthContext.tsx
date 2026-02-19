"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

// Extended User type
export interface AppUser extends FirebaseUser {
    role?: string;
    clinicId?: string;
    mongoId?: string;
}

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: async () => {} });

// ─── Route classification (must match middleware.ts) ─────────────────
const AUTH_ONLY_PATHS = ['/login', '/signup'];
const PUBLIC_PATHS = ['/register', '/pricing', '/terms', '/privacy', '/refund', '/cookies', '/p/', '/portal'];

function isAuthOnlyPath(pathname: string): boolean {
    return AUTH_ONLY_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
}

function isPublicPath(pathname: string): boolean {
    // Root '/' is public (landing/gateway page)
    if (pathname === '/') return true;
    return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));
}

function isProtectedPath(pathname: string): boolean {
    return !isAuthOnlyPath(pathname) && !isPublicPath(pathname);
}

// ─── Session cookie helpers ──────────────────────────────────────────
async function setSessionCookie(firebaseUser: FirebaseUser): Promise<boolean> {
    try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
        return res.ok;
    } catch (e) {
        console.error("[AUTH] Failed to set session cookie", e);
        return false;
    }
}

async function clearSessionCookie(): Promise<void> {
    try {
        await fetch('/api/auth/session', { method: 'DELETE' });
    } catch (e) {
        console.error("[AUTH] Failed to clear session cookie", e);
    }
}

// ─── Provider ────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<boolean> => {
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const dbUser = await res.json();
                const appUser: AppUser = Object.assign(
                    Object.create(Object.getPrototypeOf(firebaseUser)),
                    firebaseUser,
                    { role: dbUser.role, clinicId: dbUser.clinicId, mongoId: dbUser.id }
                );
                setUser(appUser);
                return true;
            }
            return false;
        } catch (e) {
            console.error("[AUTH] Failed to fetch user profile", e);
            return false;
        }
    }, []);

    // Central logout function — clears cookie, signs out Firebase, redirects
    const logout = useCallback(async () => {
        await clearSessionCookie();
        await signOut(auth);
        setUser(null);
        // Use window.location for a hard redirect to clear all client state
        window.location.href = '/login';
    }, []);

    // ─── Main auth state listener (SINGLE source of truth) ──────────
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            const currentPath = window.location.pathname;

            if (firebaseUser) {
                // ── User IS authenticated in Firebase ──

                // 1. Set session cookie FIRST (so middleware works on next navigation)
                await setSessionCookie(firebaseUser);

                // 2. Try to load DB profile
                const found = await fetchUserProfile(firebaseUser);

                if (!found) {
                    // Firebase user but no DB record
                    const isSignupFlow = currentPath.startsWith('/signup') ||
                                         currentPath.startsWith('/register');
                    if (isSignupFlow) {
                        // On signup — allow (DB record will be created at end of wizard)
                        setUser(firebaseUser as AppUser);
                    } else {
                        // Orphaned Firebase user — force full logout
                        await clearSessionCookie();
                        await signOut(auth);
                        setUser(null);
                        router.replace('/login');
                        setLoading(false);
                        return;
                    }
                }

                // 3. If user is on an auth-only page (login/signup), redirect to dashboard
                if (isAuthOnlyPath(currentPath)) {
                    // Check for ?redirect= param
                    const params = new URLSearchParams(window.location.search);
                    const redirectTo = params.get('redirect') || '/dashboard';
                    router.replace(redirectTo);
                }

            } else {
                // ── User is NOT authenticated ──
                await clearSessionCookie();
                setUser(null);

                // If on a protected page, redirect to login
                if (isProtectedPath(currentPath)) {
                    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
                    router.replace(loginUrl);
                }
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, fetchUserProfile]);

    // ─── Token refresh every 50 min ─────────────────────────────────
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(async () => {
            try {
                const freshToken = await user.getIdToken(true);
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: freshToken }),
                });
            } catch (e) {
                console.error("[AUTH] Token refresh failed", e);
            }
        }, 50 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user]);

    // ─── Pathname change: redirect auth-only pages if logged in ─────
    useEffect(() => {
        if (loading) return;
        if (user && pathname && isAuthOnlyPath(pathname)) {
            router.replace('/dashboard');
        }
    }, [pathname, user, loading, router]);

    // ─── Re-verify profile if missing (post-signup) ─────────────────
    useEffect(() => {
        if (!loading && user && (!user.mongoId || !user.role)) {
            if (pathname && !pathname.startsWith('/signup') && !pathname.startsWith('/register')) {
                fetchUserProfile(user);
            }
        }
    }, [pathname, user, loading, fetchUserProfile]);

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
