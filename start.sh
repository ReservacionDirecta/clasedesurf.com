#!/bin/bash

# Navigate to backend directory
cd backend

# Install dependencies
npm ci

# Generate Prisma Client
npx prisma generate

# Build TypeScript
npm run build

# Run migrations
npx prisma migrate deploy

# Start the server
npm run start
