"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { PLANS, type PlanId, type Currency, type BillingCycle } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PricingCalculator } from "./PricingCalculator";

interface PricingSectionProps {
  showHeader?: boolean;
  defaultCycle?: BillingCycle;
  compact?: boolean;
}

export function PricingSection({ showHeader = true, defaultCycle = "monthly", compact = false }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(defaultCycle);
  const [currency, setCurrency] = useState<Currency>("INR");

  const formatPrice = (amount: number) => {
    if (amount === 0) return "Free";
    if (currency === "INR") return `₹${amount.toLocaleString("en-IN")}`;
    return `$${amount}`;
  };

  return (
    <section id="pricing" className={cn("py-20 lg:py-28", compact ? "bg-white" : "bg-slate-50")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-4">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Simple, Transparent{" "}
              <span className="text-blue-600">Pricing</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {/* Billing Toggle */}
          <div className="flex items-center bg-slate-100 rounded-2xl p-1">
            {(["monthly", "yearly"] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={cn(
                  "relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-all",
                  billingCycle === cycle
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {cycle === "monthly" ? "Monthly" : "Yearly"}
                {cycle === "yearly" && (
                  <span className="ml-1.5 text-xs font-bold text-teal-600">Save 17%</span>
                )}
              </button>
            ))}
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            {(["INR", "USD"] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                  currency === cur
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {cur === "INR" ? "🇮🇳 INR" : "🇺🇸 USD"}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {(Object.keys(PLANS) as PlanId[]).map((planId, index) => {
            const plan = PLANS[planId];
            const price = billingCycle === "monthly"
              ? plan.monthlyPrice[currency]
              : plan.yearlyPrice[currency];
            const isPopular = planId === "PRO";

            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative rounded-3xl p-8 transition-all duration-300",
                  isPopular
                    ? "bg-slate-900 text-white border-2 border-blue-500 shadow-2xl shadow-blue-600/20 scale-[1.02] lg:scale-105"
                    : "bg-white border border-slate-200 hover:border-blue-200 hover:shadow-xl"
                )}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className={cn(
                    "absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold",
                    isPopular
                      ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white"
                      : "bg-teal-100 text-teal-700"
                  )}>
                    <Sparkles className="h-3 w-3 inline-block mr-1" />
                    {plan.badge}
                  </div>
                )}

                {/* Plan Name */}
                <h3 className={cn(
                  "text-xl font-bold mb-1",
                  isPopular ? "text-white" : "text-slate-900"
                )}>
                  {plan.name}
                </h3>
                <p className={cn(
                  "text-sm mb-6",
                  isPopular ? "text-slate-300" : "text-slate-500"
                )}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${billingCycle}-${currency}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className={cn(
                        "text-4xl font-bold",
                        isPopular ? "text-white" : "text-slate-900"
                      )}>
                        {formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className={cn(
                          "text-sm ml-1",
                          isPopular ? "text-slate-400" : "text-slate-500"
                        )}>
                          /{billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  {billingCycle === "yearly" && price > 0 && (
                    <p className={cn(
                      "text-xs mt-1",
                      isPopular ? "text-slate-400" : "text-slate-500"
                    )}>
                      That&apos;s {formatPrice(Math.round(price / 12))}/month
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className={cn(
                  "border-t mb-6",
                  isPopular ? "border-white/10" : "border-slate-100"
                )} />

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className={cn(
                        "h-4 w-4 mt-0.5 shrink-0",
                        isPopular ? "text-teal-400" : "text-blue-600"
                      )} />
                      <span className={cn(
                        "text-sm",
                        isPopular ? "text-slate-300" : "text-slate-600"
                      )}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={`/register/signup?plan=${planId}`}
                  className={cn(
                    "block w-full py-3.5 text-center font-semibold rounded-2xl transition-all active:scale-[0.97]",
                    isPopular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                      : planId === "ENTERPRISE"
                        ? "bg-slate-900 hover:bg-slate-800 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  )}
                >
                  {price === 0 ? "Start Free" : "Start Free Trial"}
                  <ArrowRight className="h-4 w-4 inline-block ml-1.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Custom Plan CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-slate-500">
            💬 Need a custom plan?{" "}
            <Link href="mailto:sales@clinicia.in?subject=Custom%20Plan%20Inquiry" className="text-blue-600 font-semibold hover:underline">
              Let&apos;s talk →
            </Link>
          </p>
        </motion.div>

        {/* Pricing Calculator */}
        {showHeader && <PricingCalculator />}
      </div>
    </section>
  );
}
