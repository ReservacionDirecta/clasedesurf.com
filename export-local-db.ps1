# ============================================
# EXPORTAR BASE DE DATOS LOCAL
# ============================================
# Este script exporta los datos de la base de datos local

$LOCAL_DB = "clasedesurf.com"
$LOCAL_USER = "postgres"
$LOCAL_PASSWORD = "surfschool_secure_password_2024"
$LOCAL_HOST = "localhost"
$LOCAL_PORT = "5432"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$EXPORT_FILE = "export_local_$TIMESTAMP.sql"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "EXPORTAR BASE DE DATOS LOCAL" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Exportando desde: $LOCAL_DB" -ForegroundColor Yellow
Write-Host "Archivo de salida: $EXPORT_FILE" -ForegroundColor Yellow
Write-Host ""

# Configurar password
$env:PGPASSWORD = $LOCAL_PASSWORD

# Exportar solo datos (sin esquema, ya que usaremos Prisma migrate)
Write-Host "Exportando datos..." -ForegroundColor Yellow
pg_dump -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB `
    --data-only `
    --no-owner `
    --no-privileges `
    --column-inserts `
    --disable-triggers `
    -f $EXPORT_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Exportación completada exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Archivo generado: $EXPORT_FILE" -ForegroundColor Green
    $fileSize = (Get-Item $EXPORT_FILE).Length / 1KB
    Write-Host "Tamaño: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Cyan
} else {
    Write-Host "✗ Error al exportar la base de datos" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "EXPORTACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
