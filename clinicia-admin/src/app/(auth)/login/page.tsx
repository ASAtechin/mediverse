"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Lock, ChevronRight, Terminal } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [error, setError] = useState("");
    const [sessionId, setSessionId] = useState("");
    const router = useRouter();

    useEffect(() => {
        setSessionId(Math.random().toString(36).substring(7).toUpperCase());
        
        // Check if user is already authenticated
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Already logged in, redirect to dashboard
                router.replace("/");
            } else {
                setCheckingAuth(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Show loading state while checking authentication
    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
                        <Shield className="h-8 w-8 text-slate-400 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 justify-center text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Checking session...</span>
                    </div>
                </div>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err: any) {
            setError("Authentication Failed: Access Denied");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans selection:bg-red-500/30 selection:text-red-200">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px] animate-pulse delay-700" />
                <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-slate-800/20 rounded-full blur-[100px]" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.03 }} />

            <div className="w-full max-w-[420px] p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 text-center"
                >
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/50 shadow-xl shadow-black/20 mb-6 group cursor-default hover:border-red-500/30 transition-colors duration-500">
                        <Shield className="h-8 w-8 text-slate-400 group-hover:text-red-500 transition-colors duration-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">System Access</h1>
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-[0.2em]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Restricted Area
                        <span className="text-slate-700 mx-1">•</span>
                        God Mode
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/40 ring-1 ring-white/5"
                >
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Terminal className="h-3 w-3" /> Identity
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3.5 outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/40 transition-all placeholder:text-slate-700 hover:border-slate-700/80"
                                    placeholder="admin@clinicia.sys"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Lock className="h-3 w-3" /> Secure Key
                            </label>
                            <div className="relative group">
                                <input
                                    type="password"
                                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3.5 outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/40 transition-all placeholder:text-slate-700 hover:border-slate-700/80 tracking-widest"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                                        <p className="text-xs text-red-400 font-medium">{error}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-slate-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-white/5 active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                            ) : (
                                <>
                                    <span>Authenticate</span>
                                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-flex flex-col items-center gap-1.5">
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
                            Secure Encrypted Connection
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800/50">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            SESSION: {sessionId || "CONNECTING..."}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
