# =========================================================================
# STAGE 1: Dependency Installation
# =========================================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfiles and installation definitions
COPY package.json package-lock.json ./

# Clean production installation of dependencies
RUN npm ci

# =========================================================================
# STAGE 2: Application Compiling & Building
# =========================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Bring in dependencies from Stage 1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Injected by Google Cloud Build / local building to bake the development URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Disable Next.js telemetry collection data to speed up image building
ENV NEXT_TELEMETRY_DISABLED=1

# Compile production-ready standalone build
RUN npm run build

# =========================================================================
# STAGE 3: Final Serverless Deployment Runtime
# =========================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Establish unprivileged system profiles for security containment
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Transfer static asset structures and standalone engine components
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Transition execution context away from root access
USER nextjs

EXPOSE 3000

# Standalone execution runtime engine start command
CMD ["node", "server.js"]
