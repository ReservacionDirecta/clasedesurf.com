# PowerShell script para construir y subir imagenes Docker a Docker Hub
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

Write-Host "Docker Build Script" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Docker Hub Username: $DockerUsername"
Write-Host "Backend Image: ${BackendImage}:$Version"
Write-Host "Frontend Image: ${FrontendImage}:$Version"
Write-Host "Build Type: $BuildType"
Write-Host "Push: $Push"
Write-Host ""

$originalLocation = Get-Location
$buildSuccess = $true
$errorMessage = ""

if ($BuildType -eq "backend" -or $BuildType -eq "all") {
    try {
        Write-Host "Building Backend..." -ForegroundColor Yellow
        Set-Location backend
        docker build -f Dockerfile.production -t "${BackendImage}:$Version" .
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker build failed with exit code $LASTEXITCODE"
        }
        
        docker tag "${BackendImage}:$Version" "${BackendImage}:latest"
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker tag failed with exit code $LASTEXITCODE"
        }
        
        Write-Host "Backend built successfully" -ForegroundColor Green
        Set-Location $originalLocation
        
        if ($Push) {
            Write-Host "Pushing Backend to Docker Hub..." -ForegroundColor Yellow
            docker push "${BackendImage}:$Version"
            if ($LASTEXITCODE -ne 0) {
                throw "Docker push failed with exit code $LASTEXITCODE"
            }
            docker push "${BackendImage}:latest"
            if ($LASTEXITCODE -ne 0) {
                throw "Docker push failed with exit code $LASTEXITCODE"
            }
            Write-Host "Backend pushed successfully" -ForegroundColor Green
        }
    }
    catch {
        Set-Location $originalLocation
        $buildSuccess = $false
        $errorMessage = $_.Exception.Message
        Write-Host ""
        Write-Host "Backend build failed: $_" -ForegroundColor Red
    }
}

if ($BuildType -eq "frontend" -or $BuildType -eq "all") {
    if ($buildSuccess) {
        try {
            Write-Host "Building Frontend..." -ForegroundColor Yellow
            Set-Location frontend
            
            $BackendUrl = if ($env:NEXT_PUBLIC_BACKEND_URL) { $env:NEXT_PUBLIC_BACKEND_URL } else { "https://surfschool-backend-production.up.railway.app" }
            $ApiUrl = if ($env:NEXT_PUBLIC_API_URL) { $env:NEXT_PUBLIC_API_URL } else { "" }
            $NextAuthUrl = if ($env:NEXTAUTH_URL) { $env:NEXTAUTH_URL } else { "https://clasedesurfcom-production.up.railway.app" }
            $NextAuthSecret = if ($env:NEXTAUTH_SECRET) { $env:NEXTAUTH_SECRET } else { "" }
            
            docker build -f Dockerfile.production --build-arg NEXT_PUBLIC_BACKEND_URL="$BackendUrl" --build-arg NEXT_PUBLIC_API_URL="$ApiUrl" --build-arg NEXTAUTH_URL="$NextAuthUrl" --build-arg NEXTAUTH_SECRET="$NextAuthSecret" -t "${FrontendImage}:$Version" .
            
            if ($LASTEXITCODE -ne 0) {
                throw "Docker build failed with exit code $LASTEXITCODE"
            }
            
            docker tag "${FrontendImage}:$Version" "${FrontendImage}:latest"
            
            if ($LASTEXITCODE -ne 0) {
                throw "Docker tag failed with exit code $LASTEXITCODE"
            }
            
            Write-Host "Frontend built successfully" -ForegroundColor Green
            Set-Location $originalLocation
            
            if ($Push) {
                Write-Host "Pushing Frontend to Docker Hub..." -ForegroundColor Yellow
                docker push "${FrontendImage}:$Version"
                if ($LASTEXITCODE -ne 0) {
                    throw "Docker push failed with exit code $LASTEXITCODE"
                }
                docker push "${FrontendImage}:latest"
                if ($LASTEXITCODE -ne 0) {
                    throw "Docker push failed with exit code $LASTEXITCODE"
                }
                Write-Host "Frontend pushed successfully" -ForegroundColor Green
            }
        }
        catch {
            Set-Location $originalLocation
            $buildSuccess = $false
            $errorMessage = $_.Exception.Message
            Write-Host ""
            Write-Host "Frontend build failed: $_" -ForegroundColor Red
        }
    }
}

Set-Location $originalLocation

if ($buildSuccess) {
    Write-Host ""
    Write-Host "Build completed successfully!" -ForegroundColor Green
    if (-not $Push) {
        Write-Host "To push images, run: .\docker-build.ps1 $BuildType -Push" -ForegroundColor Cyan
    }
    exit 0
}
else {
    Write-Host ""
    Write-Host "Build failed: $errorMessage" -ForegroundColor Red
    exit 1
}
