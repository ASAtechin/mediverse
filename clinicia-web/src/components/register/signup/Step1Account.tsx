"use client";

import { useState, useMemo } from "react";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import type { RegistrationData } from "@/app/(register)/register/signup/page";

interface Step1Props {
  data: RegistrationData;
  updateData: (updates: Partial<RegistrationData>) => void;
  onNext: () => void;
}

function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const label = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const color = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"][strength];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < strength ? color : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        strength <= 1 ? "text-red-500" : strength <= 3 ? "text-yellow-600" : "text-green-600"
      }`}>
        {label}
      </p>
    </div>
  );
}

export function Step1Account({ data, updateData, onNext }: Step1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const isValid =
    data.fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    data.phone.trim().length >= 10 &&
    data.password.length >= 8 &&
    agreeToTerms;

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.fullName });
      updateData({ firebaseUid: userCredential.user.uid });
      onNext();
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 8 characters.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (googleLoading || appleLoading) return; // Prevent double-click
    setGoogleLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      updateData({
        firebaseUid: user.uid,
        email: user.email || data.email,
        fullName: user.displayName || data.fullName,
        phone: user.phoneNumber || data.phone,
        otpVerified: true, // Google accounts are already verified
      });
      // Skip verification for Google users
      onNext();
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
      } else if (err.code === "auth/internal-error") {
        setError("Google sign-in encountered an internal error. Please try again.");
      } else {
        setError(`Google sign-in failed (${err.code || "unknown"}). Please try again.`);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    if (appleLoading || googleLoading) return; // Prevent double-click
    setAppleLoading(true);
    setError("");
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      updateData({
        firebaseUid: user.uid,
        email: user.email || data.email,
        fullName: user.displayName || data.fullName,
        phone: user.phoneNumber || data.phone,
        otpVerified: true,
      });
      onNext();
    } catch (err: any) {
      console.error("[AppleSignIn] Error:", err.code, err.message);
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // User closed the popup — not an error
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked by your browser. Please allow popups for this site and try again.");
      } else {
        setError(`Apple sign-in failed (${err.code || "unknown"}). Please try again.`);
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
      <p className="text-slate-500 text-sm mb-6">Start your free 14-day trial. No credit card needed.</p>

      {/* Social Auth Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleGoogleSignup}
          disabled={googleLoading || appleLoading}
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
          onClick={handleAppleSignup}
          disabled={appleLoading || googleLoading}
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

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-sm text-slate-400 font-medium">or sign up with email</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Full Name *</label>
          <Input
            type="text"
            placeholder="Dr. John Doe"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Email Address *</label>
          <div className="relative">
            <Input
              type="email"
              placeholder="doctor@clinic.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl pr-10"
              required
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium">
              +91
            </div>
            <Input
              type="tel"
              placeholder="98765 43210"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl flex-1"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Password *</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              value={data.password}
              onChange={(e) => updateData({ password: e.target.value })}
              className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl pr-10"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={data.password} />
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-500 leading-relaxed">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a>
          </span>
        </label>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={!isValid || loading}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
