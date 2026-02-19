"use client";

import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            By accessing and using the Clinicia platform (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">2. Description of Service</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Clinicia provides a cloud-based clinic management platform that includes patient records management, appointment scheduling, billing, prescription management, and AI-assisted diagnostic tools for healthcare professionals.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">3. Account Registration</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            You must provide accurate, complete, and current registration information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">4. Subscription & Payments</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Paid plans are billed on a recurring basis (monthly or annually). You authorize us to charge your designated payment method. Prices are subject to change with 30 days advance notice. All fees are non-refundable except as required by law or as explicitly stated.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">5. Data Ownership</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            You retain full ownership of all patient data and medical records stored on the platform. Clinicia does not claim ownership over your data and will not access, sell, or share your data with third parties except as required by law.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">6. HIPAA Compliance</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Clinicia implements appropriate technical and organizational measures to comply with applicable healthcare data protection regulations. We sign Business Associate Agreements (BAA) with applicable covered entities.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">7. Acceptable Use</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            You agree not to misuse the Service, attempt to gain unauthorized access, interfere with other users, or use the platform for any unlawful purpose.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">8. Termination</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Either party may terminate the subscription at any time. Upon termination, you will have 30 days to export your data. After this period, data may be permanently deleted.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">9. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Clinicia shall not be liable for any indirect, incidental, special, or consequential damages. Our total liability shall not exceed the amount paid by you in the twelve months prior to the claim.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">10. Contact</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            For questions about these Terms, please contact us at{" "}
            <a href="mailto:legal@clinicia.in" className="text-blue-600 hover:underline">legal@clinicia.in</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
