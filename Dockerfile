# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# AlgoPath production image.
#
# Three stages so the runtime carries neither the toolchain nor the full
# node_modules tree: deps installs, builder compiles, runner ships only the
# Next.js standalone output plus the generated Prisma client.
# ---------------------------------------------------------------------------

ARG NODE_VERSION=22-alpine

# --- deps: install with the lockfile, nothing else -------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# openssl is required by Prisma's engines on Alpine.
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# `postinstall` runs `prisma generate`, which reads the schema but never
# connects — the placeholder just satisfies the config's non-null assertion.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npm ci

# --- builder: compile the app ----------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next inlines NEXT_PUBLIC_* at build time, so Clerk's publishable key has to
# be present now rather than at runtime. It is a public value by design.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ARG NEXT_PUBLIC_SITE_URL="https://algopath.dev"
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- runner: the only stage that ships -------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run unprivileged. Alpine's node image already ships uid/gid 1000 as `node`.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder /app/public ./public

# standalone contains server.js and the traced dependencies; static and public
# are not traced and must be copied alongside it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Dependency tracing misses the generated Prisma client, so copy it explicitly.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# The schema travels with the image for reference only. The Prisma CLI is a
# devDependency and is NOT in the standalone output, so migrations cannot run
# from this container — run `prisma migrate deploy` from your machine against
# the RDS endpoint (see docs/DEPLOYMENT.md step 4).
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
