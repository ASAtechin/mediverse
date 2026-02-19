"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays, Users, FileText, IndianRupee, Package, Mic,
} from "lucide-react";
import { LANDING_FEATURES } from "@/lib/constants";

const iconMap: Record<string, any> = {
  CalendarDays, Users, FileText, IndianRupee, Package, Mic,
};

const sizeClasses: Record<string, string> = {
  sm: "col-span-1 row-span-1",
  wide: "col-span-1 sm:col-span-2 row-span-1",
  tall: "col-span-1 row-span-1 sm:row-span-2",
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Everything You Need to{" "}
            <span className="text-blue-600">Run Your Clinic</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            From appointments to AI-powered documentation, Clinicia handles it all so you can focus on patient care.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {LANDING_FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon] || CalendarDays;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={`${sizeClasses[feature.size]} group relative bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-200 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50`}
              >
                {/* Badge */}
                {"badge" in feature && feature.badge && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-xs font-bold rounded-full">
                    {feature.badge}
                  </span>
                )}

                {/* Icon */}
                <div className="h-12 w-12 bg-blue-100 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center transition-colors mb-5">
                  <Icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>

                {/* Hover Arrow */}
                <Link
                  href="/register/signup"
                  className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Get started
                  <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
