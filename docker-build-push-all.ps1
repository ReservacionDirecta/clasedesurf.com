# Script para construir y subir imágenes Docker a Docker Hub
# Uso: .\docker-build-push-all.ps1 -Username "tu-usuario" -Version "1.0.0"

param(
    [Parameter(Mandatory=$false)]
    [string]$Username = "yerct",
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPush = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$BuildOnly = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🐳 Clase de Surf - Docker Build & Push Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker está instalado
try {
    docker --version | Out-Null
    Write-Host "✅ Docker está instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar que Docker está corriendo
try {
    docker ps | Out-Null
    Write-Host "✅ Docker está corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está corriendo. Por favor, inicia Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Configuración:" -ForegroundColor Cyan
Write-Host "   Usuario Docker Hub: $Username" -ForegroundColor White
Write-Host "   Versión: $Version" -ForegroundColor White
Write-Host ""

# Login a Docker Hub (solo si no es BuildOnly)
if (-not $BuildOnly) {
    Write-Host "🔐 Iniciando sesión en Docker Hub..." -ForegroundColor Yellow
    Write-Host "   Por favor, ingresa tus credenciales de Docker Hub" -ForegroundColor Yellow
    docker login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al iniciar sesión en Docker Hub" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Sesión iniciada correctamente" -ForegroundColor Green
    Write-Host ""
}

# Función para construir imagen
function Build-Image {
    param(
        [string]$Service,
        [string]$Context,
        [string]$ImageName
    )
    
    Write-Host "🔨 Construyendo $Service..." -ForegroundColor Cyan
    Write-Host "   Contexto: $Context" -ForegroundColor Gray
    Write-Host "   Imagen: $ImageName" -ForegroundColor Gray
    
    $buildArgs = @(
        "build",
        "-t", $ImageName,
        "-f", "$Context/Dockerfile",
        $Context
    )
    
    & docker $buildArgs
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al construir $Service" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ $Service construido correctamente" -ForegroundColor Green
    Write-Host ""
    return $true
}

# Función para subir imagen
function Push-Image {
    param(
        [string]$Service,
        [string]$ImageName
    )
    
    Write-Host "📤 Subiendo $Service a Docker Hub..." -ForegroundColor Cyan
    Write-Host "   Imagen: $ImageName" -ForegroundColor Gray
    
    docker push $ImageName
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al subir $Service" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ $Service subido correctamente" -ForegroundColor Green
    Write-Host ""
    return $true
}

# Construir Backend
if (-not $SkipBuild) {
    $backendImage = "$Username/clasedesurf-backend:$Version"
    $backendSuccess = Build-Image -Service "Backend" -Context "./backend" -ImageName $backendImage
    
    if (-not $backendSuccess) {
        Write-Host "❌ Falló la construcción del Backend" -ForegroundColor Red
        exit 1
    }
    
    # Tag como latest si no es latest
    if ($Version -ne "latest") {
        Write-Host "🏷️  Etiquetando Backend como latest..." -ForegroundColor Yellow
        docker tag $backendImage "$Username/clasedesurf-backend:latest"
    }
} else {
    Write-Host "⏭️  Saltando construcción del Backend" -ForegroundColor Yellow
    Write-Host ""
}

# Construir Frontend
if (-not $SkipBuild) {
    $frontendImage = "$Username/clasedesurf-frontend:$Version"
    $frontendSuccess = Build-Image -Service "Frontend" -Context "./frontend" -ImageName $frontendImage
    
    if (-not $frontendSuccess) {
        Write-Host "❌ Falló la construcción del Frontend" -ForegroundColor Red
        exit 1
    }
    
    # Tag como latest si no es latest
    if ($Version -ne "latest") {
        Write-Host "🏷️  Etiquetando Frontend como latest..." -ForegroundColor Yellow
        docker tag $frontendImage "$Username/clasedesurf-frontend:latest"
    }
} else {
    Write-Host "⏭️  Saltando construcción del Frontend" -ForegroundColor Yellow
    Write-Host ""
}

# Subir imágenes a Docker Hub
if (-not $SkipPush -and -not $BuildOnly) {
    Write-Host "📤 Subiendo imágenes a Docker Hub..." -ForegroundColor Cyan
    Write-Host ""
    
    # Subir Backend
    $backendImage = "$Username/clasedesurf-backend:$Version"
    $backendPushSuccess = Push-Image -Service "Backend" -ImageName $backendImage
    
    if ($Version -ne "latest") {
        Push-Image -Service "Backend (latest)" -ImageName "$Username/clasedesurf-backend:latest" | Out-Null
    }
    
    # Subir Frontend
    $frontendImage = "$Username/clasedesurf-frontend:$Version"
    $frontendPushSuccess = Push-Image -Service "Frontend" -ImageName $frontendImage
    
    if ($Version -ne "latest") {
        Push-Image -Service "Frontend (latest)" -ImageName "$Username/clasedesurf-frontend:latest" | Out-Null
    }
    
    if ($backendPushSuccess -and $frontendPushSuccess) {
        Write-Host "✅ Todas las imágenes subidas correctamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Algunas imágenes no se pudieron subir" -ForegroundColor Yellow
    }
} elseif ($BuildOnly) {
    Write-Host "⏭️  Modo BuildOnly: No se subirán las imágenes" -ForegroundColor Yellow
} else {
    Write-Host "⏭️  Saltando subida de imágenes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ Proceso completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Imágenes creadas:" -ForegroundColor Cyan
Write-Host "   - $Username/clasedesurf-backend:$Version" -ForegroundColor White
Write-Host "   - $Username/clasedesurf-frontend:$Version" -ForegroundColor White

if ($Version -ne "latest") {
    Write-Host "   - $Username/clasedesurf-backend:latest" -ForegroundColor White
    Write-Host "   - $Username/clasedesurf-frontend:latest" -ForegroundColor White
}

Write-Host ""
Write-Host "🚀 Para desplegar la aplicación:" -ForegroundColor Cyan
Write-Host "   docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Para ver las imágenes en Docker Hub:" -ForegroundColor Cyan
Write-Host "   https://hub.docker.com/u/$Username" -ForegroundColor White
Write-Host ""
