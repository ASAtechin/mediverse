"use client";

import { motion } from "framer-motion";
import { UserPlus, Settings, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account in under 2 minutes. No credit card required.",
    color: "blue",
  },
  {
    icon: Settings,
    title: "Set Up Your Clinic",
    description: "Add your clinic details, specialties, team members, and customize your workflow.",
    color: "teal",
  },
  {
    icon: Rocket,
    title: "Go Live",
    description: "Start seeing patients, booking appointments, and growing your practice.",
    color: "emerald",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-600 text-sm font-semibold rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Get Started in{" "}
            <span className="text-teal-600">3 Simple Steps</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            Setting up your clinic on Clinicia is quick, easy, and completely free.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connector Line (desktop) */}
          <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-200 via-teal-200 to-emerald-200" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Step Number Circle */}
              <div className="relative mx-auto mb-6">
                <div className={`h-16 w-16 mx-auto bg-white border-2 border-${step.color}-200 rounded-2xl flex items-center justify-center shadow-lg shadow-${step.color}-100/50 relative z-10`}>
                  <step.icon className={`h-7 w-7 text-${step.color}-600`} />
                </div>
                <div className="absolute -top-2 -right-2 h-7 w-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold z-20">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
