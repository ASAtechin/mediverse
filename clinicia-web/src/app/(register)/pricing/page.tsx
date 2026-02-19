"use client";

import { Header } from "@/components/register/Header";
import { Footer } from "@/components/register/Footer";
import { PricingSection } from "@/components/register/PricingSection";
import { FAQSection } from "@/components/register/FAQSection";
import { CTASection } from "@/components/register/CTASection";
import { FEATURE_COMPARISON } from "@/lib/constants";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function PricingPage() {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Pricing Hero */}
      <section className="pt-32 pb-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-4">
              Simple Pricing
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Choose the Perfect Plan for Your Practice
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Simple, transparent pricing that grows with you. Start free, upgrade when you&apos;re ready.
            </p>
          </motion.div>
        </div>
      </section>

      <PricingSection showHeader={false} compact />

      {/* Feature Comparison Table */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full flex items-center justify-center gap-2 text-lg font-semibold text-slate-700 hover:text-blue-600 transition-colors mb-8"
          >
            Compare All Features
            <ChevronDown className={`h-5 w-5 transition-transform ${showComparison ? "rotate-180" : ""}`} />
          </button>

          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-4 px-4 text-sm font-bold text-slate-900 w-1/3">Feature</th>
                      <th className="text-center py-4 px-4 text-sm font-bold text-slate-900">Free</th>
                      <th className="text-center py-4 px-4 text-sm font-bold text-blue-600 bg-blue-50/50 rounded-t-xl">Pro</th>
                      <th className="text-center py-4 px-4 text-sm font-bold text-slate-900">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURE_COMPARISON.map((category) => (
                      <>
                        <tr key={category.category}>
                          <td colSpan={4} className="pt-6 pb-2 px-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {category.category}
                            </span>
                          </td>
                        </tr>
                        {category.features.map((feature) => (
                          <tr key={feature.name} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-sm text-slate-700">{feature.name}</td>
                            <td className="py-3 px-4 text-center text-sm text-slate-500">{feature.free}</td>
                            <td className="py-3 px-4 text-center text-sm text-slate-700 font-medium bg-blue-50/30">
                              {feature.pro}
                            </td>
                            <td className="py-3 px-4 text-center text-sm text-slate-500">{feature.enterprise}</td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
