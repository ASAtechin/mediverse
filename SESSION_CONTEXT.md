# 🚀 Clinicia — Session Context & Roadmap
> **Last updated:** 22 February 2026  
> **Purpose:** Load this file at the start of any new AI coding session to restore full context.

---

## 📁 Project Structure (Post-Cleanup)

```
clincia replica/                  ← Mono-repo root
├── README.md
├── PRODUCTION_PLAN.md            ← All Phase 1-3 items ✅ DONE
├── SPECIALTY_FEATURES_ROADMAP.md ← 6 specialty modules planned
├── REGISTRATION_WEBSITE_REQUIREMENTS.md ← Full SaaS landing page spec
├── docker-compose.yml
├── start-all.sh / start-headless.sh / stop-headless.sh
│
├── clinicia-web/                 ← Main web app (Next.js 14 App Router)
│   ├── prisma/schema.prisma     ← MongoDB + Prisma ORM
│   └── src/
│       ├── actions/              ← Server Actions (appointment, patient, doctor, dashboard, etc.)
│       ├── app/(dashboard)/      ← Dashboard pages (patients, doctors, appointments, emr, billing, etc.)
│       ├── components/           ← UI components (doctors/, patients/, appointments/, layout/, ui/)
│       ├── context/AuthContext    ← Firebase auth + session management
│       ├── lib/                  ← DB, auth-session, firebase-admin, utils
│       └── middleware.ts         ← Route protection (GUEST_ONLY, PUBLIC, PROTECTED)
│
├── clinicia-backend/             ← Express + Socket.IO real-time server
│   ├── prisma/schema.prisma
│   └── src/ (routes, middleware, lib)
│
├── clinicia-admin/               ← Admin portal (Next.js)
│
└── clinicia-mobile/              ← React Native / Expo mobile app
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Framer Motion, Recharts, SWR |
| Auth | Firebase Auth (Email, Google, Apple) + httpOnly `__session` cookie |
| Database | MongoDB (Atlas) via Prisma ORM |
| Real-time | Socket.IO (clinicia-backend) |
| Deployment | Railway (web app + backend) |
| Mobile | React Native / Expo |

---

## ✅ What's Already Built & Working

### Core Features
- **Authentication:** Email/password + Google + Apple sign-in; session cookies; token auto-refresh; auth guards
- **Dashboard:** Real-time stats (patients, appointments, revenue, treatments) via SWR with auto-refresh
- **Patients:** Full CRUD, search, add dialog with validation, auto-refresh after add
- **Doctors:** Full CRUD, card-based UI, add/edit/delete with role-gating (ADMIN only), specialization dropdown
- **Appointments:** Client-side fetching, instant refresh after booking, search, smart doctor assignment (solo-practitioner auto-assign)
- **EMR / Clinical Records:** Visit form, vitals, AI scribe (transcript + summary), prescription manager
- **Billing:** Invoice creation, paid/pending tracking
- **Expenses:** CRUD with categories
- **Settings:** Clinic profile management
- **Loading skeletons:** Dashboard-level loading.tsx for instant tab switching

### Architecture Quality
- Zero TypeScript errors
- Server Actions with proper auth gating (`requireAuth()`)
- Clinic-scoped data isolation (multi-tenant)
- SUPER_ADMIN can access any clinic
- Form validation (phone format, email format, date ranges, duplicate checks, 30-min appointment collision)

---

## 🔜 NEXT SESSION — Feature Roadmap

### Priority 1: AI-Powered Features 🤖
These are the differentiators that make Clinicia stand out:

1. **AI Clinical Notes / Scribe** (partially built in EMR)
   - Voice-to-text during consultations → auto-generate SOAP notes
   - Structured extraction: symptoms, diagnosis, prescriptions
   - Uses OpenAI/Gemini API

2. **Smart Appointment Suggestions**
   - Auto-suggest duration based on appointment type
   - Recommend follow-up dates based on condition
   - Predict no-shows based on patient history

3. **AI Insights Dashboard Widget**
   - "Patient X's blood pressure trending up over 3 visits"
   - "Revenue is 20% higher than last month"
   - Auto-generated clinic health report

4. **Prescription AI Assistant**
   - Drug interaction warnings
   - Dosage suggestions based on age/weight
   - Auto-complete from drug database

### Priority 2: Specialty Modules (from SPECIALTY_FEATURES_ROADMAP.md)

| # | Module | Key Feature | Effort |
|---|--------|------------|--------|
| 1 | 🦷 Dental Charting | Interactive 32-tooth SVG, per-tooth treatment history | 2-3 weeks |
| 2 | 🧑‍⚕️ Physio Body Map | Clickable body diagram, pain tracking, exercise plans | 2-3 weeks |
| 3 | 👁️ Ophthalmology | Visual acuity, refraction, IOP tracking, Rx generator | 1-2 weeks |
| 4 | 🩺 Dermatology | Skin map, before/after photos, SCORAD scoring | 1-2 weeks |
| 5 | 🧠 Psychiatry | Session notes, mood tracker, PHQ-9/GAD-7 assessments | 1 week |
| 6 | 🤰 OB/GYN | Pregnancy tracker, growth charts, partograph | 2 weeks |

### Priority 3: Patient Engagement
- **WhatsApp Integration** — Appointment reminders, prescription sharing
- **Patient Portal / Mobile App** — Patients view records, book appointments, track vitals
- **Telemedicine** — Video consultations with in-app notes

### Priority 4: Business Features
- **Multi-language Support** — Hindi, Tamil, Telugu, Marathi
- **Stripe + Razorpay Payments** — Subscription billing for clinics
- **Analytics Dashboard** — Revenue trends, patient demographics, doctor performance
- **Lab Integration** — Digital lab orders and results
- **Inventory Management** — Stock alerts, reorder tracking

---

## 🗄️ Key Data Models (Prisma)

```
User          → id, email, name, phone, role (DOCTOR/ADMIN/STAFF), specialization, qualification, firebaseUid, clinicId
Patient       → id, firstName, lastName, dateOfBirth, gender, phone, email, clinicId
Appointment   → id, patientId, doctorId, date, status, type, notes, tokenNumber, clinicId
Visit         → id, patientId, appointmentId, symptoms, diagnosis, notes, transcript, aiSummary, clinicId
Vital         → id, patientId, visitId, weight, height, bp, pulse, temperature, spo2
Prescription  → id, visitId, medications (JSON)
Invoice       → id, clinicId, visitId, items[], totalAmount, status
Expense       → id, clinicId, date, category, amount, note
Clinic        → id, name, address, phone, ownerId, plan, status
```

---

## 🔑 Key Files to Know

| File | Purpose |
|------|---------|
| `src/context/AuthContext.tsx` | Client auth state, cookie management, token refresh |
| `src/lib/auth-session.ts` | Server-side `requireAuth()` — verifies Firebase token from cookie |
| `src/middleware.ts` | Route protection: GUEST_ONLY, PUBLIC, PROTECTED |
| `src/actions/*.ts` | All server actions (patient, doctor, appointment, dashboard, etc.) |
| `src/app/(dashboard)/layout.tsx` | Dashboard shell with Sidebar + AuthGuard |
| `src/app/(dashboard)/loading.tsx` | Skeleton loader for instant tab switching |
| `prisma/schema.prisma` | Full data model |

---

## ⚠️ Known Considerations
- Dashboard hooks fixed (moved above conditional return) — React rules of hooks compliant
- Appointments page is now a Client Component (same pattern as Patients) for instant refresh
- All Server Component pages (EMR, Billing, Prescriptions) benefit from loading.tsx skeleton
- Firebase Admin credentials must be set on Railway: `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Production URL: `mediverse-web-production.up.railway.app`
