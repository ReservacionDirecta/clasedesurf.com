# Script para verificar el esquema de la base de datos Railway
$DatabaseUrl = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

Write-Host "🔍 Verificando esquema de base de datos Railway..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor White

# Verificar que psql esté disponible
$psqlAvailable = $false
try {
    psql --version | Out-Null
    $psqlAvailable = $true
    Write-Host "✅ psql encontrado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  psql no encontrado, usando Prisma como alternativa" -ForegroundColor Yellow
}

# Cambiar al directorio del backend
Set-Location backend

Write-Host "" -ForegroundColor White
Write-Host "📊 Obteniendo información del esquema..." -ForegroundColor Yellow

# Crear archivo temporal con la URL de la base de datos
$env:DATABASE_URL = $DatabaseUrl

try {
    # Usar Prisma para verificar el esquema
    Write-Host "Ejecutando: npx prisma db pull --print" -ForegroundColor Gray
    
    $schema = npx prisma db pull --print 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Esquema obtenido exitosamente" -ForegroundColor Green
        Write-Host "" -ForegroundColor White
        Write-Host "📋 Esquema de la base de datos:" -ForegroundColor Cyan
        Write-Host $schema -ForegroundColor White
    } else {
        Write-Host "⚠️  No se pudo obtener el esquema completo" -ForegroundColor Yellow
    }
    
    # Verificar tablas existentes
    Write-Host "" -ForegroundColor White
    Write-Host "📊 Verificando tablas..." -ForegroundColor Yellow
    
    # Crear script SQL para verificar tablas
    $sqlScript = @"
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
"@
    
    # Guardar script en archivo temporal
    $sqlScript | Out-File -FilePath "temp_verify.sql" -Encoding UTF8
    
    # Ejecutar con psql si está disponible
    if ($psqlAvailable) {
        Write-Host "Consultando tablas con psql..." -ForegroundColor Gray
        $tables = psql $DatabaseUrl -f temp_verify.sql -t
        
        Write-Host "" -ForegroundColor White
        Write-Host "📋 Tablas encontradas:" -ForegroundColor Cyan
        Write-Host $tables -ForegroundColor White
    }
    
    # Limpiar archivo temporal
    Remove-Item "temp_verify.sql" -ErrorAction SilentlyContinue
    
    # Verificar migraciones aplicadas
    Write-Host "" -ForegroundColor White
    Write-Host "🔍 Verificando migraciones..." -ForegroundColor Yellow
    
    $migrations = npx prisma migrate status 2>&1
    
    Write-Host $migrations -ForegroundColor White
    
    # Verificar si hay migraciones pendientes
    if ($migrations -match "pending") {
        Write-Host "" -ForegroundColor White
        Write-Host "⚠️  Hay migraciones pendientes" -ForegroundColor Yellow
        Write-Host "💡 Para aplicarlas ejecuta: npx prisma migrate deploy" -ForegroundColor Gray
    } elseif ($migrations -match "up to date") {
        Write-Host "" -ForegroundColor White
        Write-Host "✅ Todas las migraciones están aplicadas" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error verificando esquema: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Set-Location ..
}

Write-Host "" -ForegroundColor White
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "Ver esquema:          cd backend; npx prisma db pull" -ForegroundColor White
Write-Host "Aplicar migraciones: cd backend; npx prisma migrate deploy" -ForegroundColor White
Write-Host "Abrir Prisma Studio: cd backend; npx prisma studio" -ForegroundColor White
Write-Host "Generar cliente:     cd backend; npx prisma generate" -ForegroundColor White