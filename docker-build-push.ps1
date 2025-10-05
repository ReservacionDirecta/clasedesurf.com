# Script de PowerShell para build y push a Docker Hub

Write-Host "`n=== SURF SCHOOL - BUILD Y PUSH A DOCKER HUB ===`n" -ForegroundColor Cyan

# Verificar Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado o no está corriendo" -ForegroundColor Red
    exit 1
}

# Solicitar username
$dockerUsername = Read-Host "`nIngresa tu username de Docker Hub"
if ([string]::IsNullOrEmpty($dockerUsername)) {
    Write-Host "❌ Username es requerido" -ForegroundColor Red
    exit 1
}

Write-Host "`n📝 Username: $dockerUsername" -ForegroundColor Yellow

# Login a Docker Hub
Write-Host "`n🔐 Iniciando sesión en Docker Hub..." -ForegroundColor Yellow
try {
    docker login
    Write-Host "✅ Sesión iniciada correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al iniciar sesión en Docker Hub" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔨 CONSTRUYENDO IMÁGENES..." -ForegroundColor Cyan

# Build Frontend
Write-Host "`n📦 Construyendo Frontend (Next.js)..." -ForegroundColor Yellow
try {
    docker build -t "$dockerUsername/surfschool-frontend:latest" ./frontend
    Write-Host "✅ Frontend construido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al construir frontend" -ForegroundColor Red
    exit 1
}

# Build Backend
Write-Host "`n📦 Construyendo Backend (Node.js)..." -ForegroundColor Yellow
try {
    docker build -t "$dockerUsername/surfschool-backend:latest" ./backend
    Write-Host "✅ Backend construido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al construir backend" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 SUBIENDO IMÁGENES A DOCKER HUB..." -ForegroundColor Cyan

# Push Frontend
Write-Host "`n📤 Subiendo Frontend..." -ForegroundColor Yellow
try {
    docker push "$dockerUsername/surfschool-frontend:latest"
    Write-Host "✅ Frontend subido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al subir frontend" -ForegroundColor Red
    exit 1
}

# Push Backend
Write-Host "`n📤 Subiendo Backend..." -ForegroundColor Yellow
try {
    docker push "$dockerUsername/surfschool-backend:latest"
    Write-Host "✅ Backend subido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al subir backend" -ForegroundColor Red
    exit 1
}

# Crear docker-compose para producción
Write-Host "`n📝 Creando docker-compose.prod.yml..." -ForegroundColor Yellow

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

  # Backend API
  backend:
    image: $dockerUsername/surfschool-backend:latest
    container_name: surfschool-backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: "postgresql://postgres:`${POSTGRES_PASSWORD:-postgres}@postgres:5432/`${POSTGRES_DB:-clasedesurf.com}"
      JWT_SECRET: "`${JWT_SECRET:-change-this-in-production}"
      PORT: 4000
      NODE_ENV: "production"
      FRONTEND_URL: "`${FRONTEND_URL:-http://localhost:3000}"
    depends_on:
      - postgres
    networks:
      - surfschool-network
    restart: unless-stopped

  # Frontend (Next.js)
  frontend:
    image: $dockerUsername/surfschool-frontend:latest
    container_name: surfschool-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: "`${NEXT_PUBLIC_API_URL:-http://localhost:4000}"
      NEXTAUTH_URL: "`${NEXTAUTH_URL:-http://localhost:3000}"
      NEXTAUTH_SECRET: "`${NEXTAUTH_SECRET:-change-this-in-production}"
      DATABASE_URL: "postgresql://postgres:`${POSTGRES_PASSWORD:-postgres}@postgres:5432/`${POSTGRES_DB:-clasedesurf.com}"
    depends_on:
      - backend
      - postgres
    networks:
      - surfschool-network
    restart: unless-stopped

  # Redis (opcional)
  redis:
    image: redis:7-alpine
    container_name: surfschool-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - surfschool-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  surfschool-network:
    driver: bridge
"@

$prodCompose | Out-File -FilePath "docker-compose.prod.yml" -Encoding UTF8

Write-Host "`n🎉 PROCESO COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "`n📦 IMÁGENES DISPONIBLES EN DOCKER HUB:" -ForegroundColor Cyan
Write-Host "   🌐 Frontend: $dockerUsername/surfschool-frontend:latest" -ForegroundColor White
Write-Host "   🔧 Backend:  $dockerUsername/surfschool-backend:latest" -ForegroundColor White

Write-Host "`n🚀 PARA USAR EN PRODUCCIÓN:" -ForegroundColor Yellow
Write-Host "   1. Copia docker-compose.prod.yml a tu servidor" -ForegroundColor White
Write-Host "   2. Configura variables de entorno:" -ForegroundColor White
Write-Host "      export POSTGRES_PASSWORD=tu-password-seguro" -ForegroundColor Gray
Write-Host "      export JWT_SECRET=tu-jwt-secret-seguro" -ForegroundColor Gray
Write-Host "      export NEXTAUTH_SECRET=tu-nextauth-secret" -ForegroundColor Gray
Write-Host "   3. Ejecuta: docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor White

Write-Host "`n🔗 ENLACES DE DOCKER HUB:" -ForegroundColor Yellow
Write-Host "   Frontend: https://hub.docker.com/r/$dockerUsername/surfschool-frontend" -ForegroundColor Blue
Write-Host "   Backend:  https://hub.docker.com/r/$dockerUsername/surfschool-backend" -ForegroundColor Blue

Write-Host "`n===============================================`n" -ForegroundColor Cyan