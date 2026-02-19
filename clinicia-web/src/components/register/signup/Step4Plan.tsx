"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Sparkles, Loader2 } from "lucide-react";
import { PLANS, type PlanId, type BillingCycle } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { registerClinic } from "@/actions/registration";
import { auth } from "@/lib/firebase";
import type { RegistrationData } from "@/app/(register)/register/signup/page";

interface Step4Props {
  data: RegistrationData;
  updateData: (updates: Partial<RegistrationData>) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function Step4Plan({ data, updateData, onComplete, onBack }: Step4Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Session expired. Please go back to Step 1 and sign in again.");
        setLoading(false);
        return;
      }

      // Attempt registration with retry for transient network errors
      let lastError: Error | null = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const result = await registerClinic({
            firebaseUid: user.uid,
            email: data.email || user.email || "",
            fullName: data.fullName || user.displayName || "",
            phone: data.phone,
            clinicName: data.clinicName,
            clinicType: data.clinicType,
            specialties: data.specialties,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            plan: data.selectedPlan,
            billingCycle: data.billingCycle,
          });

          if (!result.success) {
            setError(result.error || "Registration failed. Please try again.");
            setLoading(false);
            return;
          }

          // Success — proceed to next step
          onComplete();
          return;
        } catch (fetchErr: any) {
          lastError = fetchErr;
          // Only retry on network errors (Failed to fetch), not on logic errors
          const msg = fetchErr?.message || "";
          if (attempt < 2 && (msg.includes("fetch") || msg.includes("network"))) {
            await new Promise((r) => setTimeout(r, 1000)); // Wait 1s before retry
            continue;
          }
          break;
        }
      }

      // All retries exhausted
      const msg = lastError?.message || "Something went wrong";
      if (msg.includes("fetch") || msg.includes("Failed to fetch")) {
        setError("Unable to connect to the server. Please check your internet connection and try again.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Choose your plan</h2>
      <p className="text-slate-500 text-sm mb-6">
        Start free, upgrade anytime. All plans include a 14-day trial.
      </p>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center bg-slate-100 rounded-2xl p-1 mb-6">
        {(["monthly", "yearly"] as const).map((cycle) => (
          <button
            key={cycle}
            onClick={() => updateData({ billingCycle: cycle })}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all text-center",
              data.billingCycle === cycle
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            )}
          >
            {cycle === "monthly" ? "Monthly" : "Yearly"}
            {cycle === "yearly" && (
              <span className="ml-1 text-xs text-teal-600 font-bold">Save 17%</span>
            )}
          </button>
        ))}
      </div>

      {/* Plan Cards */}
      <div className="space-y-3 mb-6">
        {(Object.keys(PLANS) as PlanId[]).map((planId) => {
          const plan = PLANS[planId];
          const price =
            data.billingCycle === "monthly"
              ? plan.monthlyPrice.INR
              : plan.yearlyPrice.INR;
          const isSelected = data.selectedPlan === planId;
          const isPopular = planId === "PRO";

          return (
            <button
              key={planId}
              onClick={() => updateData({ selectedPlan: planId })}
              className={cn(
                "w-full text-left border rounded-2xl p-4 transition-all relative",
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                  : "border-slate-200 hover:border-blue-200 bg-white"
              )}
            >
              {isPopular && (
                <span className="absolute -top-2.5 right-4 px-3 py-0.5 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Most Popular
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
                  </div>
                  {price > 0 && (
                    <div className="text-xs text-slate-500">
                      /{data.billingCycle === "monthly" ? "month" : "year"}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.features.slice(0, 4).map((feature) => (
                  <span key={feature} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                    <Check className="h-3 w-3 text-blue-600" /> {feature}
                  </span>
                ))}
                {plan.features.length > 4 && (
                  <span className="text-xs text-blue-600 font-medium px-2 py-1">
                    +{plan.features.length - 4} more
                  </span>
                )}
              </div>
              {/* Radio indicator */}
              <div className={cn(
                "absolute top-4 right-4 h-5 w-5 rounded-full border-2 flex items-center justify-center",
                isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300"
              )}>
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium mb-4">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="h-12 px-6 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={loading}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : data.selectedPlan === "FREE" ? (
            "Complete Registration"
          ) : (
            "Continue to Payment"
          )}
        </Button>
      </div>
    </div>
  );
}
