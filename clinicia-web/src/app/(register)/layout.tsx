import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clinicia – Modern Clinic Management Software",
  description: "Streamline appointments, manage EMR, billing, and grow your practice with AI-powered tools. Trusted by 5,000+ clinics.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
