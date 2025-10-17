#!/bin/sh

# Production startup script for SurfSchool Backend
set -e

echo "🚀 Starting SurfSchool Backend in production mode..."

# Debug environment variables
echo "🔍 Environment Debug:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "FRONTEND_URL: $FRONTEND_URL"
echo "JWT_SECRET exists: $([ -n "$JWT_SECRET" ] && echo "✅ Yes" || echo "❌ No")"
echo "DATABASE_URL exists: $([ -n "$DATABASE_URL" ] && echo "✅ Yes" || echo "❌ No")"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "🔧 Possible solutions:"
    echo "1. Verify PostgreSQL service is connected in Railway"
    echo "2. Check variable syntax: DATABASE_URL=\${{Postgres.DATABASE_URL}}"
    echo "3. Ensure services are in the same Railway project"
    echo "4. Try manual DATABASE_URL if auto-reference fails"
    exit 1
fi

echo "📊 Database URL configured: ${DATABASE_URL%%@*}@***"

# Verify Prisma client from build
echo "🔧 Verifying Prisma client from build..."

# Debug: Show current DATABASE_URL format
echo "🔍 DATABASE_URL format check:"
if echo "$DATABASE_URL" | grep -q "^prisma://"; then
    echo "❌ ERROR: DATABASE_URL is using Prisma Data Proxy format!"
    exit 1
elif echo "$DATABASE_URL" | grep -q "^postgresql://"; then
    echo "✅ DATABASE_URL is using direct PostgreSQL format"
else
    echo "⚠️ Unknown DATABASE_URL format"
fi

# Check if Prisma client exists from build
if [ -d "node_modules/.prisma/client" ]; then
    echo "✅ Prisma client from build found"
else
    echo "⚠️ Prisma client not found, generating..."
    npx prisma generate
fi

# Wait a bit for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Try to deploy migrations with retry logic
echo "🗄️ Deploying database migrations..."
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if npx prisma migrate deploy; then
        echo "✅ Migrations deployed successfully"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "⚠️ Migration attempt $RETRY_COUNT failed. Retrying in 10 seconds..."
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            echo "❌ Failed to deploy migrations after $MAX_RETRIES attempts"
            echo "🔍 Trying database push as fallback..."
            npx prisma db push --accept-data-loss || echo "Database push also failed"
            echo "⚠️ Starting server anyway - check database manually if needed"
            break
        fi
        sleep 10
    fi
done

# Regenerate Prisma Client with runtime DATABASE_URL
echo "🔄 Regenerating Prisma Client with runtime DATABASE_URL..."
npx prisma generate

# Start the server
echo "🌟 Starting Node.js server..."
exec node dist/server.js