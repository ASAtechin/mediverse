FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# ============================================================
# CRITICAL: Provide dummy env vars for the build phase ONLY.
# During Docker build, Railway env vars are NOT available.
# Next.js needs these to pre-render static pages without crashing.
# At runtime, Railway injects the REAL values automatically.
# ============================================================
ENV DATABASE_URL="mongodb+srv://dummy:dummy@dummy.mongodb.net/dummy"
ENV NEXT_PUBLIC_FIREBASE_API_KEY="dummy-api-key"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="dummy.firebaseapp.com"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="dummy"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="dummy.appspot.com"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="000000000000"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="1:000000000000:web:dummy"

# Build the app (prisma generate is inside npm run build)
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copy the prisma schema (needed at runtime for Prisma Client)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
