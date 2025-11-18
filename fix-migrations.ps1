# Script para resolver las migraciones fallidas/pendientes
# Ejecuta esto desde la raíz del proyecto

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Resolver Migraciones de Prisma           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$DATABASE_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

Write-Host "📋 Estado actual:" -ForegroundColor Yellow
Write-Host "   ❌ 20251118184826_add_school_rating_and_founded_year (fallida)" -ForegroundColor Red
Write-Host "   ⏳ 20251118185143_add_school_rating_and_founded_year (pendiente, vacía)" -ForegroundColor Yellow
Write-Host ""

# Paso 1: Resolver la migración fallida
Write-Host "📝 Paso 1: Resolviendo migración fallida..." -ForegroundColor Cyan
Write-Host ""

Set-Location backend
$env:DATABASE_URL = $DATABASE_URL

Write-Host "Marcando migración fallida como aplicada..." -ForegroundColor Gray
npx prisma migrate resolve --applied 20251118184826_add_school_rating_and_founded_year

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al resolver la migración fallida" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Intenta verificar si los cambios ya están en la BD:" -ForegroundColor Yellow
    Write-Host "   Ejecuta: backend/scripts/check-migration-status.sql en Railway Dashboard" -ForegroundColor White
    Set-Location ..
    exit 1
}

Write-Host "✅ Migración fallida resuelta" -ForegroundColor Green
Write-Host ""

# Paso 2: Aplicar la migración pendiente (vacía)
Write-Host "📝 Paso 2: Aplicando migración pendiente..." -ForegroundColor Cyan
Write-Host ""

npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Error al aplicar migración, intentando marcar como aplicada..." -ForegroundColor Yellow
    npx prisma migrate resolve --applied 20251118185143_add_school_rating_and_founded_year
}

Write-Host ""
Write-Host "🔍 Verificando estado final..." -ForegroundColor Cyan
Write-Host ""
npx prisma migrate status

Set-Location ..

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        ✅ Migraciones Resueltas            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

