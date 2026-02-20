# 🚀 Free Hosting Setup — Complete Guide

## Quick Decision Matrix

| Platform | Cost | Ease | Uptime | Best For |
|----------|------|------|--------|----------|
| **Railway** ⭐ | $5/mo free | ⭐⭐⭐⭐⭐ | 99.9% | Best overall — recommended |
| **Render** | 750 hrs/mo free | ⭐⭐⭐⭐ | 99% | If Railway fails, use this |
| **Fly.io** | 3 shared VMs | ⭐⭐⭐ | 99.9% | For Docker experts |

**👉 START WITH RAILWAY — it's the easiest and has enough free credit for your 3 services.**

---

# ⭐ Option 1: Railway.app (RECOMMENDED)

## Why Railway?
- ✅ **$5/month free credit** (enough for 3 services running 24/7)
- ✅ **Auto-deploys from GitHub** in 1 click
- ✅ **Auto HTTPS** (free SSL certificates)
- ✅ **Custom domains** (e.g., `clinicia.in`)
- ✅ **Environment variables** UI (no `.env` file editing)
- ✅ **No credit card required** for free tier

## Total Cost: **$0 first month** (uses free $5 credit), then **~$5-10/month** if you want persistence

---

## Step 1: Create GitHub Repository

```bash
# If you haven't already pushed to GitHub:
cd /home/rntbci/clincia\ replica
git init
git add .
git commit -m "Clinicia - Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/clincia-replica.git
git branch -M main
git push -u origin main
```

If you don't have a GitHub account:
1. Go to https://github.com/signup
2. Create free account
3. Create new repo called `clincia-replica`
4. Push code as above

---

## Step 2: Sign Up on Railway

1. Go to https://railway.app
2. Click **"Start Project"**
3. Click **"Deploy from GitHub"**
4. Click **"Connect GitHub"** and authorize Railway
5. Select your `clincia-replica` repository
6. Click **"Deploy"**

---

## Step 3: Create Backend Service

1. On Railway dashboard, click **"+ New Service"**
2. Select **"GitHub Repo"** → choose `clincia-replica`
3. A form appears:
   - **Name:** `clincia-backend`
   - **Root Directory:** `clinicia-backend`
   - Click **"Deploy"**

4. Once deployed, go to **Backend service → Settings → Environment**
5. Add these environment variables:

```
DATABASE_URL = mongodb+srv://asatechin_db_user_digi_board:7dtA0yHQHAizIVy3@cluster0.nxz9wpg.mongodb.net/clinicia?retryWrites=true&w=majority
PORT = 4000
CORS_ORIGINS = https://clinicia-web-prod.up.railway.app,https://clinicia-admin-prod.up.railway.app
FIREBASE_PROJECT_ID = clinicia-replica
GOOGLE_APPLICATION_CREDENTIALS_JSON = (your Firebase service account JSON — paste the full JSON here)
```

⚠️ **To get `GOOGLE_APPLICATION_CREDENTIALS_JSON`:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Copy the entire JSON content
4. Paste into Railway env var

6. Railway auto-detects Node.js, runs `npm install` and `npm start`
7. Wait for "Build successful" message

---

## Step 4: Create Web Service

1. Click **"+ New Service"** → **"GitHub Repo"**
2. **Name:** `clinicia-web`
3. **Root Directory:** `clinicia-web`
4. Deploy

5. Go to **Web service → Settings → Environment**, add:

```
DATABASE_URL = mongodb+srv://asatechin_db_user_digi_board:7dtA0yHQHAizIVy3@cluster0.nxz9wpg.mongodb.net/clinicia?retryWrites=true&w=majority
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDeVT_Moj7nA7KNFn... (from Firebase Console)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = clinicia-replica.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = clinicia-replica
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = clinicia-replica.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 186457096736
NEXT_PUBLIC_FIREBASE_APP_ID = 1:186457096736:web:... (from Firebase Console)
NEXT_PUBLIC_API_URL = https://clinicia-backend-prod.up.railway.app
NEXT_PUBLIC_ADMIN_URL = https://clinicia-admin-prod.up.railway.app
```

6. Go to **Settings → Build**, set:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

7. Deploy and wait for success

---

## Step 5: Create Admin Service

1. Click **"+ New Service"** → **"GitHub Repo"**
2. **Name:** `clinicia-admin`
3. **Root Directory:** `clinicia-admin`
4. Deploy

5. Add Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDeVT_Moj7nA7KNFn...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = clinicia-replica.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = clinicia-replica
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = clinicia-replica.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 186457096736
NEXT_PUBLIC_FIREBASE_APP_ID = 1:186457096736:web:...
NEXT_PUBLIC_API_URL = https://clinicia-backend-prod.up.railway.app
```

6. Set Build Command and Start Command same as Web
7. Deploy

---

## Step 6: Get Your URLs

After all 3 deploy successfully, Railway assigns URLs:

- **Backend:** `https://clinicia-backend-prod.up.railway.app` (or similar)
- **Web:** `https://clinicia-web-prod.up.railway.app`
- **Admin:** `https://clinicia-admin-prod.up.railway.app`

You can find these in each service's **Settings → Networking → Railway Domain**

---

## Step 7: Update Firebase Auth Domains

1. Go to **Firebase Console → Authentication → Settings**
2. Scroll to **Authorized Domains**
3. Add all 3 Railway domains:
   - `clinicia-web-prod.up.railway.app`
   - `clinicia-admin-prod.up.railway.app`

