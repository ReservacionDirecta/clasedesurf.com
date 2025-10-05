# Script simple para build y push a Docker Hub

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerUsername
)

Write-Host "`n=== SURF SCHOOL - BUILD Y PUSH SIMPLE ===`n" -ForegroundColor Cyan

# Verificar Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no disponible" -ForegroundColor Red
    exit 1
}

# Login (si es necesario)
Write-Host "`n🔐 Verificando login..." -ForegroundColor Yellow
docker login

Write-Host "`n🔨 CONSTRUYENDO FRONTEND..." -ForegroundColor Cyan
docker build -t "$DockerUsername/surfschool-frontend:latest" ./frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error construyendo frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend construido" -ForegroundColor Green

Write-Host "`n🔨 CONSTRUYENDO BACKEND..." -ForegroundColor Cyan
docker build -t "$DockerUsername/surfschool-backend:latest" ./backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error construyendo backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend construido" -ForegroundColor Green

Write-Host "`n🚀 SUBIENDO FRONTEND..." -ForegroundColor Cyan
docker push "$DockerUsername/surfschool-frontend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error subiendo frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend subido" -ForegroundColor Green

Write-Host "`n🚀 SUBIENDO BACKEND..." -ForegroundColor Cyan
docker push "$DockerUsername/surfschool-backend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error subiendo backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend subido" -ForegroundColor Green

Write-Host "`n🎉 COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "`nImágenes disponibles:" -ForegroundColor Cyan
Write-Host "  Frontend: $DockerUsername/surfschool-frontend:latest" -ForegroundColor White
Write-Host "  Backend:  $DockerUsername/surfschool-backend:latest" -ForegroundColor White

Write-Host "`nEnlaces Docker Hub:" -ForegroundColor Yellow
Write-Host "  https://hub.docker.com/r/$DockerUsername/surfschool-frontend" -ForegroundColor Blue
Write-Host "  https://hub.docker.com/r/$DockerUsername/surfschool-backend" -ForegroundColor Blue