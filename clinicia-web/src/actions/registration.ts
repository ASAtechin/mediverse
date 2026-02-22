'use server';

import { prisma } from "@/lib/db";
import crypto from "crypto";

interface RegisterClinicInput {
  firebaseUid: string;
  email: string;
  fullName: string;
  phone: string;
  clinicName: string;
  clinicType: string;
  specialties: string[];
  address: string;
  city: string;
  state: string;
  pincode: string;
  plan: string;
  billingCycle: string;
}

export async function registerClinic(input: RegisterClinicInput) {
  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      // Link firebase UID if the user already exists
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { firebaseUid: input.firebaseUid },
      });
      return { success: true, userId: existingUser.id, clinicId: existingUser.clinicId, existing: true };
    }

    // 2. Check if user exists by firebaseUid
    const existingByUid = await prisma.user.findUnique({
      where: { firebaseUid: input.firebaseUid },
    });

    if (existingByUid) {
      return { success: true, userId: existingByUid.id, clinicId: existingByUid.clinicId, existing: true };
    }

    // 3. Create Clinic
    const fullAddress = [input.address, input.city, input.state, input.pincode]
      .filter(Boolean)
      .join(", ");

    const clinic = await prisma.clinic.create({
      data: {
        name: input.clinicName || `${input.fullName}'s Clinic`,
        address: fullAddress || undefined,
        phone: input.phone || undefined,
        email: input.email,
        ownerId: input.firebaseUid,
        status: input.plan === "FREE" ? "ACTIVE" : "TRIAL",
        plan: input.plan || "FREE",
      },
    });

    // 4. Create User (ADMIN role — clinic owner)
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.fullName,
        firebaseUid: input.firebaseUid,
        role: "ADMIN",
        clinicId: clinic.id,
      },
    });

    // 5. If paid plan, create a pending subscription record
    if (input.plan !== "FREE") {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

      await prisma.subscription.create({
        data: {
          clinicId: clinic.id,
          provider: "RAZORPAY", // Default for Indian users
          providerSubId: "pending_" + clinic.id, // Will be updated after payment
          status: "TRIAL",
          planId: input.plan,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          cancelAtPeriodEnd: false,
        },
      });
    }

    return {
      success: true,
      userId: user.id,
      clinicId: clinic.id,
      existing: false,
    };
  } catch (error: any) {
    console.error("[REGISTER] Error:", error);
    // Ensure we return a plain, serializable error message
    const errorMessage = typeof error?.message === 'string' 
      ? error.message.slice(0, 500) 
      : "Registration failed";
    return { success: false, error: errorMessage };
  }
}

export async function validateCoupon(code: string, planId: string) {
  // Load coupons from env (JSON string) for easy configuration without redeployment
  // Format: { "CODE": { "discount": 20, "type": "percent", "description": "...", "validPlans": ["PRO"] } }
  const envCoupons = process.env.COUPON_CODES;
  if (!envCoupons) {
    return { valid: false, error: "Coupon codes are not configured" };
  }

  let coupons: Record<string, { discount: number; type: 'percent' | 'fixed'; description: string; validPlans?: string[] }>;
  try {
    coupons = JSON.parse(envCoupons);
  } catch {
    return { valid: false, error: "Invalid coupon configuration" };
  }

  const normalizedCode = code.toUpperCase().trim();
  const coupon = coupons[normalizedCode];

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }

  if (coupon.validPlans && !coupon.validPlans.includes(planId)) {
    return { valid: false, error: "This coupon is not valid for the selected plan" };
  }

  return {
    valid: true,
    discount: coupon.discount,
    type: coupon.type,
    description: coupon.description,
  };
}

export async function completePayment(input: {
  clinicId: string;
  paymentId: string;
  orderId: string;
  signature: string;
  plan: string;
  billingCycle: string;
  amount: number;
}) {
  try {
    // Verify Razorpay payment signature
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (razorpaySecret) {
      const expectedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(`${input.orderId}|${input.paymentId}`)
        .digest("hex");

      if (expectedSignature !== input.signature) {
        console.error("[PAYMENT] Signature mismatch — possible tampered payment");
        return { success: false, error: "Payment verification failed" };
      }
    } else if (process.env.NODE_ENV === "production") {
      console.error("[PAYMENT] RAZORPAY_KEY_SECRET not configured in production");
      return { success: false, error: "Payment system misconfigured" };
    } else {
      console.warn("[PAYMENT] RAZORPAY_KEY_SECRET not set — skipping verification in dev");
    }

    const now = new Date();
    const periodEnd = new Date(now);
    if (input.billingCycle === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Update or create subscription
    const existing = await prisma.subscription.findUnique({
      where: { clinicId: input.clinicId },
    });

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          provider: "RAZORPAY",
          providerSubId: input.paymentId,
          status: "ACTIVE",
          planId: input.plan,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          clinicId: input.clinicId,
          provider: "RAZORPAY",
          providerSubId: input.paymentId,
          status: "ACTIVE",
          planId: input.plan,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      });
    }

    // Update clinic plan and status
    await prisma.clinic.update({
      where: { id: input.clinicId },
      data: {
        plan: input.plan,
        status: "ACTIVE",
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[PAYMENT] Error completing payment:", error);
    return { success: false, error: error.message };
  }
}

export async function getClinicByOwner(firebaseUid: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        clinic: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!user) return { success: false, error: "User not found" };

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      clinic: {
        id: user.clinic.id,
        name: user.clinic.name,
        plan: user.clinic.plan,
        status: user.clinic.status,
        subscription: user.clinic.subscription,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
