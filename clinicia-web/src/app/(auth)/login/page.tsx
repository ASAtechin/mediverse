"use client";

import { useState, Suspense } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

function LoginPageContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();

    // AuthContext handles redirect if user is already logged in.
    // While checking or if user exists, show loader — NEVER flash login form.
    if (authLoading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // AuthContext onAuthStateChanged will fire -> set cookie -> redirect to /
            const redirect = searchParams.get("redirect") || "/dashboard";
            router.push(redirect);
        } catch (err: any) {
            if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
                setError("Invalid email or password. Please try again.");
            } else if (err.code === "auth/user-not-found") {
                setError("No account found with this email.");
            } else if (err.code === "auth/too-many-requests") {
                setError("Too many failed attempts. Please try again later.");
            } else {
                setError("Sign in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (googleLoading || appleLoading) return;
        setGoogleLoading(true);
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // AuthContext will handle redirect
            const redirect = searchParams.get("redirect") || "/dashboard";
            router.push(redirect);
        } catch (err: any) {
            console.error("[GoogleSignIn] Error:", err.code, err.message);
            if (err.code === "auth/popup-closed-by-user") {
                // User closed the popup — not an error
            } else if (err.code === "auth/popup-blocked") {
                setError("Popup was blocked by your browser. Please allow popups for this site and try again.");
            } else if (err.code === "auth/cancelled-popup-request") {
                // Another popup was already open — ignore
            } else if (err.code === "auth/unauthorized-domain") {
                setError("This domain is not authorized for Google sign-in. Please contact support.");
            } else if (err.code === "auth/account-exists-with-different-credential") {
                setError("An account already exists with this email using a different sign-in method.");
            } else {
                setError(`Google sign-in failed. Please try again.`);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        if (appleLoading || googleLoading) return;
        setAppleLoading(true);
        setError("");
        try {
            const provider = new OAuthProvider("apple.com");
            provider.addScope("email");
            provider.addScope("name");
            await signInWithPopup(auth, provider);
            // AuthContext will handle redirect
            const redirect = searchParams.get("redirect") || "/dashboard";
            router.push(redirect);
        } catch (err: any) {
            console.error("[AppleSignIn] Error:", err.code, err.message);
            if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
                // User closed the popup — not an error
            } else if (err.code === "auth/popup-blocked") {
                setError("Popup was blocked by your browser. Please allow popups for this site and try again.");
            } else if (err.code === "auth/account-exists-with-different-credential") {
                setError("An account already exists with this email using a different sign-in method.");
            } else {
                setError(`Apple sign-in failed. Please try again.`);
            }
        } finally {
            setAppleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-slate-50 font-sans">
            {/* Left Side - Brand */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-teal-600/20" />
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-teal-500/10 rounded-full blur-[120px]" />

                <div className="relative z-10 max-w-lg space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-2xl">
                            <Activity className="h-8 w-8 text-blue-400" />
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight mb-6">
                            Practice Medicine <br />
                            <span className="text-blue-400">Intelligently.</span>
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            Clinicia empowers healthcare providers with next-generation tools for patient management, accurate diagnosis, and seamless care coordination.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-4 pt-8 border-t border-white/10">
                        {["Smart Patient EMR", "AI-Assisted Diagnostics", "Seamless Scheduling"].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-300">
                                <CheckCircle2 className="h-5 w-5 text-teal-400" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white lg:bg-slate-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white lg:p-10 p-8 rounded-3xl lg:shadow-xl lg:shadow-slate-200/50"
                >
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2 lg:hidden">
                            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-900">Clinicia</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="text-slate-500 mt-2 text-sm">Please sign in to your doctor account</p>
                    </div>

                    {/* Social Auth Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || appleLoading || loading}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            {googleLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            Google
                        </button>

                        <button
                            onClick={handleAppleLogin}
                            disabled={appleLoading || googleLoading || loading}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-black border border-black rounded-xl text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {appleLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                            )}
                            Apple
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-sm text-slate-400 font-medium">or sign in with email</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Email Address</label>
                            <Input
                                type="email"
                                placeholder=" || googleLoading || appleLoadingdoctor@hospital.com"
                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <Link href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium">
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In securely <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            Don&apos;t have an account?{" "}
                            <Link href="/register/signup" className="text-blue-600 font-semibold hover:text-blue-700">
                                Register your practice
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}
