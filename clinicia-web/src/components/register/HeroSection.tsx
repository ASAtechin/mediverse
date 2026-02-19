"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Star, CalendarDays, Users, Activity as ActivityIcon } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-slate-900 to-teal-600/10" />
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/8 rounded-full blur-[100px]" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-sm font-medium text-blue-300">#1 Clinic Management Software</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Healthcare Practice
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Streamline appointments, manage EMR, billing, and grow your practice with AI-powered tools. Join 5,000+ clinics.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/register/signup"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all hover:shadow-xl hover:shadow-blue-600/25 active:scale-[0.97] flex items-center justify-center gap-2 group text-lg"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                Watch Demo →
              </Link>
            </div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-slate-400"
            >
              {["No credit card needed", "14-day free trial", "Cancel anytime"].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Floating Dashboard Mockup */}
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl">
              {/* Window Controls */}
              <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <div className="h-3 w-3 rounded-full bg-green-400/80" />
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-white/5 rounded-lg max-w-xs" />
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Today's Patients", value: "24", icon: Users, color: "blue" },
                    { label: "Appointments", value: "18", icon: CalendarDays, color: "teal" },
                    { label: "Revenue", value: "₹48.5K", icon: ActivityIcon, color: "emerald" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.15 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-3"
                    >
                      <stat.icon className={`h-4 w-4 text-${stat.color}-400 mb-1`} />
                      <div className="text-lg font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-slate-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Appointment List Mock */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-sm font-semibold text-white mb-3">Upcoming Appointments</div>
                  {[
                    { name: "Rahul M.", time: "10:00 AM", type: "Consultation" },
                    { name: "Priya S.", time: "10:30 AM", type: "Follow-up" },
                    { name: "Amit K.", time: "11:00 AM", type: "Checkup" },
                  ].map((apt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.12 }}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-300">
                          {apt.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">{apt.name}</div>
                          <div className="text-xs text-slate-400">{apt.type}</div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                        {apt.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-teal-500 text-white p-3 rounded-2xl shadow-xl shadow-teal-500/20 hidden sm:flex items-center gap-2"
            >
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-semibold">4.9/5 Rating</span>
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -bottom-3 -left-3 bg-white text-slate-900 p-3 rounded-2xl shadow-xl hidden sm:block"
            >
              <div className="text-xs font-medium text-slate-500">Active Clinics</div>
              <div className="text-lg font-bold">5,000+</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Social Proof Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          <p className="text-center text-sm text-slate-500 mb-6">
            Trusted by healthcare professionals at
          </p>
          {/* Infinite Scroll Marquee */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10" />
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="flex items-center gap-12 whitespace-nowrap"
            >
              {[...Array(2)].map((_, setIdx) => (
                <div key={setIdx} className="flex items-center gap-12">
                  {["Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Medanta", "Manipal Hospitals", "AIIMS", "Narayana Health", "Columbia Asia"].map((name) => (
                    <span key={`${setIdx}-${name}`} className="text-white font-semibold text-lg tracking-wide opacity-60 hover:opacity-100 transition-opacity cursor-default select-none">
                      {name}
                    </span>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
