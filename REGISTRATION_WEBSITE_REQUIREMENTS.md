# Clinicia Registration & Payment Portal - Complete Requirements Document

## Project Overview

**Project Name:** Clinicia Registration Portal  
**Purpose:** Self-service registration and subscription payment portal for healthcare clinics to onboard themselves to the Clinicia SaaS platform.  
**Target Users:** Healthcare clinic owners, doctors, and medical practice administrators who want to subscribe to Clinicia services.

---

## 1. System Architecture

### 1.1 Technology Stack (Aligned with Existing Clinicia Project)

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 14+ (App Router) with React Server Components |
| UI Library | React 18+ with TypeScript |
| Styling | Tailwind CSS 3.4+ with CSS Variables |
| UI Components | shadcn/ui component library + Radix UI primitives |
| Animations | Framer Motion 11+ for page transitions, micro-interactions |
| 3D Graphics | Three.js / React Three Fiber for hero animations |
| Icons | Lucide React (consistent with existing apps) |
| Authentication | Firebase Authentication (Email, Google, Apple, Phone OTP) |
| Database | MongoDB (via Prisma ORM) |
| Payment Gateway | Stripe (International) + Razorpay (India) |
| Backend API | Express.js (existing `clinicia-backend`) |
| Email Service | SendGrid / AWS SES with React Email templates |
| File Storage | Firebase Storage / AWS S3 for logos, documents |
| Hosting | Vercel (Frontend) / Railway/Render (Backend) |
| CDN | Vercel Edge Network / Cloudflare |
| Analytics | Google Analytics 4, Mixpanel, Hotjar |
| Error Tracking | Sentry for error monitoring |
| A/B Testing | PostHog / Vercel Experimentation |

### 1.2 Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLINICIA ECOSYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐     ┌──────────────────┐                   │
│  │ REGISTRATION    │────▶│ clinicia-backend │                   │
│  │ PORTAL (NEW)    │     │   (Express API)  │                   │
│  └────────┬────────┘     └────────┬─────────┘                   │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌─────────────────┐     ┌──────────────────┐                   │
│  │  Firebase Auth  │     │    MongoDB       │                   │
│  │  (Shared)       │     │   (Shared DB)    │                   │
│  └─────────────────┘     └──────────────────┘                   │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌─────────────────┐     ┌──────────────────┐     ┌───────────┐ │
│  │ clinicia-web    │     │ clinicia-admin   │     │ clinicia- │ │
│  │ (Tenant App)    │     │ (Super Admin)    │     │ mobile    │ │
│  └─────────────────┘     └──────────────────┘     └───────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Design System Foundation

```typescript
// Design Tokens - colors.ts
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#E8F5FE',
    100: '#C5E4FC',
    200: '#9DD2FA',
    300: '#64BAF7',
    400: '#38A5F2',
    500: '#0D8FED', // Main brand blue
    600: '#0B7ACC',
    700: '#0962A8',
    800: '#074B82',
    900: '#053660',
  },
  // Secondary - Teal/Mint for healthcare feel
  secondary: {
    50: '#E6FAF8',
    100: '#B3F0E9',
    200: '#80E6DA',
    300: '#4DDCCB',
    400: '#26D4BF',
    500: '#00CCB3', // Mint accent
    600: '#00B39D',
    700: '#009982',
    800: '#007F6B',
    900: '#005C4D',
  },
  // Success, Warning, Error
  success: { 500: '#10B981' },
  warning: { 500: '#F59E0B' },
  error: { 500: '#EF4444' },
  // Neutral grays
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Cal Sans', 'Inter', 'sans-serif'], // For headlines
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
    'display-md': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
    'display-sm': ['1.875rem', { lineHeight: '1.3' }],
    'display-xs': ['1.5rem', { lineHeight: '1.4' }],
    'body-xl': ['1.25rem', { lineHeight: '1.6' }],
    'body-lg': ['1.125rem', { lineHeight: '1.6' }],
    'body-md': ['1rem', { lineHeight: '1.6' }],
    'body-sm': ['0.875rem', { lineHeight: '1.5' }],
    'body-xs': ['0.75rem', { lineHeight: '1.5' }],
  },
};

// Spacing & Layout
export const spacing = {
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1440px',
  },
  section: {
    sm: '3rem',    // 48px
    md: '5rem',    // 80px
    lg: '7rem',    // 112px
    xl: '9rem',    // 144px
  },
};

// Shadow System
export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  glow: '0 0 20px rgb(13 143 237 / 0.3)', // Brand glow effect
  'glow-lg': '0 0 40px rgb(13 143 237 / 0.4)',
};

// Animation Presets
export const animations = {
  ease: {
    default: [0.25, 0.1, 0.25, 1],
    in: [0.4, 0, 1, 1],
    out: [0, 0, 0.2, 1],
    inOut: [0.4, 0, 0.2, 1],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
    bounce: { type: 'spring', stiffness: 400, damping: 10 },
  },
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
  },
};
```

---

## 2. User Journey & Features

### 2.1 Complete User Flow with Micro-Interactions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER REGISTRATION JOURNEY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. LANDING PAGE                                                      │    │
│  │    ├─▶ Hero with animated 3D medical dashboard mockup                │    │
│  │    ├─▶ Scroll-triggered feature reveals with staggered animations   │    │
│  │    ├─▶ Interactive pricing calculator                                │    │
│  │    ├─▶ Video testimonials with autoplay                              │    │
│  │    ├─▶ Live chat widget (Intercom/Crisp)                             │    │
│  │    └─▶ Sticky header with CTA that morphs on scroll                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 2. SIGN UP (Multi-step Wizard)                                       │    │
│  │    ├─▶ Step 1: Email + Password with real-time validation           │    │
│  │    │   └─ Social logins: Google, Apple (floating buttons)           │    │
│  │    ├─▶ Step 2: OTP Verification (animated code input)               │    │
│  │    ├─▶ Step 3: Clinic Details (smart form with autocomplete)        │    │
│  │    ├─▶ Step 4: Plan Selection (interactive 3D cards)                │    │
│  │    └─▶ Progress bar with step labels (animated transitions)         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 3. PAYMENT CHECKOUT                                                  │    │
│  │    ├─▶ Split-screen: Order Summary + Payment Form                   │    │
│  │    ├─▶ Real-time coupon validation with confetti on success         │    │
│  │    ├─▶ Payment method tabs with smooth transitions                  │    │
│  │    ├─▶ 3D Secure modal handling                                     │    │
│  │    └─▶ Loading state with animated progress indicators              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 4. SUCCESS & ONBOARDING                                              │    │
│  │    ├─▶ Celebratory animation (confetti + checkmark)                 │    │
│  │    ├─▶ Interactive welcome checklist                                 │    │
│  │    ├─▶ QR code for mobile app download                              │    │
│  │    ├─▶ Quick-start video tour                                       │    │
│  │    └─▶ Dashboard preview with "Launch" CTA                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Page-by-Page Requirements with Advanced UI Specifications

### 3.1 Landing Page (`/`)

**Purpose:** High-converting marketing page with premium feel, targeting healthcare professionals.

---

#### 3.1.1 Navigation Header

**Design:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   [Logo]    Features ▾    Pricing    Resources ▾    About    |  Login  [Get Started →] │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- **Default State:** Transparent background, white text (on hero)
- **Scrolled State:** Frosted glass effect (`backdrop-blur-xl`), white background with 80% opacity
- **Transition:** Smooth 300ms ease-out
- **Sticky:** Fixed to top on scroll
- **Mobile:** Hamburger menu with full-screen overlay, staggered menu item animations

**Code Structure:**
```tsx
// components/landing/Header.tsx
interface HeaderProps {
  transparent?: boolean;
}

const navItems = [
  {
    label: 'Features',
    href: '/features',
    dropdown: [
      { label: 'Patient Management', href: '/features/patients', icon: Users },
      { label: 'Appointments', href: '/features/appointments', icon: Calendar },
      { label: 'EMR', href: '/features/emr', icon: FileText },
      { label: 'Billing', href: '/features/billing', icon: CreditCard },
      { label: 'AI Scribe', href: '/features/ai-scribe', icon: Mic, badge: 'NEW' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  {
    label: 'Resources',
    dropdown: [
      { label: 'Blog', href: '/blog' },
      { label: 'Help Center', href: '/help' },
      { label: 'API Docs', href: '/docs' },
      { label: 'Webinars', href: '/webinars' },
    ],
  },
  { label: 'About', href: '/about' },
];
```

**Dropdown Animation:**
```typescript
const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.15 }
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.2,
      staggerChildren: 0.05 
    }
  },
};
```

---

#### 3.1.2 Hero Section

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌────────────────────────────┐    ┌─────────────────────────────────────┐  │
│  │                            │    │                                     │  │
│  │   🏥 #1 Clinic Software    │    │     ╭─────────────────────────────╮ │  │
│  │                            │    │     │                             │ │  │
│  │   Transform Your           │    │     │   [3D Dashboard Preview]    │ │  │
│  │   Healthcare Practice      │    │     │                             │ │  │
│  │                            │    │     │   - Live appointment view   │ │  │
│  │   Streamline appointments, │    │     │   - Patient cards floating  │ │  │
│  │   manage EMR, billing,     │    │     │   - Real-time updates       │ │  │
│  │   and grow your practice   │    │     │                             │ │  │
│  │   with AI-powered tools.   │    │     ╰─────────────────────────────╯ │  │
│  │                            │    │                                     │  │
│  │   [Start Free Trial]       │    │   Trusted by 5,000+ clinics         │  │
│  │   [Watch Demo →]           │    │   ⭐⭐⭐⭐⭐ 4.9/5 rating             │  │
│  │                            │    │                                     │  │
│  │   ✓ No credit card needed  │    │   [Logo] [Logo] [Logo] [Logo]       │  │
│  │   ✓ 14-day free trial      │    │                                     │  │
│  │   ✓ Cancel anytime         │    │                                     │  │
│  │                            │    │                                     │  │
│  └────────────────────────────┘    └─────────────────────────────────────┘  │
│                                                                              │
│  ─────────────────────── Scroll Indicator (animated) ───────────────────── │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual Elements:**
1. **Badge:** Pill-shaped, gradient border, subtle animation
2. **Headline:** Display font, gradient text on key words
3. **Subheadline:** Body text, muted color
4. **Primary CTA:** Gradient background, hover scale + glow, arrow animation
5. **Secondary CTA:** Ghost button with icon, underline on hover
6. **Trust Signals:** Checkmarks with staggered fade-in
7. **Social Proof:** Animated counter, star ratings, logo carousel
8. **Hero Image:** 3D perspective mockup with depth, floating elements

**Background:**
- Subtle gradient mesh (light mode)
- Animated gradient orbs (slow movement)
- Optional: Particle effect (medical-themed)

**Code - Hero Component:**
```tsx
// components/landing/HeroSection.tsx
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <GradientMesh />
        <FloatingOrbs />
      </div>

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="gradient" className="gap-2">
              <Sparkles className="w-4 h-4" />
              #1 Clinic Management Software
            </Badge>
          </motion.div>

          {/* Headline */}
          <h1 className="text-display-xl font-display font-bold text-neutral-900">
            Transform Your{' '}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Healthcare Practice
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-body-xl text-neutral-600 max-w-lg">
            Streamline appointments, manage EMR, billing, and grow your practice 
            with AI-powered tools trusted by 5,000+ clinics.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Button size="xl" variant="gradient" className="group">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="xl" variant="ghost" className="group">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
              <span className="ml-2 text-sm text-neutral-500">2 min</span>
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
            {['No credit card required', '14-day free trial', 'Cancel anytime'].map(
              (text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-success-500" />
                  {text}
                </motion.div>
              )
            )}
          </div>
        </motion.div>

        {/* Right - Hero Image/3D Preview */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative"
        >
          <HeroDashboardPreview />
          
          {/* Floating Elements */}
          <FloatingCard position="top-left" delay={0.8}>
            <div className="flex items-center gap-3">
              <Avatar src="/avatars/patient-1.jpg" />
              <div>
                <p className="font-medium">New Appointment</p>
                <p className="text-sm text-neutral-500">Dr. Sarah - 10:30 AM</p>
              </div>
            </div>
          </FloatingCard>
          
          <FloatingCard position="bottom-right" delay={1}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">+32%</p>
                <p className="text-sm text-neutral-500">Patient Growth</p>
              </div>
            </div>
          </FloatingCard>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1.5, y: { repeat: Infinity, duration: 1.5 } }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-neutral-400" />
      </motion.div>
    </section>
  );
}
```

