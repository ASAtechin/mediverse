# 🚀 Clinicia — Deployment & Launch Plan

## Quick Summary

Clinicia consists of 3 services that need to be deployed:

| Service | Tech | Port | Purpose |
|---------|------|------|---------|
| **clinicia-web** | Next.js 14 | 3000 | Doctor/Clinic portal (main product) |
| **clinicia-admin** | Next.js 14 | 3001 | Super Admin dashboard |
| **clinicia-backend** | Express.js 5 | 4000 | REST API + WebSocket server |

External dependencies: **Firebase Auth**, **MongoDB Atlas** (already configured)

---

## Phase 1: Free Launch (Recommended — Lowest Cost)

### Option A: Railway.app (Recommended — Easiest)

**Cost:** Free tier gives $5/month credit (~500 hours). All 3 services fit.

**Steps:**
1. Create a Railway account at https://railway.app
2. Connect your GitHub repository
3. Create 3 services:
   - **clinicia-backend** → Root directory: `clinicia-backend`
   - **clinicia-web** → Root directory: `clinicia-web`
   - **clinicia-admin** → Root directory: `clinicia-admin`
4. Set environment variables for each service (see below)
5. Railway auto-detects Node.js and deploys

**Pros:** Automatic HTTPS, custom domains, easy env var management
**Cons:** Free tier has limited hours, sleeps after inactivity

### Option B: Render.com

**Cost:** Free tier (750 hours/month for web services)

**Steps:**
1. Create Render account at https://render.com
2. Create 3 Web Services, each pointing to the respective directory
3. Set build/start commands and env vars
4. Free SSL included

**Pros:** Generous free tier, auto-deploy from Git
**Cons:** Free tier services sleep after 15 min inactivity (cold starts)

### Option C: Fly.io + Docker

**Cost:** Free tier includes 3 shared VMs

**Steps:**
1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. `fly auth login`
3. Deploy each service:
   ```bash
   cd clinicia-backend && fly launch
   cd clinicia-web && fly launch
   cd clinicia-admin && fly launch
   ```
4. Set secrets: `fly secrets set DATABASE_URL=... FIREBASE_PROJECT_ID=...`

**Pros:** Docker-native, global edge deployment, persistent VMs
**Cons:** Requires CLI familiarity

### Option D: VPS (DigitalOcean/Hetzner) — $5-6/month

**Cost:** ~$5/month for a 1GB VPS (cheapest real hosting)

**Steps:**
1. Get a VPS (Ubuntu 22.04)
2. Install Docker + Docker Compose
3. Clone repo
4. Set up environment variables
5. Run `docker compose up -d`
6. Set up Nginx reverse proxy with Certbot for free SSL

---

## Phase 2: Environment Variables Checklist

### clinicia-backend/.env
```env
DATABASE_URL=mongodb+srv://...@cluster0.nxz9wpg.mongodb.net/clinicia?retryWrites=true&w=majority
PORT=4000
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}  # Full JSON string
```

### clinicia-web/.env
```env
DATABASE_URL=mongodb+srv://...@cluster0.nxz9wpg.mongodb.net/clinicia?retryWrites=true&w=majority
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=clinicia-replica.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=clinicia-replica
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=clinicia-replica.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com
```

### clinicia-admin/.env
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=clinicia-replica.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=clinicia-replica
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=clinicia-replica.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Phase 3: Domain Setup

### Recommended domain structure:
- `clinicia.in` → Main web app (clinicia-web)
- `admin.clinicia.in` → Admin panel (clinicia-admin)
- `api.clinicia.in` → Backend API (clinicia-backend)

### DNS Records:
```
A     @          → your-server-ip
A     admin      → your-server-ip
A     api        → your-server-ip
```

### Firebase Auth Domain:
1. Go to Firebase Console → Authentication → Settings
2. Add `clinicia.in` as an authorized domain
3. Add `admin.clinicia.in` as an authorized domain

---

## Phase 4: Pre-Launch Checklist

### Security
- [ ] Rotate Firebase service account key (current one was exposed)
- [ ] Revoke the super admin refresh token in Firebase Console
- [ ] Set `NODE_ENV=production` on all services
- [ ] Enable HTTPS on all endpoints (most platforms provide this free)
- [ ] Update CORS_ORIGINS to only allow production domains
- [ ] Remove `'unsafe-eval'` from CSP in production

### Firebase Console
- [ ] Enable Google Sign-In provider in Authentication → Providers
- [ ] Add production domains to Authorized Domains list
- [ ] Enable email link sign-in if needed

### MongoDB Atlas
- [ ] Whitelist production server IP in Network Access
- [ ] Create a separate database user for production (don't use dev credentials)
- [ ] Enable MongoDB Atlas alerts for high usage

### Application
- [ ] Update `NEXT_PUBLIC_API_URL` in web and admin to production backend URL
- [ ] Update `CORS_ORIGINS` in backend to production frontend URLs
- [ ] Test all critical flows: signup → login → dashboard → patients → appointments

---

## Phase 5: Monitoring & Analytics

### Free Monitoring Tools:
1. **Uptime monitoring:** UptimeRobot (free, 5-min checks)
2. **Error tracking:** Sentry (free tier, 5000 events/month)
3. **Analytics:** Google Analytics (via Firebase) — already integrated
4. **Logs:** Railway/Render provide built-in log viewing

---

## Phase 6: Scaling Plan (When You Get Traction)

| Milestone | Action |
|-----------|--------|
| 0-50 clinics | Free tier hosting is sufficient |
| 50-200 clinics | Move to paid Railway/Render plan ($7-25/month) |
| 200-1000 clinics | Consider AWS/GCP with auto-scaling |
| 1000+ clinics | Kubernetes cluster, CDN, read replicas |

---

## Quick Deploy Command (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd clinicia-backend
railway init
railway up

# Deploy web
cd ../clinicia-web
railway init
railway up

# Deploy admin
cd ../clinicia-admin
railway init
railway up
```

---

## Quick Deploy Command (Docker on VPS)

```bash
# On your VPS
git clone your-repo clinicia
cd clinicia

# Set up env files
cp clinicia-backend/.env.example clinicia-backend/.env
cp clinicia-web/.env.example clinicia-web/.env
cp clinicia-admin/.env.example clinicia-admin/.env
# Edit each .env with production values

# Deploy
docker compose up -d --build

# Check status
docker compose ps
docker compose logs -f
```
