"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Landing page components (same as /register)
import { Header } from "@/components/register/Header";
import { HeroSection } from "@/components/register/HeroSection";
import { FeaturesSection } from "@/components/register/FeaturesSection";
import { HowItWorksSection } from "@/components/register/HowItWorksSection";
import { PricingSection } from "@/components/register/PricingSection";
import { TestimonialsSection } from "@/components/register/TestimonialsSection";
import { FAQSection } from "@/components/register/FAQSection";
import { CTASection } from "@/components/register/CTASection";
import { Footer } from "@/components/register/Footer";
import { CookieConsent } from "@/components/register/CookieConsent";

/**
 * Root page (/) — Gateway:
 * - If authenticated: redirect to /dashboard
 * - If not authenticated: show the Clinicia landing page with pricing, features, etc.
 */
export default function RootGatewayPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // While checking auth, show minimal loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If user is authenticated, show loader while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Not authenticated — show the full Clinicia landing page
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <CookieConsent />
    </div>
  );
}
