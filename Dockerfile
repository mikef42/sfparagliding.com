FROM node:20-alpine AS base

# ─── Install dependencies ───
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ─── Build ───
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (defaults for build — overridden at runtime)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Payload needs a DATABASE_URI at build time for type generation, but won't connect
ENV DATABASE_URI=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV PAYLOAD_SECRET=build-time-secret-replaced-at-runtime

RUN npm run build

# ─── Production ───
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Payload media directory (mounted as volume in production)
RUN mkdir -p /app/media && chown -R nextjs:nodejs /app/media

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck for Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
