# Build and Push SurfSchool Docker Images to Docker Hub (PowerShell)
# Usage: .\build-and-push.ps1 [your-dockerhub-username] [version]

param(
    [string]$DockerUsername = "surfschool",
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"

# Configuration
$BackendImage = "$DockerUsername/surfschool-backend"
$FrontendImage = "$DockerUsername/surfschool-frontend"

Write-Host "🏄 Building and pushing SurfSchool Docker images..." -ForegroundColor Cyan
Write-Host "Docker Hub Username: $DockerUsername" -ForegroundColor Yellow
Write-Host "Version: $Version" -ForegroundColor Yellow

# Build Backend
Write-Host "📦 Building backend image..." -ForegroundColor Green
Set-Location backend
docker build -t "${BackendImage}:${Version}" .
docker tag "${BackendImage}:${Version}" "${BackendImage}:latest"
Set-Location ..

# Build Frontend
Write-Host "📦 Building frontend image..." -ForegroundColor Green
Set-Location frontend
docker build -t "${FrontendImage}:${Version}" .
docker tag "${FrontendImage}:${Version}" "${FrontendImage}:latest"
Set-Location ..

# Login to Docker Hub (if not already logged in)
Write-Host "🔐 Logging in to Docker Hub..." -ForegroundColor Blue
docker login

# Push Backend
Write-Host "🚀 Pushing backend image..." -ForegroundColor Magenta
docker push "${BackendImage}:${Version}"
docker push "${BackendImage}:latest"

# Push Frontend
Write-Host "🚀 Pushing frontend image..." -ForegroundColor Magenta
docker push "${FrontendImage}:${Version}"
docker push "${FrontendImage}:latest"

Write-Host "✅ Successfully built and pushed all images!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend Image: ${BackendImage}:${Version}" -ForegroundColor Yellow
Write-Host "Frontend Image: ${FrontendImage}:${Version}" -ForegroundColor Yellow
Write-Host ""
Write-Host "To run locally:" -ForegroundColor Cyan
Write-Host "docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "To deploy on Railway:" -ForegroundColor Cyan
Write-Host "1. Use the images in your Railway service configuration" -ForegroundColor White
Write-Host "2. Set the appropriate environment variables" -ForegroundColor White