---

#### 3.1.3 Social Proof Bar

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│     Trusted by healthcare professionals at                                   │
│                                                                              │
│     [Apollo]   [Fortis]   [Max]   [Medanta]   [Manipal]   [AIIMS]          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Animation:** Infinite scroll carousel (marquee effect) with pause on hover

---

#### 3.1.4 Features Section

**Design Pattern:** Bento Grid Layout with varying card sizes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌───────── WIDE CARD (2 cols) ─────────┐  ┌──── TALL CARD (2 rows) ────┐ │
│   │                                       │  │                            │ │
│   │   📅 Smart Appointment Scheduling     │  │  🏥 Patient Management     │ │
│   │                                       │  │                            │ │
│   │   AI-powered scheduling that learns   │  │  360° patient view with   │ │
│   │   your preferences and optimizes      │  │  complete medical history │ │
│   │   your calendar automatically.        │  │                            │ │
│   │                                       │  │  [Animated illustration]   │ │
│   │   [Interactive calendar preview]      │  │                            │ │
│   │                                       │  │                            │ │
│   └───────────────────────────────────────┘  └────────────────────────────┘ │
│                                                                              │
│   ┌──── CARD ────┐  ┌──── CARD ────┐  ┌──── CARD ────┐  ┌──── CARD ────┐   │
│   │              │  │              │  │              │  │              │   │
│   │  📋 EMR      │  │  💳 Billing  │  │  📦 Inventory│  │  🤖 AI Scribe│   │
│   │              │  │              │  │              │  │     [NEW]    │   │
│   │  Digital     │  │  Automated   │  │  Track meds  │  │  Voice to    │   │
│   │  records     │  │  invoicing   │  │  & supplies  │  │  clinical    │   │
│   │              │  │              │  │              │  │  notes       │   │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Feature Card Component:**
```tsx
interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  illustration?: React.ReactNode;
  gradient?: string;
  size?: 'sm' | 'md' | 'lg' | 'wide' | 'tall';
  badge?: string;
  interactive?: boolean;
}

const sizeClasses = {
  sm: 'col-span-1 row-span-1',
  md: 'col-span-1 row-span-1',
  lg: 'col-span-2 row-span-2',
  wide: 'col-span-2 row-span-1',
  tall: 'col-span-1 row-span-2',
};

export function FeatureCard({
  title,
  description,
  icon: Icon,
  illustration,
  gradient = 'from-primary-500/10 to-secondary-500/10',
  size = 'md',
  badge,
  interactive = true,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      whileHover={interactive ? { y: -5, scale: 1.02 } : undefined}
      className={cn(
        'relative group rounded-2xl border border-neutral-200',
        'bg-white hover:shadow-xl transition-all duration-300',
        'overflow-hidden p-6',
        sizeClasses[size]
      )}
    >
      {/* Gradient Background on Hover */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100',
          'transition-opacity duration-300',
          gradient
        )}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'p-3 rounded-xl',
            'bg-gradient-to-br from-primary-100 to-secondary-100',
            'group-hover:from-primary-200 group-hover:to-secondary-200',
            'transition-colors duration-300'
          )}>
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
          {badge && (
            <Badge variant="new" className="animate-pulse">
              {badge}
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          {title}
        </h3>
        <p className="text-neutral-600 mb-4 flex-grow">
          {description}
        </p>

        {illustration && (
          <div className="mt-auto">
            {illustration}
          </div>
        )}

        <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700 mt-4">
          Learn more
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
```

**Complete Features Data:**
```typescript
const features = [
  {
    id: 'appointments',
    title: 'Smart Appointment Scheduling',
    description: 'AI-powered scheduling that learns your preferences, prevents double-bookings, and sends automatic reminders via SMS & WhatsApp.',
    icon: Calendar,
    size: 'wide',
    details: [
      'Drag-and-drop calendar',
      'Automated SMS/WhatsApp reminders',
      'Online booking widget for your website',
      'Recurring appointments',
      'Waitlist management',
      'Multi-location support',
    ],
  },
  {
    id: 'patients',
    title: 'Patient Management',
    description: '360° patient view with complete medical history, documents, prescriptions, and visit timeline all in one place.',
    icon: Users,
    size: 'tall',
    details: [
      'Comprehensive patient profiles',
      'Medical history timeline',
      'Document attachments',
      'Family linking',
      'Patient portal access',
      'Bulk import from Excel',
    ],
  },
  {
    id: 'emr',
    title: 'Electronic Medical Records',
    description: 'Fully digital, paperless medical records with customizable templates for different specialties.',
    icon: FileText,
    size: 'md',
    details: [
      'Specialty-specific templates',
      'Voice-to-text notes',
      'E-prescriptions',
      'Lab result integration',
      'ICD-10 coding support',
      'Print/PDF export',
    ],
  },
  {
    id: 'billing',
    title: 'Billing & Invoicing',
    description: 'Automated billing with GST-compliant invoices, payment tracking, and insurance claim management.',
    icon: CreditCard,
    size: 'md',
    details: [
      'GST-compliant invoices',
      'Multiple payment modes',
      'Insurance claim submission',
      'Revenue analytics',
      'Outstanding dues alerts',
      'Tally/Zoho integration',
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Track medicines, consumables, and equipment with automatic reorder alerts and expiry tracking.',
    icon: Package,
    size: 'md',
    details: [
      'Stock level alerts',
      'Expiry date tracking',
      'Barcode scanning',
      'Vendor management',
      'Purchase orders',
      'Usage reports',
    ],
  },
  {
    id: 'ai-scribe',
    title: 'AI Scribe',
    description: 'Speak naturally during consultations. Our AI converts your voice into structured clinical notes automatically.',
    icon: Mic,
    size: 'md',
    badge: 'NEW',
    details: [
      'Real-time transcription',
      'SOAP note generation',
      'Multi-language support',
      'Speaker diarization',
      'Privacy-first processing',
      'Review & edit workflow',
    ],
  },
  {
    id: 'reports',
    title: 'Analytics & Reports',
    description: 'Beautiful dashboards and reports to understand your practice performance and patient trends.',
    icon: BarChart3,
    size: 'md',
    details: [
      'Revenue analytics',
      'Patient demographics',
      'Appointment trends',
      'Doctor performance',
      'Custom report builder',
      'Scheduled email reports',
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile App',
    description: 'Access your clinic on-the-go with our iOS and Android apps. Perfect for doctors and staff.',
    icon: Smartphone,
    size: 'md',
    details: [
      'iOS & Android apps',
      'Push notifications',
      'Offline mode',
      'Quick patient search',
      'Prescription writing',
      'Voice commands',
    ],
  },
];
```

---

#### 3.1.5 How It Works Section

**Design:** Horizontal stepper with animated connectors

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                         Get Started in 3 Simple Steps                        │
│                                                                              │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│   │             │ ──────▶ │             │ ──────▶ │             │          │
│   │   📝        │         │   ⚙️        │         │   🚀        │          │
│   │             │         │             │         │             │          │
│   │  SIGN UP    │         │  SET UP     │         │  GO LIVE    │          │
│   │             │         │             │         │             │          │
│   │  Create     │         │  Add your   │         │  Start      │          │
│   │  account    │         │  clinic     │         │  seeing     │          │
│   │  in 2 min   │         │  details    │         │  patients   │          │
│   │             │         │             │         │             │          │
│   └─────────────┘         └─────────────┘         └─────────────┘          │
│        (1)                     (2)                     (3)                  │
│                                                                              │
│   ▼ Click to see demo video for each step                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Animation:**
- Steps revealed on scroll with staggered delay
- Connector lines animate (draw-on effect)
- Click on step to play explainer video in modal
- Active step pulses subtly

---

#### 3.1.6 Interactive Pricing Section

**Design:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                          Simple, Transparent Pricing                         │
│                                                                              │
│              [ Monthly ]  ──────●────────  [ Yearly ] Save 17%              │
│                                                                              │
│   ┌─────────────────┐  ┌─────────────────────┐  ┌─────────────────┐        │
│   │                 │  │  ✨ MOST POPULAR     │  │                 │        │
│   │     FREE        │  │                     │  │   ENTERPRISE    │        │
│   │                 │  │        PRO          │  │                 │        │
│   │     ₹0          │  │                     │  │    ₹4,999       │        │
│   │   /month        │  │     ₹1,999          │  │    /month       │        │
│   │                 │  │    /month           │  │                 │        │
│   │  Perfect for    │  │                     │  │  For hospital   │        │
│   │  solo doctors   │  │  Growing clinics    │  │  chains         │        │
│   │                 │  │                     │  │                 │        │
│   │  ────────────   │  │  ─────────────      │  │  ────────────   │        │
│   │                 │  │                     │  │                 │        │
│   │  ✓ 50 patients  │  │  ✓ Unlimited pts    │  │  ✓ Everything   │        │
│   │  ✓ 1 doctor     │  │  ✓ 5 doctors        │  │  ✓ Unlimited    │        │
│   │  ✓ 100 appts    │  │  ✓ Unlimited appts  │  │  ✓ Custom domain│        │
│   │  ✓ Basic EMR    │  │  ✓ Full EMR         │  │  ✓ API access   │        │
│   │  ✓ Email support│  │  ✓ SMS reminders    │  │  ✓ WhatsApp     │        │
│   │                 │  │  ✓ AI Scribe (50)   │  │  ✓ Priority 24/7│        │
│   │                 │  │  ✓ Chat support     │  │  ✓ Dedicated AM │        │
│   │                 │  │                     │  │                 │        │
│   │  [Start Free]   │  │  [Start Trial →]    │  │  [Contact Sales]│        │
│   │                 │  │                     │  │                 │        │
│   └─────────────────┘  └─────────────────────┘  └─────────────────┘        │
│                                                                              │
│                       💬 Need a custom plan? Let's talk                      │
│                                                                              │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│                          Compare All Features ▾                              │
│                                                                              │
│   [Expandable comparison table with all features]                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Pricing Card Interactions:**
- Hover: Card lifts slightly, shadow increases
- Popular: Gradient border with subtle animation
- Toggle: Smooth price transition with counting animation
- Currency: Dropdown to switch INR/USD/EUR with instant conversion

