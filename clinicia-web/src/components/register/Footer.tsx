"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Twitter, Linkedin, Youtube, Instagram, Mail, CheckCircle2 } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/register#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "How It Works", href: "/register#how-it-works" },
    { label: "Testimonials", href: "/register#testimonials" },
    { label: "FAQ", href: "/register#faq" },
  ],
  Company: [
    { label: "About Us", href: "mailto:info@clinicia.in" },
    { label: "Contact", href: "mailto:support@clinicia.in" },
    { label: "Careers", href: "mailto:careers@clinicia.in" },
  ],
  Resources: [
    { label: "Help Center", href: "mailto:support@clinicia.in" },
    { label: "API Docs", href: "/register#features" },
    { label: "Get Started", href: "/register/signup" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refund" },
    { label: "HIPAA Compliance", href: "/privacy" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/clinicia", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/clinicia", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@clinicia", label: "YouTube" },
  { icon: Instagram, href: "https://instagram.com/clinicia", label: "Instagram" },
];

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [nlEmail, setNlEmail] = useState("");

  const handleSubscribe = () => {
    if (nlEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nlEmail)) {
      setSubscribed(true);
      setNlEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">Clinicia</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Modern clinic management for healthcare professionals. Trusted by 5,000+ clinics across India.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                Subscribe to our newsletter
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Get product updates, tips, and healthcare insights.
              </p>
            </div>
            <div className="flex w-full sm:w-auto gap-2">
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Thanks for subscribing!
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={nlEmail}
                    onChange={(e) => setNlEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    className="flex-1 sm:w-64 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Clinicia. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors group"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
