"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Menu, X, ChevronDown,
  Calendar, Users, FileText, CreditCard, Mic, Package,
  HelpCircle, BookOpen, Code, Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href?: string;
  dropdown?: { label: string; href: string; icon: any; badge?: string; desc?: string }[];
};

const navItems: NavItem[] = [
  {
    label: "Features",
    dropdown: [
      { label: "Appointments", href: "/register#features", icon: Calendar, desc: "Smart scheduling & reminders" },
      { label: "Patient Management", href: "/register#features", icon: Users, desc: "360° patient profiles" },
      { label: "EMR", href: "/register#features", icon: FileText, desc: "Digital medical records" },
      { label: "Billing", href: "/register#features", icon: CreditCard, desc: "GST invoices & payments" },
      { label: "Inventory", href: "/register#features", icon: Package, desc: "Stock & expiry tracking" },
      { label: "AI Scribe", href: "/register#features", icon: Mic, badge: "NEW", desc: "Voice-to-clinical-notes" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/register#how-it-works" },
  {
    label: "Resources",
    dropdown: [
      { label: "Help Center", href: "mailto:support@clinicia.in", icon: HelpCircle, desc: "FAQs & support" },
      { label: "Blog", href: "/register#faq", icon: BookOpen, desc: "Tips & healthcare insights" },
      { label: "API Docs", href: "/register#features", icon: Code, desc: "Developer documentation" },
      { label: "Webinars", href: "mailto:info@clinicia.in", icon: Video, desc: "Live demos & tutorials" },
    ],
  },
];

function DropdownMenu({ items, scrolled, onClose }: {
  items: NonNullable<NavItem["dropdown"]>;
  scrolled: boolean;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 overflow-hidden"
    >
      <div className="p-2">
        {items.map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className="h-9 w-9 shrink-0 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <item.icon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.desc && (
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  // Flatten for mobile menu
  const mobileItems = navItems.flatMap((item) =>
    item.dropdown
      ? [{ label: item.label, href: item.dropdown[0].href, isHeader: true }, ...item.dropdown.map(d => ({ label: d.label, href: d.href, isHeader: false }))]
      : [{ label: item.label, href: item.href!, isHeader: false }]
  );

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                scrolled ? "bg-blue-600" : "bg-white/10 backdrop-blur-sm border border-white/20"
              )}>
                <Activity className={cn("h-5 w-5", scrolled ? "text-white" : "text-blue-400")} />
              </div>
              <span className={cn(
                "font-bold text-xl tracking-tight transition-colors",
                scrolled ? "text-slate-900" : "text-white"
              )}>
                Clinicia
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
                  onMouseLeave={item.dropdown ? handleMouseLeave : undefined}
                >
                  {item.dropdown ? (
                    <button
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1",
                        scrolled
                          ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {item.label}
                      <ChevronDown className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        openDropdown === item.label && "rotate-180"
                      )} />
                    </button>
                  ) : (
                    <Link
                      href={item.href!}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        scrolled
                          ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.dropdown && openDropdown === item.label && (
                      <DropdownMenu
                        items={item.dropdown}
                        scrolled={scrolled}
                        onClose={() => setOpenDropdown(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  scrolled
                    ? "text-slate-700 hover:text-slate-900"
                    : "text-white/90 hover:text-white"
                )}
              >
                Login
              </Link>
              <Link
                href="/register/signup"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/25 active:scale-[0.97]"
              >
                Get Started →
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "lg:hidden p-2 rounded-lg transition-colors",
                scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
              )}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-4 overflow-y-auto py-20">
              {mobileItems.filter(m => !m.isHeader).map((item, i) => (
                <motion.div
                  key={`${item.label}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-xl font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3 mt-6"
              >
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-8 py-3 text-white/80 text-center font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register/signup"
                  onClick={() => setMobileOpen(false)}
                  className="px-8 py-3 bg-blue-600 text-white text-center font-semibold rounded-xl"
                >
                  Get Started →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