**Pricing Calculator (Optional Advanced):**
```
┌───────────────────────────────────────────────────────────────┐
│                    💡 Estimate Your Cost                       │
│                                                                │
│   How many doctors?      [  1  ▾ ]                            │
│   Expected patients/mo?  [────●───────────] 200               │
│   Need AI Scribe?        [✓] Yes                              │
│                                                                │
│   Recommended Plan: PRO                                        │
│   Monthly Cost: ₹1,999                                         │
│   You save: ₹3,998/year with yearly billing                   │
│                                                                │
│                      [Get Started →]                           │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

#### 3.1.7 Testimonials Section

**Design:** Carousel with video testimonials

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                    Loved by 5,000+ Healthcare Professionals                  │
│                                                                              │
│   ◀  ┌─────────────────────────────────────────────────────────────┐  ▶    │
│      │                                                              │        │
│      │   ┌─────────────────┐                                        │        │
│      │   │                 │    "Clinicia transformed how we run    │        │
│      │   │   [▶ Video]     │    our clinic. Patient no-shows        │        │
│      │   │                 │    dropped by 60% with automated       │        │
│      │   │   Dr. Priya     │    reminders!"                         │        │
│      │   │   Sharma        │                                        │        │
│      │   │                 │    ⭐⭐⭐⭐⭐                            │        │
│      │   └─────────────────┘                                        │        │
│      │                          Dr. Priya Sharma                    │        │
│      │                          City Health Clinic, Mumbai          │        │
│      │                                                              │        │
│      └──────────────────────────────────────────────────────────────┘        │
│                                                                              │
│                              ● ○ ○ ○ ○                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Testimonial Data:**
```typescript
const testimonials = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    role: 'General Physician',
    clinic: 'City Health Clinic',
    location: 'Mumbai',
    avatar: '/testimonials/priya.jpg',
    video: '/testimonials/priya.mp4',
    quote: 'Clinicia transformed how we run our clinic. Patient no-shows dropped by 60% with automated reminders!',
    rating: 5,
    metrics: { patientGrowth: '+45%', timesSaved: '2hrs/day' },
  },
  {
    id: 2,
    name: 'Dr. Rajesh Kumar',
    role: 'Cardiologist',
    clinic: 'Heart Care Center',
    location: 'Delhi',
    avatar: '/testimonials/rajesh.jpg',
    quote: 'The AI Scribe feature is a game-changer. I can focus on my patients instead of typing notes.',
    rating: 5,
    metrics: { efficiency: '+70%', satisfaction: '98%' },
  },
  // ... more testimonials
];
```

---

#### 3.1.8 FAQ Section

**Design:** Accordion with smooth animations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                          Frequently Asked Questions                          │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ▼ What happens after my free trial ends?                            │   │
│   │                                                                      │   │
│   │   Your account will automatically convert to the FREE plan with     │   │
│   │   limited features. You won't be charged unless you upgrade.        │   │
│   │   Your data remains safe and accessible.                            │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ▶ Is my patient data secure?                                        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ▶ Can I import data from my existing system?                        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ▶ Do you offer training for my staff?                               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ▶ What payment methods do you accept?                               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                                                                              │
│   Still have questions?  [Contact Support →]  [Schedule a Demo]            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**FAQ Data:**
```typescript
const faqs = [
  {
    question: 'What happens after my free trial ends?',
    answer: 'Your account will automatically convert to the FREE plan with limited features. You won\'t be charged unless you explicitly upgrade. All your data remains safe and accessible.',
  },
  {
    question: 'Is my patient data secure?',
    answer: 'Absolutely. We use bank-grade encryption (AES-256) for all data at rest and in transit. Our servers are hosted on AWS/GCP with SOC 2 Type II compliance. We\'re also HIPAA-ready and compliant with India\'s DPDP Act 2023.',
  },
  {
    question: 'Can I import data from my existing system?',
    answer: 'Yes! We support bulk import from Excel/CSV files. Our team can also help migrate data from popular software like Practo, DocEngage, or custom systems. Enterprise customers get dedicated migration support.',
  },
  {
    question: 'Do you offer training for my staff?',
    answer: 'All plans include access to our video tutorials and help center. PRO plans get live onboarding calls, and Enterprise customers receive personalized training sessions and ongoing support.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets. For yearly plans, we also offer EMI options. Enterprise customers can pay via bank transfer with custom invoicing.',
  },
  {
    question: 'Can I change my plan later?',
    answer: 'Yes, you can upgrade or downgrade anytime. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing cycle.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Yes! We have fully-featured iOS and Android apps available on the App Store and Play Store. All plans include mobile access with real-time sync.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a full refund within the first 14 days if you\'re not satisfied. After that, you can cancel anytime and continue using the service until the end of your billing period.',
  },
];
```

---

#### 3.1.9 CTA Section (Final Conversion)

**Design:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════════════════╗   │
│ ║                                                                        ║   │
│ ║   ████████████████████████████████████████████████████████████████    ║   │
│ ║   █                                                              █    ║   │
│ ║   █   Ready to Transform Your Practice?                          █    ║   │
│ ║   █                                                              █    ║   │
│ ║   █   Join 5,000+ clinics already using Clinicia to deliver     █    ║   │
│ ║   █   better patient care and grow their practice.              █    ║   │
│ ║   █                                                              █    ║   │
│ ║   █           [Start Your Free Trial →]                          █    ║   │
│ ║   █                                                              █    ║   │
│ ║   █   No credit card required • 14-day trial • Cancel anytime   █    ║   │
│ ║   █                                                              █    ║   │
│ ║   ████████████████████████████████████████████████████████████████    ║   │
│ ║                                                                        ║   │
│ ╚═══════════════════════════════════════════════════════════════════════╝   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual:**
- Full-width gradient background (primary → secondary)
- Subtle animated pattern overlay
- Large, high-contrast CTA button
- Optional: Floating doctor avatars / clinic illustrations

---

#### 3.1.10 Footer

**Design:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   [LOGO]                                                                     │
│   Modern clinic management                                                   │
│   for healthcare professionals                                               │
│                                                                              │
│   ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│   PRODUCT          COMPANY          RESOURCES        LEGAL                   │
│   Features         About Us         Blog             Privacy Policy          │
│   Pricing          Careers          Help Center      Terms of Service        │
│   Mobile App       Press Kit        API Docs         Refund Policy           │
│   Integrations     Contact          Webinars         Cookie Policy           │
│   What's New       Partners         Templates        HIPAA Compliance        │
│                                                                              │
│   ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│   📧 Subscribe to our newsletter                                             │
│   [Email input                    ] [Subscribe]                              │
│   Get product updates, tips, and healthcare insights.                        │
│                                                                              │
│   ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│   © 2026 Clinicia. All rights reserved.                                     │
│                                                                              │
│   [Twitter] [LinkedIn] [YouTube] [Instagram]      🇮🇳 India (INR) ▾          │
│                                                                              │
│   [App Store Badge]  [Play Store Badge]                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Pricing Page (`/pricing`)

**Purpose:** Dedicated pricing page with detailed plan comparison and conversion optimization.

**Full Page Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Header with transparent → solid on scroll]                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      PRICING HERO SECTION                            │   │
│   │                                                                      │   │
│   │        Choose the Perfect Plan for Your Practice                     │   │
│   │                                                                      │   │
│   │   Simple, transparent pricing that grows with you.                   │   │
│   │   Start free, upgrade when you're ready.                             │   │
│   │                                                                      │   │
│   │   [Save 17% with yearly billing badge]                               │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌──────────────────── BILLING TOGGLE ─────────────────────┐              │
│   │                                                          │              │
│   │     Monthly        [═══════●═══════]        Yearly       │              │
│   │                                                          │              │
│   │     Currency:  [ 🇮🇳 INR ▾ ]                              │              │
│   │                                                          │              │
│   └──────────────────────────────────────────────────────────┘              │
│                                                                              │
│   ┌───────────────────── PRICING CARDS ─────────────────────┐              │
│   │                                                          │              │
│   │  ┌──────────┐   ┌──────────────┐   ┌──────────┐         │              │
│   │  │          │   │  ★ POPULAR   │   │          │         │              │
│   │  │   FREE   │   │     PRO      │   │ENTERPRISE│         │              │
│   │  │          │   │              │   │          │         │              │
│   │  └──────────┘   └──────────────┘   └──────────┘         │              │
│   │                                                          │              │
│   └──────────────────────────────────────────────────────────┘              │
│                                                                              │
│   ┌─────────────────── FEATURE COMPARISON ──────────────────┐              │
│   │                                                          │              │
│   │  [Expandable detailed comparison table]                  │              │
│   │                                                          │              │
│   └──────────────────────────────────────────────────────────┘              │
│                                                                              │
│   ┌───────────────────── FAQ SECTION ───────────────────────┐              │
│   │                                                          │              │
│   │  [Pricing-specific FAQs in accordion]                    │              │
│   │                                                          │              │
│   └──────────────────────────────────────────────────────────┘              │
│                                                                              │
│   ┌───────────────────── ENTERPRISE CTA ────────────────────┐              │
│   │                                                          │              │
│   │  Need a custom solution? Let's talk.  [Contact Sales →]  │              │
│   │                                                          │              │
│   └──────────────────────────────────────────────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Subscription Plans - Detailed:**

| Feature | FREE | PRO | ENTERPRISE |
|---------|------|-----|------------|
| **Monthly Price** | ₹0 / $0 | ₹1,999 / $25 | ₹4,999 / $60 |
| **Yearly Price** | ₹0 / $0 | ₹19,990 / $250 (17% off) | ₹49,990 / $600 (17% off) |
| **Patients** | Up to 50 | Unlimited | Unlimited |
| **Doctor Seats** | 1 | Up to 5 | Unlimited |
| **Staff Accounts** | 1 | 5 | Unlimited |
| **Appointments/month** | 100 | Unlimited | Unlimited |
| **Storage** | 1 GB | 10 GB | 100 GB |
| **SMS Reminders** | ❌ | 500/month | Unlimited |
| **WhatsApp Integration** | ❌ | ❌ | ✅ |
| **AI Scribe** | ❌ | 50 sessions | Unlimited |
| **Custom Domain** | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ❌ | ✅ |
| **Priority Support** | Email only | Email + Chat | 24/7 Phone + Dedicated AM |
| **Data Export** | CSV | CSV + PDF | CSV + PDF + API |
| **Branding Removal** | ❌ | ❌ | ✅ |
| **Audit Logs** | ❌ | 30 days | 1 year |

**Pricing Card Component - Advanced:**
```tsx
// components/pricing/PricingCard.tsx
interface PricingCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    monthlyPrice: { INR: number; USD: number; EUR: number };
    yearlyPrice: { INR: number; USD: number; EUR: number };
    features: string[];
    highlighted?: boolean;
    badge?: string;
    cta: { text: string; variant: 'primary' | 'secondary' | 'outline' };
  };
  billingCycle: 'monthly' | 'yearly';
  currency: 'INR' | 'USD' | 'EUR';
}

