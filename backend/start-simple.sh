#!/bin/bash

echo "🚀 Starting Surf School Backend (Simple Mode)..."
echo "================================================"

# Set environment variables
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-4000}

# Function to check if server file exists
check_server_file() {
    if [ ! -f "dist/server.js" ]; then
        echo "❌ Server file not found at dist/server.js"
        echo "📁 Checking available files:"
        ls -la dist/ 2>/dev/null || echo "   dist/ directory not found"
        
        # Try to find the server file
        if [ -f "src/server.js" ]; then
            echo "✅ Found server at src/server.js"
            exec node src/server.js
        elif [ -f "server.js" ]; then
            echo "✅ Found server at server.js"
            exec node server.js
        else
            echo "💥 No server file found, exiting..."
            exit 1
        fi
    fi
}

# Function to run database setup (optional)
setup_database() {
    echo "🗄️  Setting up database (optional)..."
    
    # Try to run migrations (don't fail if it doesn't work)
    echo "   Attempting migrations..."
    npx prisma migrate deploy 2>/dev/null && echo "   ✅ Migrations completed" || echo "   ⚠️  Migrations skipped"
    
    # Try to seed database (don't fail if it doesn't work)
    echo "   Attempting database seed..."
    npx prisma db seed 2>/dev/null && echo "   ✅ Database seeded" || echo "   ⚠️  Seeding skipped"
}

# Function to start the server
start_server() {
    echo "🎯 Starting Node.js server on port ${PORT}..."
    echo "🌐 Server will be available at http://localhost:${PORT}"
    echo ""
    
    exec node dist/server.js
}

# Main execution
main() {
    echo "🔍 Environment:"
    echo "   NODE_ENV: ${NODE_ENV}"
    echo "   PORT: ${PORT}"
    echo "   DATABASE_URL: ${DATABASE_URL:+configured}"
    echo ""
    
    # Check server file
    check_server_file
    
    # Setup database (optional)
    setup_database
    
    # Start server
    start_server
}

# Handle shutdown signals
trap 'echo "🛑 Shutting down server..."; exit 0' SIGTERM SIGINT

# Run main function
main