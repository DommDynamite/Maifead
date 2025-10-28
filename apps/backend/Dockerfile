# Backend Dockerfile
FROM node:20-alpine AS base

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy packages (needed for monorepo dependencies)
COPY packages ./packages

# Copy backend app
COPY apps/backend ./apps/backend

# Install dependencies (this will build better-sqlite3)
RUN pnpm install --frozen-lockfile

# Build the types package
RUN pnpm --filter @maifead/types build

# Build the backend
RUN pnpm --filter @maifead/backend build

# Production image
FROM node:20-alpine AS runner

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 build-base gcc && ln -sf /usr/bin/python3 /usr/bin/python

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy built packages
COPY --from=base /app/packages ./packages

# Copy backend app
COPY --from=base /app/apps/backend ./apps/backend

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Manually rebuild native modules for Alpine Linux (pnpm uses symlinks so we need to navigate to actual packages)
RUN cd /app/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && npm run build-release && \
    cd /app/node_modules/.pnpm/bcrypt@*/node_modules/bcrypt && npm run install

# Create data directory for SQLite database
RUN mkdir -p /app/apps/backend/data

# Expose backend port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the backend server
CMD ["node", "apps/backend/dist/index.js"]
