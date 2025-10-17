# Script para construir y subir imágenes Docker a Docker Hub
# Uso: .\docker-build-and-push.ps1

Write-Host "🐳 Docker Build and Push Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$DOCKER_USERNAME = "chambadigital"
$BACKEND_IMAGE = "$DOCKER_USERNAME/surfschool-backend"
$FRONTEND_IMAGE = "$DOCKER_USERNAME/surfschool-frontend"
$VERSION = "latest"

# Verificar si Docker está corriendo
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker está corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está corriendo. Por favor inicia Docker Desktop" -ForegroundColor Red
    exit 1
}

# Login a Docker Hub
Write-Host ""
Write-Host "🔐 Iniciando sesión en Docker Hub..." -ForegroundColor Yellow
Write-Host "Por favor ingresa tus credenciales de Docker Hub" -ForegroundColor Cyan
docker login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar sesión en Docker Hub" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Sesión iniciada correctamente" -ForegroundColor Green

# Construir Backend
Write-Host ""
Write-Host "🏗️  Construyendo imagen del Backend..." -ForegroundColor Yellow
Write-Host "Imagen: $BACKEND_IMAGE:$VERSION" -ForegroundColor Cyan

Set-Location backend
docker build -t ${BACKEND_IMAGE}:${VERSION} -t ${BACKEND_IMAGE}:v1.0 .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir imagen del backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Backend construido exitosamente" -ForegroundColor Green
Set-Location ..

# Construir Frontend
Write-Host ""
Write-Host "🏗️  Construyendo imagen del Frontend..." -ForegroundColor Yellow
Write-Host "Imagen: $FRONTEND_IMAGE:$VERSION" -ForegroundColor Cyan

Set-Location frontend
docker build -t ${FRONTEND_IMAGE}:${VERSION} -t ${FRONTEND_IMAGE}:v1.0 .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir imagen del frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Frontend construido exitosamente" -ForegroundColor Green
Set-Location ..

# Subir Backend a Docker Hub
Write-Host ""
Write-Host "📤 Subiendo Backend a Docker Hub..." -ForegroundColor Yellow
docker push ${BACKEND_IMAGE}:${VERSION}
docker push ${BACKEND_IMAGE}:v1.0

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir imagen del backend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend subido exitosamente" -ForegroundColor Green

# Subir Frontend a Docker Hub
Write-Host ""
Write-Host "📤 Subiendo Frontend a Docker Hub..." -ForegroundColor Yellow
docker push ${FRONTEND_IMAGE}:${VERSION}
docker push ${FRONTEND_IMAGE}:v1.0

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir imagen del frontend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend subido exitosamente" -ForegroundColor Green

# Resumen
Write-Host ""
Write-Host "🎉 ¡Proceso completado exitosamente!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Imágenes creadas y subidas:" -ForegroundColor Cyan
Write-Host "  • ${BACKEND_IMAGE}:latest" -ForegroundColor White
Write-Host "  • ${BACKEND_IMAGE}:v1.0" -ForegroundColor White
Write-Host "  • ${FRONTEND_IMAGE}:latest" -ForegroundColor White
Write-Host "  • ${FRONTEND_IMAGE}:v1.0" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Para desplegar el sistema completo:" -ForegroundColor Cyan
Write-Host "   docker-compose up -d" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Para ver los logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔗 URLs de acceso:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor White
Write-Host ""
Write-Host "🐳 Docker Hub:" -ForegroundColor Cyan
Write-Host "   https://hub.docker.com/r/$DOCKER_USERNAME/surfschool-backend" -ForegroundColor White
Write-Host "   https://hub.docker.com/r/$DOCKER_USERNAME/surfschool-frontend" -ForegroundColor White
Write-Host ""
