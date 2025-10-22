# Script para desplegar en Railway
# Asegúrate de tener Railway CLI instalado: npm install -g @railway/cli

param(
    [switch]$BuildFirst = $false,
    [switch]$TestFirst = $false,
    [string]$Tag = "latest",
    [string]$Registry = "clasedesurf"
)

Write-Host "🚀 Iniciando despliegue en Railway..." -ForegroundColor Green

# Verificar que Railway CLI esté instalado
try {
    railway --version
    Write-Host "✅ Railway CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI no encontrado. Instálalo con: npm install -g @railway/cli" -ForegroundColor Red
    exit 1
}

# Verificar que estés logueado
Write-Host "🔐 Verificando autenticación..." -ForegroundColor Yellow
railway whoami

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No estás logueado en Railway. Ejecuta: railway login" -ForegroundColor Red
    exit 1
}

# Construir imágenes si se solicita
if ($BuildFirst) {
    Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Yellow
    & ./docker-build-local.ps1 -Tag $Tag -Registry $Registry -All
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error construyendo imágenes" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Imágenes construidas exitosamente" -ForegroundColor Green
}

# Probar imágenes si se solicita
if ($TestFirst) {
    Write-Host "🧪 Probando imágenes localmente..." -ForegroundColor Yellow
    & ./docker-test-local.ps1 -Tag $Tag -Registry $Registry
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error en las pruebas locales" -ForegroundColor Red
        Write-Host "💡 Revisa los logs y corrige los problemas antes de desplegar" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Pruebas locales exitosas" -ForegroundColor Green
    
    # Detener contenedores de prueba
    Write-Host "🧹 Limpiando contenedores de prueba..." -ForegroundColor Yellow
    & ./docker-test-local.ps1 -Stop
}

# Verificar que las imágenes Docker existan si se van a usar
$backendImage = "$Registry/clasedesurf-backend:$Tag"
$frontendImage = "$Registry/clasedesurf-frontend:$Tag"

$backendExists = docker images -q $backendImage
$frontendExists = docker images -q $frontendImage

if ($backendExists) {
    Write-Host "✅ Imagen del backend encontrada: $backendImage" -ForegroundColor Green
} else {
    Write-Host "⚠️  Imagen del backend no encontrada: $backendImage" -ForegroundColor Yellow
    Write-Host "💡 Railway construirá la imagen usando Dockerfile.railway" -ForegroundColor Gray
}

if ($frontendExists) {
    Write-Host "✅ Imagen del frontend encontrada: $frontendImage" -ForegroundColor Green
} else {
    Write-Host "⚠️  Imagen del frontend no encontrada: $frontendImage" -ForegroundColor Yellow
    Write-Host "💡 Railway construirá la imagen usando Dockerfile.railway" -ForegroundColor Gray
}

Write-Host "📦 Desplegando Backend..." -ForegroundColor Yellow
Set-Location backend
railway up --detach
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error desplegando backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend desplegado exitosamente" -ForegroundColor Green

Write-Host "📦 Desplegando Frontend..." -ForegroundColor Yellow
Set-Location ../frontend
railway up --detach
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error desplegando frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend desplegado exitosamente" -ForegroundColor Green

Set-Location ..
Write-Host "🎉 Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Configura las variables de entorno en Railway Dashboard" -ForegroundColor White
Write-Host "2. Conecta la base de datos PostgreSQL" -ForegroundColor White
Write-Host "3. Ejecuta las migraciones de Prisma" -ForegroundColor White
Write-Host "4. Verifica que los servicios estén funcionando" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "Ver logs:           railway logs" -ForegroundColor White
Write-Host "Variables:          railway variables" -ForegroundColor White
Write-Host "Ejecutar migración: railway run npx prisma migrate deploy" -ForegroundColor White
Write-Host "Verificar deploy:   ./verify-railway-deployment.ps1 -BackendUrl <url> -FrontendUrl <url>" -ForegroundColor White