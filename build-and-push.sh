#!/bin/bash

# Build and Push SurfSchool Docker Images to Docker Hub
# Usage: ./build-and-push.sh [your-dockerhub-username]

set -e

# Configuration
DOCKER_USERNAME=${1:-"surfschool"}
VERSION=${2:-"latest"}
BACKEND_IMAGE="$DOCKER_USERNAME/surfschool-backend"
FRONTEND_IMAGE="$DOCKER_USERNAME/surfschool-frontend"

echo "🏄 Building and pushing SurfSchool Docker images..."
echo "Docker Hub Username: $DOCKER_USERNAME"
echo "Version: $VERSION"

# Build Backend
echo "📦 Building backend image..."
cd backend
docker build -t $BACKEND_IMAGE:$VERSION .
docker tag $BACKEND_IMAGE:$VERSION $BACKEND_IMAGE:latest
cd ..

# Build Frontend
echo "📦 Building frontend image..."
cd frontend
docker build -t $FRONTEND_IMAGE:$VERSION .
docker tag $FRONTEND_IMAGE:$VERSION $FRONTEND_IMAGE:latest
cd ..

# Login to Docker Hub (if not already logged in)
echo "🔐 Logging in to Docker Hub..."
docker login

# Push Backend
echo "🚀 Pushing backend image..."
docker push $BACKEND_IMAGE:$VERSION
docker push $BACKEND_IMAGE:latest

# Push Frontend
echo "🚀 Pushing frontend image..."
docker push $FRONTEND_IMAGE:$VERSION
docker push $FRONTEND_IMAGE:latest

echo "✅ Successfully built and pushed all images!"
echo ""
echo "Backend Image: $BACKEND_IMAGE:$VERSION"
echo "Frontend Image: $FRONTEND_IMAGE:$VERSION"
echo ""
echo "To run locally:"
echo "docker-compose up -d"
echo ""
echo "To deploy on Railway:"
echo "1. Use the images in your Railway service configuration"
echo "2. Set the appropriate environment variables"