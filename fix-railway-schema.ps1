# Script para arreglar el esquema de Railway y migrar datos
# Autor: Kiro AI
# Fecha: 10/08/2025

Write-Host "Arreglando esquema de Railway..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$RAILWAY_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

Write-Host "Paso 1: Ejecutando migraciones de Prisma en Railway..." -ForegroundColor Green
Write-Host ""

# Cambiar al directorio backend
Set-Location backend

# Configurar DATABASE_URL para Railway
$env:DATABASE_URL = $RAILWAY_URL

# Ejecutar migraciones
Write-Host "Ejecutando: npx prisma migrate deploy" -ForegroundColor Gray
try {
    npx prisma migrate deploy
    Write-Host ""
    Write-Host "Migraciones ejecutadas exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error al ejecutar migraciones: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "Paso 2: Generando Prisma Client..." -ForegroundColor Green
npx prisma generate

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Esquema de Railway actualizado!" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes ejecutar nuevamente:" -ForegroundColor Yellow
Write-Host "  .\migrate-to-railway.ps1" -ForegroundColor Cyan
Write-Host ""

Set-Location ..
