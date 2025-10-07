# Script para aplicar la migración de ownerId a la tabla schools
# Ejecutar desde la raíz del proyecto

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Aplicando Migración: add_school_owner" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Leer variables de entorno del backend
$envFile = "backend/.env"

if (Test-Path $envFile) {
    Write-Host "Leyendo configuración de $envFile..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^DATABASE_URL=(.+)$') {
            $env:DATABASE_URL = $matches[1]
            Write-Host "✓ DATABASE_URL configurada" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ No se encontró el archivo backend/.env" -ForegroundColor Red
    exit 1
}

if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL no está configurada" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Opciones de migración:" -ForegroundColor Cyan
Write-Host "1. Aplicar migración SQL directamente"
Write-Host "2. Usar Prisma DB Push (recomendado)"
Write-Host "3. Generar y aplicar migración de Prisma"
Write-Host ""

$option = Read-Host "Selecciona una opción (1-3)"

switch ($option) {
    "1" {
        Write-Host ""
        Write-Host "Aplicando migración SQL..." -ForegroundColor Yellow
        
        # Extraer componentes de la URL de PostgreSQL
        if ($env:DATABASE_URL -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
            $user = $matches[1]
            $password = $matches[2]
            $host = $matches[3]
            $port = $matches[4]
            $database = $matches[5]
            
            $env:PGPASSWORD = $password
            
            Write-Host "Conectando a: $host:$port/$database" -ForegroundColor Gray
            
            psql -h $host -p $port -U $user -d $database -f backend/prisma/migrations/add_school_owner.sql
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Migración aplicada exitosamente" -ForegroundColor Green
            } else {
                Write-Host "❌ Error al aplicar migración" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Formato de DATABASE_URL no válido" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Usando Prisma DB Push..." -ForegroundColor Yellow
        
        Set-Location backend
        
        Write-Host "Generando cliente Prisma..." -ForegroundColor Gray
        npx prisma generate
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error al generar cliente Prisma" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
        
        Write-Host "Aplicando cambios al schema..." -ForegroundColor Gray
        npx prisma db push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Schema actualizado exitosamente" -ForegroundColor Green
            Write-Host ""
            Write-Host "📝 Nota: Reinicia el servidor backend para aplicar los cambios" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Error al actualizar schema" -ForegroundColor Red
        }
        
        Set-Location ..
    }
    
    "3" {
        Write-Host ""
        Write-Host "Generando migración de Prisma..." -ForegroundColor Yellow
        
        Set-Location backend
        
        $migrationName = Read-Host "Nombre de la migración (default: add_school_owner)"
        if (-not $migrationName) {
            $migrationName = "add_school_owner"
        }
        
        npx prisma migrate dev --name $migrationName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Migración creada y aplicada exitosamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error al crear migración" -ForegroundColor Red
        }
        
        Set-Location ..
    }
    
    default {
        Write-Host "❌ Opción no válida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Proceso completado" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Reiniciar el servidor backend si está corriendo"
Write-Host "2. Verificar que el endpoint /api/schools/my-school funciona"
Write-Host "3. Probar la creación de escuelas desde el dashboard"
Write-Host ""
