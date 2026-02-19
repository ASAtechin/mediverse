"use client";

import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">1. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            We collect information you provide during registration (name, email, phone, clinic details), usage data (how you interact with the platform), and device information (browser type, IP address).
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">2. How We Use Your Information</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Your information is used to provide and improve our Service, process payments, send important notifications, provide customer support, and comply with legal obligations.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">3. Patient Data</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Patient data entered into the platform is owned by you and your clinic. We process this data only to provide the Service. We do not use patient data for marketing, advertising, or any purpose other than delivering the Service. All patient data is encrypted at rest and in transit.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">4. Data Storage & Security</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Data is stored on secure cloud infrastructure with 256-bit AES encryption. We implement industry-standard security measures including firewalls, access controls, regular security audits, and automated backups. Our infrastructure is HIPAA-compliant.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">5. Data Sharing</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            We do not sell your personal information. We share data only with essential service providers (payment processors, cloud hosting) under strict data processing agreements, and when required by law or valid legal process.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">6. Cookies & Tracking</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            We use essential cookies for authentication and session management. Analytics cookies are optional and can be disabled. We do not use third-party advertising cookies.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">7. Your Rights</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            You have the right to access, correct, delete, or export your personal data at any time. You can request data deletion by contacting our support team. We comply with GDPR, DPDP Act 2023, and applicable data protection regulations.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">8. Data Retention</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            We retain account data for as long as your account is active. Upon account deletion, personal data is removed within 30 days. Anonymized usage data may be retained for analytics purposes.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">9. Children&apos;s Privacy</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">10. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            For privacy-related questions or data requests, contact our Data Protection Officer at{" "}
            <a href="mailto:privacy@clinicia.in" className="text-blue-600 hover:underline">privacy@clinicia.in</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
