# ===============================================
# SURF SCHOOL - DOCKER DEPLOYMENT SCRIPT
# ===============================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod", "full")]
    [string]$Mode = "dev",
    
    [Parameter(Mandatory=$false)]
    [switch]$Build,
    
    [Parameter(Mandatory=$false)]
    [switch]$Clean,
    
    [Parameter(Mandatory=$false)]
    [switch]$Logs,
    
    [Parameter(Mandatory=$false)]
    [switch]$Stop,
    
    [Parameter(Mandatory=$false)]
    [switch]$WhatsApp
)

function Show-Header {
    Write-Host "`n===============================================" -ForegroundColor Cyan
    Write-Host "SURF SCHOOL - DOCKER DEPLOYMENT" -ForegroundColor Cyan
    Write-Host "===============================================`n" -ForegroundColor Cyan
}

function Test-Docker {
    try {
        $dockerVersion = docker --version
        Write-Host "Docker: $dockerVersion" -ForegroundColor Green
        
        $composeVersion = docker-compose --version
        Write-Host "Docker Compose: $composeVersion" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Error: Docker o Docker Compose no estan instalados" -ForegroundColor Red
        return $false
    }
}

function Stop-Services {
    Write-Host "`nDeteniendo servicios..." -ForegroundColor Yellow
    
    # Stop all possible compose files
    docker-compose -f docker-compose.yml down --remove-orphans 2>$null
    docker-compose -f docker-compose.prod.yml down --remove-orphans 2>$null
    docker-compose -f docker-compose.complete.yml down --remove-orphans 2>$null
    
    Write-Host "Servicios detenidos" -ForegroundColor Green
}

function Clean-Docker {
    Write-Host "`nLimpiando Docker..." -ForegroundColor Yellow
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused networks
    docker network prune -f
    
    Write-Host "Limpieza completada" -ForegroundColor Green
}

function Build-Images {
    Write-Host "`nConstruyendo imagenes..." -ForegroundColor Yellow
    
    # Build backend
    Write-Host "Construyendo Backend..." -ForegroundColor Blue
    docker build -t surfschool-backend:latest ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error construyendo backend" -ForegroundColor Red
        exit 1
    }
    
    # Build frontend
    Write-Host "Construyendo Frontend..." -ForegroundColor Blue
    docker build -t surfschool-frontend:latest ./frontend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error construyendo frontend" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Imagenes construidas exitosamente" -ForegroundColor Green
}

function Start-Development {
    Write-Host "`nIniciando modo desarrollo..." -ForegroundColor Yellow
    
    # Copy environment file
    if (Test-Path ".env.docker") {
        Copy-Item ".env.docker" ".env"
        Write-Host "Variables de entorno configuradas" -ForegroundColor Green
    }
    
    # Start basic services
    docker-compose -f docker-compose.yml up -d postgres redis
    
    Write-Host "Esperando que la base de datos este lista..." -ForegroundColor Blue
    Start-Sleep -Seconds 10
    
    # Start application services
    docker-compose -f docker-compose.yml up -d
    
    Write-Host "`nServicios iniciados en modo desarrollo" -ForegroundColor Green
    Show-Services
}

function Start-Production {
    Write-Host "`nIniciando modo produccion..." -ForegroundColor Yellow
    
    # Use production compose file
    $composeFile = "docker-compose.complete.yml"
    
    if ($WhatsApp) {
        Write-Host "Incluyendo servicios de WhatsApp..." -ForegroundColor Blue
        docker-compose -f $composeFile --profile whatsapp up -d
    } else {
        docker-compose -f $composeFile up -d postgres redis backend frontend nginx
    }
    
    Write-Host "`nServicios iniciados en modo produccion" -ForegroundColor Green
    Show-Services
}

function Start-Full {
    Write-Host "`nIniciando todos los servicios..." -ForegroundColor Yellow
    
    docker-compose -f docker-compose.complete.yml --profile whatsapp up -d
    
    Write-Host "`nTodos los servicios iniciados" -ForegroundColor Green
    Show-Services
}

function Show-Services {
    Write-Host "`nESTADO DE SERVICIOS:" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host "`nENLACES DISPONIBLES:" -ForegroundColor Cyan
    Write-Host "   Frontend:     http://localhost:3000" -ForegroundColor Blue
    Write-Host "   Backend API:  http://localhost:4000" -ForegroundColor Blue
    Write-Host "   Database:     localhost:5432" -ForegroundColor Blue
    Write-Host "   Redis:        localhost:6379" -ForegroundColor Blue
    
    if ($WhatsApp -or $Mode -eq "full") {
        Write-Host "   WhatsApp API: http://localhost:8080" -ForegroundColor Blue
    }
    
    if ($Mode -eq "prod" -or $Mode -eq "full") {
        Write-Host "   Nginx:        http://localhost:80" -ForegroundColor Blue
    }
}

function Show-Logs {
    Write-Host "`nMostrando logs..." -ForegroundColor Yellow
    docker-compose logs -f --tail=100
}

# ===============================================
# MAIN EXECUTION
# ===============================================

Show-Header

# Test Docker installation
if (-not (Test-Docker)) {
    exit 1
}

# Stop services if requested
if ($Stop) {
    Stop-Services
    exit 0
}

# Show logs if requested
if ($Logs) {
    Show-Logs
    exit 0
}

# Clean Docker if requested
if ($Clean) {
    Clean-Docker
}

# Build images if requested
if ($Build) {
    Build-Images
}

# Start services based on mode
switch ($Mode) {
    "dev" { Start-Development }
    "prod" { Start-Production }
    "full" { Start-Full }
    default { 
        Write-Host "Modo invalido: $Mode" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nDespliegue completado exitosamente!" -ForegroundColor Green
Write-Host "`nPara ver logs: .\docker-deploy-simple.ps1 -Logs" -ForegroundColor Yellow
Write-Host "Para detener:  .\docker-deploy-simple.ps1 -Stop" -ForegroundColor Yellow
Write-Host "`n===============================================`n" -ForegroundColor Cyan