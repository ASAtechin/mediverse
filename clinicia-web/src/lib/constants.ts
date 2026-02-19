// ========================================
// Clinicia Registration Portal - Constants
// ========================================

// Subscription Plans
export const PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    description: 'Perfect for solo doctors just getting started',
    monthlyPrice: { INR: 0, USD: 0 },
    yearlyPrice: { INR: 0, USD: 0 },
    badge: null,
    features: [
      'Up to 50 patients',
      '1 doctor seat',
      '1 staff account',
      '100 appointments/month',
      '1 GB storage',
      'Basic EMR',
      'Email support',
      'CSV data export',
    ],
    limits: {
      patients: 50,
      doctors: 1,
      staff: 1,
      appointments: 100,
      storage: 1,
      sms: 0,
      aiScribe: 0,
    },
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    description: 'For growing clinics that need more power',
    monthlyPrice: { INR: 1999, USD: 25 },
    yearlyPrice: { INR: 19990, USD: 250 },
    badge: 'Most Popular',
    features: [
      'Unlimited patients',
      'Up to 5 doctor seats',
      '5 staff accounts',
      'Unlimited appointments',
      '10 GB storage',
      'Full EMR system',
      '500 SMS reminders/month',
      'AI Scribe (50 sessions)',
      'Chat + Email support',
      'CSV + PDF export',
      '30-day audit logs',
    ],
    limits: {
      patients: -1,
      doctors: 5,
      staff: 5,
      appointments: -1,
      storage: 10,
      sms: 500,
      aiScribe: 50,
    },
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'For hospital chains and large practices',
    monthlyPrice: { INR: 4999, USD: 60 },
    yearlyPrice: { INR: 49990, USD: 600 },
    badge: 'Best Value',
    features: [
      'Everything in Pro',
      'Unlimited doctor seats',
      'Unlimited staff accounts',
      'Unlimited appointments',
      '100 GB storage',
      'Unlimited SMS reminders',
      'WhatsApp integration',
      'Unlimited AI Scribe',
      'Custom domain',
      'API access',
      '24/7 priority phone support',
      'Dedicated account manager',
      'Branding removal',
      '1-year audit logs',
    ],
    limits: {
      patients: -1,
      doctors: -1,
      staff: -1,
      appointments: -1,
      storage: 100,
      sms: -1,
      aiScribe: -1,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Currency = 'INR' | 'USD';
export type BillingCycle = 'monthly' | 'yearly';

// Feature Comparison Table
export const FEATURE_COMPARISON = [
  { category: 'Core Features', features: [
    { name: 'Patients', free: 'Up to 50', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Doctor Seats', free: '1', pro: 'Up to 5', enterprise: 'Unlimited' },
    { name: 'Staff Accounts', free: '1', pro: '5', enterprise: 'Unlimited' },
    { name: 'Appointments/month', free: '100', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Storage', free: '1 GB', pro: '10 GB', enterprise: '100 GB' },
  ]},
  { category: 'Clinical Features', features: [
    { name: 'EMR System', free: 'Basic', pro: 'Full', enterprise: 'Full + Custom' },
    { name: 'AI Scribe', free: '—', pro: '50 sessions', enterprise: 'Unlimited' },
    { name: 'Prescription Management', free: '✓', pro: '✓', enterprise: '✓' },
    { name: 'Lab Reports', free: '✓', pro: '✓', enterprise: '✓' },
    { name: 'Vitals Tracking', free: '✓', pro: '✓', enterprise: '✓' },
  ]},
  { category: 'Communication', features: [
    { name: 'SMS Reminders', free: '—', pro: '500/month', enterprise: 'Unlimited' },
    { name: 'WhatsApp Integration', free: '—', pro: '—', enterprise: '✓' },
    { name: 'Email Notifications', free: '✓', pro: '✓', enterprise: '✓' },
  ]},
  { category: 'Business Features', features: [
    { name: 'Billing & Invoicing', free: 'Basic', pro: 'Advanced', enterprise: 'Advanced + Custom' },
    { name: 'Inventory Management', free: '—', pro: '✓', enterprise: '✓' },
    { name: 'Expense Tracking', free: '—', pro: '✓', enterprise: '✓' },
    { name: 'Data Export', free: 'CSV', pro: 'CSV + PDF', enterprise: 'CSV + PDF + API' },
    { name: 'Custom Domain', free: '—', pro: '—', enterprise: '✓' },
    { name: 'API Access', free: '—', pro: '—', enterprise: '✓' },
    { name: 'Branding Removal', free: '—', pro: '—', enterprise: '✓' },
  ]},
  { category: 'Support', features: [
    { name: 'Support Level', free: 'Email', pro: 'Email + Chat', enterprise: '24/7 Phone + Dedicated AM' },
    { name: 'Audit Logs', free: '—', pro: '30 days', enterprise: '1 year' },
    { name: 'Onboarding Help', free: 'Self-serve', pro: 'Guided', enterprise: 'White-glove' },
  ]},
];

// Medical Specialties
export const SPECIALTIES = [
  { id: 'general', label: 'General Medicine', icon: 'Stethoscope' },
  { id: 'dental', label: 'Dentistry', icon: 'SmilePlus' },
  { id: 'cardiology', label: 'Cardiology', icon: 'Heart' },
  { id: 'orthopedics', label: 'Orthopedics', icon: 'Bone' },
  { id: 'pediatrics', label: 'Pediatrics', icon: 'Baby' },
  { id: 'dermatology', label: 'Dermatology', icon: 'Palette' },
  { id: 'ophthalmology', label: 'Ophthalmology', icon: 'Eye' },
  { id: 'ent', label: 'ENT', icon: 'Ear' },
  { id: 'gynecology', label: 'Gynecology', icon: 'HeartPulse' },
  { id: 'neurology', label: 'Neurology', icon: 'Brain' },
  { id: 'psychiatry', label: 'Psychiatry', icon: 'BrainCircuit' },
  { id: 'urology', label: 'Urology', icon: 'Stethoscope' },
  { id: 'oncology', label: 'Oncology', icon: 'Microscope' },
  { id: 'physiotherapy', label: 'Physiotherapy', icon: 'Activity' },
  { id: 'ayurveda', label: 'Ayurveda', icon: 'Leaf' },
  { id: 'homeopathy', label: 'Homeopathy', icon: 'FlaskConical' },
];

// Clinic Types
export const CLINIC_TYPES = [
  { id: 'solo', label: 'Solo Practice', description: 'Single doctor practice' },
  { id: 'group', label: 'Group Practice', description: 'Multiple doctors' },
  { id: 'hospital', label: 'Hospital', description: 'Full hospital setup' },
  { id: 'chain', label: 'Clinic Chain', description: 'Multiple locations' },
];

// FAQ Data
export const FAQS = [
  {
    question: 'What happens after my free trial ends?',
    answer: 'Your account automatically converts to the FREE plan with limited features. You won\'t be charged unless you choose to upgrade. All your data remains safe and accessible.',
  },
  {
    question: 'Is my patient data secure?',
    answer: 'Absolutely. We use bank-level encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Our infrastructure is HIPAA-compliant, and we conduct regular security audits. Your data is hosted on secure cloud servers with 99.9% uptime.',
  },
  {
    question: 'Can I import data from my existing system?',
    answer: 'Yes! We support bulk import via CSV files for patients, appointments, and medical records. Our onboarding team can also help you migrate from popular EMR systems. Enterprise customers get dedicated migration support.',
  },
  {
    question: 'Do you offer training for my staff?',
    answer: 'Free plan users get access to our help center and video tutorials. Pro users get guided onboarding sessions. Enterprise customers receive dedicated white-glove training for their entire team.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), net banking, and wallets. For enterprise plans, we also support wire transfers and purchase orders.',
  },
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades apply at the end of your current billing cycle.',
  },
  {
    question: 'Is there a refund policy?',
    answer: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, contact us within 30 days for a full refund — no questions asked.',
  },
  {
    question: 'Do you support multiple clinic locations?',
    answer: 'Enterprise plan supports unlimited locations with centralized management. Each location gets its own dashboard while administrators can view consolidated reports across all locations.',
  },
];

// Testimonials
export const TESTIMONIALS = [
  {
    name: 'Dr. Priya Sharma',
    role: 'General Physician',
    clinic: 'City Health Clinic, Mumbai',
    rating: 5,
    quote: 'Clinicia transformed how we run our clinic. Patient no-shows dropped by 60% with automated reminders!',
    avatar: '/testimonials/priya.jpg',
  },
  {
    name: 'Dr. Rajesh Patel',
    role: 'Orthopedic Surgeon',
    clinic: 'Patel Ortho Center, Ahmedabad',
    rating: 5,
    quote: 'The AI Scribe feature saves me 2 hours daily on documentation. It\'s like having a personal assistant.',
    avatar: '/testimonials/rajesh.jpg',
  },
  {
    name: 'Dr. Ananya Iyer',
    role: 'Pediatrician',
    clinic: 'Rainbow Kids Clinic, Bangalore',
    rating: 5,
    quote: 'Setting up took just 10 minutes. Parents love the online booking and digital prescriptions.',
    avatar: '/testimonials/ananya.jpg',
  },
  {
    name: 'Dr. Mohammed Khan',
    role: 'Dentist',
    clinic: 'Smile Dental Studio, Delhi',
    rating: 5,
    quote: 'Billing, appointments, patient records — everything in one place. Best decision we made for our practice.',
    avatar: '/testimonials/mohammed.jpg',
  },
];

// Landing Features
export const LANDING_FEATURES = [
  {
    title: 'Smart Appointment Scheduling',
    description: 'AI-powered scheduling that learns your preferences and optimizes your calendar automatically. Reduce no-shows by 60%.',
    icon: 'CalendarDays',
    size: 'wide' as const,
  },
  {
    title: 'Patient Management',
    description: '360° patient view with complete medical history, vitals tracking, and digital records at your fingertips.',
    icon: 'Users',
    size: 'tall' as const,
  },
  {
    title: 'Digital EMR',
    description: 'Go paperless with comprehensive electronic medical records. Fast, searchable, and secure.',
    icon: 'FileText',
    size: 'sm' as const,
  },
  {
    title: 'Smart Billing',
    description: 'Automated invoicing with GST support, payment tracking, and financial reports.',
    icon: 'IndianRupee',
    size: 'sm' as const,
  },
  {
    title: 'Inventory Tracking',
    description: 'Track medicines, supplies, and equipment with low-stock alerts.',
    icon: 'Package',
    size: 'sm' as const,
  },
  {
    title: 'AI Scribe',
    description: 'Voice-to-clinical-notes powered by AI. Just speak — we\'ll handle the documentation.',
    icon: 'Mic',
    size: 'sm' as const,
    badge: 'NEW',
  },
];

// Coupon codes (demo - in production these would be in DB)
export const DEMO_COUPONS: Record<string, { discount: number; type: 'percent' | 'fixed'; description: string }> = {
  'WELCOME20': { discount: 20, type: 'percent', description: '20% off your first purchase' },
  'SAVE500': { discount: 500, type: 'fixed', description: '₹500 off' },
  'LAUNCH50': { discount: 50, type: 'percent', description: '50% off — Launch offer!' },
};