export function PricingCard({ plan, billingCycle, currency }: PricingCardProps) {
  const price = billingCycle === 'monthly' 
    ? plan.monthlyPrice[currency] 
    : plan.yearlyPrice[currency];
  
  const currencySymbol = { INR: '₹', USD: '$', EUR: '€' }[currency];
  const monthlyEquivalent = billingCycle === 'yearly' 
    ? Math.round(price / 12) 
    : price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className={cn(
        'relative rounded-2xl p-8 transition-all duration-300',
        plan.highlighted
          ? 'bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-2xl scale-105 z-10'
          : 'bg-white border-2 border-neutral-200 hover:border-primary-300 hover:shadow-xl'
      )}
    >
      {/* Popular Badge */}
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'px-4 py-1 rounded-full text-sm font-semibold',
              plan.highlighted
                ? 'bg-white text-primary-600'
                : 'bg-primary-500 text-white'
            )}
          >
            {plan.badge}
          </motion.div>
        </div>
      )}

      {/* Plan Name */}
      <h3 className={cn(
        'text-2xl font-bold mb-2',
        plan.highlighted ? 'text-white' : 'text-neutral-900'
      )}>
        {plan.name}
      </h3>
      
      <p className={cn(
        'text-sm mb-6',
        plan.highlighted ? 'text-primary-100' : 'text-neutral-500'
      )}>
        {plan.description}
      </p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">
            {currencySymbol}
            <AnimatedNumber value={monthlyEquivalent} />
          </span>
          <span className={cn(
            'text-sm',
            plan.highlighted ? 'text-primary-200' : 'text-neutral-500'
          )}>
            /month
          </span>
        </div>
        
        {billingCycle === 'yearly' && price > 0 && (
          <p className={cn(
            'text-sm mt-1',
            plan.highlighted ? 'text-primary-200' : 'text-neutral-500'
          )}>
            Billed {currencySymbol}{price.toLocaleString()}/year
          </p>
        )}
      </div>

      {/* CTA Button */}
      <Button
        variant={plan.highlighted ? 'secondary' : plan.cta.variant}
        size="lg"
        className="w-full mb-6 group"
      >
        {plan.cta.text}
        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>

      {/* Features */}
      <ul className="space-y-3">
        {plan.features.map((feature, index) => (
          <motion.li
            key={feature}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3"
          >
            <CheckCircle2 className={cn(
              'w-5 h-5 flex-shrink-0 mt-0.5',
              plan.highlighted ? 'text-white' : 'text-primary-500'
            )} />
            <span className={cn(
              'text-sm',
              plan.highlighted ? 'text-primary-50' : 'text-neutral-600'
            )}>
              {feature}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
```

**Billing Toggle Component:**
```tsx
// components/pricing/BillingToggle.tsx
export function BillingToggle({ 
  value, 
  onChange 
}: { 
  value: 'monthly' | 'yearly'; 
  onChange: (value: 'monthly' | 'yearly') => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span className={cn(
        'text-sm font-medium transition-colors',
        value === 'monthly' ? 'text-neutral-900' : 'text-neutral-400'
      )}>
        Monthly
      </span>
      
      <button
        onClick={() => onChange(value === 'monthly' ? 'yearly' : 'monthly')}
        className={cn(
          'relative w-14 h-8 rounded-full transition-colors',
          value === 'yearly' ? 'bg-primary-500' : 'bg-neutral-200'
        )}
      >
        <motion.div
          layout
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
          animate={{ left: value === 'yearly' ? 'calc(100% - 28px)' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      
      <span className={cn(
        'text-sm font-medium transition-colors',
        value === 'yearly' ? 'text-neutral-900' : 'text-neutral-400'
      )}>
        Yearly
      </span>
      
      {value === 'yearly' && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-2 py-1 bg-success-100 text-success-700 text-xs font-semibold rounded-full"
        >
          Save 17%
        </motion.span>
      )}
    </div>
  );
}
```

---

### 3.3 Sign Up Page (`/signup`)

**Purpose:** Multi-step registration wizard with premium UX.

**Full Page Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │  ┌─────────────────────┐                ┌─────────────────────────┐ │   │
│   │  │                     │                │                         │ │   │
│   │  │    LEFT PANEL       │                │      RIGHT PANEL        │ │   │
│   │  │    (Decorative)     │                │      (Form Area)        │ │   │
│   │  │                     │                │                         │ │   │
│   │  │  ┌───────────────┐  │                │  ┌───────────────────┐  │ │   │
│   │  │  │               │  │                │  │                   │  │ │   │
│   │  │  │  [Logo]       │  │                │  │  Progress Bar     │  │ │   │
│   │  │  │               │  │                │  │  ───●───○───○───  │  │ │   │
│   │  │  │  "Join 5000+  │  │                │  │                   │  │ │   │
│   │  │  │   clinics"    │  │                │  │  Create Account   │  │ │   │
│   │  │  │               │  │                │  │                   │  │ │   │
│   │  │  │  [Animated    │  │                │  │  ┌─────────────┐  │  │ │   │
│   │  │  │   Medical     │  │                │  │  │ Email       │  │  │ │   │
│   │  │  │   Graphics]   │  │                │  │  └─────────────┘  │  │ │   │
│   │  │  │               │  │                │  │  ┌─────────────┐  │  │ │   │
│   │  │  │  Trust badges │  │                │  │  │ Password    │  │  │ │   │
│   │  │  │  🔒 Secure    │  │                │  │  └─────────────┘  │  │ │   │
│   │  │  │  ✓ HIPAA      │  │                │  │                   │  │ │   │
│   │  │  │  ⭐ 4.9/5     │  │                │  │  [Continue →]     │  │ │   │
│   │  │  │               │  │                │  │                   │  │ │   │
│   │  │  └───────────────┘  │                │  │  ─── or ───       │  │ │   │
│   │  │                     │                │  │                   │  │ │   │
│   │  │                     │                │  │  [Google] [Apple] │  │ │   │
│   │  │                     │                │  │                   │  │ │   │
│   │  └─────────────────────┘                │  │  Already have an  │  │ │   │
│   │                                          │  │  account? Login   │  │ │   │
│   │                                          │  │                   │  │ │   │
│   │                                          │  └───────────────────┘  │ │   │
│   │                                          │                         │ │   │
│   │                                          └─────────────────────────┘ │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Multi-Step Wizard Steps:**

**Step 1: Account Creation**
```typescript
interface Step1Data {
  email: string;              // Required, real-time availability check
  password: string;           // Min 8 chars, strength indicator
  confirmPassword: string;    // Must match
  fullName: string;           // Required
  phone: string;              // Optional, with country code
  agreeToTerms: boolean;      // Required checkbox
}
```

**Step 2: Email Verification**
```typescript
interface Step2Data {
  otp: string;  // 6-digit code, auto-focus next input
}
```

**Step 3: Clinic Setup**
```typescript
interface Step3Data {
  clinicName: string;         // Required
  clinicType: 'solo' | 'group' | 'hospital' | 'chain';
  specialty: string[];        // Multi-select
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;          // Dropdown with flags
    postalCode: string;
  };
  phone: string;
  email: string;
  website?: string;
  logo?: File;                // Image upload with crop
  operatingHours?: OperatingHours[];
}
```

**Step 4: Plan Selection**
```typescript
interface Step4Data {
  selectedPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  billingCycle: 'MONTHLY' | 'YEARLY';
}
```

**Progress Bar Component:**
```tsx
// components/registration/ProgressBar.tsx
interface ProgressBarProps {
  steps: { id: string; label: string }[];
  currentStep: number;
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="relative">
      {/* Line */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200" />
      <motion.div
        className="absolute top-4 left-0 h-0.5 bg-primary-500"
        initial={{ width: '0%' }}
        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.3 }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <motion.div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'border-2 transition-colors z-10',
                  isCompleted && 'bg-primary-500 border-primary-500',
                  isCurrent && 'bg-white border-primary-500',
                  !isCompleted && !isCurrent && 'bg-white border-neutral-300'
                )}
                animate={{
                  scale: isCurrent ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  scale: { repeat: isCurrent ? Infinity : 0, duration: 2 }
                }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span className={cn(
                    'text-sm font-semibold',
                    isCurrent ? 'text-primary-500' : 'text-neutral-400'
                  )}>
                    {index + 1}
                  </span>
                )}
              </motion.div>
              
              <span className={cn(
                'mt-2 text-xs font-medium',
                isCurrent ? 'text-primary-600' : 'text-neutral-500'
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**OTP Input Component:**
```tsx
// components/registration/OTPInput.tsx
export function OTPInput({ 
  length = 6, 
  value, 
  onChange 
}: { 
  length?: number; 
  value: string; 
  onChange: (value: string) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;
    
    const newValue = value.split('');
    newValue[index] = digit;
    onChange(newValue.join(''));
    
    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData);
      inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, index) => (
        <motion.input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'w-12 h-14 text-center text-2xl font-bold',
            'border-2 rounded-xl outline-none transition-all',
            'focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
            value[index] ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'
          )}
        />
      ))}
    </div>
  );
}
```

**Password Strength Indicator:**
```tsx
// components/registration/PasswordStrength.tsx
export function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const levels = [
    { min: 0, label: 'Weak', color: 'bg-red-500' },
    { min: 2, label: 'Fair', color: 'bg-orange-500' },
    { min: 4, label: 'Good', color: 'bg-yellow-500' },
    { min: 5, label: 'Strong', color: 'bg-green-500' },
    { min: 6, label: 'Excellent', color: 'bg-emerald-500' },
  ];

  const currentLevel = levels.reduce((acc, level) => 
    strength >= level.min ? level : acc
  , levels[0]);

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <motion.div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full',
              level <= Math.ceil(strength / 1.2) ? currentLevel.color : 'bg-neutral-200'
            )}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: level <= Math.ceil(strength / 1.2) ? 1 : 1 }}
            transition={{ delay: level * 0.05 }}
          />
        ))}
      </div>
      <p className={cn(
        'text-xs',
        strength < 4 ? 'text-neutral-500' : 'text-green-600'
      )}>
        Password strength: {currentLevel.label}
      </p>
    </div>
  );
}
```

**Social Auth Buttons:**
```tsx
// components/registration/SocialAuth.tsx
export function SocialAuth({ onGoogleClick, onAppleClick }) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-neutral-500">
            or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={onGoogleClick}
          className="group"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            {/* Google icon SVG */}
          </svg>
          Google
        </Button>

        <Button
          variant="outline"
          onClick={onAppleClick}
          className="group"
        >
          <Apple className="w-5 h-5 mr-2" />
          Apple
        </Button>
      </div>
    </div>
  );
}
```

---

### 3.4 Email Verification Page (`/verify-email`)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │                         ┌─────────────────┐                          │   │
│   │                         │                 │                          │   │
│   │                         │   📧            │                          │   │
│   │                         │   [Animated     │                          │   │
│   │                         │    Email Icon]  │                          │   │
│   │                         │                 │                          │   │
│   │                         └─────────────────┘                          │   │
│   │                                                                      │   │
│   │                      Check your inbox                                │   │
│   │                                                                      │   │
│   │         We've sent a 6-digit code to                                 │   │
│   │         dr.sharma@example.com                                        │   │
│   │                                                                      │   │
│   │         ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                        │   │
│   │         │   │ │   │ │   │ │   │ │   │ │   │                        │   │
│   │         └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                        │   │
│   │                                                                      │   │
│   │                    [Verify Email →]                                  │   │
│   │                                                                      │   │
│   │         Didn't receive the code?                                     │   │
│   │         [Resend Code] (available in 45s)                             │   │
│   │                                                                      │   │
│   │         [← Change Email Address]                                     │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Animated email icon (Lottie or Framer Motion)
- Auto-focus on first OTP input
- Real-time validation with visual feedback
- Countdown timer for resend button
- Success animation on verification

---

### 3.5 Clinic Setup Wizard (`/onboarding`)

**Multi-Step Wizard with Sidebar Navigation:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌───────────────────┐  ┌─────────────────────────────────────────────────┐ │
│  │                   │  │                                                  │ │
│  │   SIDEBAR         │  │              MAIN CONTENT AREA                   │ │
│  │                   │  │                                                  │ │
│  │   [Logo]          │  │  ┌────────────────────────────────────────────┐ │ │
│  │                   │  │  │                                            │ │ │
│  │   ● Clinic Info   │  │  │     Tell us about your clinic              │ │ │
│  │   ○ Branding      │  │  │                                            │ │ │
│  │   ○ Team Setup    │  │  │     This helps us customize your          │ │ │
│  │   ○ Plan          │  │  │     experience.                            │ │ │
│  │                   │  │  │                                            │ │ │
│  │   ─────────────   │  │  │     ┌──────────────────────────────────┐  │ │ │
│  │                   │  │  │     │ Clinic Name *                    │  │ │ │
│  │   Progress:       │  │  │     │ [City Health Clinic            ] │  │ │ │
│  │   25% complete    │  │  │     └──────────────────────────────────┘  │ │ │
│  │   ▓▓░░░░░░░░     │  │  │                                            │ │ │
│  │                   │  │  │     ┌──────────────────────────────────┐  │ │ │
│  │                   │  │  │     │ Clinic Type                      │  │ │ │
│  │   Need help?      │  │  │     │ ○ Solo Practice  ● Group Practice│  │ │ │
│  │   [Chat with us]  │  │  │     │ ○ Hospital       ○ Chain         │  │ │ │
│  │                   │  │  │     └──────────────────────────────────┘  │ │ │
│  │                   │  │  │                                            │ │ │
│  │                   │  │  │     ┌──────────────────────────────────┐  │ │ │
│  │                   │  │  │     │ Specialties (select multiple)    │  │ │ │
│  │                   │  │  │     │ [General Med] [Dental] [Cardio]  │  │ │ │
│  │                   │  │  │     │ [Ortho] [Pediatrics] [+ More]    │  │ │ │
│  │                   │  │  │     └──────────────────────────────────┘  │ │ │
│  │                   │  │  │                                            │ │ │
│  │                   │  │  │     [Skip for now]        [Continue →]    │ │ │
│  │                   │  │  │                                            │ │ │
│  │                   │  │  └────────────────────────────────────────────┘ │ │
│  │                   │  │                                                  │ │
│  └───────────────────┘  └─────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Specialty Selection Component:**
```tsx
// components/onboarding/SpecialtySelector.tsx
const specialties = [
  { id: 'general', label: 'General Medicine', icon: Stethoscope },
  { id: 'dental', label: 'Dentistry', icon: Smile },
  { id: 'cardio', label: 'Cardiology', icon: Heart },
  { id: 'ortho', label: 'Orthopedics', icon: Bone },
  { id: 'pedia', label: 'Pediatrics', icon: Baby },
  { id: 'gynec', label: 'Gynecology', icon: PersonStanding },
  { id: 'derma', label: 'Dermatology', icon: Sparkles },
  { id: 'neuro', label: 'Neurology', icon: Brain },
  { id: 'eye', label: 'Ophthalmology', icon: Eye },
  { id: 'ent', label: 'ENT', icon: Ear },
  { id: 'psych', label: 'Psychiatry', icon: HeartPulse },
  { id: 'physio', label: 'Physiotherapy', icon: Activity },
];

export function SpecialtySelector({ 
  value, 
  onChange 
}: { 
  value: string[]; 
  onChange: (value: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(
      value.includes(id)
        ? value.filter(v => v !== id)
        : [...value, id]
    );
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
      {specialties.map((specialty) => {
        const isSelected = value.includes(specialty.id);
        const Icon = specialty.icon;
        
        return (
          <motion.button
            key={specialty.id}
            type="button"
            onClick={() => toggle(specialty.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
              isSelected
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
            )}
          >
            <Icon className={cn(
              'w-6 h-6',
              isSelected ? 'text-primary-500' : 'text-neutral-400'
            )} />
            <span className="text-sm font-medium text-center">
              {specialty.label}
            </span>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
```

**Logo Upload Component:**
```tsx
// components/onboarding/LogoUpload.tsx
export function LogoUpload({ value, onChange }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      onChange(file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-8 transition-all',
        'flex flex-col items-center justify-center',
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300',
        preview ? 'border-solid border-primary-500' : ''
      )}
    >
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative"
          >
            <img 
              src={preview} 
              alt="Logo preview" 
              className="w-32 h-32 object-contain rounded-xl"
            />
            <button
              onClick={() => { setPreview(null); onChange(null); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 font-medium mb-1">
              Drag & drop your logo here
            </p>
            <p className="text-neutral-400 text-sm mb-4">
              PNG, JPG or SVG (max 2MB)
            </p>
            <label className="cursor-pointer">
              <span className="text-primary-600 font-medium hover:text-primary-700">
                Browse files
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

### 3.6 Payment Page (`/checkout`)

**Purpose:** Seamless, conversion-optimized checkout experience with trust signals.

**Full Page Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Minimal Header: Logo + Secure Badge + Help]                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────────────────┐  ┌────────────────────────────────────┐ │
│   │                               │  │                                    │ │
│   │      ORDER SUMMARY            │  │         PAYMENT DETAILS            │ │
│   │                               │  │                                    │ │
│   │   ┌─────────────────────────┐ │  │   ┌──────────────────────────────┐ │ │
│   │   │ 👑 PRO Plan             │ │  │   │                              │ │ │
│   │   │    Yearly Subscription  │ │  │   │   Contact Information        │ │ │
│   │   │                         │ │  │   │                              │ │ │
│   │   │    ✓ Unlimited patients │ │  │   │   [Email] [Phone]            │ │ │
│   │   │    ✓ 5 doctor seats     │ │  │   │                              │ │ │
│   │   │    ✓ AI Scribe (50)     │ │  │   └──────────────────────────────┘ │ │
│   │   │    ✓ SMS reminders      │ │  │                                    │ │
│   │   │    ✓ Chat support       │ │  │   ┌──────────────────────────────┐ │ │
│   │   │                         │ │  │   │                              │ │ │
│   │   │    [Change Plan]        │ │  │   │   Billing Address            │ │ │
│   │   └─────────────────────────┘ │  │   │                              │ │ │
│   │                               │  │   │   [Name] [Company]           │ │ │
│   │   ─────────────────────────── │  │   │   [Address Line 1]           │ │ │
│   │                               │  │   │   [City] [State] [Postal]    │ │ │
│   │   Subtotal         ₹19,990   │  │   │   [Country ▾]                 │ │ │
│   │                               │  │   │                              │ │ │
│   │   ┌─────────────────────────┐ │  │   │   [GSTIN] (optional)         │ │ │
│   │   │ 🎟️ [Enter coupon code] │ │  │   │                              │ │ │
│   │   └─────────────────────────┘ │  │   └──────────────────────────────┘ │ │
│   │                               │  │                                    │ │
│   │   Discount (SAVE20)  -₹3,998 │  │   ┌──────────────────────────────┐ │ │
│   │   GST (18%)          +₹2,878 │  │   │                              │ │ │
│   │   ─────────────────────────── │  │   │   Payment Method             │ │ │
│   │                               │  │   │                              │ │ │
│   │   TOTAL             ₹18,870  │  │   │   ┌────┐ ┌────┐ ┌────┐       │ │ │
│   │                               │  │   │   │Card│ │UPI │ │Bank│       │ │ │
│   │   ─────────────────────────── │  │   │   └────┘ └────┘ └────┘       │ │ │
│   │                               │  │   │                              │ │ │
│   │   🔒 Secure checkout by       │  │   │   [Card Number           ]   │ │ │
│   │      Razorpay                 │  │   │   [MM/YY]    [CVC]           │ │ │
│   │                               │  │   │   [Cardholder Name]          │ │ │
│   │   💳 Visa Mastercard RuPay   │  │   │                              │ │ │
│   │   📱 UPI GPay PhonePe Paytm  │  │   │   ☑️ Save card for future    │ │ │
│   │                               │  │   │                              │ │ │
│   │   30-day money-back guarantee │  │   └──────────────────────────────┘ │ │
│   │                               │  │                                    │ │
│   │   Need help? Chat with us     │  │   ┌──────────────────────────────┐ │ │
│   │                               │  │   │                              │ │ │
│   └───────────────────────────────┘  │   │   [  Complete Payment  →  ]  │ │ │
│                                       │   │                              │ │ │
│                                       │   │   By completing, you agree   │ │ │
│                                       │   │   to our Terms of Service    │ │ │
│                                       │   │                              │ │ │
│                                       │   └──────────────────────────────┘ │ │
│                                       │                                    │ │
│                                       └────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Payment Information Schema:**

```typescript
interface PaymentData {
  // Plan Details (from previous step)
  planId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  amount: number;
  currency: 'INR' | 'USD' | 'EUR';
  
  // Contact Information
  email: string;
  phone: string;
  
  // Billing Information
  billingName: string;
  companyName?: string;      // For B2B billing
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  
  // Tax Information (India)
  gstin?: string;            // For GST invoice
  
  // Coupon/Discount
  couponCode?: string;
  discountAmount?: number;
  
  // Payment Method
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  saveCard?: boolean;
}
```

**Coupon Input Component:**
```tsx
// components/checkout/CouponInput.tsx
export function CouponInput({ 
  onApply 
}: { 
  onApply: (code: string) => Promise<{ valid: boolean; discount: number }>;
}) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [discount, setDiscount] = useState<number | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setStatus('loading');
    try {
      const result = await onApply(code.trim().toUpperCase());
      if (result.valid) {
        setStatus('success');
        setDiscount(result.discount);
        // Trigger confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setStatus('idle');
            }}
            placeholder="Enter coupon code"
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-lg border-2 outline-none transition-all',
              status === 'success' && 'border-green-500 bg-green-50',
              status === 'error' && 'border-red-500 bg-red-50',
              status === 'idle' && 'border-neutral-200 focus:border-primary-500'
            )}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={!code.trim() || status === 'loading' || status === 'success'}
          className="min-w-[100px]"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      
      <AnimatePresence>
        {status === 'success' && discount && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-green-600 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Coupon applied! You save ₹{discount.toLocaleString()}
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-red-600 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Invalid or expired coupon code
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Payment Method Tabs:**
```tsx
// components/checkout/PaymentMethodTabs.tsx
const paymentMethods = [
  { id: 'card', label: 'Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'upi', label: 'UPI', icon: Smartphone, description: 'GPay, PhonePe, Paytm' },
  { id: 'netbanking', label: 'Net Banking', icon: Building, description: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, description: 'Paytm, Amazon Pay' },
];

export function PaymentMethodTabs({ value, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {paymentMethods.map((method) => {
          const isSelected = value === method.id;
          const Icon = method.icon;
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <Icon className={cn(
                'w-6 h-6',
                isSelected ? 'text-primary-600' : 'text-neutral-400'
              )} />
              <span className={cn(
                'text-sm font-medium',
                isSelected ? 'text-primary-700' : 'text-neutral-600'
              )}>
                {method.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Payment Form based on selected method */}
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {value === 'card' && <CardPaymentForm />}
          {value === 'upi' && <UPIPaymentForm />}
          {value === 'netbanking' && <NetBankingForm />}
          {value === 'wallet' && <WalletForm />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

**Stripe Card Element Integration:**
```tsx
// components/checkout/CardPaymentForm.tsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#171717',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': {
        color: '#A3A3A3',
      },
    },
    invalid: {
      color: '#EF4444',
    },
  },
};

