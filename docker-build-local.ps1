# Script para construir imágenes Docker localmente
param(
    [string]$Tag = "latest",
    [string]$Registry = "clasedesurf",
    [switch]$Push = $false,
    [switch]$Backend = $false,
    [switch]$Frontend = $false,
    [switch]$All = $false
)

Write-Host "🐳 Construyendo imágenes Docker localmente..." -ForegroundColor Green

# Si no se especifica ningún servicio, construir todo
if (-not $Backend -and -not $Frontend) {
    $All = $true
}

# Función para construir imagen
function Build-DockerImage {
    param(
        [string]$Service,
        [string]$Context,
        [string]$Dockerfile,
        [string]$ImageName
    )
    
    Write-Host "📦 Construyendo $Service..." -ForegroundColor Yellow
    Write-Host "Context: $Context" -ForegroundColor Gray
    Write-Host "Dockerfile: $Dockerfile" -ForegroundColor Gray
    Write-Host "Image: $ImageName" -ForegroundColor Gray
    
    try {
        $buildArgs = @(
            "build",
            "--file", $Dockerfile,
            "--tag", $ImageName,
            "--platform", "linux/amd64",
            $Context
        )
        
        Write-Host "Ejecutando: docker $($buildArgs -join ' ')" -ForegroundColor Gray
        
        & docker @buildArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Service construido exitosamente" -ForegroundColor Green
            
            # Mostrar información de la imagen
            Write-Host "📊 Información de la imagen:" -ForegroundColor Cyan
            docker images $ImageName --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
            
            return $true
        } else {
            Write-Host "❌ Error construyendo $Service" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error ejecutando docker build para $Service : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para hacer push de imagen
function Push-DockerImage {
    param([string]$ImageName)
    
    if ($Push) {
        Write-Host "📤 Subiendo $ImageName..." -ForegroundColor Yellow
        docker push $ImageName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $ImageName subido exitosamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error subiendo $ImageName" -ForegroundColor Red
        }
    }
}

# Verificar que Docker esté funcionando
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no encontrado. Asegúrate de que Docker esté instalado y funcionando." -ForegroundColor Red
    exit 1
}

$success = $true

# Construir Backend
if ($Backend -or $All) {
    $backendImage = "$Registry/clasedesurf-backend:$Tag"
    $backendSuccess = Build-DockerImage -Service "Backend" -Context "./backend" -Dockerfile "./backend/Dockerfile.railway" -ImageName $backendImage
    
    if ($backendSuccess) {
        Push-DockerImage -ImageName $backendImage
    } else {
        $success = $false
    }
}

# Construir Frontend
if ($Frontend -or $All) {
    $frontendImage = "$Registry/clasedesurf-frontend:$Tag"
    $frontendSuccess = Build-DockerImage -Service "Frontend" -Context "./frontend" -Dockerfile "./frontend/Dockerfile.railway" -ImageName $frontendImage
    
    if ($frontendSuccess) {
        Push-DockerImage -ImageName $frontendImage
    } else {
        $success = $false
    }
}

Write-Host "" -ForegroundColor White
Write-Host "📋 Resumen de construcción:" -ForegroundColor Cyan

if ($success) {
    Write-Host "🎉 ¡Todas las imágenes construidas exitosamente!" -ForegroundColor Green
    
    Write-Host "" -ForegroundColor White
    Write-Host "📊 Imágenes creadas:" -ForegroundColor Cyan
    docker images "$Registry/clasedesurf-*:$Tag" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    Write-Host "" -ForegroundColor White
    Write-Host "🚀 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Probar las imágenes localmente:" -ForegroundColor White
    Write-Host "   docker run -p 4000:4000 $Registry/clasedesurf-backend:$Tag" -ForegroundColor Gray
    Write-Host "   docker run -p 3000:3000 $Registry/clasedesurf-frontend:$Tag" -ForegroundColor Gray
    Write-Host "2. Desplegar en Railway:" -ForegroundColor White
    Write-Host "   ./deploy-railway.ps1" -ForegroundColor Gray
    
    if ($Push) {
        Write-Host "3. Las imágenes ya están subidas al registry" -ForegroundColor White
    } else {
        Write-Host "3. Subir imágenes al registry:" -ForegroundColor White
        Write-Host "   ./docker-build-local.ps1 -Push" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Algunas imágenes fallaron al construirse" -ForegroundColor Red
    Write-Host "🔍 Revisa los logs arriba para más detalles" -ForegroundColor Yellow
    exit 1
}