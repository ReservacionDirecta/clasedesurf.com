# Script completo para construir y probar imágenes Docker
param(
    [string]$Tag = "latest",
    [string]$Registry = "clasedesurf",
    [switch]$SkipBuild = $false,
    [switch]$SkipTest = $false,
    [switch]$UseCompose = $false,
    [switch]$Clean = $false
)

Write-Host "🐳 Script completo de construcción y prueba Docker" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor White

if ($Clean) {
    Write-Host "🧹 Limpiando contenedores y volúmenes..." -ForegroundColor Yellow
    
    # Detener y eliminar contenedores de prueba
    docker stop clasedesurf-backend-test clasedesurf-frontend-test clasedesurf-postgres-test 2>$null
    docker rm clasedesurf-backend-test clasedesurf-frontend-test clasedesurf-postgres-test 2>$null
    
    # Limpiar docker-compose si existe
    if (Test-Path "docker-compose.test.yml") {
        docker-compose -f docker-compose.test.yml down -v 2>$null
    }
    
    # Eliminar imágenes de prueba
    docker rmi "$Registry/clasedesurf-backend:$Tag" "$Registry/clasedesurf-frontend:$Tag" 2>$null
    
    # Limpiar volúmenes huérfanos
    docker volume prune -f 2>$null
    
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
    exit 0
}

# Paso 1: Construir imágenes
if (-not $SkipBuild) {
    Write-Host "📦 Paso 1: Construyendo imágenes..." -ForegroundColor Cyan
    
    & ./docker-build-local.ps1 -Tag $Tag -Registry $Registry -All
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error en la construcción de imágenes" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Imágenes construidas exitosamente" -ForegroundColor Green
} else {
    Write-Host "⏭️  Saltando construcción de imágenes" -ForegroundColor Yellow
}

# Paso 2: Probar imágenes
if (-not $SkipTest) {
    Write-Host "" -ForegroundColor White
    Write-Host "🧪 Paso 2: Probando imágenes..." -ForegroundColor Cyan
    
    if ($UseCompose) {
        Write-Host "🐙 Usando Docker Compose para pruebas..." -ForegroundColor Yellow
        
        # Verificar que las imágenes existan
        $backendExists = docker images -q "$Registry/clasedesurf-backend:$Tag"
        $frontendExists = docker images -q "$Registry/clasedesurf-frontend:$Tag"
        
        if (-not $backendExists -or -not $frontendExists) {
            Write-Host "❌ Imágenes no encontradas. Construye primero con -SkipTest" -ForegroundColor Red
            exit 1
        }
        
        # Actualizar docker-compose.test.yml con el tag correcto
        $composeContent = Get-Content "docker-compose.test.yml" -Raw
        $composeContent = $composeContent -replace "clasedesurf/clasedesurf-backend:latest", "$Registry/clasedesurf-backend:$Tag"
        $composeContent = $composeContent -replace "clasedesurf/clasedesurf-frontend:latest", "$Registry/clasedesurf-frontend:$Tag"
        $composeContent | Set-Content "docker-compose.test.yml.tmp"
        
        # Iniciar servicios
        docker-compose -f docker-compose.test.yml.tmp up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Servicios iniciados con Docker Compose" -ForegroundColor Green
            
            # Esperar a que los servicios estén listos
            Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            
            # Verificar endpoints
            Write-Host "🔍 Verificando endpoints..." -ForegroundColor Yellow
            
            try {
                $backendResponse = Invoke-WebRequest -Uri "http://localhost:4001/health" -Method GET -TimeoutSec 10
                if ($backendResponse.StatusCode -eq 200) {
                    Write-Host "✅ Backend funcionando correctamente" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  Backend responde con status: $($backendResponse.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "❌ Backend no responde: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            try {
                $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 10
                if ($frontendResponse.StatusCode -eq 200) {
                    Write-Host "✅ Frontend funcionando correctamente" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  Frontend responde con status: $($frontendResponse.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "❌ Frontend no responde: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            Write-Host "" -ForegroundColor White
            Write-Host "🌐 URLs de prueba (Docker Compose):" -ForegroundColor Cyan
            Write-Host "Backend:  http://localhost:4001" -ForegroundColor White
            Write-Host "Frontend: http://localhost:3001" -ForegroundColor White
            Write-Host "" -ForegroundColor White
            Write-Host "📋 Comandos útiles:" -ForegroundColor Cyan
            Write-Host "Ver logs:    docker-compose -f docker-compose.test.yml.tmp logs -f" -ForegroundColor White
            Write-Host "Detener:     docker-compose -f docker-compose.test.yml.tmp down" -ForegroundColor White
            Write-Host "Limpiar:     ./docker-build-and-test.ps1 -Clean" -ForegroundColor White
            
        } else {
            Write-Host "❌ Error iniciando servicios con Docker Compose" -ForegroundColor Red
            exit 1
        }
        
        # Limpiar archivo temporal
        Remove-Item "docker-compose.test.yml.tmp" -ErrorAction SilentlyContinue
        
    } else {
        Write-Host "🐳 Usando contenedores individuales para pruebas..." -ForegroundColor Yellow
        
        & ./docker-test-local.ps1 -Tag $Tag -Registry $Registry
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error en las pruebas" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "✅ Pruebas completadas exitosamente" -ForegroundColor Green
} else {
    Write-Host "⏭️  Saltando pruebas" -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor White
Write-Host "🎉 ¡Proceso completado exitosamente!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📊 Resumen:" -ForegroundColor Cyan

# Mostrar imágenes creadas
Write-Host "Imágenes Docker:" -ForegroundColor White
docker images "$Registry/clasedesurf-*:$Tag" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

Write-Host "" -ForegroundColor White
Write-Host "🚀 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Probar la aplicación en el navegador" -ForegroundColor White
Write-Host "2. Si todo funciona, desplegar en Railway:" -ForegroundColor White
Write-Host "   ./deploy-railway.ps1" -ForegroundColor Gray
Write-Host "3. Para limpiar todo:" -ForegroundColor White
Write-Host "   ./docker-build-and-test.ps1 -Clean" -ForegroundColor Gray