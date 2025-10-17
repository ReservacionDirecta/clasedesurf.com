#!/bin/sh

echo "🔧 Using direct connection schema..."

# Backup original schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Use direct connection schema
cp prisma-direct.schema.prisma prisma/schema.prisma

# Remove any existing client (but keep @prisma/client installed)
rm -rf node_modules/.prisma || true

# Set environment variables
export PRISMA_GENERATE_DATAPROXY=false
export PRISMA_CLIENT_ENGINE_TYPE=library

# Generate client with direct schema
echo "🔧 Generating client with direct schema..."
npx prisma generate

echo "✅ Direct schema client generated"