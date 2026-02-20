# ─── Build Stage ───
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY . .

# Build Next.js standalone
ENV NEXT_TELEMETRY_DISABLED=1

# ============================================================
# CRITICAL: Provide dummy env vars for the build phase ONLY.
# During Docker build, Railway env vars are NOT available.
# Next.js needs these to pre-render static pages without crashing.
# At runtime, Railway injects the REAL values automatically.
# ============================================================
ENV NEXT_PUBLIC_FIREBASE_API_KEY="dummy-api-key"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="dummy.firebaseapp.com"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="dummy"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="dummy.appspot.com"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="000000000000"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="1:000000000000:web:dummy"
ENV NEXT_PUBLIC_API_URL="http://dummy:4000"

RUN npm run build

# ─── Production Stage ───
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
