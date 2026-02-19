"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Users,
  UserCog,
  CalendarDays,
  HardDrive,
  Mic,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { PLANS, type PlanId, type Currency, type BillingCycle } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Requirement {
  doctors: number;
  staff: number;
  patientsPerMonth: number;
  storageGB: number;
  needAIScribe: boolean;
  needSMS: boolean;
  needWhatsApp: boolean;
}

const DEFAULT_REQ: Requirement = {
  doctors: 1,
  staff: 1,
  patientsPerMonth: 30,
  storageGB: 1,
  needAIScribe: false,
  needSMS: false,
  needWhatsApp: false,
};

function recommendPlan(req: Requirement): PlanId {
  // Enterprise triggers
  if (
    req.doctors > 5 ||
    req.staff > 5 ||
    req.needWhatsApp ||
    req.storageGB > 10
  ) {
    return "ENTERPRISE";
  }

  // Pro triggers
  if (
    req.doctors > 1 ||
    req.staff > 1 ||
    req.patientsPerMonth > 50 ||
    req.needAIScribe ||
    req.needSMS ||
    req.storageGB > 1
  ) {
    return "PRO";
  }

  return "FREE";
}

export function PricingCalculator() {
  const [req, setReq] = useState<Requirement>(DEFAULT_REQ);
  const [currency, setCurrency] = useState<Currency>("INR");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [showResult, setShowResult] = useState(false);

  const recommended = useMemo(() => recommendPlan(req), [req]);
  const plan = PLANS[recommended];
  const price =
    billingCycle === "monthly"
      ? plan.monthlyPrice[currency]
      : plan.yearlyPrice[currency];

  const formatPrice = (amount: number) => {
    if (amount === 0) return "Free";
    if (currency === "INR") return `₹${amount.toLocaleString("en-IN")}`;
    return `$${amount}`;
  };

  const handleCalculate = () => {
    setShowResult(true);
  };

  const handleReset = () => {
    setReq(DEFAULT_REQ);
    setShowResult(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-3xl mx-auto mt-16"
    >
      <div className="bg-gradient-to-br from-blue-50 via-white to-teal-50 border border-blue-100 rounded-3xl p-8 md:p-10 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <Calculator className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Estimate Your Cost</h3>
            <p className="text-sm text-slate-500">
              Tell us your needs, we&apos;ll recommend the right plan
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          {/* Doctors */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              Number of Doctors
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={req.doctors}
              onChange={(e) =>
                setReq((r) => ({ ...r, doctors: parseInt(e.target.value) }))
              }
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1</span>
              <span className="font-bold text-blue-600 text-sm">
                {req.doctors}
              </span>
              <span>20</span>
            </div>
          </div>

          {/* Staff */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <UserCog className="h-4 w-4 text-blue-500" />
              Staff Accounts
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={req.staff}
              onChange={(e) =>
                setReq((r) => ({ ...r, staff: parseInt(e.target.value) }))
              }
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1</span>
              <span className="font-bold text-blue-600 text-sm">
                {req.staff}
              </span>
              <span>20</span>
            </div>
          </div>

          {/* Patients/Month */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Patients per Month
            </label>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={req.patientsPerMonth}
              onChange={(e) =>
                setReq((r) => ({
                  ...r,
                  patientsPerMonth: parseInt(e.target.value),
                }))
              }
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>10</span>
              <span className="font-bold text-blue-600 text-sm">
                {req.patientsPerMonth}
              </span>
              <span>500+</span>
            </div>
          </div>

          {/* Storage */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <HardDrive className="h-4 w-4 text-blue-500" />
              Storage Needed (GB)
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={req.storageGB}
              onChange={(e) =>
                setReq((r) => ({
                  ...r,
                  storageGB: parseInt(e.target.value),
                }))
              }
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1 GB</span>
              <span className="font-bold text-blue-600 text-sm">
                {req.storageGB} GB
              </span>
              <span>100 GB</span>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { key: "needAIScribe" as const, label: "AI Scribe", icon: Mic },
            {
              key: "needSMS" as const,
              label: "SMS Reminders",
              icon: MessageSquare,
            },
            {
              key: "needWhatsApp" as const,
              label: "WhatsApp",
              icon: MessageSquare,
            },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setReq((r) => ({ ...r, [key]: !r[key] }))}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                req[key]
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {req[key] && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            {(["monthly", "yearly"] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
                  billingCycle === cycle
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {cycle === "monthly" ? "Monthly" : "Yearly"}
                {cycle === "yearly" && (
                  <span className="ml-1 text-xs text-teal-600 font-bold">
                    -17%
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            {(["INR", "USD"] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-all",
                  currency === cur
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {cur === "INR" ? "₹" : "$"}
              </button>
            ))}
          </div>
        </div>

        {/* Calculate Button */}
        {!showResult ? (
          <button
            onClick={handleCalculate}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98]"
          >
            <Calculator className="h-4 w-4 inline-block mr-2" />
            Calculate My Plan
          </button>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={recommended}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  Recommended Plan
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-2">
                <h4 className="text-2xl font-bold text-slate-900">
                  {plan.name}
                </h4>
                <span className="text-3xl font-extrabold text-blue-600">
                  {formatPrice(price)}
                </span>
                {price > 0 && (
                  <span className="text-sm text-slate-500">
                    /{billingCycle === "monthly" ? "mo" : "yr"}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500 mb-4">{plan.description}</p>

              {billingCycle === "yearly" && price > 0 && (
                <div className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full mb-4">
                  You save{" "}
                  {formatPrice(
                    plan.monthlyPrice[currency] * 12 - price
                  )}
                  /year with annual billing!
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <Link
                  href={`/register/signup?plan=${recommended}`}
                  className="flex-1 py-3 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 inline-block ml-1.5" />
                </Link>
                <button
                  onClick={handleReset}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
