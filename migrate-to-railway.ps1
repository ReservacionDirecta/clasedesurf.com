# Script para migrar datos de PostgreSQL local a Railway
# Autor: Kiro AI
# Fecha: 10/08/2025

Write-Host "Migracion de Base de Datos: Local -> Railway" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuracion de PostgreSQL
$PG_BIN = "C:\Program Files\PostgreSQL\17\bin"
$env:PATH = "$PG_BIN;$env:PATH"

# Configuracion
$LOCAL_DB = "clasedesurf.com"
$LOCAL_USER = "postgres"
$LOCAL_HOST = "localhost"
$LOCAL_PORT = "5432"

$RAILWAY_DB = "railway"
$RAILWAY_USER = "postgres"
$RAILWAY_PASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
$RAILWAY_HOST = "hopper.proxy.rlwy.net"
$RAILWAY_PORT = "14816"

$BACKUP_FILE = "backup_local_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
$DATA_ONLY_FILE = "data_only_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

Write-Host "Configuracion:" -ForegroundColor Yellow
Write-Host "  Local DB: $LOCAL_DB"
Write-Host "  Railway DB: $RAILWAY_DB"
Write-Host "  Archivo backup: $DATA_ONLY_FILE"
Write-Host ""

# Paso 1: Exportar datos de la base local
Write-Host "Paso 1: Exportando datos de la base local..." -ForegroundColor Green
Write-Host ""

$env:PGPASSWORD = ""
$exportCmd = "pg_dump -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d `"$LOCAL_DB`" --data-only --column-inserts --no-owner --no-privileges -f `"$DATA_ONLY_FILE`""

Write-Host "Ejecutando exportacion..." -ForegroundColor Gray
try {
    Invoke-Expression $exportCmd
    if (Test-Path $DATA_ONLY_FILE) {
        Write-Host "Datos exportados exitosamente a: $DATA_ONLY_FILE" -ForegroundColor Green
        $fileSize = (Get-Item $DATA_ONLY_FILE).Length / 1KB
        Write-Host "Tamanio: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
    } else {
        Write-Host "Error: No se pudo crear el archivo de backup" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error al exportar datos: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 2: Preguntar si limpiar la base de Railway
Write-Host "Paso 2: Limpieza de base de datos Railway" -ForegroundColor Yellow
Write-Host ""
Write-Host "ADVERTENCIA: Esto eliminara TODOS los datos actuales en Railway" -ForegroundColor Red
$response = Read-Host "Deseas limpiar la base de Railway antes de importar? (S/N)"

if ($response -eq "S" -or $response -eq "s") {
    Write-Host ""
    Write-Host "Limpiando base de datos Railway..." -ForegroundColor Yellow
    
    # Crear script de limpieza
    $cleanScript = @"
-- Deshabilitar triggers y constraints temporalmente
SET session_replication_role = 'replica';

-- Limpiar datos de todas las tablas en orden inverso de dependencias
TRUNCATE TABLE "Payment" CASCADE;
TRUNCATE TABLE "Class" CASCADE;
TRUNCATE TABLE "Instructor" CASCADE;
TRUNCATE TABLE "School" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- Rehabilitar triggers y constraints
SET session_replication_role = 'origin';

-- Resetear secuencias
SELECT setval(pg_get_serial_sequence('"User"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"School"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"Instructor"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"Class"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"Payment"', 'id'), 1, false);
"@
    
    $cleanFile = "clean_railway.sql"
    $cleanScript | Out-File -FilePath $cleanFile -Encoding UTF8
    
    $env:PGPASSWORD = $RAILWAY_PASSWORD
    $cleanCmd = "psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DB -f `"$cleanFile`""
    
    try {
        Invoke-Expression $cleanCmd
        Write-Host "Base de datos Railway limpiada exitosamente" -ForegroundColor Green
        Remove-Item $cleanFile -ErrorAction SilentlyContinue
    } catch {
        Write-Host "Advertencia al limpiar: $_" -ForegroundColor Yellow
        Write-Host "Continuando con la importacion..." -ForegroundColor Gray
    }
} else {
    Write-Host "Saltando limpieza. Los datos se actualizaran/insertaran." -ForegroundColor Gray
}

Write-Host ""

# Paso 3: Importar datos a Railway
Write-Host "Paso 3: Importando datos a Railway..." -ForegroundColor Green
Write-Host ""

$env:PGPASSWORD = $RAILWAY_PASSWORD
$importCmd = "psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DB -f `"$DATA_ONLY_FILE`""

Write-Host "Ejecutando importacion..." -ForegroundColor Gray
try {
    $output = Invoke-Expression $importCmd 2>&1
    Write-Host $output
    Write-Host ""
    Write-Host "Datos importados exitosamente a Railway" -ForegroundColor Green
} catch {
    Write-Host "Algunos errores durante la importacion (puede ser normal si hay duplicados)" -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor Gray
}

Write-Host ""

# Paso 4: Verificar datos importados
Write-Host "Paso 4: Verificando datos importados..." -ForegroundColor Green
Write-Host ""

$verifyScript = @"
SELECT 'Users' as tabla, COUNT(*) as registros FROM "User"
UNION ALL
SELECT 'Schools', COUNT(*) FROM "School"
UNION ALL
SELECT 'Instructors', COUNT(*) FROM "Instructor"
UNION ALL
SELECT 'Classes', COUNT(*) FROM "Class"
UNION ALL
SELECT 'Payments', COUNT(*) FROM "Payment";
"@

$verifyFile = "verify_railway.sql"
$verifyScript | Out-File -FilePath $verifyFile -Encoding UTF8

$env:PGPASSWORD = $RAILWAY_PASSWORD
$verifyCmd = "psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DB -f `"$verifyFile`""

try {
    Write-Host "Conteo de registros en Railway:" -ForegroundColor Cyan
    Invoke-Expression $verifyCmd
    Remove-Item $verifyFile -ErrorAction SilentlyContinue
} catch {
    Write-Host "No se pudo verificar los datos" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Migracion completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos generados:" -ForegroundColor Yellow
Write-Host "  - $DATA_ONLY_FILE (backup de datos)"
Write-Host ""
Write-Host "Conexion Railway:" -ForegroundColor Yellow
$railwayUrl = "postgresql://$RAILWAY_USER@$RAILWAY_HOST" + ":" + "$RAILWAY_PORT/$RAILWAY_DB"
Write-Host "  $railwayUrl"
Write-Host ""
Write-Host "Tip: Guarda el archivo $DATA_ONLY_FILE como respaldo" -ForegroundColor Cyan
Write-Host ""
