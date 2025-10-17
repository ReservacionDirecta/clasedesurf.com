# ============================================
# VERIFICAR BASE DE DATOS RAILWAY
# ============================================
# Este script verifica el estado de la base de datos en Railway

$RAILWAY_HOST = "hopper.proxy.rlwy.net"
$RAILWAY_PORT = "14816"
$RAILWAY_USER = "postgres"
$RAILWAY_PASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
$RAILWAY_DBNAME = "railway"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN DE BASE DE DATOS RAILWAY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = $RAILWAY_PASSWORD

Write-Host "Conectando a Railway..." -ForegroundColor Yellow
Write-Host ""

# Verificar tablas
Write-Host "TABLAS EXISTENTES:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
$tablesSQL = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
"@
$tablesSQL | Out-File -FilePath "temp_tables.sql" -Encoding UTF8
psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DBNAME -f temp_tables.sql
Remove-Item temp_tables.sql -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "CONTEO DE REGISTROS:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

$countSQL = @"
DO `$`$
DECLARE
    r RECORD;
    count_result INTEGER;
BEGIN
    FOR r IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma%'
        ORDER BY table_name
    LOOP
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(r.table_name) INTO count_result;
        RAISE NOTICE '% : %', RPAD(r.table_name, 30), count_result;
    END LOOP;
END
`$`$;
"@

$countSQL | Out-File -FilePath "temp_count.sql" -Encoding UTF8
psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DBNAME -f temp_count.sql
Remove-Item temp_count.sql -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "USUARIOS EN LA BASE DE DATOS:" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

$usersSQL = @"
SELECT 
    id,
    email,
    name,
    role,
    created_at
FROM users
ORDER BY id
LIMIT 10;
"@

$usersSQL | Out-File -FilePath "temp_users.sql" -Encoding UTF8
psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DBNAME -f temp_users.sql 2>$null
Remove-Item temp_users.sql -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
