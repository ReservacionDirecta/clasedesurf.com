# Script de optimización Docker para Railway
param(
    [switch]$CleanAll = $false,
    [switch]$PruneImages = $false,
    [switch]$PruneContainers = $false,
    [switch]$PruneVolumes = $false,
    [switch]$PruneNetworks = $false,
    [switch]$OptimizeImages = $false,
    [switch]$AnalyzeSize = $false
)

Write-Host "🔧 Optimización Docker - Clasedesurf.com" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor White

# Función para mostrar tamaño en formato legible
function Format-FileSize {
    param([long]$Size)
    
    if ($Size -gt 1GB) {
        return "{0:N2} GB" -f ($Size / 1GB)
    } elseif ($Size -gt 1MB) {
        return "{0:N2} MB" -f ($Size / 1MB)
    } elseif ($Size -gt 1KB) {
        return "{0:N2} KB" -f ($Size / 1KB)
    } else {
        return "$Size bytes"
    }
}

# Función para obtener estadísticas de Docker
function Get-DockerStats {
    Write-Host "📊 Analizando uso de Docker..." -ForegroundColor Yellow
    
    try {
        # Obtener información del sistema Docker
        $dockerInfo = docker system df --format "table {{.Type}}\t{{.Total}}\t{{.Active}}\t{{.Size}}\t{{.Reclaimable}}"
        
        Write-Host "" -ForegroundColor White
        Write-Host "💾 Uso de espacio Docker:" -ForegroundColor Cyan
        Write-Host $dockerInfo -ForegroundColor White
        
        # Obtener espacio total usado
        $systemDf = docker system df -v 2>$null
        if ($systemDf) {
            Write-Host "" -ForegroundColor White
            Write-Host "📈 Detalles de uso:" -ForegroundColor Cyan
            Write-Host $systemDf -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️  Error obteniendo estadísticas: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Función para limpiar contenedores
function Clean-Containers {
    Write-Host "🧹 Limpiando contenedores..." -ForegroundColor Yellow
    
    # Contenedores detenidos
    $stoppedContainers = docker ps -aq --filter "status=exited"
    if ($stoppedContainers) {
        Write-Host "Eliminando contenedores detenidos..." -ForegroundColor Gray
        docker rm $stoppedContainers
        Write-Host "✅ Contenedores detenidos eliminados" -ForegroundColor Green
    } else {
        Write-Host "✅ No hay contenedores detenidos para eliminar" -ForegroundColor Green
    }
    
    # Contenedores huérfanos
    Write-Host "Eliminando contenedores huérfanos..." -ForegroundColor Gray
    docker container prune -f
}

# Función para limpiar imágenes
function Clean-Images {
    Write-Host "🖼️  Limpiando imágenes..." -ForegroundColor Yellow
    
    # Imágenes sin usar
    Write-Host "Eliminando imágenes sin usar..." -ForegroundColor Gray
    docker image prune -f
    
    # Imágenes colgantes (dangling)
    $danglingImages = docker images -f "dangling=true" -q
    if ($danglingImages) {
        Write-Host "Eliminando imágenes colgantes..." -ForegroundColor Gray
        docker rmi $danglingImages
        Write-Host "✅ Imágenes colgantes eliminadas" -ForegroundColor Green
    } else {
        Write-Host "✅ No hay imágenes colgantes" -ForegroundColor Green
    }
}

# Función para limpiar volúmenes
function Clean-Volumes {
    Write-Host "💽 Limpiando volúmenes..." -ForegroundColor Yellow
    
    Write-Host "Eliminando volúmenes sin usar..." -ForegroundColor Gray
    docker volume prune -f
    Write-Host "✅ Volúmenes limpiados" -ForegroundColor Green
}

# Función para limpiar redes
function Clean-Networks {
    Write-Host "🌐 Limpiando redes..." -ForegroundColor Yellow
    
    Write-Host "Eliminando redes sin usar..." -ForegroundColor Gray
    docker network prune -f
    Write-Host "✅ Redes limpiadas" -ForegroundColor Green
}

# Función para optimizar imágenes
function Optimize-Images {
    Write-Host "⚡ Optimizando imágenes de Clasedesurf..." -ForegroundColor Yellow
    
    $images = docker images "clasedesurf/*" --format "{{.Repository}}:{{.Tag}}"
    
    if ($images) {
        Write-Host "📋 Imágenes encontradas:" -ForegroundColor Cyan
        foreach ($image in $images) {
            $size = docker images $image --format "{{.Size}}"
            Write-Host "  $image - $size" -ForegroundColor White
        }
        
        Write-Host "" -ForegroundColor White
        Write-Host "💡 Sugerencias de optimización:" -ForegroundColor Cyan
        Write-Host "1. Usar .dockerignore para excluir archivos innecesarios" -ForegroundColor White
        Write-Host "2. Usar multi-stage builds (ya implementado)" -ForegroundColor White
        Write-Host "3. Limpiar caché de npm después de la instalación" -ForegroundColor White
        Write-Host "4. Usar imágenes base Alpine (ya implementado)" -ForegroundColor White
    } else {
        Write-Host "ℹ️  No se encontraron imágenes de Clasedesurf" -ForegroundColor Gray
    }
}

# Función para análisis detallado de tamaño
function Analyze-ImageSizes {
    Write-Host "🔍 Analizando tamaños de imágenes..." -ForegroundColor Yellow
    
    # Análisis de capas de imágenes
    $clasedesurfImages = docker images "clasedesurf/*" --format "{{.Repository}}:{{.Tag}}"
    
    foreach ($image in $clasedesurfImages) {
        Write-Host "" -ForegroundColor White
        Write-Host "📊 Análisis de $image:" -ForegroundColor Cyan
        
        try {
            # Obtener historial de la imagen
            $history = docker history $image --format "table {{.CreatedBy}}\t{{.Size}}" --no-trunc
            Write-Host $history -ForegroundColor Gray
        } catch {
            Write-Host "⚠️  No se pudo analizar $image" -ForegroundColor Yellow
        }
    }
}

# Verificar que Docker esté funcionando
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no encontrado o no está funcionando" -ForegroundColor Red
    exit 1
}

# Mostrar estadísticas iniciales
if ($AnalyzeSize -or $CleanAll) {
    Get-DockerStats
}

# Ejecutar limpieza según parámetros
if ($CleanAll) {
    Write-Host "" -ForegroundColor White
    Write-Host "🧹 Limpieza completa iniciada..." -ForegroundColor Yellow
    
    Clean-Containers
    Clean-Images
    Clean-Volumes
    Clean-Networks
    
    Write-Host "" -ForegroundColor White
    Write-Host "🎉 Limpieza completa terminada" -ForegroundColor Green
    
} else {
    if ($PruneContainers) {
        Clean-Containers
    }
    
    if ($PruneImages) {
        Clean-Images
    }
    
    if ($PruneVolumes) {
        Clean-Volumes
    }
    
    if ($PruneNetworks) {
        Clean-Networks
    }
}

if ($OptimizeImages) {
    Write-Host "" -ForegroundColor White
    Optimize-Images
}

if ($AnalyzeSize) {
    Write-Host "" -ForegroundColor White
    Analyze-ImageSizes
}

# Mostrar estadísticas finales
Write-Host "" -ForegroundColor White
Write-Host "📊 Estadísticas finales:" -ForegroundColor Cyan
Get-DockerStats

# Recomendaciones
Write-Host "" -ForegroundColor White
Write-Host "💡 Recomendaciones:" -ForegroundColor Cyan
Write-Host "1. Ejecuta limpieza regularmente: ./optimize-docker.ps1 -CleanAll" -ForegroundColor White
Write-Host "2. Monitorea el uso de espacio: docker system df" -ForegroundColor White
Write-Host "3. Usa .dockerignore para reducir contexto de build" -ForegroundColor White
Write-Host "4. Considera usar registry externo para imágenes de producción" -ForegroundColor White

Write-Host "" -ForegroundColor White
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "Limpieza completa:    ./optimize-docker.ps1 -CleanAll" -ForegroundColor White
Write-Host "Solo contenedores:    ./optimize-docker.ps1 -PruneContainers" -ForegroundColor White
Write-Host "Solo imágenes:        ./optimize-docker.ps1 -PruneImages" -ForegroundColor White
Write-Host "Análisis de tamaño:   ./optimize-docker.ps1 -AnalyzeSize" -ForegroundColor White
Write-Host "Optimizar imágenes:   ./optimize-docker.ps1 -OptimizeImages" -ForegroundColor White