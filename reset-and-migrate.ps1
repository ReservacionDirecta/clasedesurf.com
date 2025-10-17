# Script para resetear Railway y migrar datos correctamente
# Autor: Kiro AI
# Fecha: 10/08/2025

Write-Host "Reset y Migracion de Railway" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$PG_BIN = "C:\Program Files\PostgreSQL\17\bin"
$RAILWAY_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"
$RAILWAY_PASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
$RAILWAY_HOST = "hopper.proxy.rlwy.net"
$RAILWAY_PORT = "14816"
$RAILWAY_USER = "postgres"
$RAILWAY_DB = "railway"

Write-Host "ADVERTENCIA: Esto eliminara TODAS las tablas y datos en Railway" -ForegroundColor Red
$response = Read-Host "Estas seguro? (S/N)"

if ($response -ne "S" -and $response -ne "s") {
    Write-Host "Operacion cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Paso 1: Eliminando tablas antiguas..." -ForegroundColor Yellow

$dropScript = @"
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS instructor_reviews CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS _prisma_migrations CASCADE;
"@

$dropFile = "drop_tables.sql"
$dropScript | Out-File -FilePath $dropFile -Encoding ASCII

$env:PGPASSWORD = $RAILWAY_PASSWORD
& "$PG_BIN\psql.exe" -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DB -f $dropFile

Write-Host "Tablas antiguas eliminadas" -ForegroundColor Green
Remove-Item $dropFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Paso 2: Ejecutando migraciones de Prisma..." -ForegroundColor Green

Set-Location backend
$env:DATABASE_URL = $RAILWAY_URL

npx prisma migrate deploy

Write-Host ""
Write-Host "Paso 3: Verificando tablas creadas..." -ForegroundColor Green

$verifyScript = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name NOT LIKE '_prisma%'
ORDER BY table_name;
"@

$verifyFile = "verify_tables.sql"
$verifyScript | Out-File -FilePath $verifyFile -Encoding ASCII

$env:PGPASSWORD = $RAILWAY_PASSWORD
& "$PG_BIN\psql.exe" -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DB -f $verifyFile

Remove-Item $verifyFile -ErrorAction SilentlyContinue

Set-Location ..

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Railway reseteado y listo para importar datos!" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora ejecuta:" -ForegroundColor Yellow
Write-Host "  .\migrate-to-railway.ps1" -ForegroundColor Cyan
Write-Host ""
