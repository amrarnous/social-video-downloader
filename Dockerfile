# Use Node.js 18 Alpine as base image for smaller size and security
FROM node:18-alpine AS base

# Install system dependencies required for video downloaders
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    curl \
    git \
    build-base

# Install yt-dlp (better alternative to youtube-dl)
RUN pip3 install --break-system-packages yt-dlp

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install system dependencies for production
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    curl

# Install yt-dlp
RUN pip3 install --break-system-packages yt-dlp

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs package*.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
