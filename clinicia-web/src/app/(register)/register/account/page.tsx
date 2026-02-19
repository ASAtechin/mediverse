"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Activity, CreditCard, Calendar, Shield, ArrowLeft,
  CheckCircle2, AlertCircle, ExternalLink, Download,
  TrendingUp, Loader2, Crown, Zap, X, ArrowDown, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getClinicByOwner } from "@/actions/registration";

interface SubscriptionInfo {
  status: string;
  planId: string;
  provider: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface ClinicInfo {
  id: string;
  name: string;
  plan: string;
  status: string;
  subscription: SubscriptionInfo | null;
}

export default function AccountPage() {
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmed, setCancelConfirmed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName || "User");
        setUserEmail(user.email || "");
        const result = await getClinicByOwner(user.uid);
        if (result.success && result.clinic) {
          setClinic(result.clinic as ClinicInfo);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const plan = clinic?.plan as PlanId;
  const planInfo = plan ? PLANS[plan] : PLANS.FREE;
  const subscription = clinic?.subscription;

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    TRIAL: "bg-yellow-100 text-yellow-700",
    PAST_DUE: "bg-red-100 text-red-700",
    CANCELED: "bg-slate-100 text-slate-600",
  };

  const statusIcons: Record<string, typeof CheckCircle2> = {
    ACTIVE: CheckCircle2,
    TRIAL: Zap,
    PAST_DUE: AlertCircle,
    CANCELED: AlertCircle,
  };

  const currentStatus = subscription?.status || clinic?.status || "ACTIVE";
  const StatusIcon = statusIcons[currentStatus] || CheckCircle2;

