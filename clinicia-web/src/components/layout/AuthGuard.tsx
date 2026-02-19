"use client";

import { Loader2, Stethoscope } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * AuthGuard — wraps protected (dashboard) pages.
 * It does NOT create its own Firebase listener. 
 * It reads from AuthContext which is the single source of truth.
 * AuthContext already handles redirects, cookie management, and logout.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-sm mb-4">
                        <Stethoscope className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 justify-center text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Verifying access...</span>
                    </div>
                </div>
            </div>
        );
    }

    // AuthContext will have already redirected to /login if not authenticated.
    // This is a safety net — render nothing if somehow no user.
    if (!user) {
        return null;
    }

    return <>{children}</>;
}
