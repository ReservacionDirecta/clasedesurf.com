#!/bin/bash

# ===============================================
# SURF SCHOOL - DOCKER DEPLOYMENT SCRIPT (Linux/Mac)
# ===============================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
MODE="dev"
BUILD=false
CLEAN=false
LOGS=false
STOP=false
WHATSAPP=false

# Functions
show_header() {
    echo -e "${CYAN}"
    echo "==============================================="
    echo "🏄 SURF SCHOOL - DOCKER DEPLOYMENT"
    echo "==============================================="
    echo -e "${NC}"
}

test_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker no está instalado${NC}"
        return 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose no está instalado${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Docker: $(docker --version)${NC}"
    echo -e "${GREEN}✅ Docker Compose: $(docker-compose --version)${NC}"
    return 0
}

stop_services() {
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    
    docker-compose -f docker-compose.yml down --remove-orphans 2>/dev/null
    docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null
    docker-compose -f docker-compose.complete.yml down --remove-orphans 2>/dev/null
    
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
}

clean_docker() {
    echo -e "${YELLOW}🧹 Limpiando Docker...${NC}"
    
    docker container prune -f
    docker image prune -f
    docker network prune -f
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

build_images() {
    echo -e "${YELLOW}🔨 Construyendo imágenes...${NC}"
    
    echo -e "${BLUE}📦 Construyendo Backend...${NC}"
    docker build -t surfschool-backend:latest ./backend
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error construyendo backend${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📦 Construyendo Frontend...${NC}"
    docker build -t surfschool-frontend:latest ./frontend
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error construyendo frontend${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Imágenes construidas exitosamente${NC}"
}

start_development() {
    echo -e "${YELLOW}🚀 Iniciando modo desarrollo...${NC}"
    
    if [ -f ".env.docker" ]; then
        cp .env.docker .env
        echo -e "${GREEN}✅ Variables de entorno configuradas${NC}"
    fi
    
    docker-compose -f docker-compose.yml up -d postgres redis
    
    echo -e "${BLUE}⏳ Esperando que la base de datos esté lista...${NC}"
    sleep 10
    
    docker-compose -f docker-compose.yml up -d
    
    echo -e "${GREEN}✅ Servicios iniciados en modo desarrollo${NC}"
    show_services
}

start_production() {
    echo -e "${YELLOW}🚀 Iniciando modo producción...${NC}"
    
    if [ "$WHATSAPP" = true ]; then
        echo -e "${BLUE}📱 Incluyendo servicios de WhatsApp...${NC}"
        docker-compose -f docker-compose.complete.yml --profile whatsapp up -d
    else
        docker-compose -f docker-compose.complete.yml up -d postgres redis backend frontend nginx
    fi
    
    echo -e "${GREEN}✅ Servicios iniciados en modo producción${NC}"
    show_services
}

start_full() {
    echo -e "${YELLOW}🚀 Iniciando todos los servicios...${NC}"
    
    docker-compose -f docker-compose.complete.yml --profile whatsapp up -d
    
    echo -e "${GREEN}✅ Todos los servicios iniciados${NC}"
    show_services
}

show_services() {
    echo -e "${CYAN}📋 ESTADO DE SERVICIOS:${NC}"
    docker-compose ps
    
    echo -e "${CYAN}🌐 ENLACES DISPONIBLES:${NC}"
    echo -e "${BLUE}   Frontend:     http://localhost:3000${NC}"
    echo -e "${BLUE}   Backend API:  http://localhost:4000${NC}"
    echo -e "${BLUE}   Database:     localhost:5432${NC}"
    echo -e "${BLUE}   Redis:        localhost:6379${NC}"
    
    if [ "$WHATSAPP" = true ] || [ "$MODE" = "full" ]; then
        echo -e "${BLUE}   WhatsApp API: http://localhost:8080${NC}"
    fi
    
    if [ "$MODE" = "prod" ] || [ "$MODE" = "full" ]; then
        echo -e "${BLUE}   Nginx:        http://localhost:80${NC}"
    fi
}

show_logs() {
    echo -e "${YELLOW}📋 Mostrando logs...${NC}"
    docker-compose logs -f --tail=100
}

show_help() {
    echo -e "${CYAN}"
    cat << EOF

🏄 SURF SCHOOL - DOCKER DEPLOYMENT SCRIPT

USAGE:
    ./docker-deploy.sh [OPTIONS]

OPTIONS:
    --mode <dev|prod|full>  Modo de despliegue (default: dev)
    --build                 Construir imágenes antes de iniciar
    --clean                 Limpiar Docker antes de iniciar
    --logs                  Mostrar logs de los servicios
    --stop                  Detener todos los servicios
    --whatsapp             Incluir servicios de WhatsApp
    --help                  Mostrar esta ayuda

EXAMPLES:
    ./docker-deploy.sh                          # Modo desarrollo básico
    ./docker-deploy.sh --mode prod              # Modo producción
    ./docker-deploy.sh --mode full --whatsapp  # Todos los servicios
    ./docker-deploy.sh --build --clean         # Limpiar y construir
    ./docker-deploy.sh --stop                  # Detener servicios
    ./docker-deploy.sh --logs                  # Ver logs

MODES:
    dev     - PostgreSQL, Redis, Backend, Frontend (desarrollo)
    prod    - Todos los servicios + Nginx (producción)
    full    - Todos los servicios incluyendo WhatsApp

EOF
    echo -e "${NC}"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode)
            MODE="$2"
            shift 2
            ;;
        --build)
            BUILD=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --logs)
            LOGS=true
            shift
            ;;
        --stop)
            STOP=true
            shift
            ;;
        --whatsapp)
            WHATSAPP=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opción desconocida: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# ===============================================
# MAIN EXECUTION
# ===============================================

show_header

# Test Docker installation
if ! test_docker; then
    exit 1
fi

# Stop services if requested
if [ "$STOP" = true ]; then
    stop_services
    exit 0
fi

# Show logs if requested
if [ "$LOGS" = true ]; then
    show_logs
    exit 0
fi

# Clean Docker if requested
if [ "$CLEAN" = true ]; then
    clean_docker
fi

# Build images if requested
if [ "$BUILD" = true ]; then
    build_images
fi

# Start services based on mode
case $MODE in
    "dev")
        start_development
        ;;
    "prod")
        start_production
        ;;
    "full")
        start_full
        ;;
    *)
        echo -e "${RED}❌ Modo inválido: $MODE${NC}"
        show_help
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Despliegue completado exitosamente!${NC}"
echo -e "${YELLOW}Para ver logs: ./docker-deploy.sh --logs${NC}"
echo -e "${YELLOW}Para detener:  ./docker-deploy.sh --stop${NC}"
echo -e "${CYAN}===============================================${NC}"