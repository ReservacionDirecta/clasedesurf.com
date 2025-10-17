# ============================================
# MIGRAR DE LOCAL A RAILWAY
# ============================================
# Este script migra los datos de la base local a Railway

$RAILWAY_DB = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"
$RAILWAY_HOST = "hopper.proxy.rlwy.net"
$RAILWAY_PORT = "14816"
$RAILWAY_USER = "postgres"
$RAILWAY_PASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
$RAILWAY_DBNAME = "railway"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "MIGRACIÓN LOCAL → RAILWAY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe un archivo de exportación
$exportFiles = Get-ChildItem -Filter "export_local_*.sql" | Sort-Object LastWriteTime -Descending
if ($exportFiles.Count -eq 0) {
    Write-Host "✗ No se encontró archivo de exportación" -ForegroundColor Red
    Write-Host "Ejecuta primero: .\export-local-db.ps1" -ForegroundColor Yellow
    exit 1
}

$EXPORT_FILE = $exportFiles[0].Name
Write-Host "Usando archivo: $EXPORT_FILE" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Aplicar migraciones de Prisma
Write-Host "Paso 1: Aplicando esquema de Prisma a Railway..." -ForegroundColor Yellow
$env:DATABASE_URL = $RAILWAY_DB
Set-Location backend
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al aplicar migraciones" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✓ Esquema aplicado correctamente" -ForegroundColor Green
Write-Host ""

# Paso 2: Importar datos
Write-Host "Paso 2: Importando datos..." -ForegroundColor Yellow
$env:PGPASSWORD = $RAILWAY_PASSWORD
psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DBNAME -f $EXPORT_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Datos importados exitosamente" -ForegroundColor Green
} else {
    Write-Host "⚠ Algunos datos pueden no haberse importado correctamente" -ForegroundColor Yellow
    Write-Host "Esto es normal si hay conflictos de IDs o constraints" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Paso 3: Verificando datos importados..." -ForegroundColor Yellow

# Script de verificación
$verifySQL = @"
SELECT 'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'schools', COUNT(*) FROM schools
UNION ALL
SELECT 'instructors', COUNT(*) FROM instructors
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;
"@

$verifySQL | Out-File -FilePath "temp_verify.sql" -Encoding UTF8
psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DBNAME -f temp_verify.sql
Remove-Item temp_verify.sql -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "MIGRACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso: Actualizar variables de entorno en Railway" -ForegroundColor Yellow
Write-Host "DATABASE_URL=$RAILWAY_DB" -ForegroundColor Cyan
