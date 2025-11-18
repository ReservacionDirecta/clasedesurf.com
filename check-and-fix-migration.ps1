# Script para verificar y corregir la migracion

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificar y Corregir Migracion" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$DATABASE_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

Write-Host "Paso 1: Verificando si los cambios estan en la BD..." -ForegroundColor Cyan
Write-Host ""

# Verificar si psql esta disponible
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERROR: psql no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternativa: Ejecuta verify-migration-changes.sql en Railway Dashboard" -ForegroundColor Yellow
    Write-Host "   1. Ve a Railway Dashboard > Tu Base de Datos > Query" -ForegroundColor White
    Write-Host "   2. Copia el contenido de backend/scripts/verify-migration-changes.sql" -ForegroundColor White
    Write-Host "   3. Pega y ejecuta en Railway" -ForegroundColor White
    Write-Host ""
    Write-Host "   Luego ejecuta resolve-failed-migration.sql si faltan cambios" -ForegroundColor Yellow
    exit 1
}

$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"

# Verificar columnas
Write-Host "Verificando columnas en schools..." -ForegroundColor Gray
$checkColumns = "SELECT column_name FROM information_schema.columns WHERE table_name = 'schools' AND column_name IN ('foundedYear', 'rating', 'totalReviews');"

$columnsResult = psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -t -c $checkColumns 2>&1

# Verificar tabla
Write-Host "Verificando tabla school_reviews..." -ForegroundColor Gray
$checkTable = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'school_reviews';"

$tableResult = psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -t -c $checkTable 2>&1

$changesExist = $false
$columnsMatch = $columnsResult -match "foundedYear|rating|totalReviews"
$tableMatch = $tableResult -match "school_reviews"

if ($columnsMatch -and $tableMatch) {
    $changesExist = $true
    Write-Host ""
    Write-Host "OK: Los cambios YA estan aplicados en la base de datos" -ForegroundColor Green
    Write-Host ""
    Write-Host "El problema puede ser que Prisma Client necesita regenerarse" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Regenerando Prisma Client..." -ForegroundColor Cyan
    Set-Location backend
    $env:DATABASE_URL = $DATABASE_URL
    npx prisma generate
    Set-Location ..
    Write-Host ""
    Write-Host "OK: Prisma Client regenerado" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ADVERTENCIA: Los cambios NO estan aplicados completamente" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Aplicando cambios manualmente..." -ForegroundColor Cyan
    psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f "backend/scripts/resolve-failed-migration.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "OK: Cambios aplicados exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Regenerando Prisma Client..." -ForegroundColor Cyan
        Set-Location backend
        $env:DATABASE_URL = $DATABASE_URL
        npx prisma generate
        Set-Location ..
        Write-Host ""
        Write-Host "OK: Prisma Client regenerado" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "ERROR: Error al aplicar cambios" -ForegroundColor Red
        Write-Host "   Revisa los errores arriba" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Verificando estado final de migraciones..." -ForegroundColor Cyan
Write-Host ""
Set-Location backend
$env:DATABASE_URL = $DATABASE_URL
npx prisma migrate status
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Verificacion Completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Si el error 500 persiste, revisa los logs del backend en Railway" -ForegroundColor Yellow
Write-Host "   Los logs ahora mostraran mas detalles del error" -ForegroundColor Yellow
Write-Host ""
