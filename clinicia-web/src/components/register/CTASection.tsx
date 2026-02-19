"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, XCircle } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[2.5rem] px-8 py-16 md:px-16 md:py-20 text-center"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[100px]" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-10">
              Join 5,000+ clinics already using Clinicia to deliver better patient care and grow their practice.
            </p>

            <Link
              href="/register/signup"
              className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.97] group"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-blue-300">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> 14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4" /> Cancel anytime
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
