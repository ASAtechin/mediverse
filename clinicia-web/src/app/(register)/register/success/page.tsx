"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity, Check, Download, Smartphone, Monitor, ArrowRight,
  UserPlus, CalendarDays, Users, Loader2, CheckCircle2,
  Mail, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/constants";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { QRCodeSVG } from "@/components/register/QRCodeSVG";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = (searchParams.get("plan") as PlanId) || "FREE";
  const paymentId = searchParams.get("payment_id");
  const amount = searchParams.get("amount");

  const plan = PLANS[planId] || PLANS.FREE;

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "Doctor");
        setUserEmail(user.email || "");
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const checklistItems = [
    { id: "patient", label: "Set up your first patient", href: "/patients", icon: UserPlus, done: false },
    { id: "schedule", label: "Configure your schedule", href: "/appointments", icon: CalendarDays, done: false },
    { id: "team", label: "Invite your team", href: "/settings", icon: Users, done: false },
    { id: "app", label: "Download mobile app", href: "#mobile-app", icon: Smartphone, done: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: typeof window !== "undefined" ? window.innerWidth / 2 : 500,
                y: -20,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * (typeof window !== "undefined" ? window.innerWidth : 1000),
                y: typeof window !== "undefined" ? window.innerHeight + 100 : 1000,
                opacity: 0,
                rotate: Math.random() * 720 - 360,
              }}
              transition={{
                duration: 2.5 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
              style={{
                width: 8 + Math.random() * 8,
                height: 8 + Math.random() * 8,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                backgroundColor: ["#2563EB", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6", "#22C55E"][
                  Math.floor(Math.random() * 6)
                ],
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">Clinicia</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center mb-8"
        >
          <div className="mx-auto mb-6 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="h-20 w-20 mx-auto bg-green-100 rounded-full flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </motion.div>
            </motion.div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-slate-900 mb-2"
          >
            {planId === "FREE" ? "Welcome to Clinicia!" : "Payment Successful! 🎉"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-slate-500"
          >
            Welcome aboard, {userName}! Your clinic is ready.
          </motion.p>
        </motion.div>

        {/* Order Details (only for paid plans) */}
        {planId !== "FREE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 mb-6"
          >
            <h2 className="font-bold text-slate-900 mb-4">Order Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan</span>
                <span className="text-slate-900 font-medium">{plan.name} Plan</span>
              </div>
              {amount && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="text-slate-900 font-medium">₹{Number(amount).toLocaleString("en-IN")}</span>
                </div>
              )}
              {paymentId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment ID</span>
                  <span className="text-slate-500 font-mono text-xs">{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice</span>
                <button onClick={() => showToast("Invoice will be emailed to you shortly.")} className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* What's Next Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 mb-6"
        >
          <h2 className="font-bold text-slate-900 mb-4">🚀 What&apos;s Next?</h2>
          <div className="space-y-3">
            {checklistItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <item.icon className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid sm:grid-cols-2 gap-4 mb-6"
        >
          {/* Mobile App */}
          <div id="mobile-app" className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 mb-1">Download the App</h3>
            <p className="text-xs text-slate-500 mb-4">Manage your clinic on the go</p>
            <div className="h-24 w-24 mx-auto rounded-xl flex items-center justify-center mb-3 overflow-hidden">
              <QRCodeSVG value="https://clinicia.in/download" size={96} />
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => showToast("iOS app coming soon! We'll notify you at launch.")} className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors">
                App Store
              </button>
              <button onClick={() => showToast("Android app coming soon! We'll notify you at launch.")} className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors">
                Play Store
              </button>
            </div>
          </div>

          {/* Go to Dashboard */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-center flex flex-col justify-center">
            <Monitor className="h-8 w-8 text-white mx-auto mb-3" />
            <h3 className="font-bold text-white mb-1">Go to Dashboard</h3>
            <p className="text-xs text-blue-200 mb-4">Start managing your clinic now</p>
            <Link href="/dashboard">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl px-6 w-full">
                Launch Dashboard <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Email Confirmation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-slate-500 flex items-center justify-center gap-2"
        >
          <Mail className="h-4 w-4" />
          A confirmation email has been sent to {userEmail}
        </motion.div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          {toastMsg}
        </motion.div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
