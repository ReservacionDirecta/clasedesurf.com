# Script simplificado para verificar que todo está listo para Railway

Write-Host "Verificando preparacion para Railway..." -ForegroundColor Green
Write-Host ""

$allGood = $true

# 1. Verificar archivos de configuracion
Write-Host "Verificando archivos de configuracion..." -ForegroundColor Cyan

$requiredFiles = @(
    "railway.json",
    "backend/railway.json", 
    "frontend/railway.json",
    "backend/package.json",
    "frontend/package.json"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: $file NO ENCONTRADO" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# 2. Verificar secrets
Write-Host "Verificando secrets..." -ForegroundColor Cyan

if (Test-Path "railway-secrets.txt") {
    Write-Host "  OK: railway-secrets.txt existe" -ForegroundColor Green
} else {
    Write-Host "  ERROR: railway-secrets.txt NO ENCONTRADO" -ForegroundColor Red
    Write-Host "  Ejecuta: node generate-secrets.js" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# 3. Verificar migraciones
Write-Host "Verificando migraciones en Railway..." -ForegroundColor Cyan

$env:DATABASE_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

try {
    Set-Location backend
    $migrateStatus = npx prisma migrate status 2>&1
    Set-Location ..
    
    if ($migrateStatus -match "Database schema is up to date") {
        Write-Host "  OK: Migraciones aplicadas" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Migraciones pendientes" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERROR: No se pudo verificar migraciones" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Resumen
Write-Host "=========================================" -ForegroundColor White
if ($allGood) {
    Write-Host "LISTO PARA DESPLEGAR EN RAILWAY" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Ve a Railway Dashboard" -ForegroundColor White
    Write-Host "2. Crea proyecto desde GitHub" -ForegroundColor White
    Write-Host "3. Sigue DEPLOY_RAILWAY.md" -ForegroundColor White
    Write-Host "4. Usa CHECKLIST_RAILWAY.md" -ForegroundColor White
} else {
    Write-Host "HAY PROBLEMAS QUE RESOLVER" -ForegroundColor Yellow
    Write-Host "Corrige los errores antes de desplegar" -ForegroundColor White
}
Write-Host "=========================================" -ForegroundColor White