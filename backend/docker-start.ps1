# Script para iniciar el backend con Docker en Windows

Write-Host "🐳 Iniciando Clase de Surf Backend con Docker..." -ForegroundColor Cyan

# Verificar si existe .env
if (-not (Test-Path .env)) {
    Write-Host "⚠️  No se encontró archivo .env" -ForegroundColor Yellow
    Write-Host "📝 Copiando .env.docker.example a .env..." -ForegroundColor Yellow
    Copy-Item .env.docker.example .env
    Write-Host "✅ Archivo .env creado. Por favor, edita las variables de entorno antes de continuar." -ForegroundColor Green
    exit 1
}

# Detener contenedores existentes
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Construir imágenes
Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Cyan
docker-compose build

# Iniciar servicios
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Green
docker-compose up -d

# Esperar a que PostgreSQL esté listo
Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Ejecutar migraciones
Write-Host "📦 Ejecutando migraciones de Prisma..." -ForegroundColor Cyan
docker-compose exec backend npx prisma migrate deploy

# Generar cliente de Prisma
Write-Host "🔧 Generando cliente de Prisma..." -ForegroundColor Cyan
docker-compose exec backend npx prisma generate

# Mostrar información
Write-Host ""
Write-Host "✅ Backend iniciado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Servicios disponibles:" -ForegroundColor Cyan
Write-Host "   - Backend API: http://localhost:4000" -ForegroundColor White
Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "📝 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   - Ver logs: docker-compose logs -f backend" -ForegroundColor White
Write-Host "   - Detener: docker-compose down" -ForegroundColor White
Write-Host "   - Reiniciar: docker-compose restart backend" -ForegroundColor White
Write-Host "   - Ver estado: docker-compose ps" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Mostrando logs del backend..." -ForegroundColor Cyan
docker-compose logs -f backend
