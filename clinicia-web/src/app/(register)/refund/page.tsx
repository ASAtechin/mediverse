"use client";

import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/register" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link href="/register" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">Clinicia</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Refund & Cancellation Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: February 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">1. Free Trial</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            All paid plans include a 14-day free trial period. During the trial period, you can explore all features without any charge. No credit card is required to start a trial. If you do not upgrade to a paid plan before the trial ends, your account will automatically revert to the Free plan.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">2. Subscription Cancellation</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            You may cancel your subscription at any time through your account settings or by contacting our support team. Upon cancellation:
          </p>
          <ul className="list-disc list-inside text-slate-600 mb-4 space-y-1">
            <li>Your subscription will remain active until the end of the current billing cycle.</li>
            <li>You will not be charged for subsequent billing periods.</li>
            <li>Your data will be retained for 90 days after cancellation, after which it may be permanently deleted.</li>
            <li>You can export your data at any time before or during the retention period.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">3. Refund Eligibility</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            We offer refunds under the following circumstances:
          </p>

          <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-2">3.1 Full Refund (within 30 days)</h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            If you are not satisfied with the service, you may request a full refund within 30 days of your first paid subscription purchase. This applies to new customers only and can be claimed once.
          </p>

          <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-2">3.2 Pro-Rated Refund</h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            If you downgrade from a higher-tier plan to a lower-tier plan mid-cycle, the difference will be credited to your account and applied to future billing. Direct monetary refunds for downgrades are not provided.
          </p>

          <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-2">3.3 Service Outage</h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            If the Clinicia platform experiences significant unplanned downtime (exceeding 24 continuous hours or 72 cumulative hours in a billing month), affected customers may request a proportional service credit.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">4. Non-Refundable Items</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The following are not eligible for refunds:
          </p>
          <ul className="list-disc list-inside text-slate-600 mb-4 space-y-1">
            <li>Subscription fees after the 30-day money-back window</li>
            <li>Setup fees, data migration services, or custom development work</li>
            <li>Accounts terminated for violation of our Terms of Service</li>
            <li>Third-party integrations or add-ons purchased separately</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">5. How to Request a Refund</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            To request a refund, please:
          </p>
          <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-1">
            <li>Email us at <a href="mailto:billing@clinicia.in" className="text-blue-600 hover:underline">billing@clinicia.in</a> with your registered email and reason for refund.</li>
            <li>Include your payment/transaction ID (found in your account settings or payment confirmation email).</li>
            <li>Our team will review your request within 3-5 business days.</li>
          </ol>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">6. Refund Processing</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Approved refunds will be processed using the original payment method within 7-10 business days. For UPI and net banking payments, refunds may take up to 14 business days to reflect in your account depending on your bank.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">7. Plan Changes</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            You can upgrade or downgrade your subscription plan at any time:
          </p>
          <ul className="list-disc list-inside text-slate-600 mb-4 space-y-1">
            <li><strong>Upgrades:</strong> Take effect immediately. You will be charged a pro-rated amount for the remainder of your current billing cycle.</li>
            <li><strong>Downgrades:</strong> Take effect at the end of your current billing cycle. You will retain access to higher-tier features until the cycle ends.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">8. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            For any billing or refund questions, contact us at:
          </p>
          <ul className="list-disc list-inside text-slate-600 mb-4 space-y-1">
            <li>Email: <a href="mailto:billing@clinicia.in" className="text-blue-600 hover:underline">billing@clinicia.in</a></li>
            <li>Support: <a href="mailto:support@clinicia.in" className="text-blue-600 hover:underline">support@clinicia.in</a></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
