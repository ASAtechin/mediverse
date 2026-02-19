import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Razorpay API base URL
const RAZORPAY_API = "https://api.razorpay.com/v1";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", plan, clinicId, billingCycle } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // If Razorpay credentials are configured, create a real order
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

      const orderResponse = await fetch(`${RAZORPAY_API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Razorpay expects paise
          currency,
          receipt: `rcpt_${clinicId}_${Date.now()}`,
          notes: {
            plan,
            clinicId,
            billingCycle,
          },
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        console.error("[RAZORPAY] Order creation failed:", error);
        return NextResponse.json(
          { error: "Failed to create payment order" },
          { status: 500 }
        );
      }

      const order = await orderResponse.json();
      return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID,
      });
    }

    // Demo mode: generate a mock order ID
    const mockOrderId = `order_demo_${crypto.randomBytes(8).toString("hex")}`;
    return NextResponse.json({
      orderId: mockOrderId,
      amount: Math.round(amount * 100),
      currency,
      keyId: "rzp_test_demo",
      demo: true,
    });
  } catch (error: any) {
    console.error("[RAZORPAY] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