export function CardPaymentForm() {
  const stripe = useStripe();
  const elements = useElements();

  return (
    <div className="space-y-4">
      <div className="p-4 border-2 border-neutral-200 rounded-xl focus-within:border-primary-500 transition-colors">
        <CardElement options={cardElementOptions} />
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox id="saveCard" />
        <label htmlFor="saveCard" className="text-sm text-neutral-600">
          Save this card for future purchases
        </label>
      </div>
    </div>
  );
}
```

**Razorpay UPI Form:**
```tsx
// components/checkout/UPIPaymentForm.tsx
export function UPIPaymentForm() {
  const [upiId, setUpiId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateUPI = async (id: string) => {
    // Regex validation
    const upiRegex = /^[\w.-]+@[\w]+$/;
    if (!upiRegex.test(id)) {
      setIsValid(false);
      return;
    }
    
    setIsValidating(true);
    // API call to validate UPI
    // ...
    setIsValid(true);
    setIsValidating(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          onBlur={() => upiId && validateUPI(upiId)}
          placeholder="yourname@upi"
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 outline-none transition-all',
            isValid === true && 'border-green-500',
            isValid === false && 'border-red-500',
            isValid === null && 'border-neutral-200 focus:border-primary-500'
          )}
        />
        {isValidating && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-neutral-400" />
        )}
        {isValid === true && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-500">Or pay using:</span>
        <div className="flex gap-2">
          {['gpay', 'phonepe', 'paytm'].map((app) => (
            <button
              key={app}
              type="button"
              className="p-2 rounded-lg border border-neutral-200 hover:border-primary-500 transition-colors"
            >
              <img src={`/icons/${app}.svg`} alt={app} className="w-8 h-8" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Order Summary Component:**
```tsx
// components/checkout/OrderSummary.tsx
export function OrderSummary({ 
  plan, 
  billingCycle, 
  coupon, 
  currency 
}: OrderSummaryProps) {
  const subtotal = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const discount = coupon?.discountAmount || 0;
  const taxableAmount = subtotal - discount;
  const gst = currency === 'INR' ? taxableAmount * 0.18 : 0;
  const total = taxableAmount + gst;

  return (
    <div className="bg-neutral-50 rounded-2xl p-6 space-y-6">
      {/* Plan Card */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200">
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            plan.id === 'PRO' && 'bg-blue-100',
            plan.id === 'ENTERPRISE' && 'bg-purple-100'
          )}>
            {plan.id === 'PRO' ? (
              <TrendingUp className="w-6 h-6 text-blue-600" />
            ) : (
              <Crown className="w-6 h-6 text-purple-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">{plan.name} Plan</h3>
            <p className="text-sm text-neutral-500">
              {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} subscription
            </p>
          </div>
          <button className="text-primary-600 text-sm hover:underline">
            Change
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-dashed border-neutral-200">
          <ul className="space-y-2">
            {plan.features.slice(0, 5).map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        
        {discount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex justify-between text-green-600"
          >
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Discount ({coupon?.code})
            </span>
            <span>-₹{discount.toLocaleString()}</span>
          </motion.div>
        )}
        
        {gst > 0 && (
          <div className="flex justify-between text-neutral-600">
            <span>GST (18%)</span>
            <span>₹{Math.round(gst).toLocaleString()}</span>
          </div>
        )}
        
        <div className="pt-3 border-t border-neutral-200">
          <div className="flex justify-between text-lg font-semibold text-neutral-900">
            <span>Total</span>
            <motion.span
              key={total}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ₹{Math.round(total).toLocaleString()}
            </motion.span>
          </div>
          {billingCycle === 'yearly' && (
            <p className="text-sm text-neutral-500 mt-1">
              That's just ₹{Math.round(total / 12).toLocaleString()}/month
            </p>
          )}
        </div>
      </div>

      {/* Trust Signals */}
      <div className="pt-4 border-t border-neutral-200 space-y-3">
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <Shield className="w-5 h-5 text-green-500" />
          <span>Secured by 256-bit SSL encryption</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <RotateCcw className="w-5 h-5 text-blue-500" />
          <span>30-day money-back guarantee</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <Lock className="w-5 h-5 text-purple-500" />
          <span>PCI DSS compliant payments</span>
        </div>
      </div>

      {/* Payment Logos */}
      <div className="flex items-center justify-center gap-4 pt-4 opacity-50">
        <img src="/payment/visa.svg" alt="Visa" className="h-6" />
        <img src="/payment/mastercard.svg" alt="Mastercard" className="h-6" />
        <img src="/payment/rupay.svg" alt="RuPay" className="h-6" />
        <img src="/payment/upi.svg" alt="UPI" className="h-6" />
      </div>
    </div>
  );
}
```

---

### 3.7 Payment Success Page (`/checkout/success`)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │                    🎉 [Confetti Animation]                           │   │
│   │                                                                      │   │
│   │                         ┌─────────────┐                              │   │
│   │                         │      ✓      │                              │   │
│   │                         │             │                              │   │
│   │                         └─────────────┘                              │   │
│   │                                                                      │   │
│   │                    Payment Successful!                               │   │
│   │                                                                      │   │
│   │             Welcome to Clinicia, Dr. Sharma!                         │   │
│   │                                                                      │   │
│   │   ────────────────────────────────────────────────────────────────   │   │
│   │                                                                      │   │
│   │   ┌──────────────────────────────────────────────────────────────┐  │   │
│   │   │                                                               │  │   │
│   │   │   Order Details                                               │  │   │
│   │   │   ───────────                                                 │  │   │
│   │   │   Plan: PRO (Yearly)                                          │  │   │
│   │   │   Amount: ₹18,870                                             │  │   │
│   │   │   Invoice: #INV-2026-00142                                    │  │   │
│   │   │   Payment ID: pay_LmN7KpQr8STUV                               │  │   │
│   │   │                                                               │  │   │
│   │   │   [📄 Download Invoice]                                       │  │   │
│   │   │                                                               │  │   │
│   │   └──────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌──────────────────────────────────────────────────────────────┐  │   │
│   │   │                                                               │  │   │
│   │   │   🚀 What's Next?                                             │  │   │
│   │   │                                                               │  │   │
│   │   │   ☑️ 1. Set up your first patient                             │  │   │
│   │   │   ☐ 2. Configure your schedule                                │  │   │
│   │   │   ☐ 3. Invite your team                                       │  │   │
│   │   │   ☐ 4. Download mobile app                                    │  │   │
│   │   │                                                               │  │   │
│   │   └──────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌────────────────────┐    ┌────────────────────┐                  │   │
│   │   │                    │    │                    │                  │   │
│   │   │   📱 Download App  │    │   🖥️ Go to Dashboard│                  │   │
│   │   │                    │    │                    │                  │   │
│   │   │   [QR Code]        │    │   [Launch →]       │                  │   │
│   │   │                    │    │                    │                  │   │
│   │   │   iOS | Android    │    │                    │                  │   │
│   │   │                    │    │                    │                  │   │
│   │   └────────────────────┘    └────────────────────┘                  │   │
│   │                                                                      │   │
│   │   📧 A confirmation email has been sent to dr.sharma@clinic.com     │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Success Animation Component:**
```tsx
// components/checkout/SuccessAnimation.tsx
export function SuccessAnimation() {
  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0D8FED', '#00CCB3', '#F59E0B'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0D8FED', '#00CCB3', '#F59E0B'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="relative"
    >
      {/* Animated Circle */}
      <motion.div
        className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, times: [0, 0.6, 1] }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </motion.div>
      </motion.div>

      {/* Pulse Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-green-200"
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1, repeat: 2 }}
      />
    </motion.div>
  );
}
```

**Onboarding Checklist Component:**
```tsx
// components/checkout/OnboardingChecklist.tsx
const checklistItems = [
  { id: 'patient', label: 'Set up your first patient', href: '/patients/new', icon: UserPlus },
  { id: 'schedule', label: 'Configure your schedule', href: '/settings/schedule', icon: Calendar },
  { id: 'team', label: 'Invite your team', href: '/settings/team', icon: Users },
  { id: 'app', label: 'Download mobile app', href: '#mobile-app', icon: Smartphone },
];

export function OnboardingChecklist({ completedItems = [] }) {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-primary-500" />
        What's Next?
      </h3>
      
      <ul className="space-y-3">
        {checklistItems.map((item, index) => {
          const isCompleted = completedItems.includes(item.id);
          const Icon = item.icon;
          
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all',
                  isCompleted
                    ? 'bg-green-50 text-green-700'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  isCompleted ? 'bg-green-100' : 'bg-neutral-100'
                )}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="text-sm font-semibold text-neutral-500">
                      {index + 1}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'flex-1',
                  isCompleted && 'line-through'
                )}>
                  {item.label}
                </span>
                <Icon className="w-5 h-5 text-neutral-400" />
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
```

**Mobile App QR Code:**
```tsx
// components/checkout/MobileAppQR.tsx
export function MobileAppQR() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
      <Smartphone className="w-8 h-8 text-primary-500 mx-auto mb-4" />
      <h3 className="font-semibold text-neutral-900 mb-2">
        Get the Mobile App
      </h3>
      <p className="text-sm text-neutral-500 mb-4">
        Scan QR code to download
      </p>
      
      <div className="w-32 h-32 mx-auto mb-4 bg-neutral-100 rounded-xl flex items-center justify-center">
        <QRCode 
          value="https://clinicia.com/app" 
          size={112}
          level="H"
        />
      </div>
      
      <div className="flex justify-center gap-3">
        <Link href="https://apps.apple.com/clinicia" target="_blank">
          <img src="/badges/app-store.svg" alt="App Store" className="h-10" />
        </Link>
        <Link href="https://play.google.com/store/apps/details?id=com.clinicia" target="_blank">
          <img src="/badges/play-store.svg" alt="Play Store" className="h-10" />
        </Link>
      </div>
    </div>
  );
}
```

---

### 3.8 Account Management Dashboard (`/account`)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Header: Logo + User Avatar Dropdown]                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────────────────────────────────────┐ │
│  │                  │  │                                                   │ │
│  │   SIDEBAR        │  │              MAIN CONTENT                         │ │
│  │                  │  │                                                   │ │
│  │   ───────────    │  │   ┌───────────────────────────────────────────┐  │ │
│  │                  │  │   │                                            │  │ │
│  │   👤 Profile     │  │   │   SUBSCRIPTION OVERVIEW                    │  │ │
│  │                  │  │   │                                            │  │ │
│  │   💳 Billing     │  │   │   ┌────────────────┐  ┌────────────────┐  │  │ │
│  │                  │  │   │   │                │  │                │  │  │ │
│  │   📦 Subscription│  │   │   │  Current Plan  │  │  Next Billing  │  │  │ │
│  │                  │  │   │   │  PRO           │  │  Feb 29, 2027  │  │  │ │
│  │   📋 Invoices    │  │   │   │                │  │  ₹19,990       │  │  │ │
│  │                  │  │   │   └────────────────┘  └────────────────┘  │  │ │
│  │   💳 Payment     │  │   │                                            │  │ │
│  │      Methods     │  │   │   [Upgrade Plan]  [Manage Subscription]   │  │ │
│  │                  │  │   │                                            │  │ │
│  │   👥 Team        │  │   └───────────────────────────────────────────┘  │ │
│  │                  │  │                                                   │ │
│  │   ⚙️ Settings    │  │   ┌───────────────────────────────────────────┐  │ │
│  │                  │  │   │                                            │  │ │
│  │   ───────────    │  │   │   RECENT INVOICES                         │  │ │
│  │                  │  │   │                                            │  │ │
│  │   [Help Center]  │  │   │   #INV-2026-00142  Jan 29  ₹18,870  [PDF] │  │ │
│  │   [Logout]       │  │   │   #INV-2025-00089  Jan 29  ₹19,990  [PDF] │  │ │
│  │                  │  │   │   #INV-2024-00012  Jan 29  ₹19,990  [PDF] │  │ │
│  │                  │  │   │                                            │  │ │
│  │                  │  │   │   [View All Invoices →]                   │  │ │
│  │                  │  │   │                                            │  │ │
│  │                  │  │   └───────────────────────────────────────────┘  │ │
│  │                  │  │                                                   │ │
│  └──────────────────┘  └──────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Subscription Card Component:**
```tsx
// components/account/SubscriptionCard.tsx
export function SubscriptionCard({ subscription }) {
  const daysUntilRenewal = differenceInDays(
    new Date(subscription.currentPeriodEnd),
    new Date()
  );

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-primary-100 text-sm mb-1">Current Plan</p>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            {subscription.planId === 'PRO' && <TrendingUp className="w-8 h-8" />}
            {subscription.planId === 'ENTERPRISE' && <Crown className="w-8 h-8" />}
            {subscription.planId}
          </h2>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white">
          {subscription.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-primary-100 text-sm mb-1">Next Billing</p>
          <p className="text-xl font-semibold">
            {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
          </p>
          <p className="text-primary-200 text-sm">
            in {daysUntilRenewal} days
          </p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-primary-100 text-sm mb-1">Amount Due</p>
          <p className="text-xl font-semibold">
            ₹{subscription.amount.toLocaleString()}
          </p>
          <p className="text-primary-200 text-sm">
            {subscription.billingCycle === 'yearly' ? 'per year' : 'per month'}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1">
          Upgrade Plan
        </Button>
        <Button variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
          Manage
        </Button>
      </div>

      {subscription.cancelAtPeriodEnd && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-orange-500/20 rounded-lg flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm">
            Your subscription will cancel on {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
          </p>
          <Button size="sm" variant="ghost" className="ml-auto">
            Reactivate
          </Button>
        </motion.div>
      )}
    </div>
  );
}
```

---

### 3.9 Login Page (`/login`)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │  ┌─────────────────────┐                ┌─────────────────────────┐ │   │
│   │  │                     │                │                         │ │   │
│   │  │    LEFT PANEL       │                │      RIGHT PANEL        │ │   │
│   │  │    (Decorative)     │                │      (Form Area)        │ │   │
│   │  │                     │                │                         │ │   │
│   │  │  ┌───────────────┐  │                │  ┌───────────────────┐  │ │   │
│   │  │  │               │  │                │  │                   │  │ │   │
│   │  │  │  [Logo]       │  │                │  │  Welcome back     │  │ │   │
│   │  │  │               │  │                │  │                   │  │ │   │
│   │  │  │  Welcome back │  │                │  │  Sign in to your  │  │ │   │
│   │  │  │  to Clinicia  │  │                │  │  account          │  │ │   │
│   │  │  │               │  │                │  │                   │  │ │   │
│   │  │  │  [Dashboard   │  │                │  │  ┌─────────────┐  │  │ │   │
│   │  │  │   Preview     │  │                │  │  │ Email       │  │  │ │   │
│   │  │  │   Image]      │  │                │  │  └─────────────┘  │  │ │   │
│   │  │  │               │  │                │  │  ┌─────────────┐  │  │ │   │
│   │  │  │               │  │                │  │  │ Password 👁️ │  │  │ │   │
│   │  │  │               │  │                │  │  └─────────────┘  │  │ │   │
│   │  │  │               │  │                │  │                   │  │ │   │
│   │  │  └───────────────┘  │                │  │  ☑️ Remember me   │  │ │   │
│   │  │                     │                │  │  [Forgot password?]│  │ │   │
│   │  │                     │                │  │                   │  │ │   │
│   │  │                     │                │  │  [Sign In →]      │  │ │   │
│   │  │                     │                │  │                   │  │ │   │
│   │  │                     │                │  │  ─── or ───       │  │ │   │
│   │  │                     │                │  │                   │  │ │   │
│   │  │                     │                │  │  [Google] [Apple] │  │ │   │
│   │  │                     │                │  │                   │  │ │   │
│   │  └─────────────────────┘                │  │  Don't have an    │  │ │   │
│   │                                          │  │  account? Sign up │  │ │   │
│   │                                          │  │                   │  │ │   │
│   │                                          │  └───────────────────┘  │ │   │
│   │                                          │                         │ │   │
│   │                                          └─────────────────────────┘ │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.10 Password Reset Flow (`/reset-password`)

**Step 1: Request Reset**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                         ┌─────────────────────────┐                          │
│                         │                         │                          │
│                         │   🔑 [Lock Icon]        │                          │
│                         │                         │                          │
│                         │   Forgot Password?      │                          │
│                         │                         │                          │
│                         │   No worries! Enter your│                          │
│                         │   email and we'll send  │                          │
│                         │   reset instructions.   │                          │
│                         │                         │                          │
│                         │   ┌─────────────────┐   │                          │
│                         │   │ Email           │   │                          │
│                         │   └─────────────────┘   │                          │
│                         │                         │                          │
│                         │   [Send Reset Link →]   │                          │
│                         │                         │                          │
│                         │   [← Back to Login]     │                          │
│                         │                         │                          │
│                         └─────────────────────────┘                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Step 2: Check Email Confirmation**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                         ┌─────────────────────────┐                          │
│                         │                         │                          │
│                         │   ✉️ [Email Icon]       │                          │
│                         │                         │                          │
│                         │   Check your inbox      │                          │
│                         │                         │                          │
│                         │   We've sent a password │                          │
│                         │   reset link to:        │                          │
│                         │                         │                          │
│                         │   dr.sharma@clinic.com  │                          │
│                         │                         │                          │
│                         │   Link expires in       │                          │
│                         │   1 hour                │                          │
│                         │                         │                          │
│                         │   [Open Email App]      │                          │
│                         │   [Resend Link]         │                          │
│                         │                         │                          │
│                         └─────────────────────────┘                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Step 3: Set New Password**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                         ┌─────────────────────────┐                          │
│                         │                         │                          │
│                         │   🔐 [Lock Icon]        │                          │
│                         │                         │                          │
│                         │   Create New Password   │                          │
│                         │                         │                          │
│                         │   ┌─────────────────┐   │                          │
│                         │   │ New Password 👁️ │   │                          │
│                         │   └─────────────────┘   │                          │
│                         │   [Password Strength]   │                          │
│                         │   ▓▓▓▓░░ Good          │                          │
│                         │                         │                          │
│                         │   ┌─────────────────┐   │                          │
│                         │   │ Confirm Password│   │                          │
│                         │   └─────────────────┘   │                          │
│                         │                         │                          │
│                         │   [Reset Password →]    │                          │
│                         │                         │                          │
│                         └─────────────────────────┘                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Advanced UI Components Library

### 4.1 Core UI Components (shadcn/ui Extended)

```typescript
// Extended shadcn/ui components with custom variants

// Button Component with gradient and glow variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg",
        secondary: "bg-secondary-500 text-white hover:bg-secondary-600",
        outline: "border-2 border-neutral-200 bg-transparent hover:bg-neutral-50",
        ghost: "hover:bg-neutral-100",
        link: "text-primary-500 underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        glow: "bg-primary-500 text-white shadow-[0_0_20px_rgba(13,143,237,0.4)] hover:shadow-[0_0_30px_rgba(13,143,237,0.6)]",
        destructive: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// Input Component with floating label
export function FloatingInput({ 
  label, 
  error, 
  success,
  icon: Icon,
  ...props 
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!props.value;

  return (
    <div className="relative">
      {Icon && (
        <Icon className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
          focused ? "text-primary-500" : "text-neutral-400"
        )} />
      )}
      
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        className={cn(
          "peer w-full px-4 py-4 pt-6 rounded-xl border-2 outline-none transition-all",
          "placeholder-transparent",
          Icon && "pl-12",
          error && "border-red-500 focus:border-red-500",
          success && "border-green-500 focus:border-green-500",
          !error && !success && "border-neutral-200 focus:border-primary-500"
        )}
      />
      
      <label className={cn(
        "absolute left-4 transition-all pointer-events-none",
        Icon && "left-12",
        (focused || hasValue) 
          ? "top-2 text-xs text-primary-500" 
          : "top-1/2 -translate-y-1/2 text-neutral-400"
      )}>
        {label}
      </label>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500 flex items-center gap-1"
        >
          <XCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Card with hover effects
export function HoverCard({ children, className, ...props }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "bg-white rounded-2xl border border-neutral-200",
        "shadow-sm hover:shadow-xl transition-shadow duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Badge with variants
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-700",
        primary: "bg-primary-100 text-primary-700",
        secondary: "bg-secondary-100 text-secondary-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-orange-100 text-orange-700",
        error: "bg-red-100 text-red-700",
        new: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white",
        gradient: "bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 border border-primary-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

### 4.2 Animation Components

```tsx
// Animated Counter (for pricing, stats)
export function AnimatedNumber({ 
  value, 
  duration = 1,
  formatFn = (n) => n.toLocaleString()
}: { 
  value: number; 
  duration?: number;
  formatFn?: (n: number) => string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      
      const currentValue = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    previousValue.current = value;
  }, [value, duration]);

  return <span>{formatFn(displayValue)}</span>;
}

// Staggered List Animation
export function StaggeredList({ children, delay = 0.05 }: StaggeredListProps) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: delay },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.li
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          {child}
        </motion.li>
      ))}
    </motion.ul>
  );
}

