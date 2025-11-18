# Script para resolver la migración fallida en Railway
# Migración: 20251118184826_add_school_rating_and_founded_year

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Resolver Migración Fallida de Prisma     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$DATABASE_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

Write-Host "📋 Opciones disponibles:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verificar estado de la migración (recomendado primero)" -ForegroundColor White
Write-Host "2. Aplicar cambios manualmente y marcar como aplicada" -ForegroundColor White
Write-Host "3. Solo marcar como aplicada (si los cambios ya están)" -ForegroundColor White
Write-Host "4. Marcar como revertida (empezar de nuevo)" -ForegroundColor White
Write-Host ""

$option = Read-Host "Selecciona una opción (1-4)"

switch ($option) {
    "1" {
        Write-Host ""
        Write-Host "🔍 Verificando estado de la migración..." -ForegroundColor Cyan
        Write-Host ""
        
        # Verificar si psql está disponible
        $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
        if (-not $psqlPath) {
            Write-Host "❌ psql no está instalado o no está en el PATH" -ForegroundColor Red
            Write-Host "   Instala PostgreSQL client o usa Railway Dashboard" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "   Alternativa: Ejecuta check-migration-status.sql en Railway Dashboard" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "Ejecutando verificación..." -ForegroundColor Gray
        $env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
        psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f "backend/scripts/check-migration-status.sql"
        
        Write-Host ""
        Write-Host "✅ Verificación completada" -ForegroundColor Green
        Write-Host "   Revisa los resultados arriba para ver qué cambios faltan" -ForegroundColor Yellow
    }
    
    "2" {
        Write-Host ""
        Write-Host "🔧 Aplicando cambios manualmente..." -ForegroundColor Cyan
        Write-Host ""
        
        # Verificar si psql está disponible
        $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
        if (-not $psqlPath) {
            Write-Host "❌ psql no está instalado o no está en el PATH" -ForegroundColor Red
            Write-Host ""
            Write-Host "📝 Alternativa: Ejecuta resolve-failed-migration.sql en Railway Dashboard" -ForegroundColor Yellow
            Write-Host "   1. Ve a Railway Dashboard > Tu Base de Datos > Query" -ForegroundColor White
            Write-Host "   2. Copia el contenido de backend/scripts/resolve-failed-migration.sql" -ForegroundColor White
            Write-Host "   3. Pega y ejecuta en Railway" -ForegroundColor White
            Write-Host ""
            Write-Host "   Luego ejecuta la opción 3 para marcar como aplicada" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "Aplicando cambios SQL..." -ForegroundColor Gray
        $env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
        psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f "backend/scripts/resolve-failed-migration.sql"
        
        Write-Host ""
        Write-Host "✅ Cambios aplicados" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Ahora marca la migración como aplicada:" -ForegroundColor Yellow
        Write-Host "   cd backend" -ForegroundColor White
        Write-Host "   npx prisma migrate resolve --applied 20251118184826_add_school_rating_and_founded_year" -ForegroundColor White
    }
    
    "3" {
        Write-Host ""
        Write-Host "✅ Marcando migración como aplicada..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  Asegúrate de que los cambios ya están en la base de datos" -ForegroundColor Yellow
        Write-Host ""
        
        $confirm = Read-Host "¿Los cambios ya están aplicados en la BD? (s/n)"
        if ($confirm -ne "s" -and $confirm -ne "S") {
            Write-Host "❌ Operación cancelada" -ForegroundColor Red
            exit 1
        }
        
        Write-Host ""
        Write-Host "Ejecutando comando Prisma..." -ForegroundColor Gray
        Set-Location backend
        $env:DATABASE_URL = $DATABASE_URL
        npx prisma migrate resolve --applied 20251118184826_add_school_rating_and_founded_year
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Migración marcada como aplicada" -ForegroundColor Green
            Write-Host ""
            Write-Host "🔍 Verificando estado..." -ForegroundColor Cyan
            npx prisma migrate status
        } else {
            Write-Host ""
            Write-Host "❌ Error al marcar la migración" -ForegroundColor Red
            Write-Host "   Verifica la conexión a la base de datos" -ForegroundColor Yellow
        }
        
        Set-Location ..
    }
    
    "4" {
        Write-Host ""
        Write-Host "⚠️  Marcando migración como revertida..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚠️  ADVERTENCIA: Esto no revierte los cambios en la BD" -ForegroundColor Red
        Write-Host "   Solo marca la migración como revertida en Prisma" -ForegroundColor Yellow
        Write-Host ""
        
        $confirm = Read-Host "¿Estás seguro? (s/n)"
        if ($confirm -ne "s" -and $confirm -ne "S") {
            Write-Host "❌ Operación cancelada" -ForegroundColor Red
            exit 1
        }
        
        Write-Host ""
        Write-Host "Ejecutando comando Prisma..." -ForegroundColor Gray
        Set-Location backend
        $env:DATABASE_URL = $DATABASE_URL
        npx prisma migrate resolve --rolled-back 20251118184826_add_school_rating_and_founded_year
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Migración marcada como revertida" -ForegroundColor Green
            Write-Host ""
            Write-Host "💡 Puedes crear una nueva migración ahora:" -ForegroundColor Yellow
            Write-Host "   npx prisma migrate dev --name add_school_rating_and_founded_year_v2" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "❌ Error al marcar la migración" -ForegroundColor Red
        }
        
        Set-Location ..
    }
    
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           Proceso Completado               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

