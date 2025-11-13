# ============================================
# VERIFICAR SCHEMA DE RAILWAY
# ============================================
# Este script verifica que el schema de Railway coincida con el local

$RAILWAY_DB_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN DE SCHEMA RAILWAY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Ejecutar script de verificación
Write-Host "Ejecutando verificación..." -ForegroundColor Yellow
Write-Host ""

node scripts/verify-railway-simple.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Verificación completada" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error en la verificación" -ForegroundColor Red
    exit 1
}
