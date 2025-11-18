# Script rápido para resolver las migraciones fallidas/pendientes

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Resolver Migraciones de Prisma           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$DATABASE_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

Write-Host "📋 Migraciones a resolver:" -ForegroundColor Yellow
Write-Host "   1. 20251118184826_add_school_rating_and_founded_year (fallida)" -ForegroundColor Red
Write-Host "   2. 20251118185143_add_school_rating_and_founded_year (pendiente, vacía)" -ForegroundColor Yellow
Write-Host ""

# Paso 1: Verificar si los cambios ya están aplicados
Write-Host "🔍 Paso 1: Verificando si los cambios ya están en la BD..." -ForegroundColor Cyan
Write-Host ""

$env:DATABASE_URL = $DATABASE_URL
$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"

# Verificar columnas
$checkColumns = @"
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'schools' 
AND column_name IN ('foundedYear', 'rating', 'totalReviews');
"@

$columnsResult = psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -t -c $checkColumns 2>&1

# Verificar tabla
$checkTable = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'school_reviews';
"@

$tableResult = psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -t -c $checkTable 2>&1

$changesExist = $false
if ($columnsResult -match "foundedYear|rating|totalReviews" -and $tableResult -match "school_reviews") {
    $changesExist = $true
    Write-Host "✅ Los cambios ya están aplicados en la base de datos" -ForegroundColor Green
} else {
    Write-Host "⚠️  Los cambios NO están aplicados completamente" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "¿Deseas aplicar los cambios ahora? (s/n)" -ForegroundColor Yellow
    $apply = Read-Host
    if ($apply -eq "s" -or $apply -eq "S") {
        Write-Host ""
        Write-Host "🔧 Aplicando cambios..." -ForegroundColor Cyan
        psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f "backend/scripts/resolve-failed-migration.sql"
        $changesExist = $true
    } else {
        Write-Host "❌ Operación cancelada" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📝 Paso 2: Resolviendo migración fallida..." -ForegroundColor Cyan
Write-Host ""

Set-Location backend
$env:DATABASE_URL = $DATABASE_URL

# Marcar primera migración como aplicada
Write-Host "Marcando 20251118184826_add_school_rating_and_founded_year como aplicada..." -ForegroundColor Gray
npx prisma migrate resolve --applied 20251118184826_add_school_rating_and_founded_year

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Primera migración resuelta" -ForegroundColor Green
} else {
    Write-Host "❌ Error al resolver la primera migración" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "📝 Paso 3: Aplicando migración pendiente..." -ForegroundColor Cyan
Write-Host ""

# Aplicar segunda migración (es vacía, así que solo se marca como aplicada)
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migración pendiente aplicada" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error al aplicar migración pendiente" -ForegroundColor Yellow
    Write-Host "   Intentando marcar como aplicada manualmente..." -ForegroundColor Gray
    npx prisma migrate resolve --applied 20251118185143_add_school_rating_and_founded_year
}

Write-Host ""
Write-Host "🔍 Verificando estado final..." -ForegroundColor Cyan
Write-Host ""
npx prisma migrate status

Set-Location ..

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        Migraciones Resueltas               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

