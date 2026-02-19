# 🏥 Clinicia — Medical Specialty Features Roadmap

## Overview

These features add specialty-specific modules that differentiate Clinicia from generic clinic management software. Each specialty module enhances the patient profile, clinical records, and treatment tracking with field-specific visualizations and workflows.

---

## 🦷 Module 1: Dental Charting System

### Core Feature: Interactive Dental Chart
A visual representation of all 32 teeth (adult) / 20 teeth (pediatric) where each tooth is clickable and shows:

- **Treatment status:** Healthy, Cavity, Filled, Crown, Bridge, Implant, Extracted, Root Canal
- **Color coding:** Green (healthy), Yellow (watch), Red (needs treatment), Blue (treated), Gray (extracted)
- **Treatment history:** Click any tooth to see all past treatments with dates
- **Ongoing treatments:** Highlighted with a pulsing animation

### Implementation Details:

```
src/components/specialty/dental/
├── DentalChart.tsx          # Interactive SVG chart with all 32 teeth
├── ToothDetail.tsx          # Popup showing tooth history
├── DentalTreatmentForm.tsx  # Record treatment per tooth
├── DentalSummary.tsx        # Overview card for patient profile
└── tooth-paths.ts           # SVG path data for each tooth
```

### Data Model Addition:
```prisma
model DentalRecord {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  patientId   String   @db.ObjectId
  patient     Patient  @relation(fields: [patientId], references: [id])
  clinicId    String   @db.ObjectId
  clinic      Clinic   @relation(fields: [clinicId], references: [id])
  
  toothNumber Int      // 1-32 (FDI notation)
  quadrant    String   // UL, UR, LL, LR
  status      String   // HEALTHY, CAVITY, FILLED, CROWN, BRIDGE, IMPLANT, EXTRACTED, RCT
  surface     String?  // Mesial, Distal, Buccal, Lingual, Occlusal
  notes       String?
  treatmentDate DateTime @default(now())
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([patientId])
  @@index([clinicId])
}
```

### UI/UX:
- Full-mouth SVG diagram in patient profile → "Dental Chart" tab
- Click tooth → opens treatment history + add new record
- Print-ready dental chart for patient handouts
- Before/After treatment comparison view
- Orthodontic bracket tracking overlay (optional)

---

## 🧑‍⚕️ Module 2: Physiotherapy Body Mapping

### Core Feature: Interactive Body Diagram
A front/back/side human body diagram where therapists can:

- **Mark pain/problem areas:** Click on body regions to mark them
- **Color intensity:** Red gradient showing pain level (1-10 scale)
- **Treatment zones:** Mark areas receiving treatment (ultrasound, TENS, manual therapy)
- **Progress tracking:** Side-by-side comparison of pain maps over time
- **3D body model (stretch goal):** Three.js based rotatable body model

### Implementation Details:

```
src/components/specialty/physio/
├── BodyDiagram.tsx          # SVG front/back body with clickable regions
├── BodyRegionDetail.tsx     # Pain level, treatment notes per region
├── PhysioProgressChart.tsx  # Pain level over time (line chart)
├── ExercisePlan.tsx         # Prescribed exercises with images
├── PhysioSummary.tsx        # Overview card for patient profile
├── BodyModel3D.tsx          # Three.js 3D body (stretch goal)
└── body-regions.ts          # SVG region paths + metadata
```

### Data Model Addition:
```prisma
model PhysioRecord {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  patientId   String   @db.ObjectId
  patient     Patient  @relation(fields: [patientId], references: [id])
  clinicId    String   @db.ObjectId
  clinic      Clinic   @relation(fields: [clinicId], references: [id])
  
  bodyRegion  String   // NECK, SHOULDER_L, SHOULDER_R, LOWER_BACK, KNEE_L, etc.
  painLevel   Int      // 1-10
  condition   String   // Diagnosis: "Frozen Shoulder", "Sciatica", etc.
  treatment   String   // ULTRASOUND, TENS, MANUAL_THERAPY, EXERCISE, ICE, HEAT
  notes       String?
  sessionDate DateTime @default(now())
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([patientId])
  @@index([clinicId])
}

model ExercisePrescription {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  patientId   String   @db.ObjectId
  patient     Patient  @relation(fields: [patientId], references: [id])
  clinicId    String   @db.ObjectId
  
  exercises   ExerciseItem[]
  notes       String?
  startDate   DateTime
  endDate     DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

type ExerciseItem {
  name        String
  sets        Int
  reps        Int
  holdSeconds Int?
  imageUrl    String?
  instructions String?
}
```

### UI/UX:
- Body diagram in patient profile → "Body Map" tab
- Toggle front/back/side views
- Overlay mode: show all problem areas at once
- Session-by-session progress slider
- Exercise prescription builder with printable handout
- ROM (Range of Motion) tracking

---

## 👁️ Module 3: Ophthalmology

