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

# Copy the full application (not standalone — Payload needs full deps for schema push)
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/payload.config.ts ./payload.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/docker-start.sh ./docker-start.sh

# Payload media directory (mounted as volume in production)
RUN mkdir -p /app/media && chown -R nextjs:nodejs /app/media && \
    chmod +x /app/docker-start.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck for Coolify (use 127.0.0.1 to avoid IPv6 issues on Alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["./docker-start.sh"]
