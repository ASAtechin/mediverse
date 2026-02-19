"use client";

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

export default function LandingPage() {
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
