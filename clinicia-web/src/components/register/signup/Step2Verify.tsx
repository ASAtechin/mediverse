"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { sendEmailVerification, reload } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, ArrowLeft, Mail, RotateCcw } from "lucide-react";
import type { RegistrationData } from "@/app/(register)/register/signup/page";

interface Step2Props {
  data: RegistrationData;
  updateData: (updates: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Verify({ data, updateData, onNext, onBack }: Step2Props) {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [emailSent, setEmailSent] = useState(false);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // If already verified (e.g., Google signup), skip ahead
  useEffect(() => {
    if (data.otpVerified) {
      onNext();
    }
  }, [data.otpVerified, onNext]);

  // Send verification email on mount
  useEffect(() => {
    const sendVerification = async () => {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        try {
          await sendEmailVerification(user);
          setEmailSent(true);
          startCountdown();
        } catch (err: any) {
          if (err.code === "auth/too-many-requests") {
            setError("Too many requests. Please wait a few minutes before trying again.");
          } else {
            setEmailSent(true); // Still allow checking
            startCountdown();
          }
        }
      } else if (user?.emailVerified) {
        updateData({ otpVerified: true });
        onNext();
      }
    };
    sendVerification();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setResendLoading(true);
    setError("");
    try {
      await sendEmailVerification(user);
      setEmailSent(true);
      startCountdown();
    } catch (err: any) {
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setChecking(true);
    setError("");
    try {
      await reload(user);
      if (user.emailVerified) {
        updateData({ otpVerified: true });
        onNext();
      } else {
        setError("Email not yet verified. Please check your inbox and click the verification link.");
      }
    } catch (err: any) {
      setError("Failed to check verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  // Auto-check verification every 5 seconds
  useEffect(() => {
    const autoCheck = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          await reload(user);
          if (user.emailVerified) {
            updateData({ otpVerified: true });
            onNext();
          }
        } catch {}
      }
    }, 5000);
    return () => clearInterval(autoCheck);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center">
      {/* Animated Email Icon */}
      <div className="mx-auto mb-6 relative">
        <div className="h-20 w-20 mx-auto bg-blue-100 rounded-3xl flex items-center justify-center">
          <Mail className="h-10 w-10 text-blue-600" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-white text-xs font-bold">1</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox</h2>
      <p className="text-slate-500 text-sm mb-2">
        We&apos;ve sent a verification link to
      </p>
      <p className="text-slate-900 font-semibold mb-8">{data.email}</p>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-left">
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="h-5 w-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
            Open the email from Clinicia
          </li>
          <li className="flex items-start gap-2">
            <span className="h-5 w-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
            Click the verification link
          </li>
          <li className="flex items-start gap-2">
            <span className="h-5 w-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
            Come back here — we&apos;ll detect it automatically
          </li>
        </ol>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium mb-4">
          {error}
        </div>
      )}

      <Button
        onClick={handleCheckVerification}
        disabled={checking}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl mb-3"
      >
        {checking ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            I&apos;ve Verified <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Change email
        </button>

        <button
          onClick={handleResend}
          disabled={countdown > 0 || resendLoading}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend email"}
        </button>
      </div>
    </div>
  );
}
