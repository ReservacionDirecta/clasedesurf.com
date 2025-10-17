#!/bin/bash

echo "🧪 Testing Surf School Deployment..."
echo "===================================="

# Function to check if a service is running
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo "🔍 Checking $service_name at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is running!"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts: $service_name not ready, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to test API endpoints
test_api_endpoints() {
    echo "🔧 Testing API endpoints..."
    
    # Test health endpoint
    if curl -s "http://localhost:4000/health" | grep -q "OK"; then
        echo "✅ Health endpoint working"
    else
        echo "❌ Health endpoint failed"
        return 1
    fi
    
    # Test API root
    if curl -s -f "http://localhost:4000/api" > /dev/null 2>&1; then
        echo "✅ API root accessible"
    else
        echo "⚠️  API root not accessible (may be normal)"
    fi
    
    return 0
}

# Function to test frontend
test_frontend() {
    echo "🌐 Testing frontend..."
    
    if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
        echo "✅ Frontend is accessible"
        return 0
    else
        echo "❌ Frontend is not accessible"
        return 1
    fi
}

# Main test function
run_tests() {
    echo "🚀 Starting deployment test..."
    echo ""
    
    # Pull latest images
    echo "📥 Pulling latest images..."
    docker-compose pull
    
    # Start services
    echo "🏁 Starting services..."
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting for services to initialize..."
    sleep 10
    
    # Check service status
    echo "📊 Service Status:"
    docker-compose ps
    echo ""
    
    # Test database
    echo "🗄️  Testing database connection..."
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ Database is ready"
    else
        echo "❌ Database connection failed"
    fi
    
    # Test backend
    if check_service "Backend" "http://localhost:4000/health"; then
        test_api_endpoints
    fi
    
    # Test frontend
    check_service "Frontend" "http://localhost:3000"
    
    echo ""
    echo "📋 Final Status:"
    echo "================"
    docker-compose ps
    
    echo ""
    echo "📝 Service Logs (last 10 lines each):"
    echo "======================================"
    
    echo "🗄️  Database logs:"
    docker-compose logs --tail=10 postgres
    
    echo ""
    echo "🔧 Backend logs:"
    docker-compose logs --tail=10 backend
    
    echo ""
    echo "🌐 Frontend logs:"
    docker-compose logs --tail=10 frontend
    
    echo ""
    echo "🎯 Test completed!"
    echo "=================="
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:4000"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "To stop services: docker-compose down"
    echo "To view live logs: docker-compose logs -f"
}

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    # Uncomment the next line if you want to stop services after test
    # docker-compose down
}

trap cleanup EXIT

# Run the tests
run_tests