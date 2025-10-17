# Script para construir y subir imágenes Docker a Docker Hub

Write-Host "Docker Build and Push Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

$DOCKER_USERNAME = "chambadigital"
$BACKEND_IMAGE = "$DOCKER_USERNAME/surfschool-backend"
$FRONTEND_IMAGE = "$DOCKER_USERNAME/surfschool-frontend"

# Verificar Docker
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "Docker OK" -ForegroundColor Green
} catch {
    Write-Host "Docker no esta corriendo" -ForegroundColor Red
    exit 1
}

# Login
Write-Host ""
Write-Host "Login a Docker Hub..." -ForegroundColor Yellow
docker login

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en login" -ForegroundColor Red
    exit 1
}

# Build Backend
Write-Host ""
Write-Host "Construyendo Backend..." -ForegroundColor Yellow
Set-Location backend
docker build -t ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:v1.0 .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error construyendo backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "Backend OK" -ForegroundColor Green
Set-Location ..

# Build Frontend
Write-Host ""
Write-Host "Construyendo Frontend..." -ForegroundColor Yellow
Set-Location frontend
docker build -t ${FRONTEND_IMAGE}:latest -t ${FRONTEND_IMAGE}:v1.0 .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error construyendo frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "Frontend OK" -ForegroundColor Green
Set-Location ..

# Push Backend
Write-Host ""
Write-Host "Subiendo Backend..." -ForegroundColor Yellow
docker push ${BACKEND_IMAGE}:latest
docker push ${BACKEND_IMAGE}:v1.0

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error subiendo backend" -ForegroundColor Red
    exit 1
}

Write-Host "Backend subido OK" -ForegroundColor Green

# Push Frontend
Write-Host ""
Write-Host "Subiendo Frontend..." -ForegroundColor Yellow
docker push ${FRONTEND_IMAGE}:latest
docker push ${FRONTEND_IMAGE}:v1.0

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error subiendo frontend" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend subido OK" -ForegroundColor Green

# Resumen
Write-Host ""
Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "Imagenes creadas:" -ForegroundColor Cyan
Write-Host "  $BACKEND_IMAGE:latest" -ForegroundColor White
Write-Host "  $BACKEND_IMAGE:v1.0" -ForegroundColor White
Write-Host "  $FRONTEND_IMAGE:latest" -ForegroundColor White
Write-Host "  $FRONTEND_IMAGE:v1.0" -ForegroundColor White
Write-Host ""
Write-Host "Para desplegar:" -ForegroundColor Cyan
Write-Host "  docker-compose up -d" -ForegroundColor Yellow
Write-Host ""
