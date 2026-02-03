# --- STAGE 1: Builder ---
FROM node:24-slim AS builder
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable

WORKDIR /app

# 1. Copy schema first to cache the generation step
COPY pnpm-lock.yaml package.json ./
COPY prisma ./prisma/ 

# 2. Install ALL deps (including prisma CLI)
RUN pnpm install --frozen-lockfile

# 3. GENERATE the client for the container's OS (Linux)
RUN pnpm prisma generate

# 4. Build your TS code
COPY . .
RUN pnpm run build


# --- STAGE 2: Production ---
FROM node:24-slim AS production
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

ENV NODE_ENV=production

# 5. Install ONLY production deps
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# 6. CRITICAL: Copy the generated Prisma Client from builder
# Prisma lives in node_modules/.prisma by default
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist

EXPOSE 5500
CMD ["node", "/app/dist/src/server.js"]