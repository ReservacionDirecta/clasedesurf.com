# Script para generar docker-compose.prod.yml con tu username

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerUsername
)

Write-Host "`n📝 Generando docker-compose.prod.yml para usuario: $DockerUsername" -ForegroundColor Yellow

$prodCompose = @"
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: surfschool-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: `${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: `${POSTGRES_DB:-clasedesurf.com}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - surfschool-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    image: $DockerUsername/surfschool-backend:latest
    container_name: surfschool-backend
    ports:
      - "4000:4000"
    environment:
      # Database
      DATABASE_URL: "postgresql://postgres:`${POSTGRES_PASSWORD:-postgres}@postgres:5432/`${POSTGRES_DB:-clasedesurf.com}"
      
      # JWT
      JWT_SECRET: "`${JWT_SECRET:-change-this-in-production}"
      
      # Server
      PORT: 4000
      NODE_ENV: "production"
      
      # Frontend URL
      FRONTEND_URL: "`${FRONTEND_URL:-http://localhost:3000}"
      
      # WhatsApp (WPPConnect)
      WHATSAPP_ENABLED: "`${WHATSAPP_ENABLED:-true}"
      WHATSAPP_SESSION: "`${WHATSAPP_SESSION:-surfschool}"
    volumes:
      - backend_sessions:/app/sessions
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - surfschool-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend (Next.js)
  frontend:
    image: $DockerUsername/surfschool-frontend:latest
    container_name: surfschool-frontend
    ports:
      - "3000:3000"
    environment:
      # API URL
      NEXT_PUBLIC_API_URL: "`${NEXT_PUBLIC_API_URL:-http://localhost:4000}"
      
      # NextAuth
      NEXTAUTH_URL: "`${NEXTAUTH_URL:-http://localhost:3000}"
      NEXTAUTH_SECRET: "`${NEXTAUTH_SECRET:-change-this-in-production}"
      
      # Database (for NextAuth)
      DATABASE_URL: "postgresql://postgres:`${POSTGRES_PASSWORD:-postgres}@postgres:5432/`${POSTGRES_DB:-clasedesurf.com}"
    depends_on:
      - backend
      - postgres
    networks:
      - surfschool-network
    restart: unless-stopped

  # Redis (Cache y Sesiones)
  redis:
    image: redis:7-alpine
    container_name: surfschool-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - surfschool-network
    command: redis-server --appendonly yes
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # Nginx (Reverse Proxy) - Opcional
  nginx:
    image: nginx:alpine
    container_name: surfschool-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - surfschool-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  backend_sessions:

networks:
  surfschool-network:
    driver: bridge
"@

# Guardar archivo
$prodCompose | Out-File -FilePath "docker-compose.prod.yml" -Encoding UTF8

Write-Host "✅ docker-compose.prod.yml generado exitosamente!" -ForegroundColor Green

# Crear archivo .env.example para producción
$envExample = @"
# ===========================================
# SURF SCHOOL - VARIABLES DE PRODUCCIÓN
# ===========================================

# Base de Datos
POSTGRES_PASSWORD=tu-password-muy-seguro-aqui
POSTGRES_DB=clasedesurf.com

# JWT y Autenticación
JWT_SECRET=tu-jwt-secret-super-seguro-de-32-caracteres
NEXTAUTH_SECRET=tu-nextauth-secret-super-seguro-de-32-caracteres

# URLs (cambiar por tu dominio)
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com

# WhatsApp (WPPConnect)
WHATSAPP_ENABLED=true
WHATSAPP_SESSION=surfschool

# ===========================================
# INSTRUCCIONES:
# ===========================================
# 1. Copia este archivo como .env.prod
# 2. Cambia todos los valores por los reales
# 3. Ejecuta: docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
# 4. Para generar secrets seguros usa: openssl rand -base64 32
"@

$envExample | Out-File -FilePath ".env.prod.example" -Encoding UTF8

Write-Host "✅ .env.prod.example generado exitosamente!" -ForegroundColor Green

Write-Host "`n🚀 ARCHIVOS GENERADOS:" -ForegroundColor Cyan
Write-Host "   📄 docker-compose.prod.yml - Configuración de producción" -ForegroundColor White
Write-Host "   📄 .env.prod.example - Variables de entorno de ejemplo" -ForegroundColor White

Write-Host "`n📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "   1. Copia .env.prod.example como .env.prod" -ForegroundColor White
Write-Host "   2. Edita .env.prod con tus valores reales" -ForegroundColor White
Write-Host "   3. Ejecuta: docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d" -ForegroundColor White

Write-Host "`n🔗 IMÁGENES DOCKER HUB:" -ForegroundColor Yellow
Write-Host "   Frontend: https://hub.docker.com/r/$DockerUsername/surfschool-frontend" -ForegroundColor Blue
Write-Host "   Backend:  https://hub.docker.com/r/$DockerUsername/surfschool-backend" -ForegroundColor Blue