### Features:
- **Visual acuity chart** — Record OD/OS vision readings
- **Eye diagram** — Clickable anterior/posterior segment
- **Refraction records** — Sphere, Cylinder, Axis, Add for each eye
- **Prescription generator** — Auto-generate spectacle/contact lens prescriptions
- **IOP tracking** — Intraocular pressure over time graph
- **Surgical notes** — Template for cataract, LASIK, etc.

### Data Model:
```prisma
model EyeRecord {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  patientId   String   @db.ObjectId
  clinicId    String   @db.ObjectId
  
  eye         String   // OD (right) or OS (left)
  visionDist  String?  // "6/6", "6/12", etc.
  visionNear  String?  
  sphere      Float?
  cylinder    Float?
  axis        Int?
  addition    Float?
  iop         Float?   // Intraocular pressure
  diagnosis   String?
  notes       String?
  
  examDate    DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🩺 Module 4: Dermatology

### Features:
- **Skin diagram** — Full body surface map for marking lesions/conditions
- **Photo documentation** — Before/after photo timeline with zoom
- **SCORAD/PASI scoring** — Auto-calculate severity scores
- **Treatment protocols** — Templates for common conditions (acne, eczema, psoriasis)

---

## 🧠 Module 5: Psychiatry / Psychology

### Features:
- **Session notes** — Structured therapy session recording
- **Mood tracker** — Patient self-reported mood over time (chart)
- **Assessment scales** — PHQ-9, GAD-7, Beck Depression Inventory built-in
- **Medication tracker** — Psychotropic medication management with side effect logging
- **Appointment history** — Session frequency visualization

---

## 🤰 Module 6: Obstetrics & Gynecology

### Features:
- **Pregnancy tracker** — Gestational age calculator, EDD, trimester milestones
- **Growth charts** — Fundal height, fetal weight tracking
- **Ultrasound records** — Attach & annotate ultrasound images
- **Labor notes** — Partograph template
- **Postpartum checklist** — Follow-up care milestones

---

## 🏗️ Implementation Priority

| Priority | Module | Effort | Impact |
|----------|--------|--------|--------|
| 🥇 P1 | Dental Charting | 2-3 weeks | High — Dentists are a huge market |
| 🥈 P2 | Physiotherapy Body Map | 2-3 weeks | High — Visual progress tracking |
| 🥉 P3 | Ophthalmology | 1-2 weeks | Medium — Specialized but needed |
| P4 | Dermatology | 1-2 weeks | Medium — Photo-driven |
| P5 | Psychiatry | 1 week | Medium — Assessment tools |
| P6 | OB/GYN | 2 weeks | Medium — Pregnancy tracking |

---

## 🔧 Architecture: How Specialty Modules Plug In

### 1. Clinic Type Configuration
When a clinic registers, they select their specialty:
```typescript
type ClinicSpecialty = 
  | 'GENERAL' 
  | 'DENTAL' 
  | 'PHYSIOTHERAPY' 
  | 'OPHTHALMOLOGY' 
  | 'DERMATOLOGY' 
  | 'PSYCHIATRY' 
  | 'OBGYN'
  | 'MULTI_SPECIALTY';
```

### 2. Patient Profile Tabs
The patient profile dynamically loads specialty tabs based on the clinic type:
```
General:        [Overview] [Visits] [Vitals] [Prescriptions] [Billing]
Dental:         [Overview] [Dental Chart] [Visits] [Prescriptions] [Billing]
Physiotherapy:  [Overview] [Body Map] [Exercises] [Progress] [Billing]
Ophthalmology:  [Overview] [Eye Records] [Refraction] [Prescriptions] [Billing]
```

### 3. Dashboard Widgets
Each specialty gets custom dashboard widgets:
- **Dental:** "Treatments today by type" pie chart, "Teeth treated this month" counter
- **Physio:** "Active patients by condition" chart, "Average pain reduction" metric
- **Ophthalmology:** "Surgeries scheduled", "Prescription glasses dispensed"

---

## 💡 Additional Feature Ideas

### Cross-Specialty:
1. **Smart Appointment Scheduling** — Auto-suggest appointment duration based on treatment type
2. **Template Library** — Pre-built note templates per specialty
3. **Patient Portal Enhancements** — Patients see their dental chart / body map in the mobile app
4. **AI-Powered Insights** — "This patient's pain level has increased 30% over 3 sessions"
5. **Inter-clinic Referrals** — Refer patients between clinics on the platform
6. **Lab Integration** — Order and receive lab results digitally
7. **Telemedicine** — Video consultations with in-app notes
8. **Multi-language Support** — Hindi, Tamil, Telugu, Marathi for Indian market
9. **WhatsApp Integration** — Appointment reminders and prescription sharing via WhatsApp
10. **Inventory Alerts** — Low stock notifications for dental supplies, medicines, etc.
