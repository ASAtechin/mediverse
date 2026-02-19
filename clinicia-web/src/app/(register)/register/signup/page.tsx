"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, Star, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { PlanId, BillingCycle } from "@/lib/constants";

// Steps
import { Step1Account } from "@/components/register/signup/Step1Account";
import { Step2Verify } from "@/components/register/signup/Step2Verify";
import { Step3Clinic } from "@/components/register/signup/Step3Clinic";
import { Step4Plan } from "@/components/register/signup/Step4Plan";

export interface RegistrationData {
  // Step 1
  fullName: string;
  email: string;
  phone: string;
  password: string;
  // Step 2
  otpVerified: boolean;
  firebaseUid: string;
  // Step 3
  clinicName: string;
  clinicType: string;
  specialties: string[];
  address: string;
  city: string;
  state: string;
  pincode: string;
  clinicLogo: string; // base64 data URL or empty
  // Step 4
  selectedPlan: PlanId;
  billingCycle: BillingCycle;
}

const initialData: RegistrationData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  otpVerified: false,
  firebaseUid: "",
  clinicName: "",
  clinicType: "solo",
  specialties: [],
  address: "",
  city: "",
  state: "",
  pincode: "",
  clinicLogo: "",
  selectedPlan: "FREE",
  billingCycle: "monthly",
};

const steps = [
  { id: "account", label: "Account" },
  { id: "verify", label: "Verify" },
  { id: "clinic", label: "Clinic" },
  { id: "plan", label: "Plan" },
];

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<RegistrationData>(() => {
    const plan = searchParams.get("plan") as PlanId | null;
    return {
      ...initialData,
      selectedPlan: plan && ["FREE", "PRO", "ENTERPRISE"].includes(plan) ? plan : "FREE",
    };
  });

  const updateData = useCallback((updates: Partial<RegistrationData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleComplete = useCallback(() => {
    // If free plan, go directly to dashboard
    if (data.selectedPlan === "FREE") {
      router.push("/register/success?plan=FREE");
    } else {
      // Go to checkout
      router.push(
        `/register/checkout?plan=${data.selectedPlan}&cycle=${data.billingCycle}`
      );
    }
  }, [data, router]);

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex w-[45%] bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-teal-600/10" />
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-teal-500/8 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-md space-y-8">
          <Link href="/register" className="flex items-center gap-2.5">
            <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <span className="font-bold text-xl text-white">Clinicia</span>
          </Link>

          <div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Join 5,000+ clinics transforming healthcare
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Set up your practice in minutes. Start managing patients, appointments, and billing — all in one place.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/10">
            {[
              { icon: Shield, text: "HIPAA compliant & secure" },
              { icon: Star, text: "4.9/5 rating from 5,000+ users" },
              { icon: Lock, text: "Bank-level encryption" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <item.icon className="h-5 w-5 text-teal-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mt-8">
            <p className="text-white/80 text-sm italic mb-3">
              &ldquo;Setting up on Clinicia took just 10 minutes. Now I manage everything from appointments to prescriptions in one place.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                P
              </div>
              <div>
                <div className="text-white text-sm font-semibold">Dr. Priya Sharma</div>
                <div className="text-slate-400 text-xs">General Physician, Mumbai</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 bg-white lg:bg-slate-50">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center">
            <Link href="/register" className="flex items-center gap-2">
              <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">Clinicia</span>
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        index < currentStep
                          ? "bg-blue-600 text-white"
                          : index === currentStep
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1.5 font-medium ${
                        index <= currentStep ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-full h-0.5 mx-2 mt-[-16px] ${
                        index < currentStep ? "bg-blue-600" : "bg-slate-200"
                      }`}
                      style={{ minWidth: "40px" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white lg:shadow-xl lg:shadow-slate-200/50 rounded-3xl lg:p-10 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <Step1Account
                    data={data}
                    updateData={updateData}
                    onNext={nextStep}
                  />
                )}
                {currentStep === 1 && (
                  <Step2Verify
                    data={data}
                    updateData={updateData}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                )}
                {currentStep === 2 && (
                  <Step3Clinic
                    data={data}
                    updateData={updateData}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                )}
                {currentStep === 3 && (
                  <Step4Plan
                    data={data}
                    updateData={updateData}
                    onComplete={handleComplete}
                    onBack={prevStep}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