// Parallax Scroll Effect
export function ParallaxSection({ children, speed = 0.5 }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

// Reveal on Scroll
export function RevealOnScroll({ children, direction = 'up' }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

// Gradient Mesh Background
export function GradientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(at 40% 20%, hsla(212, 93%, 49%, 0.3) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(174, 100%, 40%, 0.2) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(212, 93%, 49%, 0.2) 0px, transparent 50%),
            radial-gradient(at 80% 50%, hsla(174, 100%, 40%, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(212, 93%, 49%, 0.1) 0px, transparent 50%)
          `,
        }}
      />
    </div>
  );
}

// Floating Orbs Animation
export function FloatingOrbs() {
  return (
    <>
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-primary-500/10 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: '10%', left: '10%' }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-secondary-500/10 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ bottom: '20%', right: '10%' }}
      />
    </>
  );
}

// Page Transition Wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

### 4.3 Form Components

```tsx
// Multi-Select with Tags
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  maxItems,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) &&
      !value.includes(opt.value)
  );

  const addItem = (item: string) => {
    if (maxItems && value.length >= maxItems) return;
    onChange([...value, item]);
    setSearch("");
  };

  const removeItem = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "min-h-[48px] p-2 rounded-xl border-2 cursor-text",
          "focus-within:border-primary-500 transition-colors",
          isOpen ? "border-primary-500" : "border-neutral-200"
        )}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {value.map((v) => {
              const option = options.find((o) => o.value === v);
              return (
                <motion.span
                  key={v}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1 rounded-full",
                    "bg-primary-100 text-primary-700 text-sm"
                  )}
                >
                  {option?.label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(v);
                    }}
                    className="hover:text-primary-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              );
            })}
          </AnimatePresence>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute z-50 w-full mt-2 py-2 bg-white rounded-xl",
              "border border-neutral-200 shadow-xl max-h-60 overflow-auto"
            )}
          >
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-2 text-neutral-500 text-sm">No options found</p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => addItem(option.value)}
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-neutral-50",
                    "flex items-center gap-3 transition-colors"
                  )}
                >
                  {option.icon && <option.icon className="w-5 h-5 text-neutral-400" />}
                  <span>{option.label}</span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Date Picker with Calendar
