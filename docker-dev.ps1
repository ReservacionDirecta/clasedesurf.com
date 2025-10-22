# ============================================
# DESARROLLO LOCAL CON DOCKER
# ============================================

param(
    [string]$Action = "up"
)

$ErrorActionPreference = "Stop"

# Colores
function Write-Color {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Color "============================================" "Cyan"
    Write-Color $Message "Cyan"
    Write-Color "============================================" "Cyan"
    Write-Host ""
}

# Verificar que Docker esté corriendo
Write-Header "Verificando Docker"
try {
    docker version | Out-Null
    Write-Color "✅ Docker está corriendo" "Green"
} catch {
    Write-Color "❌ Docker no está corriendo. Por favor inicia Docker Desktop." "Red"
    exit 1
}

switch ($Action.ToLower()) {
    "up" {
        Write-Header "Iniciando clasesde.pe en modo desarrollo"
        Write-Color "🚀 Construyendo e iniciando servicios..." "Yellow"
        docker-compose up --build -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Color "✅ Servicios iniciados exitosamente" "Green"
            Write-Host ""
            Write-Color "📱 Aplicación disponible en:" "Cyan"
            Write-Color "   Frontend: http://localhost:3000" "White"
            Write-Color "   Backend:  http://localhost:4000" "White"
            Write-Color "   Database: localhost:5432" "White"
            Write-Host ""
            Write-Color "📋 Comandos útiles:" "Cyan"
            Write-Color "   Ver logs:    docker-compose logs -f" "White"
            Write-Color "   Parar:       .\docker-dev.ps1 down" "White"
            Write-Color "   Reiniciar:   .\docker-dev.ps1 restart" "White"
        } else {
            Write-Color "❌ Error al iniciar servicios" "Red"
            exit 1
        }
    }
    
    "down" {
        Write-Header "Deteniendo servicios"
        docker-compose down
        Write-Color "✅ Servicios detenidos" "Green"
    }
    
    "restart" {
        Write-Header "Reiniciando servicios"
        docker-compose restart
        Write-Color "✅ Servicios reiniciados" "Green"
    }
    
    "logs" {
        Write-Header "Mostrando logs"
        docker-compose logs -f
    }
    
    "clean" {
        Write-Header "Limpiando contenedores y volúmenes"
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Color "✅ Limpieza completada" "Green"
    }
    
    default {
        Write-Header "Uso del script"
        Write-Color "Comandos disponibles:" "Cyan"
        Write-Color "  .\docker-dev.ps1 up       - Iniciar servicios" "White"
        Write-Color "  .\docker-dev.ps1 down     - Detener servicios" "White"
        Write-Color "  .\docker-dev.ps1 restart  - Reiniciar servicios" "White"
        Write-Color "  .\docker-dev.ps1 logs     - Ver logs" "White"
        Write-Color "  .\docker-dev.ps1 clean    - Limpiar todo" "White"
    }
}