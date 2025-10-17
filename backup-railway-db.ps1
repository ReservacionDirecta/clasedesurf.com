# ============================================
# BACKUP DE BASE DE DATOS RAILWAY
# ============================================
# Este script crea un backup de la base de datos actual en Railway

$RAILWAY_HOST = "hopper.proxy.rlwy.net"
$RAILWAY_PORT = "14816"
$RAILWAY_USER = "postgres"
$RAILWAY_PASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
$RAILWAY_DBNAME = "railway"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "backup_railway_$TIMESTAMP.sql"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "BACKUP DE BASE DE DATOS RAILWAY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Creando backup de Railway..." -ForegroundColor Yellow
Write-Host "Archivo de salida: $BACKUP_FILE" -ForegroundColor Yellow
Write-Host ""

# Configurar password
$env:PGPASSWORD = $RAILWAY_PASSWORD

# Crear backup completo (esquema + datos)
pg_dump -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DBNAME `
    --no-owner `
    --no-privileges `
    --column-inserts `
    -f $BACKUP_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backup creado exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Archivo generado: $BACKUP_FILE" -ForegroundColor Green
    
    if (Test-Path $BACKUP_FILE) {
        $fileSize = (Get-Item $BACKUP_FILE).Length / 1KB
        Write-Host "Tamaño: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Cyan
        
        # Mostrar resumen del contenido
        Write-Host ""
        Write-Host "Contenido del backup:" -ForegroundColor Cyan
        $content = Get-Content $BACKUP_FILE -Raw
        
        if ($content -match "CREATE TABLE") {
            Write-Host "  ✓ Contiene definiciones de tablas" -ForegroundColor Green
        }
        
        if ($content -match "INSERT INTO") {
            Write-Host "  ✓ Contiene datos" -ForegroundColor Green
        }
        
        if ($content -match "CREATE TYPE") {
            Write-Host "  ✓ Contiene tipos enum" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✗ Error al crear el backup" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "BACKUP COMPLETADO" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: Guarda este archivo en un lugar seguro" -ForegroundColor Yellow
Write-Host "Para restaurar: psql -h ... -f $BACKUP_FILE" -ForegroundColor Cyan
