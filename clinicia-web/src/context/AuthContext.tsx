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
// Guest-only: login, signup, register flow, pricing — logged-in users must NOT see these
const GUEST_ONLY_PATHS = ['/login', '/signup', '/register', '/pricing'];

// Truly public: legal pages, patient portal — always accessible
const PUBLIC_PATHS = ['/terms', '/privacy', '/refund', '/cookies', '/p/', '/portal'];

/** Returns true for pages that only guests (unauthenticated users) should see */
function isGuestOnlyPath(pathname: string): boolean {
    return GUEST_ONLY_PATHS.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p));
}

function isPublicPath(pathname: string): boolean {
    if (pathname === '/') return true;
    return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));
}

function isProtectedPath(pathname: string): boolean {
    return !isGuestOnlyPath(pathname) && !isPublicPath(pathname);
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

    const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<'found' | 'not-registered' | 'error'> => {
        try {
            // Send token BOTH as Authorization header AND via cookie (belt-and-suspenders)
            // Cookie may not be available yet due to browser timing after setSessionCookie
            const token = await firebaseUser.getIdToken();
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
            });
            if (res.ok) {
                const dbUser = await res.json();
                const appUser: AppUser = Object.assign(
                    Object.create(Object.getPrototypeOf(firebaseUser)),
                    firebaseUser,
                    { role: dbUser.role, clinicId: dbUser.clinicId, mongoId: dbUser.id }
                );
                setUser(appUser);
                return 'found';
            }
            if (res.status === 404) {
                // Authenticated in Firebase but no DB record (not registered)
                console.warn("[AUTH] Firebase user exists but not registered in database");
                return 'not-registered';
            }
            console.error("[AUTH] Failed to fetch user profile:", res.status, res.statusText);
            return 'error';
        } catch (e) {
            console.error("[AUTH] Failed to fetch user profile", e);
            return 'error';
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
                const profileResult = await fetchUserProfile(firebaseUser);

                if (profileResult !== 'found') {
                    // Firebase user but no DB record or fetch error
                    const isSignupFlow = currentPath.startsWith('/signup') ||
                                         currentPath.startsWith('/register/signup');
                    if (isSignupFlow) {
                        // On signup — allow (DB record will be created at end of wizard)
                        setUser(firebaseUser as AppUser);
                    } else if (profileResult === 'not-registered') {
                        // User is authenticated in Firebase but never completed registration.
                        // Sign them out and redirect to registration with a helpful message.
                        await clearSessionCookie();
                        await signOut(auth);
                        setUser(null);
                        router.replace('/register/signup?error=not-registered');
                        setLoading(false);
                        return;
                    } else {
                        // Transient error (network, server issue) — retry once then give up
                        console.warn('[AUTH] Profile fetch failed, retrying once...');
                        await new Promise(r => setTimeout(r, 1000));
                        const retry = await fetchUserProfile(firebaseUser);
                        if (retry !== 'found') {
                            await clearSessionCookie();
                            await signOut(auth);
                            setUser(null);
                            router.replace('/login?error=session-expired');
                            setLoading(false);
                            return;
                        }
                    }
                }

                // 3. If user is on a guest-only page (login/signup/register/pricing),
                //    redirect to dashboard. This covers both initial load and back-navigation.
                if (isGuestOnlyPath(currentPath)) {
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

    // ─── Pathname change: redirect guest-only pages if logged in ────
    // This fires on EVERY client-side navigation (including browser back/forward)
    // and covers /login, /signup, /register/*, /pricing — all guest-only routes.
    useEffect(() => {
        if (loading) return;
        if (user && pathname && isGuestOnlyPath(pathname)) {
            // Replace the current history entry so pressing back again
            // won't land on this guest-only page
            window.history.replaceState(null, '', '/dashboard');
            router.replace('/dashboard');
        }
    }, [pathname, user, loading, router]);

    // ─── Re-verify profile if missing (post-signup) ─────────────────
    useEffect(() => {
        if (!loading && user && (!user.mongoId || !user.role)) {
            if (pathname && !pathname.startsWith('/signup') && !pathname.startsWith('/register/signup')) {
                fetchUserProfile(user); // Result is handled internally (sets user state)
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
