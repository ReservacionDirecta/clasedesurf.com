#!/bin/bash

# Script para construir y subir imágenes Docker a Docker Hub
# Uso: ./docker-build-push-all.sh [username] [version]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parámetros
USERNAME=${1:-yerct}
VERSION=${2:-latest}
SKIP_BUILD=${SKIP_BUILD:-false}
SKIP_PUSH=${SKIP_PUSH:-false}
BUILD_ONLY=${BUILD_ONLY:-false}

echo -e "${CYAN}🐳 Clase de Surf - Docker Build & Push Script${NC}"
echo -e "${CYAN}=============================================${NC}"
echo ""

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está instalado${NC}"

# Verificar que Docker está corriendo
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está corriendo${NC}"

echo ""
echo -e "${CYAN}📋 Configuración:${NC}"
echo -e "   Usuario Docker Hub: ${USERNAME}"
echo -e "   Versión: ${VERSION}"
echo ""

# Login a Docker Hub (solo si no es BUILD_ONLY)
if [ "$BUILD_ONLY" != "true" ]; then
    echo -e "${YELLOW}🔐 Iniciando sesión en Docker Hub...${NC}"
    echo -e "${YELLOW}   Por favor, ingresa tus credenciales de Docker Hub${NC}"
    docker login
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al iniciar sesión en Docker Hub${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Sesión iniciada correctamente${NC}"
    echo ""
fi

# Función para construir imagen
build_image() {
    local service=$1
    local context=$2
    local image_name=$3
    
    echo -e "${CYAN}🔨 Construyendo ${service}...${NC}"
    echo -e "   Contexto: ${context}"
    echo -e "   Imagen: ${image_name}"
    
    docker build -t "${image_name}" -f "${context}/Dockerfile" "${context}"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al construir ${service}${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ ${service} construido correctamente${NC}"
    echo ""
    return 0
}

# Función para subir imagen
push_image() {
    local service=$1
    local image_name=$2
    
    echo -e "${CYAN}📤 Subiendo ${service} a Docker Hub...${NC}"
    echo -e "   Imagen: ${image_name}"
    
    docker push "${image_name}"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al subir ${service}${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ ${service} subido correctamente${NC}"
    echo ""
    return 0
}

# Construir Backend
if [ "$SKIP_BUILD" != "true" ]; then
    BACKEND_IMAGE="${USERNAME}/clasedesurf-backend:${VERSION}"
    build_image "Backend" "./backend" "${BACKEND_IMAGE}"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Falló la construcción del Backend${NC}"
        exit 1
    fi
    
    # Tag como latest si no es latest
    if [ "$VERSION" != "latest" ]; then
        echo -e "${YELLOW}🏷️  Etiquetando Backend como latest...${NC}"
        docker tag "${BACKEND_IMAGE}" "${USERNAME}/clasedesurf-backend:latest"
    fi
else
    echo -e "${YELLOW}⏭️  Saltando construcción del Backend${NC}"
    echo ""
fi

# Construir Frontend
if [ "$SKIP_BUILD" != "true" ]; then
    FRONTEND_IMAGE="${USERNAME}/clasedesurf-frontend:${VERSION}"
    build_image "Frontend" "./frontend" "${FRONTEND_IMAGE}"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Falló la construcción del Frontend${NC}"
        exit 1
    fi
    
    # Tag como latest si no es latest
    if [ "$VERSION" != "latest" ]; then
        echo -e "${YELLOW}🏷️  Etiquetando Frontend como latest...${NC}"
        docker tag "${FRONTEND_IMAGE}" "${USERNAME}/clasedesurf-frontend:latest"
    fi
else
    echo -e "${YELLOW}⏭️  Saltando construcción del Frontend${NC}"
    echo ""
fi

# Subir imágenes a Docker Hub
if [ "$SKIP_PUSH" != "true" ] && [ "$BUILD_ONLY" != "true" ]; then
    echo -e "${CYAN}📤 Subiendo imágenes a Docker Hub...${NC}"
    echo ""
    
    # Subir Backend
    BACKEND_IMAGE="${USERNAME}/clasedesurf-backend:${VERSION}"
    push_image "Backend" "${BACKEND_IMAGE}"
    
    if [ "$VERSION" != "latest" ]; then
        push_image "Backend (latest)" "${USERNAME}/clasedesurf-backend:latest"
    fi
    
    # Subir Frontend
    FRONTEND_IMAGE="${USERNAME}/clasedesurf-frontend:${VERSION}"
    push_image "Frontend" "${FRONTEND_IMAGE}"
    
    if [ "$VERSION" != "latest" ]; then
        push_image "Frontend (latest)" "${USERNAME}/clasedesurf-frontend:latest"
    fi
    
    echo -e "${GREEN}✅ Todas las imágenes subidas correctamente${NC}"
elif [ "$BUILD_ONLY" == "true" ]; then
    echo -e "${YELLOW}⏭️  Modo BuildOnly: No se subirán las imágenes${NC}"
else
    echo -e "${YELLOW}⏭️  Saltando subida de imágenes${NC}"
fi

echo ""
echo -e "${CYAN}=============================================${NC}"
echo -e "${GREEN}✅ Proceso completado!${NC}"
echo ""
echo -e "${CYAN}📋 Imágenes creadas:${NC}"
echo -e "   - ${USERNAME}/clasedesurf-backend:${VERSION}"
echo -e "   - ${USERNAME}/clasedesurf-frontend:${VERSION}"

if [ "$VERSION" != "latest" ]; then
    echo -e "   - ${USERNAME}/clasedesurf-backend:latest"
    echo -e "   - ${USERNAME}/clasedesurf-frontend:latest"
fi

echo ""
echo -e "${CYAN}🚀 Para desplegar la aplicación:${NC}"
echo -e "   docker-compose up -d"
echo ""
echo -e "${CYAN}🔍 Para ver las imágenes en Docker Hub:${NC}"
echo -e "   https://hub.docker.com/u/${USERNAME}"
echo ""
