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

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Blue = "Blue"

function Write-ColorOutput($ForegroundColor, $Message) {
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Show-Header {
    Write-ColorOutput $Cyan "`n==============================================="
    Write-ColorOutput $Cyan "SURF SCHOOL - DOCKER DEPLOYMENT"
    Write-ColorOutput $Cyan "===============================================`n"
}

function Test-Docker {
    try {
        $dockerVersion = docker --version
        Write-ColorOutput $Green "✅ Docker: $dockerVersion"
        
        $composeVersion = docker-compose --version
        Write-ColorOutput $Green "✅ Docker Compose: $composeVersion"
        return $true
    } catch {
        Write-ColorOutput $Red "❌ Docker o Docker Compose no están instalados"
        return $false
    }
}

function Stop-Services {
    Write-ColorOutput $Yellow "`nDeteniendo servicios..."
    
    # Stop all possible compose files
    docker-compose -f docker-compose.yml down --remove-orphans 2>$null
    docker-compose -f docker-compose.prod.yml down --remove-orphans 2>$null
    docker-compose -f docker-compose.complete.yml down --remove-orphans 2>$null
    
    Write-ColorOutput $Green "✅ Servicios detenidos"
}

function Clean-Docker {
    Write-ColorOutput $Yellow "`nLimpiando Docker..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful!)
    # docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    Write-ColorOutput $Green "✅ Limpieza completada"
}

function Build-Images {
    Write-ColorOutput $Yellow "`nConstruyendo imagenes..."
    
    # Build backend
    Write-ColorOutput $Blue "Construyendo Backend..."
    docker build -t surfschool-backend:latest ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput $Red "❌ Error construyendo backend"
        exit 1
    }
    
    # Build frontend
    Write-ColorOutput $Blue "Construyendo Frontend..."
    docker build -t surfschool-frontend:latest ./frontend
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput $Red "❌ Error construyendo frontend"
        exit 1
    }
    
    Write-ColorOutput $Green "Imagenes construidas exitosamente"
}

function Start-Development {
    Write-ColorOutput $Yellow "`n🚀 Iniciando modo desarrollo..."
    
    # Copy environment file
    if (Test-Path ".env.docker") {
        Copy-Item ".env.docker" ".env"
        Write-ColorOutput $Green "✅ Variables de entorno configuradas"
    }
    
    # Start basic services
    docker-compose -f docker-compose.yml up -d postgres redis
    
    Write-ColorOutput $Blue "⏳ Esperando que la base de datos esté lista..."
    Start-Sleep -Seconds 10
    
    # Start application services
    docker-compose -f docker-compose.yml up -d
    
    Write-ColorOutput $Green "`n✅ Servicios iniciados en modo desarrollo"
    Show-Services
}

function Start-Production {
    Write-ColorOutput $Yellow "`n🚀 Iniciando modo producción..."
    
    # Use production compose file
    $composeFile = "docker-compose.complete.yml"
    
    if ($WhatsApp) {
        Write-ColorOutput $Blue "📱 Incluyendo servicios de WhatsApp..."
        docker-compose -f $composeFile --profile whatsapp up -d
    } else {
        docker-compose -f $composeFile up -d postgres redis backend frontend nginx
    }
    
    Write-ColorOutput $Green "`n✅ Servicios iniciados en modo producción"
    Show-Services
}

function Start-Full {
    Write-ColorOutput $Yellow "`n🚀 Iniciando todos los servicios..."
    
    docker-compose -f docker-compose.complete.yml --profile whatsapp up -d
    
    Write-ColorOutput $Green "`n✅ Todos los servicios iniciados"
    Show-Services
}

function Show-Services {
    Write-ColorOutput $Cyan "`n📋 ESTADO DE SERVICIOS:"
    docker-compose ps
    
    Write-ColorOutput $Cyan "`n🌐 ENLACES DISPONIBLES:"
    Write-ColorOutput $Blue "   Frontend:     http://localhost:3000"
    Write-ColorOutput $Blue "   Backend API:  http://localhost:4000"
    Write-ColorOutput $Blue "   Database:     localhost:5432"
    Write-ColorOutput $Blue "   Redis:        localhost:6379"
    
    if ($WhatsApp -or $Mode -eq "full") {
        Write-ColorOutput $Blue "   WhatsApp API: http://localhost:8080"
    }
    
    if ($Mode -eq "prod" -or $Mode -eq "full") {
        Write-ColorOutput $Blue "   Nginx:        http://localhost:80"
    }
}

function Show-Logs {
    Write-ColorOutput $Yellow "`n📋 Mostrando logs..."
    docker-compose logs -f --tail=100
}

function Show-Help {
    Write-ColorOutput $Cyan @"

🏄 SURF SCHOOL - DOCKER DEPLOYMENT SCRIPT

USAGE:
    .\docker-deploy.ps1 [OPTIONS]

OPTIONS:
    -Mode <dev|prod|full>   Modo de despliegue (default: dev)
    -Build                  Construir imágenes antes de iniciar
    -Clean                  Limpiar Docker antes de iniciar
    -Logs                   Mostrar logs de los servicios
    -Stop                   Detener todos los servicios
    -WhatsApp              Incluir servicios de WhatsApp
    -Help                   Mostrar esta ayuda

EXAMPLES:
    .\docker-deploy.ps1                          # Modo desarrollo básico
    .\docker-deploy.ps1 -Mode prod               # Modo producción
    .\docker-deploy.ps1 -Mode full -WhatsApp     # Todos los servicios
    .\docker-deploy.ps1 -Build -Clean            # Limpiar y construir
    .\docker-deploy.ps1 -Stop                    # Detener servicios
    .\docker-deploy.ps1 -Logs                    # Ver logs

MODES:
    dev     - PostgreSQL, Redis, Backend, Frontend (desarrollo)
    prod    - Todos los servicios + Nginx (producción)
    full    - Todos los servicios incluyendo WhatsApp

"@
}

# ===============================================
# MAIN EXECUTION
# ===============================================

Show-Header

# Show help if requested
if ($Help) {
    Show-Help
    exit 0
}

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
        Write-ColorOutput $Red "❌ Modo inválido: $Mode"
        Show-Help
        exit 1
    }
}

Write-ColorOutput $Green "`n🎉 Despliegue completado exitosamente!"
Write-ColorOutput $Yellow "`nPara ver logs: .\docker-deploy.ps1 -Logs"
Write-ColorOutput $Yellow "Para detener:  .\docker-deploy.ps1 -Stop"
Write-ColorOutput $Cyan "`n===============================================`n"