---

## Step 8: Test Your Deployment

```bash
# Test backend
curl https://clinicia-backend-prod.up.railway.app/health

# Test web (should show landing page)
curl mediverse-web-production.up.railway.app

# Test admin
curl mediverse-web-production.up.railway.app
```

If all return 200, you're live! 🎉

---

## Step 9 (Optional): Add Custom Domain

If you bought a domain (e.g., `clinicia.in`):

1. On Railway, go to **Web service → Settings → Networking**
2. Click **"Add Custom Domain"**
3. Enter your domain: `clinicia.in`
4. Railway shows DNS records you need to update
5. Go to your domain registrar (GoDaddy, Namecheap, etc.)
6. Add the CNAME record Railway shows
7. Wait 24 hours for DNS propagation

**Then update these env vars:**
- **Backend:** `CORS_ORIGINS = https://clinicia.in,https://admin.clinicia.in`
- **Web:** `NEXT_PUBLIC_API_URL = https://api.clinicia.in`
- **Web:** `NEXT_PUBLIC_ADMIN_URL = https://admin.clinicia.in`
- **Admin:** `NEXT_PUBLIC_API_URL = https://api.clinicia.in`

---

## Troubleshooting Railway

### Build fails with "MODULE_NOT_FOUND"
- Rebuild: Go to service → **Deploy → Redeploy**
- Check logs: Click service → scroll to Logs tab

### App crashes on startup
- Click service → Logs tab → scroll to bottom for errors
- Common: Missing env vars (check they're all set)

### Database connection fails
- Verify MongoDB Atlas whitelist includes Railway IP
- Go to MongoDB Atlas → Network Access → Add current IP (Railway's)

---

# 🟠 Option 2: Render.com (Backup)

If Railway doesn't work, Render is very similar but with 750 free hours/month per service.

## Quick Setup:

1. Go to https://render.com/signup
2. Connect GitHub
3. Create 3 Web Services:

### Backend Service
- **Name:** clinicia-backend
- **Root Directory:** clinicia-backend
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Env vars:** Same as Railway (add DATABASE_URL, CORS_ORIGINS, etc.)

### Web Service
- **Name:** clinicia-web
- **Root Directory:** clinicia-web
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Env vars:** Add all NEXT_PUBLIC_* vars

### Admin Service
- Same as Web but different directory

Each gets a free `*.onrender.com` domain. Update Firebase auth domains same as Railway.

---

# 🚁 Option 3: Fly.io (Docker - Advanced)

For those comfortable with Docker:

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Authenticate
fly auth login

# Deploy backend
cd clinicia-backend
fly launch --name clinicia-backend
fly secrets set DATABASE_URL="mongodb+srv://..."
fly deploy

# Deploy web
cd ../clinicia-web
fly launch --name clinicia-web
fly secrets set NEXT_PUBLIC_API_URL="https://clinicia-backend.fly.dev"
fly deploy

# Deploy admin
cd ../clinicia-admin
fly launch --name clinicia-admin
fly secrets set NEXT_PUBLIC_API_URL="https://clinicia-backend.fly.dev"
fly deploy
```

Each service gets a free URL like `https://clinicia-backend.fly.dev`

---

# 📊 Cost Comparison After First Month

| Platform | First 30 Days | After 30 Days | Notes |
|----------|---------------|---------------|-------|
| **Railway** | $0 (free $5 credit) | ~$10-15/mo | Pay as you go, very cheap |
| **Render** | $0 (750 free hours) | ~$25-50/mo | Slightly more expensive |
| **Fly.io** | $0 (free shared VMs) | ~$15-20/mo | Need 2-3 paid VMs for good uptime |

---

# ✅ Quick Checklist to Go Live

- [ ] Push code to GitHub
- [ ] Create Railway account
- [ ] Create 3 services (Backend, Web, Admin)
- [ ] Add all environment variables
- [ ] Update Firebase auth domains
- [ ] Test all 3 URLs work
- [ ] (Optional) Add custom domain
- [ ] (Optional) Add uptime monitoring (UptimeRobot free)
- [ ] Tell your first users about https://clinicia-[web-url]

---

# 🚨 Important: MongoDB Atlas Network Access

After deploying to Railway/Render, **you MUST whitelist their IPs**:

1. Go to MongoDB Atlas → Network Access
2. Click **"+ ADD IP ADDRESS"**
3. If you don't know the IP, use `0.0.0.0/0` (allows all — less secure but works)
4. Better: Railway → Settings → Networking → Copy public IP → Add to MongoDB

---

# 💬 Monitoring (Free)

After launch, add free monitoring:

1. **UptimeRobot.com** (free tier)
   - Monitor your 3 URLs every 5 minutes
   - Get alerts if any service goes down

2. **Firebase Analytics** (already built-in)
   - Track user signups, logins, page views
   - Real-time dashboard in Firebase Console

3. **Sentry.io** (free tier - 5000 events/month)
   - Automatic error tracking
   - Know immediately if something breaks

---

# 🎉 You're Live!

Once deployed, share with your friends:

```
👋 Try Clinicia → https://[your-railway-url]
Admin Dashboard → https://[your-admin-railway-url]

Tech Stack:
- Next.js 14 (React 18)
- Express.js 5
- Firebase Auth
- MongoDB Atlas
- Socket.IO (Real-time)
```

Send feedback and feature requests! 🚀
