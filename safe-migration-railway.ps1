# ============================================
# MIGRACIÓN SEGURA: LOCAL → RAILWAY
# ============================================
# Este script incluye un backup de Railway antes de limpiar

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   MIGRACIÓN SEGURA: LOCAL → RAILWAY        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script realizará los siguientes pasos:" -ForegroundColor Yellow
Write-Host "  0. Backup de la base de datos actual en Railway" -ForegroundColor White
Write-Host "  1. Limpiar la base de datos de Railway" -ForegroundColor White
Write-Host "  2. Exportar datos de la base local" -ForegroundColor White
Write-Host "  3. Aplicar esquema de Prisma a Railway" -ForegroundColor White
Write-Host "  4. Importar datos a Railway" -ForegroundColor White
Write-Host "  5. Verificar la migración" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos actuales en Railway" -ForegroundColor Red
Write-Host "✓  Se creará un backup antes de proceder" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "¿Deseas continuar? Escribe 'SI' para proceder"

if ($confirm -ne "SI") {
    Write-Host ""
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PASO 0/5: Creando backup de Railway" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

& .\backup-railway-db.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  Error al crear backup. ¿Deseas continuar de todos modos?" -ForegroundColor Yellow
    $continueAnyway = Read-Host "Escribe 'SI' para continuar sin backup"
    if ($continueAnyway -ne "SI") {
        Write-Host "❌ Operación cancelada" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PASO 1/5: Limpiando base de datos Railway" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Crear un script de limpieza sin confirmación
$cleanSQL = @"
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS instructor_reviews CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "ClassLevel" CASCADE;
DROP TYPE IF EXISTS "ReservationStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "InstructorRole" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
"@

$cleanSQL | Out-File -FilePath "temp_clean_auto.sql" -Encoding UTF8
$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f temp_clean_auto.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Base de datos limpiada exitosamente" -ForegroundColor Green
} else {
    Write-Host "✗ Error al limpiar la base de datos" -ForegroundColor Red
    Remove-Item temp_clean_auto.sql -ErrorAction SilentlyContinue
    exit 1
}

Remove-Item temp_clean_auto.sql -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PASO 2/5: Exportando base de datos local" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

& .\export-local-db.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error en el paso 2. Abortando migración." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PASO 3-4/5: Migrando a Railway" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

& .\migrate-local-to-railway.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  Advertencia: Hubo errores durante la migración" -ForegroundColor Yellow
    Write-Host "Continuando con la verificación..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PASO 5/5: Verificando migración" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

& .\verify-railway-db.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      ✓ MIGRACIÓN COMPLETADA                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 ARCHIVOS GENERADOS:" -ForegroundColor Yellow
Write-Host ""

# Listar archivos generados
$backupFiles = Get-ChildItem -Filter "backup_railway_*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$exportFiles = Get-ChildItem -Filter "export_local_*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($backupFiles) {
    Write-Host "  📦 Backup Railway: $($backupFiles.Name)" -ForegroundColor Cyan
}
if ($exportFiles) {
    Write-Host "  📦 Export Local: $($exportFiles.Name)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 SIGUIENTE PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Actualiza las variables de entorno en Railway" -ForegroundColor White
Write-Host "2. Despliega tu aplicación" -ForegroundColor White
Write-Host "3. Prueba el login con tus usuarios existentes" -ForegroundColor White
Write-Host ""
Write-Host "📖 Para más detalles, consulta: GUIA_MIGRACION_RAILWAY.md" -ForegroundColor Yellow
Write-Host ""
