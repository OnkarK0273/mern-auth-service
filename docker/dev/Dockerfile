# Use Node 24 Slim
FROM node:24-slim

# Install OpenSSL (often needed for DB connections like Prisma/Postgres)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Cache dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# In Dev, we don't COPY . because of Compose volumes
EXPOSE 5501

CMD ["pnpm", "run", "dev"]