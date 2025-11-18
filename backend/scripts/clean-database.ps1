# PowerShell script para limpiar la base de datos
# Uso: .\clean-database.ps1 [DATABASE_URL]

param(
    [Parameter(Position=0)]
    [string]$DatabaseUrl = $env:DATABASE_URL
)

$ErrorActionPreference = "Stop"

if (-not $DatabaseUrl) {
    Write-Host "Error: No se proporcionó DATABASE_URL" -ForegroundColor Red
    Write-Host "Uso: .\clean-database.ps1 [DATABASE_URL]" -ForegroundColor Yellow
    Write-Host "O establece la variable de entorno: `$env:DATABASE_URL='postgresql://...'" -ForegroundColor Yellow
    exit 1
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Limpieza de Base de Datos - clasedesurf.com" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Extraer componentes de la URL de conexión
if ($DatabaseUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
    $username = $matches[1]
    $password = $matches[2]
    $host = $matches[3]
    $port = $matches[4]
    $database = $matches[5]
    
    Write-Host "Host: $host" -ForegroundColor Gray
    Write-Host "Puerto: $port" -ForegroundColor Gray
    Write-Host "Base de datos: $database" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "Error: URL de base de datos inválida" -ForegroundColor Red
    exit 1
}

# Confirmación
Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de la base de datos!" -ForegroundColor Red
Write-Host ""
$confirmation = Read-Host "¿Estás seguro? Escribe 'SI' para continuar"

if ($confirmation -ne "SI") {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Limpiando base de datos..." -ForegroundColor Yellow

# Ejecutar script SQL
$scriptPath = Join-Path $PSScriptRoot "clean-database.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Host "Error: No se encontró el archivo clean-database.sql" -ForegroundColor Red
    exit 1
}

# Verificar si psql está disponible
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "Error: psql no está disponible. Instala PostgreSQL client tools." -ForegroundColor Red
    Write-Host "O ejecuta el script SQL manualmente usando tu cliente PostgreSQL preferido." -ForegroundColor Yellow
    exit 1
}

# Ejecutar el script
try {
    $env:PGPASSWORD = $password
    psql -h $host -p $port -U $username -d $database -f $scriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Base de datos limpiada exitosamente!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Error al limpiar la base de datos" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Proceso completado" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

