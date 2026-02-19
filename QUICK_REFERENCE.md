# 🚀 CLINICIA — QUICK REFERENCE

## 5-Minute Setup to Live

### Prerequisites
- GitHub account (free at github.com)
- Railway account (free at railway.app)
- Firebase service account JSON (from Firebase Console)
- MongoDB URI (already have: `mongodb+srv://...@cluster0...`)

### The 5 Steps

#### 1️⃣ Push to GitHub
```bash
cd ~/clincia\ replica
git init
git add .
git commit -m "Clinicia"
git remote add origin https://github.com/USERNAME/clincia-replica.git
git push -u origin main
```
⏱️ **2 minutes**

#### 2️⃣ Create Railway Account
Go to https://railway.app → Click "Start Project" → Sign in with GitHub
⏱️ **1 minute**

#### 3️⃣ Deploy 3 Services
In Railway dashboard:

**Click "New Service" → GitHub Repo → Select `clincia-replica`**

| Service | Root Dir | Env Vars |
|---------|----------|----------|
| Backend | `clinicia-backend` | DATABASE_URL, PORT, CORS_ORIGINS, FIREBASE_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS_JSON |
| Web | `clinicia-web` | DATABASE_URL, NEXT_PUBLIC_FIREBASE_*, NEXT_PUBLIC_API_URL, NEXT_PUBLIC_ADMIN_URL |
| Admin | `clinicia-admin` | NEXT_PUBLIC_FIREBASE_*, NEXT_PUBLIC_API_URL |

See [FREE_HOSTING_SETUP.md](FREE_HOSTING_SETUP.md) for exact values
⏱️ **2 minutes** (to create), 5-10 minutes (to deploy)

#### 4️⃣ Update Firebase
Firebase Console → Authentication → Settings → Authorized Domains
- Add: `clinicia-web-prod.up.railway.app`
- Add: `clinicia-admin-prod.up.railway.app`

⏱️ **1 minute**

#### 5️⃣ Test
```bash
# Test backend (should return JSON)
curl https://clinicia-backend-prod.up.railway.app/health

# Test web (should return HTML)
curl https://clinicia-web-prod.up.railway.app/

# Open in browser:
# Web: https://clinicia-web-prod.up.railway.app
# Admin: https://clinicia-admin-prod.up.railway.app
```
⏱️ **1 minute**

✅ **YOU'RE LIVE!** 🎉

---

## Environment Variables Needed

### Backend (`clinicia-backend/.env` or Railway)
```
DATABASE_URL=mongodb+srv://asatechin_db_user_digi_board:7dtA0yHQHAizIVy3@cluster0.nxz9wpg.mongodb.net/clinicia
PORT=4000
CORS_ORIGINS=https://clinicia-web-prod.up.railway.app,https://clinicia-admin-prod.up.railway.app
FIREBASE_PROJECT_ID=clinicia-replica
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"clinicia-replica",...}
```

### Web (`clinicia-web/.env` or Railway)
```
DATABASE_URL=mongodb+srv://asatechin_db_user_digi_board:7dtA0yHQHAizIVy3@cluster0.nxz9wpg.mongodb.net/clinicia
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDeVT_Moj7nA7KNFnKCVvQvRGjQNcz...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=clinicia-replica.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=clinicia-replica
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=clinicia-replica.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=186457096736
NEXT_PUBLIC_FIREBASE_APP_ID=1:186457096736:web:abc123def456ghi789...
NEXT_PUBLIC_API_URL=https://clinicia-backend-prod.up.railway.app
NEXT_PUBLIC_ADMIN_URL=https://clinicia-admin-prod.up.railway.app
```

### Admin (`clinicia-admin/.env` or Railway)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDeVT_Moj7nA7KNFnKCVvQvRGjQNcz...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=clinicia-replica.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=clinicia-replica
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=clinicia-replica.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=186457096736
NEXT_PUBLIC_FIREBASE_APP_ID=1:186457096736:web:abc123def456ghi789...
NEXT_PUBLIC_API_URL=https://clinicia-backend-prod.up.railway.app
```

---

## Get Firebase Values

1. Go to https://console.firebase.google.com/project/clinicia-replica
2. Click ⚙️ → Project Settings
3. Copy these:
   - **NEXT_PUBLIC_FIREBASE_API_KEY** → Web API Key (under "Your web apps")
   - **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID** → Project Number
   - **NEXT_PUBLIC_FIREBASE_APP_ID** → App ID (under "Your web apps")
4. Go to Service Accounts tab
5. Click "Generate New Private Key"
6. Paste entire JSON into **GOOGLE_APPLICATION_CREDENTIALS_JSON**

---

## Test Locally First

```bash
# Backend
cd clinicia-backend
npm install && npm run build
PORT=4000 node dist/index.js
# Expect: "Server running on port 4000" + "MongoDB Connected"

# Web
cd ../clinicia-web
npm install && npm run build
npm start
# Expect: "ready - started server on 0.0.0.0:3000"

# Admin
cd ../clinicia-admin
npm install && npm run build
npm start
# Expect: "ready - started server on 0.0.0.0:3001"
```

---

## Verify Deployment

After Railway deployment, test these URLs:

✅ **Backend API**
```
https://clinicia-backend-prod.up.railway.app/health
→ {"status":"healthy","db":"connected"...}
```

✅ **Web App**
```
https://clinicia-web-prod.up.railway.app/
→ Landing page with pricing, features, login button
```

✅ **Admin Dashboard**
```
https://clinicia-admin-prod.up.railway.app/
→ Login page (client-side redirects because no auth)
```

---

## Default Super Admin

After 1st deployment:

**Email:** `superadmin@clinicia.com`  
**Password:** [Reset in Firebase Console → Authentication → Users]

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Check all required env vars are set in Railway |
| Database not connecting | Verify MongoDB Atlas IP whitelist includes Railway IP |
| CORS error in browser | Update `CORS_ORIGINS` to match your Railway web URL |
| Firebase auth fails | Add Railway domains to Firebase Authorized Domains |
| Blank white screen | Check browser console for errors, check Railway logs |

---

## Cost Tracker

| Month | Service | Hours | Cost |
|-------|---------|-------|------|
| **Month 1** | Railway (all 3) | 720 | **$0** (free $5 credit) |
| **Month 2+** | Railway | 720 | **~$10-15** |
| | Render alt | 750 free | **~$25-50** |
| | Fly.io alt | 2-3 VMs | **~$15-20** |

---

## File Guide

| File | Purpose |
|------|---------|
| `LAUNCH_GUIDE.md` | ⭐ Start here — Complete overview |
| `FREE_HOSTING_SETUP.md` | Detailed Railway/Render/Fly.io setup |
| `PRE_LAUNCH_CHECKLIST.md` | Verify everything before deploying |
| `DEPLOYMENT_PLAN.md` | Architecture & deployment details |
| `SPECIALTY_FEATURES_ROADMAP.md` | Future features (Dental, Physio, etc.) |

---

## Next Features

After launch:
- [ ] Dental charting (32-tooth interactive diagram)
- [ ] Physiotherapy body mapping (pain visualization)
- [ ] Ophthalmology module (vision tracking)
- [ ] WhatsApp integration (appointment reminders)
- [ ] Telemedicine (video consultations)
- [ ] Mobile app (iOS/Android from existing React Native code)

---

**Status:** ✅ **READY FOR PRODUCTION**

Deploy now → https://railway.app → 5 minutes → LIVE! 🚀
