# docker/Dockerfile
# Multi-stage build. Used for local dev parity and CI build verification.
# NOTE: Vercel builds from source directly in production — this image is not
# the production deploy artifact (see deployment.md §2.3).

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
# Alpine needs libc6-compat for some native deps (e.g., sharp, if used for image optimization)
RUN apk add --no-cache libc6-compat

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Dev (used by docker-compose.yml for local development) ----
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
# Runs as the default node user's UID in dev for simplicity; hot reload via volume mount.
CMD ["npm", "run", "dev"]

# ---- Builder (used in CI to verify a production build succeeds) ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runner (slim production-style image, e.g., for self-hosted verification or preview) ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: run as a non-root user, never root in the final image
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# Requires next.config.ts to set `output: "standalone"` for the runner stage to work.
