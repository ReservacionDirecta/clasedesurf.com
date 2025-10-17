# Script rápido para construir, subir y desplegar
# Uso: .\quick-deploy.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest"
)

Write-Host "🚀 Quick Deploy - Clase de Surf" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Construir y subir imágenes
Write-Host "📦 Paso 1: Construyendo y subiendo imágenes..." -ForegroundColor Yellow
.\docker-build-push-all.ps1 -Username $DockerUsername -Version $Version

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en la construcción/subida" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Imágenes construidas y subidas correctamente" -ForegroundColor Green
Write-Host ""

# 2. Actualizar .env con el usuario
Write-Host "📝 Paso 2: Actualizando variables de entorno..." -ForegroundColor Yellow

if (Test-Path .env) {
    $envContent = Get-Content .env
    $envContent = $envContent -replace "DOCKER_USERNAME=.*", "DOCKER_USERNAME=$DockerUsername"
    $envContent = $envContent -replace "VERSION=.*", "VERSION=$Version"
    $envContent | Set-Content .env
} else {
    Copy-Item .env.docker.example .env
    Write-Host "⚠️  Archivo .env creado. Por favor, edita las variables antes de continuar." -ForegroundColor Yellow
    Write-Host "   Presiona Enter cuando hayas terminado..." -ForegroundColor Yellow
    Read-Host
}

Write-Host "✅ Variables actualizadas" -ForegroundColor Green
Write-Host ""

# 3. Iniciar servicios
Write-Host "🐳 Paso 3: Iniciando servicios con Docker Compose..." -ForegroundColor Yellow
docker-compose down
docker-compose pull
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar servicios" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Servicios iniciados correctamente" -ForegroundColor Green
Write-Host ""

# 4. Esperar a que los servicios estén listos
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 5. Ejecutar migraciones
Write-Host "📦 Paso 4: Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
docker-compose exec -T backend npx prisma migrate deploy

Write-Host ""
Write-Host "✅ Migraciones ejecutadas" -ForegroundColor Green
Write-Host ""

# 6. Verificar estado
Write-Host "🔍 Verificando estado de los servicios..." -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Servicios disponibles:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend: http://localhost:4000" -ForegroundColor White
Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "📝 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   - Ver logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   - Detener: docker-compose down" -ForegroundColor White
Write-Host "   - Reiniciar: docker-compose restart" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Ver imágenes en Docker Hub:" -ForegroundColor Cyan
Write-Host "   https://hub.docker.com/u/$DockerUsername" -ForegroundColor White
Write-Host ""
