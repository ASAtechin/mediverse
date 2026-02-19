"use client";

import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export default function CookiePolicyPage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: February 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">1. What Are Cookies</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our platform, and improving our services.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">2. Types of Cookies We Use</h2>

          <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-2">2.1 Essential Cookies</h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            These cookies are necessary for the website to function properly. They enable core functionality such as authentication, security, and session management. You cannot opt out of these cookies as the service would not work without them.
          </p>
          <ul className="list-disc list-inside text-slate-600 mb-4 space-y-1">
            <li><strong>__session</strong> — Authentication session token (expires: 60 minutes)</li>
            <li><strong>cookie-consent</strong> — Records your cookie consent preference (expires: 1 year)</li>
          </ul>

          <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-2">2.2 Performance Cookies</h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            These cookies collect information about how you use our website, such as which pages you visit most often. This data helps us improve the website&apos;s performance and your user experience. All information collected is aggregated and anonymous.
          </p>

          <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-2">2.3 Functional Cookies</h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            These cookies allow the website to remember choices you make (such as your language or region) and provide enhanced, more personalized features. They may also be used to provide services you have requested, such as watching a video or commenting on a blog.
          </p>

          <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-2">2.4 Targeting/Advertising Cookies</h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites. We currently do not use advertising cookies, but may introduce them in the future with proper notice.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">3. Third-Party Cookies</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Some cookies are placed by third-party services that appear on our pages. We use the following third-party services that may set cookies:
          </p>
          <ul className="list-disc list-inside text-slate-600 mb-4 space-y-1">
            <li><strong>Firebase (Google)</strong> — Authentication and analytics</li>
            <li><strong>Razorpay</strong> — Payment processing (only on checkout pages)</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">4. Managing Cookies</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            You can control and manage cookies in several ways:
          </p>
          <ul className="list-disc list-inside text-slate-600 mb-4 space-y-1">
            <li><strong>Cookie Consent Banner:</strong> When you first visit our site, you can choose to accept all cookies or only essential ones.</li>
            <li><strong>Browser Settings:</strong> Most browsers allow you to manage cookies through their settings. You can set your browser to refuse cookies, delete cookies, or alert you when a cookie is being sent.</li>
            <li><strong>Opt-Out Links:</strong> Some third-party services provide their own opt-out mechanisms.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mb-4">
            Please note that disabling cookies may affect the functionality of our service. Essential cookies cannot be disabled as they are required for the platform to operate.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">5. Data Protection</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Our use of cookies complies with the General Data Protection Regulation (GDPR), India&apos;s Digital Personal Data Protection Act 2023 (DPDP Act), and other applicable privacy laws. For more information about how we protect your data, please see our{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">6. Updates to This Policy</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            We may update this Cookie Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with a revised &quot;Last Updated&quot; date.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">7. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            If you have questions about our use of cookies, please contact us at{" "}
            <a href="mailto:privacy@clinicia.in" className="text-blue-600 hover:underline">privacy@clinicia.in</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
