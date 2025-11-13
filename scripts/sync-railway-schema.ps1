# ============================================
# SINCRONIZAR SCHEMA CON RAILWAY
# ============================================
# Este script sincroniza el schema local con Railway usando Prisma

$RAILWAY_DB_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SINCRONIZAR SCHEMA CON RAILWAY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Esto modificará la base de datos de Railway" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "¿Deseas continuar? (s/N)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Sincronizando schema..." -ForegroundColor Yellow
Write-Host ""

# Cambiar al directorio del backend
Set-Location backend

# Establecer DATABASE_URL
$env:DATABASE_URL = $RAILWAY_DB_URL

# Ejecutar prisma db push
Write-Host "Ejecutando: npx prisma db push" -ForegroundColor Gray
Write-Host ""

npx prisma db push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Schema sincronizado exitosamente" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error al sincronizar schema" -ForegroundColor Red
    exit 1
}

# Volver al directorio raíz
Set-Location ..

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

