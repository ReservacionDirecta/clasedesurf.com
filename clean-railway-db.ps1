# ============================================
# LIMPIAR BASE DE DATOS DE RAILWAY
# ============================================
# Este script limpia completamente la base de datos de Railway
# ADVERTENCIA: Esto eliminará TODOS los datos

$RAILWAY_DB = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "LIMPIEZA DE BASE DE DATOS RAILWAY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ADVERTENCIA: Esto eliminará TODOS los datos de Railway" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "¿Estás seguro? Escribe 'SI' para continuar"

if ($confirm -ne "SI") {
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Paso 1: Eliminando todas las tablas..." -ForegroundColor Yellow

# Script SQL para limpiar la base de datos
$cleanSQL = @"
-- Eliminar todas las tablas en orden correcto (respetando foreign keys)
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS instructor_reviews CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Eliminar enums
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "ClassLevel" CASCADE;
DROP TYPE IF EXISTS "ReservationStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "InstructorRole" CASCADE;

-- Eliminar tabla de migraciones de Prisma
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
"@

# Guardar SQL en archivo temporal
$cleanSQL | Out-File -FilePath "temp_clean.sql" -Encoding UTF8

# Ejecutar limpieza
Write-Host "Ejecutando limpieza..." -ForegroundColor Yellow
$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f temp_clean.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Base de datos limpiada exitosamente" -ForegroundColor Green
} else {
    Write-Host "✗ Error al limpiar la base de datos" -ForegroundColor Red
    Remove-Item temp_clean.sql -ErrorAction SilentlyContinue
    exit 1
}

# Limpiar archivo temporal
Remove-Item temp_clean.sql -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "LIMPIEZA COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso: Ejecutar 'migrate-local-to-railway.ps1'" -ForegroundColor Yellow
