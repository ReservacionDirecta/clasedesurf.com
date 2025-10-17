#!/bin/bash

echo "🧪 Testing Backend Container..."
echo "================================"

# Stop any existing container
docker stop surfschool-backend-test 2>/dev/null || true
docker rm surfschool-backend-test 2>/dev/null || true

# Run the backend container for testing
echo "🚀 Starting backend container..."
docker run -d \
  --name surfschool-backend-test \
  -p 4001:4000 \
  -e DATABASE_URL="postgresql://postgres:postgres123@host.docker.internal:5432/surfschool" \
  -e JWT_SECRET="test-jwt-secret" \
  -e NEXTAUTH_SECRET="test-nextauth-secret" \
  -e NODE_ENV="production" \
  chambadigital/surfschool-backend:latest

# Wait for container to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Check if container is running
if docker ps | grep -q surfschool-backend-test; then
  echo "✅ Container is running!"
  
  # Test health endpoint
  echo "🔍 Testing health endpoint..."
  if curl -f http://localhost:4001/health 2>/dev/null; then
    echo "✅ Health check passed!"
  else
    echo "❌ Health check failed!"
  fi
  
  # Show container logs
  echo "📋 Container logs:"
  docker logs surfschool-backend-test --tail 20
  
else
  echo "❌ Container failed to start!"
  echo "📋 Container logs:"
  docker logs surfschool-backend-test
fi

# Cleanup
echo "🧹 Cleaning up test container..."
docker stop surfschool-backend-test
docker rm surfschool-backend-test

echo "🏁 Test completed!"