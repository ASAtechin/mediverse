# Clinicia — Production Readiness Master Plan

> Created: 15 Feb 2026 | Status: ✅ ALL ITEMS COMPLETED

---

## Phase 1 — P0: Security Hardening ✅

### 1.1 Fix .gitignore + Remove Committed Secrets ✅
- [x] Create root `.gitignore` (node_modules, .env*, *.log, token.json)
- [x] Create `clinicia-backend/.gitignore` (node_modules, .env, dist/, service-account.json)
- [x] Update `clinicia-web/.gitignore` (add .env.local)
- [x] Update `clinicia-mobile/.gitignore` (add .env)
- [x] Ensure `service-account.json` is gitignored

### 1.2 Add Auth to ALL Server Actions ✅
- [x] Created `clinicia-web/src/lib/auth-session.ts` — `requireAuth()` + `requireAuthForClinic()`
- [x] Created `clinicia-web/src/app/api/auth/session/route.ts` — POST/DELETE httpOnly cookie
- [x] Updated `AuthContext.tsx` with `setSessionCookie()` + `clearSessionCookie()` + 50-min token refresh
- [x] `actions/patient.ts` — getPatients, createPatient now call requireAuth()
- [x] `actions/appointment.ts` — createAppointment now calls requireAuth()
- [x] `actions/dashboard.ts` — getDashboardStats now calls requireAuth()
- [x] `actions/emr.ts` — saveConsultation now calls requireAuth()
- [x] `actions/billing.ts` — createInvoice, markInvoicePaid now call requireAuth()
- [x] `actions/settings.ts` — getSettingsData, updateProfile, updateClinic now call requireAuth()

### 1.3 Patient API Ownership Verification (Backend) ✅
- [x] Added `resolvePatient()` helper in patient-api.ts
- [x] `GET /patient/appointments` — ownership check: user owns patient OR is clinic staff
- [x] `GET /patient/records` — same ownership check
- [x] `POST /patient/appointments` — same ownership check + Zod validation

### 1.4 Payment Signature Verification ✅
- [x] Added Razorpay HMAC-SHA256 signature verification in `completePayment()`
- [x] Production mode: fails if secret missing; Dev mode: warns and skips

### 1.5 Input Validation with Zod ✅
- [x] Installed `zod` in backend and web
- [x] Created `clinicia-backend/src/lib/validation.ts` with schemas
- [x] Applied validation to POST /api/patients, POST /api/appointments, POST /api/patient/appointments

### 1.6 Backend Security Headers ✅
- [x] Installed and applied `helmet` middleware
- [x] Added `express.json({ limit: '1mb' })` body size limit

### 1.7 Socket.IO Room Authorization ✅
- [x] `join-clinic`: verifies user belongs to clinic via DB lookup
- [x] `join-admin`: verifies SUPER_ADMIN role via DB lookup
- [x] Both emit `error` event if unauthorized

---

## Phase 2 — P1: Stability & Reliability ✅

### 2.1 Align Prisma Schemas ✅
- [x] Backend schema now identical to web schema
- [x] Added: Vital, Expense, Attachment models, Patient.password, tokenNumber, etc.
- [x] Regenerated Prisma clients for both projects

### 2.2 Add Pagination to All List Endpoints ✅
- [x] GET /api/patients — paginated with `{ data, total, page, limit }`
- [x] GET /api/appointments — paginated
- [x] GET /api/admin/tenants — paginated
- [x] All capped at max 100 per page

### 2.3 Change Stream Reconnection ✅
- [x] Created `watchCollection()` reusable function
- [x] `.on("error")` + `.on("close")` handlers with 5-second retry
- [x] Replaced all 4 individual stream watchers

### 2.4 Structured Logging ✅
- [x] Installed `pino` + `pino-pretty` in backend
- [x] Created `src/lib/logger.ts` (JSON in production, pretty in dev)
- [x] Replaced ALL `console.log/error/warn` calls across index.ts, all route files, middleware, firebase.ts
- [x] Added HTTP request logging middleware (method, url, status, duration)
- [x] Fixed tsconfig.json to exclude scripts directory

### 2.5 Mobile API Auth Token Attachment ✅
- [x] Added request interceptor with Firebase auth token
- [x] Added 401 response interceptor with token refresh and automatic retry

