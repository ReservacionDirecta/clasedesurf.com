#!/bin/bash

# Script para construir y subir imágenes Docker a Docker Hub
# Uso: ./docker-build-and-push.sh

echo "🐳 Docker Build and Push Script"
echo "================================="
echo ""

# Variables
DOCKER_USERNAME="chambadigital"
BACKEND_IMAGE="$DOCKER_USERNAME/surfschool-backend"
FRONTEND_IMAGE="$DOCKER_USERNAME/surfschool-frontend"
VERSION="latest"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar si Docker está corriendo
echo -e "${YELLOW}🔍 Verificando Docker...${NC}"
if ! docker version > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo. Por favor inicia Docker${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está corriendo${NC}"

# Login a Docker Hub
echo ""
echo -e "${YELLOW}🔐 Iniciando sesión en Docker Hub...${NC}"
echo -e "${CYAN}Por favor ingresa tus credenciales de Docker Hub${NC}"
docker login

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al iniciar sesión en Docker Hub${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Sesión iniciada correctamente${NC}"

# Construir Backend
echo ""
echo -e "${YELLOW}🏗️  Construyendo imagen del Backend...${NC}"
echo -e "${CYAN}Imagen: $BACKEND_IMAGE:$VERSION${NC}"

cd backend
docker build -t ${BACKEND_IMAGE}:${VERSION} -t ${BACKEND_IMAGE}:v1.0 .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir imagen del backend${NC}"
    cd ..
    exit 1
fi

echo -e "${GREEN}✅ Backend construido exitosamente${NC}"
cd ..

# Construir Frontend
echo ""
echo -e "${YELLOW}🏗️  Construyendo imagen del Frontend...${NC}"
echo -e "${CYAN}Imagen: $FRONTEND_IMAGE:$VERSION${NC}"

cd frontend
docker build -t ${FRONTEND_IMAGE}:${VERSION} -t ${FRONTEND_IMAGE}:v1.0 .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir imagen del frontend${NC}"
    cd ..
    exit 1
fi

echo -e "${GREEN}✅ Frontend construido exitosamente${NC}"
cd ..

# Subir Backend a Docker Hub
echo ""
echo -e "${YELLOW}📤 Subiendo Backend a Docker Hub...${NC}"
docker push ${BACKEND_IMAGE}:${VERSION}
docker push ${BACKEND_IMAGE}:v1.0

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al subir imagen del backend${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend subido exitosamente${NC}"

# Subir Frontend a Docker Hub
echo ""
echo -e "${YELLOW}📤 Subiendo Frontend a Docker Hub...${NC}"
docker push ${FRONTEND_IMAGE}:${VERSION}
docker push ${FRONTEND_IMAGE}:v1.0

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al subir imagen del frontend${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend subido exitosamente${NC}"

# Resumen
echo ""
echo -e "${GREEN}🎉 ¡Proceso completado exitosamente!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo -e "${CYAN}📦 Imágenes creadas y subidas:${NC}"
echo "  • ${BACKEND_IMAGE}:latest"
echo "  • ${BACKEND_IMAGE}:v1.0"
echo "  • ${FRONTEND_IMAGE}:latest"
echo "  • ${FRONTEND_IMAGE}:v1.0"
echo ""
echo -e "${CYAN}🚀 Para desplegar el sistema completo:${NC}"
echo -e "${YELLOW}   docker-compose up -d${NC}"
echo ""
echo -e "${CYAN}📋 Para ver los logs:${NC}"
echo -e "${YELLOW}   docker-compose logs -f${NC}"
echo ""
echo -e "${CYAN}🔗 URLs de acceso:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo ""
echo -e "${CYAN}🐳 Docker Hub:${NC}"
echo "   https://hub.docker.com/r/${DOCKER_USERNAME}/surfschool-backend"
echo "   https://hub.docker.com/r/${DOCKER_USERNAME}/surfschool-frontend"
echo ""
