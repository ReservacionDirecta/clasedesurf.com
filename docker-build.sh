#!/bin/bash

# Script para construir y subir imágenes Docker a Docker Hub
# Uso: ./docker-build.sh [backend|frontend|all] [push]

set -e

DOCKER_USERNAME="${DOCKER_USERNAME:-tu-usuario}"
BACKEND_IMAGE="${DOCKER_USERNAME}/clasedesurf-backend"
FRONTEND_IMAGE="${DOCKER_USERNAME}/clasedesurf-frontend"
VERSION="${VERSION:-latest}"

BUILD_TYPE="${1:-all}"
PUSH="${2:-}"

echo "🐳 Docker Build Script"
echo "======================"
echo "Docker Hub Username: $DOCKER_USERNAME"
echo "Backend Image: $BACKEND_IMAGE:$VERSION"
echo "Frontend Image: $FRONTEND_IMAGE:$VERSION"
echo "Build Type: $BUILD_TYPE"
echo "Push: ${PUSH:-no}"
echo ""

build_backend() {
    echo "🔨 Building Backend..."
    cd backend
    docker build -f Dockerfile.production -t $BACKEND_IMAGE:$VERSION .
    docker tag $BACKEND_IMAGE:$VERSION $BACKEND_IMAGE:latest
    cd ..
    echo "✅ Backend built successfully"
}

build_frontend() {
    echo "🔨 Building Frontend..."
    cd frontend
    
    # Build arguments for Railway production
    docker build \
        -f Dockerfile.production \
        --build-arg NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL:-https://surfschool-backend-production.up.railway.app}" \
        --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-}" \
        --build-arg NEXTAUTH_URL="${NEXTAUTH_URL:-https://clasedesurfcom-production.up.railway.app}" \
        --build-arg NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-}" \
        -t $FRONTEND_IMAGE:$VERSION .
    
    docker tag $FRONTEND_IMAGE:$VERSION $FRONTEND_IMAGE:latest
    cd ..
    echo "✅ Frontend built successfully"
}

push_backend() {
    echo "📤 Pushing Backend to Docker Hub..."
    docker push $BACKEND_IMAGE:$VERSION
    docker push $BACKEND_IMAGE:latest
    echo "✅ Backend pushed successfully"
}

push_frontend() {
    echo "📤 Pushing Frontend to Docker Hub..."
    docker push $FRONTEND_IMAGE:$VERSION
    docker push $FRONTEND_IMAGE:latest
    echo "✅ Frontend pushed successfully"
}

# Build
case $BUILD_TYPE in
    backend)
        build_backend
        if [ "$PUSH" = "push" ]; then
            push_backend
        fi
        ;;
    frontend)
        build_frontend
        if [ "$PUSH" = "push" ]; then
            push_frontend
        fi
        ;;
    all)
        build_backend
        build_frontend
        if [ "$PUSH" = "push" ]; then
            push_backend
            push_frontend
        fi
        ;;
    *)
        echo "❌ Invalid build type: $BUILD_TYPE"
        echo "Usage: ./docker-build.sh [backend|frontend|all] [push]"
        exit 1
        ;;
esac

echo ""
echo "🎉 Build completed successfully!"
if [ "$PUSH" != "push" ]; then
    echo "💡 To push images, run: ./docker-build.sh $BUILD_TYPE push"
fi