### 2.6 Dockerfiles + Docker Compose ✅
- [x] `clinicia-backend/Dockerfile` — multi-stage node:20-alpine
- [x] `clinicia-admin/Dockerfile` — multi-stage Next.js standalone
- [x] `docker-compose.yml` — 3 services with health checks, depends_on, restart

### 2.7 CI/CD Pipeline ✅
- [x] `.github/workflows/ci.yml` — matrix build for all 3 projects
- [x] Steps: checkout → setup node 20 → npm ci → prisma generate → lint → type check → build
- [x] Docker build job on main branch

---

## Phase 3 — P2: Feature Completeness & Polish ✅

### 3.1 Wire Real Dashboard Data ✅
- [x] Added `getWeeklyChartData()` — real appointment counts per day
- [x] Added `getUpcomingSchedule()` — real next 5 appointments
- [x] Dashboard chart + schedule replaced with SWR hooks + real data
- [x] Removed hardcoded trend percentages from admin dashboard

### 3.2 Remove All Hardcoded/Mock Data ✅
- [x] Admin tenants page: removed mock fallback data (5 fake clinics), replaced with empty array
- [x] Admin tenants page: fixed paginated response handling (`res.data.data`)
- [x] Admin tenants page: wired real pagination (Previous/Next buttons with page state)
- [x] Admin dashboard: replaced "1,240+" with real patient count from DB
- [x] Admin dashboard: replaced `$` with `₹` for revenue display
- [x] Registration: moved coupon codes from hardcoded to env-configurable `COUPON_CODES` JSON

### 3.3 Database Indexes ✅
- [x] Patient: `@@index([clinicId])`, `@@index([email])`
- [x] Appointment: `@@index([clinicId, date])`, `@@index([doctorId, date])`, `@@index([patientId])`, `@@index([status])`
- [x] Visit: `@@index([patientId])`, `@@index([clinicId])`
- [x] Invoice: `@@index([clinicId])`, `@@index([status])`
- [x] Expense: `@@index([clinicId])`, `@@index([date])`
- [x] Attachment: `@@index([clinicId])`, `@@index([patientId])`
- [x] Pushed to MongoDB Atlas via `prisma db push`

### 3.4 Fix Tailwind Version Conflict ✅
- [x] Removed conflicting `@tailwindcss/postcss@^4` from clinicia-web
- [x] Project standardized on `tailwindcss@^3.4.19` + classic postcss config
- [x] Fixed `prisma/cleanup.ts` TypeScript error (excluded from tsconfig)
- [x] Fixed `error.message` unknown type error in vitals route
- [x] Verified full `next build` succeeds

### 3.5 Wire Admin Action Buttons ✅
- [x] Created `EditTenantModal` component (edit form + delete confirmation)
- [x] "Manage" button opens EditTenantModal with tenant data
- [x] Edit saves via `PUT /api/admin/tenants/:id`
- [x] Delete with confirmation via `DELETE /api/admin/tenants/:id`
- [x] Subscriptions "Create New Plan" / "Edit Plan" buttons disabled with tooltip
- [x] RecentClinics "View All" wired to `/tenants` page link

### 3.6 Fix Startup Scripts ✅
- [x] Removed duplicate cleanup block in `start-all.sh`
- [x] Used `SCRIPT_DIR` for portable paths (no hardcoded `/home/rntbci/...`)
- [x] `start-headless.sh`: added `mkdir -p logs`, cleaner output
- [x] Removed Mobile/Expo from scripts (not available in server environment)
- [x] Added gnome-terminal fallback to background process

### 3.7 Enhanced Health Check ✅
- [x] Backend `/` returns JSON `{ status, service, uptime }`
- [x] Backend `/health` pings MongoDB, returns 200 or 503

---

## Not In Scope (Post-Launch / V2)
- Three.js 3D hero animation
- Stripe international payments
- SendGrid/SES email service
- Password reset flow
- Email verification
- GDPR cookie consent
- Analytics (GA4, Mixpanel, Hotjar)
- Sentry error tracking
- A/B testing (PostHog)
- Live chat (Intercom/Crisp)
- Video testimonials
- File upload validation (MIME, size, virus scan)
- Database backup automation
- Redis caching layer
- Unit/Integration/E2E test suite
- Mobile offline support
- Mobile missing features (Meds, Notifications, etc.)
