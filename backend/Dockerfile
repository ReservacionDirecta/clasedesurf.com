# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies including OpenSSL
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    openssl-dev \
    libc6-compat

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code and prisma schema
COPY . .

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS production

ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Install runtime dependencies including OpenSSL
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    openssl-dev \
    libc6-compat \
    curl

# Copy package files
COPY package*.json ./

# Copy node_modules from builder (includes Prisma client already generated)
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy scripts directory
COPY scripts ./scripts

# Copy startup scripts (backup)
COPY start.sh ./start.sh
COPY start-simple.sh ./start-simple.sh

# Make startup scripts executable
RUN chmod +x start.sh start-simple.sh scripts/start.js

# Prune dev dependencies (optional, reduces image size)
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Change ownership of the app directory
RUN chown -R backend:nodejs /app

# Switch to non-root user
USER backend

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application
CMD ["npm", "start"]