export function DatePicker({ value, onChange, minDate, maxDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());

  const daysInMonth = getDaysInMonth(viewDate);
  const firstDayOfMonth = startOfMonth(viewDate);
  const startingDayOfWeek = getDay(firstDayOfMonth);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
          "border-2 border-neutral-200 hover:border-neutral-300",
          "focus:border-primary-500 transition-colors"
        )}
      >
        <Calendar className="w-5 h-5 text-neutral-400" />
        <span className={value ? "text-neutral-900" : "text-neutral-400"}>
          {value ? format(value, "MMMM d, yyyy") : "Select a date"}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={cn(
              "absolute z-50 mt-2 p-4 bg-white rounded-xl",
              "border border-neutral-200 shadow-xl"
            )}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold">
                {format(viewDate, "MMMM yyyy")}
              </span>
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="w-10 h-10 flex items-center justify-center text-xs text-neutral-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="w-10 h-10" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = addDays(firstDayOfMonth, i);
                const isSelected = value && isSameDay(date, value);
                const isToday = isSameDay(date, new Date());
                const isDisabled =
                  (minDate && isBefore(date, minDate)) ||
                  (maxDate && isAfter(date, maxDate));

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (!isDisabled) {
                        onChange(date);
                        setIsOpen(false);
                      }
                    }}
                    disabled={isDisabled}
                    className={cn(
                      "w-10 h-10 rounded-lg text-sm transition-all",
                      isSelected && "bg-primary-500 text-white",
                      !isSelected && isToday && "bg-primary-100 text-primary-700",
                      !isSelected && !isToday && !isDisabled && "hover:bg-neutral-100",
                      isDisabled && "text-neutral-300 cursor-not-allowed"
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Phone Input with Country Code
export function PhoneInput({ value, onChange }: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');

  const countries = [
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+65', flag: '🇸🇬', name: 'Singapore' },
    { code: '+61', flag: '🇦🇺', name: 'Australia' },
  ];

  useEffect(() => {
    onChange(`${countryCode}${phone}`);
  }, [countryCode, phone]);

  return (
    <div className="flex gap-2">
      <Select value={countryCode} onValueChange={setCountryCode}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
        placeholder="9876543210"
        maxLength={10}
        className={cn(
          "flex-1 px-4 py-3 rounded-xl border-2 border-neutral-200",
          "focus:border-primary-500 outline-none transition-colors"
        )}
      />
    </div>
  );
}
```

### 4.4 Feedback Components

```tsx
// Toast Notifications
export function ToastProvider({ children }) {
  return (
    <ToastPrimitive.Provider>
      {children}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-2 w-96 max-w-[100vw] z-50" />
    </ToastPrimitive.Provider>
  );
}

export function toast(props: ToastProps) {
  // Implementation using Sonner or custom toast system
}

// Skeleton Loader
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-neutral-200",
        className
      )}
      {...props}
    />
  );
}

// Loading Spinner
export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <svg
      className={cn("animate-spin text-primary-500", sizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Empty State
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// Confetti Effect
export function triggerConfetti(options?: ConfettiOptions) {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#0D8FED', '#00CCB3', '#F59E0B', '#EF4444', '#8B5CF6'],
    ...options,
  });
}
```

---

## 5. Database Schema Additions

### 4.1 New Models for Registration Portal

```prisma
// Add to existing schema.prisma

model RegistrationSession {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  email         String   @unique
  
  // Partial registration data
  step          Int      @default(1)  // Current wizard step
  accountData   Json?    // Step 1 data
  clinicData    Json?    // Step 2 data
  planData      Json?    // Step 3 data
  
  // Verification
  emailVerified Boolean  @default(false)
  verifyToken   String?
  verifyExpiry  DateTime?
  
  // Conversion tracking
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  referralCode  String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  expiresAt     DateTime // Auto-delete after 7 days if incomplete
}

