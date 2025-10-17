#!/bin/bash

echo "🚀 Starting Surf School Backend..."
echo "=================================="

# Set environment variables for OpenSSL
export OPENSSL_CONF=/etc/ssl/
export PRISMA_CLI_BINARY_TARGETS="linux-musl,linux-musl-openssl-3.0.x"

# Function to check if database is ready
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."
    
    # Extract database connection details from DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
        echo "⚠️  Could not parse database connection details, proceeding anyway..."
        sleep 5
        return 0
    fi
    
    # Wait for database to be ready (max 60 seconds)
    for i in {1..12}; do
        if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
            echo "✅ Database is ready!"
            return 0
        fi
        echo "   Attempt $i/12: Database not ready, waiting 5 seconds..."
        sleep 5
    done
    
    echo "⚠️  Database connection timeout, proceeding anyway..."
    return 1
}

# Function to run Prisma migrations with retry
run_migrations() {
    echo "🔄 Running database migrations..."
    
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "   Migration attempt $attempt/$max_attempts..."
        
        if npx prisma migrate deploy; then
            echo "✅ Migrations completed successfully!"
            return 0
        else
            echo "❌ Migration attempt $attempt failed"
            if [ $attempt -eq $max_attempts ]; then
                echo "💥 All migration attempts failed, starting without migrations..."
                return 1
            fi
            attempt=$((attempt + 1))
            sleep 5
        fi
    done
}

# Function to seed database with retry
seed_database() {
    echo "🌱 Seeding database..."
    
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "   Seed attempt $attempt/$max_attempts..."
        
        if npx prisma db seed; then
            echo "✅ Database seeded successfully!"
            return 0
        else
            echo "❌ Seed attempt $attempt failed"
            if [ $attempt -eq $max_attempts ]; then
                echo "⚠️  All seed attempts failed, starting without seed data..."
                return 1
            fi
            attempt=$((attempt + 1))
            sleep 3
        fi
    done
}

# Function to start the server
start_server() {
    echo "🎯 Starting Node.js server..."
    
    if [ -f "dist/server.js" ]; then
        exec node dist/server.js
    else
        echo "❌ Built server file not found at dist/server.js"
        echo "📁 Available files:"
        ls -la dist/ 2>/dev/null || echo "   dist/ directory not found"
        exit 1
    fi
}

# Main execution flow
main() {
    echo "🔍 Environment check:"
    echo "   NODE_ENV: ${NODE_ENV:-not set}"
    echo "   DATABASE_URL: ${DATABASE_URL:+set}"
    echo "   PORT: ${PORT:-4000}"
    echo ""
    
    # Wait for database
    wait_for_db
    
    # Run migrations
    run_migrations
    
    # Seed database
    seed_database
    
    # Start server
    start_server
}

# Handle signals gracefully
trap 'echo "🛑 Received shutdown signal, stopping server..."; exit 0' SIGTERM SIGINT

# Run main function
main