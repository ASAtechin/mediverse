"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/api";
import { Loader2, Shield, AlertTriangle } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Verify user has SUPER_ADMIN role on the backend
                    const res = await api.get("/auth/me");
                    if (res.data?.role === "SUPER_ADMIN") {
                        setAuthenticated(true);
                    } else {
                        setError("Access Denied: This panel is restricted to Super Admins only.");
                        await auth.signOut();
                    }
                } catch (err: any) {
                    console.error("Role verification failed:", err);
                    setError("Unable to verify admin privileges. Please try again.");
                    await auth.signOut();
                }
            } else {
                router.replace("/login");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
                        <Shield className="h-8 w-8 text-slate-400 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 justify-center text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Verifying admin access...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-red-950/30 border border-red-900/50 mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => router.replace("/login")}
                        className="px-6 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return null;
    }

    return <>{children}</>;
}