  const invoices = [
    { id: "INV-001", date: "2025-01-15", amount: "₹1,999", status: "Paid", plan: "Pro" },
    { id: "INV-002", date: "2024-12-15", amount: "₹1,999", status: "Paid", plan: "Pro" },
    { id: "INV-003", date: "2024-11-15", amount: "₹1,999", status: "Paid", plan: "Pro" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg text-slate-900">Clinicia</span>
              </Link>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2 rounded-xl text-sm">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Account & Billing</h1>
          <p className="text-slate-500 mb-8">Manage your subscription, billing, and account settings.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column — Plan & Subscription */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-bold text-slate-900">{planInfo.name} Plan</h2>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[currentStatus] || statusColors.ACTIVE}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {currentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{planInfo.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">
                      ₹{planInfo.monthlyPrice.INR.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-slate-400">per month</div>
                  </div>
                </div>
              </div>

              {subscription && (
                <div className="p-6 bg-slate-50/50 grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400">Current Period</div>
                      <div className="text-sm text-slate-700">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {" — "}
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400">Payment Method</div>
                      <div className="text-sm text-slate-700">
                        {subscription.provider === "RAZORPAY" ? "Razorpay" : subscription.provider}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 flex flex-wrap gap-3">
                {plan !== "ENTERPRISE" && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
                    onClick={() => setShowChangePlan(true)}
                  >
                    <TrendingUp className="h-4 w-4" /> Change Plan
                  </Button>
                )}
                {plan === "ENTERPRISE" && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
                    onClick={() => setShowChangePlan(true)}
                  >
                    <ArrowDown className="h-4 w-4" /> Downgrade Plan
                  </Button>
                )}
                {plan !== "FREE" && (
                  <Button
                    variant="outline"
                    className="rounded-xl text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Billing History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Billing History</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{inv.plan} Plan — {inv.amount}</div>
                          <div className="text-xs text-slate-400">{inv.id} · {inv.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          {inv.status}
                        </span>
                        <button
                          onClick={() => alert(`Invoice ${inv.id} will be emailed to your registered address.`)}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                          title="Download invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No billing history yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column — Quick Info */}
          <div className="space-y-6">
            {/* Clinic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <h3 className="font-bold text-slate-900 mb-4">Clinic Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Clinic Name</div>
                  <div className="text-slate-700 font-medium">{clinic?.name || "—"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Owner</div>
                  <div className="text-slate-700 font-medium">{userName}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Email</div>
                  <div className="text-slate-700 font-medium">{userEmail}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">Clinic ID</div>
                  <div className="text-slate-400 font-mono text-xs">{clinic?.id || "—"}</div>
                </div>
              </div>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white"
            >
              <Crown className="h-8 w-8 mb-3 text-blue-200" />
              <h3 className="font-bold text-lg mb-2">
                {plan === "FREE" ? "Unlock Pro Features" : "Your Plan Includes"}
              </h3>
              <ul className="space-y-2 text-sm text-blue-100">
                {planInfo.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan === "FREE" && (
                <Link href="/register/checkout?plan=PRO&billing=monthly">
                  <Button className="mt-4 bg-white text-blue-600 hover:bg-blue-50 rounded-xl w-full font-bold">
                    Upgrade Now
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-slate-900">Security</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Data encrypted at rest
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  256-bit SSL encryption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  HIPAA compliant storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Daily automated backups
                </li>
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <h3 className="font-bold text-slate-900 mb-3">Need Help?</h3>
              <p className="text-sm text-slate-500 mb-4">
                Our support team is available to help you with billing questions.
              </p>
              <a href="mailto:billing@clinicia.in" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                Contact Billing Support <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Change Plan Modal */}
      <AnimatePresence>
        {showChangePlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowChangePlan(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Change Your Plan</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Currently on <span className="font-semibold">{planInfo.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowChangePlan(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {(Object.keys(PLANS) as PlanId[]).map((pid) => {
                  const p = PLANS[pid];
                  const isCurrent = pid === plan;
                  const isUpgrade =
                    (plan === "FREE" && (pid === "PRO" || pid === "ENTERPRISE")) ||
                    (plan === "PRO" && pid === "ENTERPRISE");
                  const isDowngrade =
                    (plan === "ENTERPRISE" && (pid === "PRO" || pid === "FREE")) ||
                    (plan === "PRO" && pid === "FREE");

                  return (
                    <div
                      key={pid}
                      className={cn(
                        "border rounded-2xl p-5 transition-all",
                        isCurrent
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                          : "border-slate-200 hover:border-blue-200"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{p.name}</h3>
                            {isCurrent && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                Current
                              </span>
                            )}
                            {isUpgrade && (
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                                Upgrade
                              </span>
                            )}
                            {isDowngrade && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                Downgrade
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{p.description}</p>
                          <ul className="mt-3 space-y-1.5">
                            {p.features.slice(0, 4).map((f) => (
                              <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                                <Check className="h-3 w-3 text-blue-500 shrink-0" />
                                {f}
                              </li>
                            ))}
                            {p.features.length > 4 && (
                              <li className="text-xs text-slate-400">
                                +{p.features.length - 4} more features
                              </li>
                            )}
                          </ul>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-2xl font-bold text-slate-900">
                            {p.monthlyPrice.INR === 0
                              ? "Free"
                              : `₹${p.monthlyPrice.INR.toLocaleString("en-IN")}`}
                          </div>
                          {p.monthlyPrice.INR > 0 && (
                            <div className="text-xs text-slate-400">/month</div>
                          )}
                          {!isCurrent && (
                            <Link
                              href={
                                isUpgrade
                                  ? `/register/checkout?plan=${pid}&billing=monthly`
                                  : pid === "FREE"
                                    ? "#"
                                    : `/register/checkout?plan=${pid}&billing=monthly`
                              }
                              onClick={() => {
                                if (isDowngrade && pid === "FREE") {
                                  setShowChangePlan(false);
                                  setShowCancelModal(true);
                                }
                              }}
                            >
                              <Button
                                className={cn(
                                  "mt-3 rounded-xl text-sm",
                                  isUpgrade
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                )}
                                size="sm"
                              >
                                {isUpgrade ? "Upgrade" : "Downgrade"}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <p className="text-xs text-slate-400 text-center mt-4">
                  Upgrades take effect immediately. Downgrades apply at end of billing period.
                  <br />
                  Prorated credits will be applied automatically.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Subscription Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => {
              setShowCancelModal(false);
              setCancelConfirmed(false);
              setCancelReason("");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl"
            >
              {!cancelConfirmed ? (
                <>
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-900">Cancel Subscription</h2>
                      <button
                        onClick={() => setShowCancelModal(false)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <X className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                      <p className="text-sm text-amber-800 font-medium">
                        ⚠️ Your {planInfo.name} plan will remain active until the end of your current billing period.
                        After that, you&apos;ll be moved to the Free plan.
                      </p>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      What you&apos;ll lose:
                    </h3>
                    <ul className="space-y-2 mb-5">
                      {planInfo.features
                        .filter((f) => !(PLANS.FREE.features as readonly string[]).includes(f))
                        .slice(0, 5)
                        .map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-red-600">
                            <X className="h-3.5 w-3.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                    </ul>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Reason for cancellation (optional)
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select a reason...</option>
                      <option value="too_expensive">Too expensive</option>
                      <option value="missing_features">Missing features I need</option>
                      <option value="switching">Switching to another product</option>
                      <option value="not_using">Not using it enough</option>
                      <option value="temporary">Temporary — I&apos;ll be back</option>
                      <option value="other">Other</option>
                    </select>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl"
                        onClick={() => {
                          setShowCancelModal(false);
                          setCancelReason("");
                        }}
                      >
                        Keep My Plan
                      </Button>
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        onClick={() => setCancelConfirmed(true)}
                      >
                        Confirm Cancel
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Subscription Cancelled
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Your {planInfo.name} plan will remain active until the end of your billing period.
                    You can resubscribe at any time.
                  </p>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelConfirmed(false);
                      setCancelReason("");
                    }}
                  >
                    Got it
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