model PaymentTransaction {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  clinicId        String?  @db.ObjectId
  subscriptionId  String?  @db.ObjectId
  
  // Payment Gateway Info
  provider        String   // 'STRIPE', 'RAZORPAY'
  providerTxnId   String   @unique  // External transaction ID
  orderId         String?  // Razorpay order ID
  
  // Amount
  amount          Float
  currency        String
  
  // Status
  status          String   // PENDING, SUCCESS, FAILED, REFUNDED
  failureReason   String?
  
  // Invoice
  invoiceNumber   String?  @unique
  invoicePdf      String?  // S3/Firebase Storage URL
  
  // Tax
  taxAmount       Float?
  gstin           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Coupon {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  code            String   @unique
  
  discountType    String   // 'PERCENT', 'FIXED'
  discountValue   Float    // 20 for 20% or 500 for ₹500
  
  applicablePlans String[] // ['PRO', 'ENTERPRISE'] or ['ALL']
  minPurchase     Float?   // Minimum cart value
  maxDiscount     Float?   // Cap for percentage discounts
  
  usageLimit      Int?     // Total times coupon can be used
  usedCount       Int      @default(0)
  perUserLimit    Int      @default(1)
  
  validFrom       DateTime
  validUntil      DateTime
  
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ReferralCode {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  referrerId      String   @db.ObjectId  // Clinic ID of referrer
  code            String   @unique
  
  rewardType      String   // 'CREDIT', 'DISCOUNT', 'FREE_MONTH'
  rewardValue     Float
  
  usedBy          String[] @db.ObjectId  // Clinic IDs who used this code
  
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model WaitlistEntry {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  email           String   @unique
  name            String?
  clinicName      String?
  specialty       String?
  country         String?
  
  source          String?  // 'LANDING', 'BLOG', 'SOCIAL'
  
  notified        Boolean  @default(false)
  convertedToUser Boolean  @default(false)
  
  createdAt       DateTime @default(now())
}
```

---

## 5. API Endpoints

### 5.1 Registration Endpoints

```typescript
// POST /api/register/initiate
// Start registration, send verification email
{
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}
// Response: { sessionId: string, message: "Verification email sent" }

// POST /api/register/verify-email
// Verify email with OTP
{
  email: string;
  otp: string;
}
// Response: { verified: true }

// POST /api/register/resend-otp
{
  email: string;
}
// Response: { message: "OTP resent" }

// PUT /api/register/clinic-setup
// Save clinic information
{
  sessionId: string;
  clinicData: { ... }
}

// PUT /api/register/select-plan
// Save plan selection
{
  sessionId: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  billingCycle: 'MONTHLY' | 'YEARLY';
}

// POST /api/register/complete-free
// Complete FREE plan registration
{
  sessionId: string;
}
// Response: { clinicId, userId, redirectUrl }

// POST /api/register/create-checkout
// Create payment session for paid plans
{
  sessionId: string;
  couponCode?: string;
  billingDetails: { ... }
}
// Response: { checkoutUrl: string } (Stripe) or { orderId, options } (Razorpay)
```

### 5.2 Payment Endpoints

```typescript
// POST /api/payments/stripe/webhook
// Stripe webhook handler for payment events

// POST /api/payments/razorpay/webhook
// Razorpay webhook handler

// POST /api/payments/verify
// Verify payment completion
{
  provider: 'STRIPE' | 'RAZORPAY';
  paymentId: string;
  orderId?: string;
  signature?: string;  // Razorpay signature
}

// GET /api/payments/invoice/:transactionId
// Download invoice PDF

// POST /api/coupons/validate
{
  code: string;
  planId: string;
  amount: number;
}
// Response: { valid: boolean, discount: number, finalAmount: number }
```

### 5.3 Subscription Management Endpoints

```typescript
// GET /api/subscription
// Get current subscription details

// POST /api/subscription/upgrade
{
  newPlan: 'PRO' | 'ENTERPRISE';
  billingCycle: 'MONTHLY' | 'YEARLY';
}

// POST /api/subscription/cancel
{
  reason: string;
  feedback?: string;
}

// POST /api/subscription/reactivate
// Reactivate a canceled subscription before period ends

// PUT /api/subscription/payment-method
// Update default payment method
{
  paymentMethodId: string;  // Stripe PM ID
}
```

---

## 6. Security Requirements

### 6.1 Authentication & Authorization

- All API endpoints require authentication (except public pages)
- JWT tokens via Firebase Auth
- Role-based access control (RBAC)
- Session timeout: 24 hours (configurable)
- Refresh token rotation

### 6.2 Data Protection

- All data encrypted in transit (TLS 1.3)
- Sensitive data encrypted at rest (MongoDB encryption)
- PII data handling compliant with:
  - GDPR (Europe)
  - HIPAA (Healthcare data - US)
  - DPDP Act 2023 (India)
- Password hashing: bcrypt with salt rounds ≥ 12
- No plaintext passwords stored or logged

### 6.3 Payment Security

- PCI-DSS compliance via Stripe/Razorpay
- No card data stored on our servers
- Webhook signature verification
- Idempotency keys for payment requests
- Rate limiting on payment endpoints

### 6.4 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Login attempts | 5 per minute per IP |
| Password reset | 3 per hour per email |
| OTP resend | 1 per 60 seconds |
| Registration | 10 per hour per IP |
| Payment attempts | 10 per hour per user |

### 6.5 Security Headers

```typescript
// Middleware security headers
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.razorpay.com",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

---

## 7. Email Templates

### 7.1 Required Email Templates

1. **Welcome Email**
   - Subject: "Welcome to Clinicia! 🎉"
   - Content: Login link, getting started guide, support contact

2. **Email Verification**
   - Subject: "Verify your Clinicia account"
   - Content: OTP code or magic link, expiry time

3. **Password Reset**
   - Subject: "Reset your Clinicia password"
   - Content: Reset link, expiry notice, security warning

4. **Payment Successful**
   - Subject: "Payment confirmed - Invoice #INV-XXXX"
   - Content: Receipt details, invoice PDF attachment

5. **Payment Failed**
   - Subject: "Action required: Payment failed"
   - Content: Retry link, alternative payment options

6. **Subscription Renewal Reminder**
   - Subject: "Your subscription renews in 7 days"
   - Sent: 7 days, 3 days, 1 day before renewal

7. **Subscription Canceled**
   - Subject: "We're sad to see you go"
   - Content: Access until date, reactivation link

8. **Trial Ending**
   - Subject: "Your free trial ends in 3 days"
   - Content: Upgrade CTA, plan comparison

9. **Invoice**
   - Subject: "Invoice #INV-XXXX from Clinicia"
   - PDF attachment with GST details (India)

10. **Team Invitation**
    - Subject: "[Clinic Name] invited you to join Clinicia"
    - Content: Invitation link, role info

---

## 8. Analytics & Tracking

### 8.1 Events to Track

```typescript
// Registration Funnel
'registration_started'
'email_verified'
'clinic_setup_completed'
'plan_selected'
'checkout_initiated'
'payment_completed'
'registration_completed'
'registration_abandoned' // User left at step X

// Subscription Events
'subscription_upgraded'
'subscription_downgraded'
'subscription_canceled'
'subscription_reactivated'
'payment_failed'
'payment_retry_success'

// Engagement
'page_view'
'feature_clicked'
'pricing_page_viewed'
'plan_comparison_viewed'
'faq_expanded'
'contact_sales_clicked'
'demo_requested'
```

### 8.2 Attribution Tracking

- UTM parameters: source, medium, campaign, content, term
- Referral code tracking
- First-touch and last-touch attribution
- Conversion window: 30 days

### 8.3 Tools Integration

- Google Analytics 4
- Mixpanel / Amplitude (product analytics)
- Hotjar / Microsoft Clarity (session recordings)
- Facebook Pixel / Google Ads (remarketing)

---

## 9. Localization

### 9.1 Supported Languages (Phase 1)

- English (default)
- Hindi (India)

### 9.2 Currency & Region Support

| Region | Currency | Payment Gateway | Tax |
|--------|----------|-----------------|-----|
| India | INR | Razorpay | 18% GST |
| US | USD | Stripe | State sales tax |
| EU | EUR | Stripe | VAT |
| UK | GBP | Stripe | 20% VAT |
| Others | USD | Stripe | Varies |

### 9.3 Localization Requirements

- Date formats: DD/MM/YYYY (India) vs MM/DD/YYYY (US)
- Phone number formats with country codes
- Address format variations
- Currency formatting (₹1,00,000 vs $100,000)
- GST invoice requirements for India

---

## 10. Mobile App Access Post-Registration

### 10.1 After Successful Registration

Users get access to `clinicia-mobile` app with:
- Same Firebase Auth credentials
- Automatic clinic context detection
- Features based on subscription plan
- Push notifications enabled

### 10.2 App Download CTAs

Display on:
- Registration success page
- Welcome email
- Dashboard sidebar
- QR code for easy mobile download

---

## 11. Admin Features (clinicia-admin Integration)

### 11.1 Super Admin Visibility

New registrations appear in `clinicia-admin`:
- Real-time tenant list updates
- Revenue tracking
- Subscription analytics
- Trial-to-paid conversion rates
- Churn metrics

### 11.2 Manual Tenant Actions

Super admins can:
- Extend trials
- Apply discounts
- Suspend/activate accounts
- Process refunds
- Override plan limits

---

## 12. Testing Requirements

### 12.1 Test Scenarios

1. **Happy Path**
   - Complete registration with FREE plan
   - Complete registration with paid plan (card)
   - Complete registration with UPI (India)

2. **Edge Cases**
   - Email already registered
   - Invalid/expired verification link
   - Payment failure and retry
   - Coupon code edge cases
   - Network interruption during payment

3. **Security Tests**
   - SQL injection attempts
   - XSS attempts
   - CSRF protection
   - Rate limiting enforcement
   - Webhook signature validation

### 12.2 Test Accounts

```
# Stripe Test Cards
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184

# Razorpay Test
Success: 4111 1111 1111 1111
UPI: success@razorpay
```

---

## 13. Launch Checklist

### 13.1 Pre-Launch

- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] SSL certificate configured
- [ ] Payment gateway production keys
- [ ] Email service configured (production)
- [ ] Analytics tracking verified
- [ ] Legal pages live (Privacy Policy, Terms, Refund Policy)
- [ ] GDPR cookie consent banner
- [ ] Error monitoring (Sentry) configured
- [ ] Load testing passed
- [ ] Security audit completed
- [ ] Backup & recovery tested

### 13.2 Post-Launch

- [ ] Monitor error rates
- [ ] Monitor conversion funnel
- [ ] Check payment success rates
- [ ] Review email deliverability
- [ ] Monitor server performance
- [ ] Customer support ready

---

## 14. File Structure (Proposed)

```
clinicia-registration/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   │   ├── page.tsx                # Wizard container
│   │   │   ├── clinic-setup/
│   │   │   ├── plan-selection/
│   │   │   └── team-setup/
│   │   ├── checkout/
│   │   │   ├── page.tsx
│   │   │   └── success/
│   │   │       └── page.tsx
│   │   ├── account/
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── billing/
│   │   │   ├── subscription/
│   │   │   └── settings/
│   │   ├── reset-password/
│   │   │   ├── page.tsx
│   │   │   └── [token]/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── register/
│   │       ├── payments/
│   │       ├── subscription/
│   │       └── webhooks/
│   ├── components/
│   │   ├── landing/
│   │   ├── pricing/
│   │   ├── registration/
│   │   ├── checkout/
│   │   ├── account/
│   │   └── ui/                         # shadcn components
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── stripe.ts
│   │   ├── razorpay.ts
│   │   ├── email.ts
│   │   └── validations.ts
│   └── hooks/
│       ├── useRegistration.ts
│       └── useSubscription.ts
├── public/
├── prisma/
│   └── schema.prisma
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## 15. Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# MongoDB
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Email
SENDGRID_API_KEY=
EMAIL_FROM=noreply@clinicia.com

# App URLs
NEXT_PUBLIC_APP_URL=https://register.clinicia.com
NEXT_PUBLIC_WEB_APP_URL=https://app.clinicia.com
NEXT_PUBLIC_ADMIN_URL=https://admin.clinicia.com

# Analytics
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_MIXPANEL_TOKEN=

# Other
NEXT_PUBLIC_ENVIRONMENT=production
```

---

## Summary

This Registration Portal will serve as the unified entry point for all new Clinicia customers, providing:

✅ **Self-service onboarding** - No manual intervention needed  
✅ **Multi-plan support** - FREE, PRO, ENTERPRISE  
✅ **Flexible payments** - Stripe (global) + Razorpay (India)  
✅ **Seamless integration** - Works with existing clinicia-web and clinicia-mobile  
✅ **Admin visibility** - All registrations visible in clinicia-admin  
✅ **Secure & compliant** - GDPR, HIPAA-ready, PCI-DSS via payment gateways

---

**Document Version:** 1.0  
**Last Updated:** January 29, 2026  
**Author:** Development Team  
**Status:** Ready for Implementation
