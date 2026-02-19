# 🎯 Pre-Launch Verification Checklist

Before deploying to Railway/Render, verify all these items. This ensures your deployment will succeed on the first try.

## ✅ Code & Configuration

### clinicia-backend
- [ ] `src/index.ts` starts on `PORT` env var (check: `process.env.PORT || 4000`)
- [ ] `package.json` has `"start": "node dist/index.js"`
- [ ] `tsconfig.json` exists
- [ ] All required env vars listed in README or comments:
  - [ ] `DATABASE_URL`
  - [ ] `PORT`
  - [ ] `CORS_ORIGINS`
  - [ ] `FIREBASE_PROJECT_ID`
  - [ ] `GOOGLE_APPLICATION_CREDENTIALS_JSON`

### clinicia-web
- [ ] `next.config.js` exists
- [ ] `package.json` has `"build": "next build"` and `"start": "next start"`
- [ ] `.env.example` lists all NEXT_PUBLIC_* vars
- [ ] Middleware properly redirects unauthenticated users
- [ ] All links use correct relative paths (no hardcoded localhost)

### clinicia-admin
- [ ] Same as clinicia-web
- [ ] `NEXT_PUBLIC_API_URL` points to backend

---

## ✅ Database & Firebase Setup

### MongoDB Atlas
- [ ] Database URI is correct: `mongodb+srv://...`
- [ ] Database name is `clinicia`
- [ ] Network Access: At least one IP whitelisted (or 0.0.0.0/0 for testing)
- [ ] Backup enabled (optional but recommended)

### Firebase Console (https://console.firebase.google.com/project/clinicia-replica)
- [ ] **Authentication → Providers → Email/Password:** Enabled ✅
- [ ] **Authentication → Providers → Google:** Enabled ✅ (for Google Sign-In)
- [ ] **Authentication → Settings → Authorized Domains:** At least includes production URLs
- [ ] **Service Accounts → Generate Private Key:** Downloaded JSON (for backend)
- [ ] **API Keys:** Copied API key (for frontend)
- [ ] **Storage Rules:** Allow authenticated reads/writes (if using Firebase Storage)

---

## ✅ Environment Variables

### Backend (.env or Railway env vars)

Required:
```
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/clinicia
PORT=4000
CORS_ORIGINS=https://web-url,https://admin-url
FIREBASE_PROJECT_ID=clinicia-replica
GOOGLE_APPLICATION_CREDENTIALS_JSON={full JSON object}
```

### Web (.env or Railway env vars)

Required:
```
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/clinicia
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=clinicia-replica.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=clinicia-replica
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=clinicia-replica.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=186457096736
NEXT_PUBLIC_FIREBASE_APP_ID=1:186457096736:web:...
NEXT_PUBLIC_API_URL=https://backend-url
NEXT_PUBLIC_ADMIN_URL=https://admin-url
```

### Admin (.env or Railway env vars)

Required:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=clinicia-replica.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=clinicia-replica
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=clinicia-replica.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=186457096736
NEXT_PUBLIC_FIREBASE_APP_ID=1:186457096736:web:...
NEXT_PUBLIC_API_URL=https://backend-url
```

---

## ✅ GitHub Repository

- [ ] All code pushed to GitHub
- [ ] `.gitignore` includes:
  - [ ] `node_modules/`
  - [ ] `.env` (all .env files)
  - [ ] `token.json`
  - [ ] `service-account.json`
- [ ] No sensitive credentials in code
- [ ] Main branch is clean (no broken code)

---

## ✅ Local Testing (Before Pushing)

Run these tests locally to catch issues:

### Backend
```bash
cd clinicia-backend
npm install
npm run build
PORT=4000 node dist/index.js
# Should see: "Server running on port 4000"
# Should see: "MongoDB Connected"
# Test: curl http://localhost:4000/health
# Should return: {"status":"healthy","db":"connected",...}
```

### Web
```bash
cd clinicia-web
npm install
npm run build
npm start
# Should see: "ready - started server on 0.0.0.0:3000"
# Test: curl http://localhost:3000/
# Should return: 200 OK with HTML content
```

### Admin
```bash
cd clinicia-admin
npm install
npm run build
npm start
# Should see: "ready - started server on 0.0.0.0:3000"
# Test: curl http://localhost:3001/
# Should return: 200 OK
```

---

## ✅ Deployment Readiness

- [ ] No `console.log()` spam in production code (or use proper logging)
- [ ] Error messages don't leak sensitive info (check src/routes/admin.ts, etc.)
- [ ] Rate limiting enabled (backend should have it)
- [ ] CORS properly configured (only allow production origins)
- [ ] HTTPS enforced (Railway/Render do this automatically)
- [ ] Database backups enabled (MongoDB Atlas recommended)

---

## ✅ After Deployment (Post-Launch)

Once deployed to Railway/Render:

- [ ] Test landing page at https://[web-url]/
- [ ] Test login page at https://[web-url]/login
- [ ] Test backend health at https://[backend-url]/health
- [ ] Test admin at https://[admin-url]/
- [ ] Update Firebase Authorized Domains with Railway URLs
- [ ] Verify no CORS errors in browser console
- [ ] Try signing up a new user
- [ ] Try logging in
- [ ] Try viewing dashboard
- [ ] Check logs for any errors

---

## 🚨 Common Deployment Issues & Fixes

### "Build failed - MODULE_NOT_FOUND"
**Cause:** Missing dependencies in package.json  
**Fix:** `npm install` locally to verify all packages, commit package-lock.json

### "Port 3000 already in use"
**This is normal on Railway** — Railway assigns ports dynamically. Next.js handles this.

### "Cannot connect to database"
**Cause:** MongoDB Atlas IP whitelist doesn't include Railway IP  
**Fix:** MongoDB Atlas → Network Access → Add Railway IP (or 0.0.0.0/0 for testing)

### "CORS error in browser"
**Cause:** `CORS_ORIGINS` env var doesn't match frontend URL  
**Fix:** Make sure backend has `CORS_ORIGINS=https://[exact-railway-web-url]`

### "Firebase auth fails"
**Cause:** Railway URLs not in Firebase Authorized Domains  
**Fix:** Firebase Console → Authentication → Settings → Add all 3 Railway domains

### "Blank page / white screen"
**Cause:** Frontend can't reach backend API  
**Fix:** Check `NEXT_PUBLIC_API_URL` is set and points to correct backend URL

---

## 📋 Pre-Launch Checklist

Run this before pushing:

```bash
# 1. Verify no errors
npm run lint 2>/dev/null || true
npm run build 2>/dev/null || true

# 2. Ensure package.json has all needed scripts
grep -E "\"start\"|\"build\"|\"dev\"" package.json

# 3. Check .gitignore excludes sensitive files
grep -E "\.env|token|service-account" .gitignore

# 4. Verify no hardcoded localhost URLs
grep -r "localhost:3000\|localhost:4000" src/ || echo "✓ No localhost hardcoded"

# 5. Make sure .env.example exists (for documentation)
ls -la .env.example
```

---

## ✨ You're Ready!

If all checkboxes above are ✅, your deployment will succeed on Railway/Render. Push to GitHub and follow the guide in **FREE_HOSTING_SETUP.md**.

Good luck! 🚀
