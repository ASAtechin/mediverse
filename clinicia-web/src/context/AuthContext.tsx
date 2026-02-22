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
/** Sets the session cookie and returns the token string on success (null on failure). */
async function setSessionCookie(firebaseUser: FirebaseUser): Promise<string | null> {
    try {
        const token = await firebaseUser.getIdToken(true); // Force-refresh to get a fresh token
        const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
        return res.ok ? token : null;
    } catch (e) {
        console.error("[AUTH] Failed to set session cookie", e);
        return null;
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

    /**
     * Fetch user profile from DB. If `token` is provided, it's sent as Authorization header
     * (belt-and-suspenders alongside the cookie). This avoids the race where the cookie
     * isn't in the browser jar yet.
     */
    const fetchUserProfile = useCallback(async (
        firebaseUser: FirebaseUser,
        token?: string | null
    ): Promise<'found' | 'not-registered' | 'error'> => {
        try {
            const authToken = token || await firebaseUser.getIdToken();
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${authToken}` },
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

                // 1. Set session cookie FIRST and get back the EXACT token used
                const token = await setSessionCookie(firebaseUser);

                // 2. Try to load DB profile — pass the same token to avoid race
                const profileResult = await fetchUserProfile(firebaseUser, token);

                if (profileResult !== 'found') {
                    const isSignupFlow = currentPath.startsWith('/signup') ||
                                         currentPath.startsWith('/register/signup');
                    if (isSignupFlow) {
                        // On signup — allow (DB record will be created at end of wizard)
                        setUser(firebaseUser as AppUser);
                    } else if (profileResult === 'not-registered') {
                        // Authenticated in Firebase but never completed registration.
                        await clearSessionCookie();
                        await signOut(auth);
                        setUser(null);
                        setLoading(false);
                        // Hard redirect to clear history
                        window.location.href = '/register/signup?error=not-registered';
                        return;
                    } else {
                        // Transient error — retry once with a fresh token
                        console.warn('[AUTH] Profile fetch failed, retrying...');
                        await new Promise(r => setTimeout(r, 1500));
                        const freshToken = await setSessionCookie(firebaseUser);
                        const retry = await fetchUserProfile(firebaseUser, freshToken);
                        if (retry !== 'found') {
                            // Still failing — keep user logged in at Firebase level,
                            // but allow them to see a fallback. Don't force-logout on
                            // transient server errors.
                            console.error('[AUTH] Profile fetch failed after retry');
                            setUser(firebaseUser as AppUser);
                        }
                    }
                }

                // 3. If user is on a guest-only page, redirect to dashboard.
                //    Use window.location.href (not router.replace) to CLEAR the
                //    entire back-history so pressing back won't show login/signup.
                if (isGuestOnlyPath(currentPath)) {
                    const params = new URLSearchParams(window.location.search);
                    const redirectTo = params.get('redirect') || '/dashboard';
                    setLoading(false);
                    window.location.replace(redirectTo);
                    return; // Don't setLoading again below
                }

            } else {
                // ── User is NOT authenticated ──
                await clearSessionCookie();
                setUser(null);

                // If on a protected page, hard-redirect to login
                if (isProtectedPath(currentPath)) {
                    window.location.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
                    return;
                }
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, fetchUserProfile]);

    // ─── Token refresh every 10 min — keeps the __session cookie alive ──
    useEffect(() => {
        if (!user) return;

        const refreshToken = async () => {
            try {
                const freshToken = await user.getIdToken(true); // force refresh
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: freshToken }),
                });
            } catch (e) {
                console.error("[AUTH] Token refresh failed", e);
            }
        };

        // Also refresh immediately on visibility change (user returns to tab)
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') refreshToken();
        };
        document.addEventListener('visibilitychange', handleVisibility);

        const interval = setInterval(refreshToken, 10 * 60 * 1000); // Every 10 minutes
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [user]);

    // ─── Pathname change: redirect guest-only pages if logged in ────
    // This fires on EVERY client-side navigation (including browser back/forward)
    // and covers /login, /signup, /register/*, /pricing — all guest-only routes.
    useEffect(() => {
        if (loading) return;
        if (user && pathname && isGuestOnlyPath(pathname)) {
            // Hard redirect clears the history entry completely —
            // router.replace only replaces the URL but the entry stays in the back stack
            window.location.replace('/dashboard');
        }
    }, [pathname, user, loading]);

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
