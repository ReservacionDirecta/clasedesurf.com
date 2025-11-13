# Script para verificar y comparar el schema de Railway con el local
# Uso: .\scripts\verify-railway-schema.ps1

$RAILWAY_DB_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN DE SCHEMA RAILWAY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del backend
Set-Location backend

Write-Host "📖 Verificando schema local..." -ForegroundColor Yellow
if (Test-Path "prisma/schema.prisma") {
    Write-Host "✅ Schema local encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Schema local no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Conectando a Railway..." -ForegroundColor Yellow

# Establecer DATABASE_URL para Railway
$env:DATABASE_URL = $RAILWAY_DB_URL

# Verificar conexión
Write-Host "Probando conexión..." -ForegroundColor Gray
$connectionTest = npx prisma db execute --stdin --schema=prisma/schema.prisma 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No se pudo verificar la conexión directamente" -ForegroundColor Yellow
    Write-Host "   Continuando con verificación de tablas..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "📊 Obteniendo información de tablas..." -ForegroundColor Yellow

# Usar Prisma para obtener el schema de Railway
Write-Host ""
Write-Host "Ejecutando: npx prisma db pull --print" -ForegroundColor Gray
Write-Host "(Esto mostrará el schema actual de Railway)" -ForegroundColor Gray
Write-Host ""

$env:DATABASE_URL = $RAILWAY_DB_URL
npx prisma db pull --print --schema=prisma/schema.prisma

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Schema obtenido exitosamente" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error al obtener schema" -ForegroundColor Red
    Write-Host "Verifica la conexión a Railway" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Para sincronizar el schema de Railway con el local:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   `$env:DATABASE_URL=`"$RAILWAY_DB_URL`"" -ForegroundColor White
Write-Host "   npx prisma db push" -ForegroundColor White
Write-Host ""

# Volver al directorio raíz
Set-Location ..

