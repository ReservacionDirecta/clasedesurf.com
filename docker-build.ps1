# PowerShell script para construir y subir imágenes Docker a Docker Hub
# Uso: .\docker-build.ps1 [backend|frontend|all] [push]

param(
    [Parameter(Position=0)]
    [ValidateSet("backend", "frontend", "all")]
    [string]$BuildType = "all",
    
    [Parameter(Position=1)]
    [switch]$Push
)

$ErrorActionPreference = "Stop"

$DockerUsername = if ($env:DOCKER_USERNAME) { $env:DOCKER_USERNAME } else { "chambadigital" }
$BackendImage = "$DockerUsername/clasedesurf-backend"
$FrontendImage = "$DockerUsername/clasedesurf-frontend"
$Version = if ($env:VERSION) { $env:VERSION } else { "latest" }

Write-Host "🐳 Docker Build Script" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Docker Hub Username: $DockerUsername"
Write-Host "Backend Image: ${BackendImage}:$Version"
Write-Host "Frontend Image: ${FrontendImage}:$Version"
Write-Host "Build Type: $BuildType"
Write-Host "Push: $Push"
Write-Host ""

function Build-Backend {
    Write-Host "🔨 Building Backend..." -ForegroundColor Yellow
    $originalLocation = Get-Location
    try {
        Set-Location backend
        docker build -f Dockerfile.production -t "${BackendImage}:$Version" .
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker build failed with exit code $LASTEXITCODE"
        }
        
        docker tag "${BackendImage}:$Version" "${BackendImage}:latest"
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker tag failed with exit code $LASTEXITCODE"
        }
        
        Write-Host "✅ Backend built successfully" -ForegroundColor Green
    }
    finally {
        Set-Location $originalLocation
    }
}

function Build-Frontend {
    Write-Host "🔨 Building Frontend..." -ForegroundColor Yellow
    $originalLocation = Get-Location
    try {
        Set-Location frontend
        
        $BackendUrl = if ($env:NEXT_PUBLIC_BACKEND_URL) { $env:NEXT_PUBLIC_BACKEND_URL } else { "https://surfschool-backend-production.up.railway.app" }
        $ApiUrl = if ($env:NEXT_PUBLIC_API_URL) { $env:NEXT_PUBLIC_API_URL } else { "" }
        $NextAuthUrl = if ($env:NEXTAUTH_URL) { $env:NEXTAUTH_URL } else { "https://clasedesurfcom-production.up.railway.app" }
        $NextAuthSecret = if ($env:NEXTAUTH_SECRET) { $env:NEXTAUTH_SECRET } else { "" }
        
        docker build `
            -f Dockerfile.production `
            --build-arg NEXT_PUBLIC_BACKEND_URL="$BackendUrl" `
            --build-arg NEXT_PUBLIC_API_URL="$ApiUrl" `
            --build-arg NEXTAUTH_URL="$NextAuthUrl" `
            --build-arg NEXTAUTH_SECRET="$NextAuthSecret" `
            -t "${FrontendImage}:$Version" .
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker build failed with exit code $LASTEXITCODE"
        }
        
        docker tag "${FrontendImage}:$Version" "${FrontendImage}:latest"
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker tag failed with exit code $LASTEXITCODE"
        }
        
        Write-Host "✅ Frontend built successfully" -ForegroundColor Green
    }
    finally {
        Set-Location $originalLocation
    }
}

function Push-Backend {
    Write-Host "📤 Pushing Backend to Docker Hub..." -ForegroundColor Yellow
    docker push "${BackendImage}:$Version"
    docker push "${BackendImage}:latest"
    Write-Host "✅ Backend pushed successfully" -ForegroundColor Green
}

function Push-Frontend {
    Write-Host "📤 Pushing Frontend to Docker Hub..." -ForegroundColor Yellow
    docker push "${FrontendImage}:$Version"
    docker push "${FrontendImage}:latest"
    Write-Host "✅ Frontend pushed successfully" -ForegroundColor Green
}

# Build
try {
    switch ($BuildType) {
        "backend" {
            Build-Backend
            if ($Push) {
                Push-Backend
            }
        }
        "frontend" {
            Build-Frontend
            if ($Push) {
                Push-Frontend
            }
        }
        "all" {
            Build-Backend
            Build-Frontend
            if ($Push) {
                Push-Backend
                Push-Frontend
            }
        }
    }
    
    Write-Host ""
    Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
    if (-not $Push) {
        Write-Host "💡 To push images, run: .\docker-build.ps1 $BuildType -Push" -ForegroundColor Cyan
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    exit 1
}
