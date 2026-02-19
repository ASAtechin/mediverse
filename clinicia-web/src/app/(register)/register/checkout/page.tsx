"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Activity, Shield, Lock, CreditCard, Smartphone, Building2,
  Wallet, Tag, Check, X, Loader2, ArrowLeft, ArrowRight,
  IndianRupee, ChevronDown, Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId, type BillingCycle, type Currency } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { validateCoupon, completePayment, getClinicByOwner } from "@/actions/registration";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { CouponConfetti } from "@/components/register/CouponConfetti";

// Payment method types
type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

const paymentMethods: { id: PaymentMethod; label: string; icon: any; description: string }[] = [
  { id: "card", label: "Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
  { id: "upi", label: "UPI", icon: Smartphone, description: "GPay, PhonePe, Paytm" },
  { id: "netbanking", label: "Net Banking", icon: Building2, description: "All major banks" },
  { id: "wallet", label: "Wallet", icon: Wallet, description: "Paytm, Amazon Pay" },
];

// Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = (searchParams.get("plan") as PlanId) || "PRO";
  const cycle = (searchParams.get("cycle") as BillingCycle) || "monthly";

  const plan = PLANS[planId] || PLANS.PRO;

  const [billingCycle, setBillingCycle] = useState<BillingCycle>(cycle);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [currency] = useState<Currency>("INR");

  // Form fields
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPincode, setBillingPincode] = useState("");
  const [gstin, setGstin] = useState("");
  const [upiId, setUpiId] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; discount: number; type: "percent" | "fixed"; description: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponConfetti, setCouponConfetti] = useState(false);

  // Processing
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [clinicId, setClinicId] = useState("");

  // Compute prices
  const subtotal = billingCycle === "monthly" ? plan.monthlyPrice[currency] : plan.yearlyPrice[currency];
  const discount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.round(subtotal * (appliedCoupon.discount / 100))
      : appliedCoupon.discount
    : 0;
  const afterDiscount = Math.max(subtotal - discount, 0);
  const gst = Math.round(afterDiscount * 0.18);
  const total = afterDiscount + gst;

  const formatINR = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  // Load user data
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setContactEmail(user.email || "");
        setBillingName(user.displayName || "");
        try {
          const result = await getClinicByOwner(user.uid);
          if (result.success && result.clinic) {
            setClinicId(result.clinic.id);
          } else {
            setError("Could not load clinic data. Please go back and try again.");
          }
        } catch (err: any) {
          console.error("[Checkout] Failed to load clinic:", err);
          setError("Connection error loading clinic data. Please refresh the page.");
        }
      } else {
        router.push("/register/signup");
      }
    });
    return () => unsub();
  }, [router]);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");

    try {
      const result = await validateCoupon(couponCode, planId);
      if (result.valid) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount: result.discount!,
          type: result.type!,
          description: result.description!,
        });
        // Trigger confetti
        setCouponConfetti(false);
        setTimeout(() => setCouponConfetti(true), 50);
      } else {
        setCouponError(result.error || "Invalid coupon");
      }
    } catch (err: any) {
      console.error("[Checkout] Coupon validation error:", err);
      setCouponError("Failed to validate coupon. Please try again.");
    }
    setCouponLoading(false);
  };

  const handlePayment = async () => {
    if (!clinicId) {
      setError("Clinic not found. Please complete registration first.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Create order via API
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          plan: planId,
          clinicId,
          billingCycle,
        }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error || "Failed to create payment order");
        setProcessing(false);
        return;
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        order_id: orderData.orderId,
        name: "Clinicia",
        description: `${plan.name} Plan - ${billingCycle === "yearly" ? "Yearly" : "Monthly"} Subscription`,
        image: "/logo.png",
        handler: async function (response: any) {
          // Payment success — save to database
          const result = await completePayment({
            clinicId,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || "demo_order",
            signature: response.razorpay_signature || "demo_sig",
            plan: planId,
            billingCycle,
            amount: total,
          });

          if (result.success) {
            router.push(
              `/register/success?plan=${planId}&payment_id=${response.razorpay_payment_id}&amount=${total}`
            );
          } else {
            setError("Payment recorded but activation failed. Please contact support.");
          }
        },
        prefill: {
          name: billingName,
          email: contactEmail,
          contact: contactPhone,
        },
        notes: {
          clinicId,
          plan: planId,
          billingCycle,
        },
        theme: {
          color: "#2563EB",
          backdrop_color: "#0f172a",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
        method: {
          card: paymentMethod === "card",
          upi: paymentMethod === "upi",
          netbanking: paymentMethod === "netbanking",
          wallet: paymentMethod === "wallet",
        },
      };

      if (typeof window.Razorpay !== "undefined") {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setError("Payment failed: " + (response.error?.description || "Please try again"));
          setProcessing(false);
        });
        rzp.open();
      } else {
        // Razorpay SDK not loaded — simulate success for demo
        const demoPaymentId = "pay_demo_" + Date.now();
        const result = await completePayment({
          clinicId,
          paymentId: demoPaymentId,
          orderId: "order_demo_" + Date.now(),
          signature: "sig_demo",
          plan: planId,
          billingCycle,
          amount: total,
        });

        if (result.success) {
          router.push(
            `/register/success?plan=${planId}&payment_id=${demoPaymentId}&amount=${total}`
          );
        } else {
          setError("Payment processing error. Please try again.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Payment initialization failed");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Coupon Confetti */}
      <CouponConfetti trigger={couponConfetti} />

      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/register" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">Clinicia</span>
            </Link>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="hidden sm:inline">Secure Checkout</span>
              <Lock className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Order Summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>

              {/* Plan Card */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-blue-600">👑 {plan.name} Plan</span>
                    <p className="text-xs text-slate-500 capitalize">{billingCycle} Subscription</p>
                  </div>
                  <button
                    onClick={() => router.push("/register/signup?step=plan")}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Change
                  </button>
                </div>
                <ul className="space-y-1">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Check className="h-3 w-3 text-blue-600" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 mb-4">
                {(["monthly", "yearly"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setBillingCycle(c)}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all text-center",
                      billingCycle === c ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    )}
                  >
                    {c === "monthly" ? "Monthly" : "Yearly (17% off)"}
                  </button>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900 font-medium">{formatINR(subtotal)}</span>
                </div>

                {/* Coupon */}
                {!appliedCoupon ? (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="h-10 pl-9 bg-slate-50 border-slate-200 rounded-xl text-sm"
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        />
                      </div>
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        variant="outline"
                        className="h-10 px-4 rounded-xl text-sm"
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500 mt-1">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <div>
                        <span className="text-sm font-semibold text-green-700">{appliedCoupon.code}</span>
                        <p className="text-xs text-green-600">{appliedCoupon.description}</p>
                      </div>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-green-600 hover:text-green-800">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatINR(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    GST (18%)
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                  </span>
                  <span className="text-slate-900 font-medium">+{formatINR(gst)}</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="text-slate-900 font-bold text-base">Total</span>
                  <span className="text-slate-900 font-bold text-xl">{formatINR(total)}</span>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Lock className="h-3.5 w-3.5" /> Secure checkout powered by Razorpay
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Shield className="h-3.5 w-3.5" /> 30-day money-back guarantee
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Visa", "Mastercard", "RuPay", "UPI", "GPay", "PhonePe"].map((m) => (
                    <span key={m} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-500 font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment Form */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Contact Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                    placeholder="doctor@clinic.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Phone</label>
                  <Input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Billing Address</h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <Input
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">GSTIN <span className="text-slate-400 font-normal">(optional)</span></label>
                    <Input
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Address</label>
                  <Input
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">City</label>
                    <Input
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">State</label>
                    <Input
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Pincode</label>
                    <Input
                      value={billingPincode}
                      onChange={(e) => setBillingPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Payment Method</h3>

              {/* Method Tabs */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 border rounded-xl transition-all text-center",
                      paymentMethod === method.id
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-blue-200"
                    )}
                  >
                    <method.icon className={cn(
                      "h-5 w-5",
                      paymentMethod === method.id ? "text-blue-600" : "text-slate-400"
                    )} />
                    <span className={cn(
                      "text-xs font-semibold",
                      paymentMethod === method.id ? "text-blue-700" : "text-slate-600"
                    )}>
                      {method.label}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                      {method.description}
                    </span>
                  </button>
                ))}
              </div>

              {/* Payment Form — varies by method */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={paymentMethod}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {paymentMethod === "upi" && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                        <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-blue-700 font-medium mb-1">Pay with UPI</p>
                        <p className="text-xs text-blue-500">
                          You&apos;ll be redirected to your UPI app to complete the payment
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">UPI ID (optional)</label>
                        <Input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                          placeholder="yourname@upi"
                        />
                        <p className="text-xs text-slate-400">Leave blank to choose in the payment window</p>
                      </div>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {[
                          { name: "Google Pay", color: "bg-white" },
                          { name: "PhonePe", color: "bg-white" },
                          { name: "Paytm", color: "bg-white" },
                          { name: "BHIM", color: "bg-white" },
                        ].map((app) => (
                          <div key={app.name} className="flex flex-col items-center gap-1">
                            <div className={`${app.color} border border-slate-200 rounded-xl h-12 w-12 flex items-center justify-center text-xs font-bold text-slate-700`}>
                              {app.name.split(" ").map(w => w[0]).join("")}
                            </div>
                            <span className="text-[10px] text-slate-500">{app.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <CreditCard className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 font-medium">
                          Card details will be collected securely via Razorpay
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Supports Visa, Mastercard, RuPay, and American Express
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "netbanking" && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <Building2 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 font-medium">Net Banking</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Choose your bank in the Razorpay payment window
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Yes Bank", "PNB", "BOB"].map((bank) => (
                          <span key={bank} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
                            {bank}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethod === "wallet" && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <Wallet className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 font-medium">Mobile Wallets</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Select your wallet in the Razorpay payment window
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {["Paytm", "Amazon Pay", "Freecharge", "JioMoney"].map((wallet) => (
                          <span key={wallet} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
                            {wallet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  Pay {formatINR(total)}
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>

            <p className="text-xs text-slate-400 text-center">
              By completing this payment, you agree to our{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Privacy Policy</a>.
              Prices are in INR and include 18% GST.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
