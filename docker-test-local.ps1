# Script para probar imágenes Docker localmente
param(
    [string]$Tag = "latest",
    [string]$Registry = "clasedesurf",
    [int]$BackendPort = 4000,
    [int]$FrontendPort = 3000,
    [string]$DatabaseUrl = "postgresql://postgres:postgres@localhost:5432/clasedesurf",
    [switch]$Stop = $false,
    [switch]$Logs = $false
)

$backendImage = "$Registry/clasedesurf-backend:$Tag"
$frontendImage = "$Registry/clasedesurf-frontend:$Tag"
$backendContainer = "clasedesurf-backend-test"
$frontendContainer = "clasedesurf-frontend-test"

if ($Stop) {
    Write-Host "🛑 Deteniendo contenedores de prueba..." -ForegroundColor Yellow
    
    docker stop $backendContainer $frontendContainer 2>$null
    docker rm $backendContainer $frontendContainer 2>$null
    
    Write-Host "✅ Contenedores detenidos y eliminados" -ForegroundColor Green
    exit 0
}

if ($Logs) {
    Write-Host "📋 Mostrando logs de contenedores..." -ForegroundColor Yellow
    Write-Host "Backend logs:" -ForegroundColor Cyan
    docker logs $backendContainer --tail 20
    Write-Host "" -ForegroundColor White
    Write-Host "Frontend logs:" -ForegroundColor Cyan
    docker logs $frontendContainer --tail 20
    exit 0
}

Write-Host "🧪 Probando imágenes Docker localmente..." -ForegroundColor Green

# Verificar que las imágenes existan
Write-Host "🔍 Verificando imágenes..." -ForegroundColor Yellow

$backendExists = docker images -q $backendImage
$frontendExists = docker images -q $frontendImage

if (-not $backendExists) {
    Write-Host "❌ Imagen del backend no encontrada: $backendImage" -ForegroundColor Red
    Write-Host "💡 Construye la imagen primero: ./docker-build-local.ps1 -Backend" -ForegroundColor Yellow
    exit 1
}

if (-not $frontendExists) {
    Write-Host "❌ Imagen del frontend no encontrada: $frontendImage" -ForegroundColor Red
    Write-Host "💡 Construye la imagen primero: ./docker-build-local.ps1 -Frontend" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Imágenes encontradas" -ForegroundColor Green

# Detener contenedores existentes si están corriendo
Write-Host "🧹 Limpiando contenedores existentes..." -ForegroundColor Yellow
docker stop $backendContainer $frontendContainer 2>$null
docker rm $backendContainer $frontendContainer 2>$null

# Generar secretos para prueba
$jwtSecret = -join ((1..32) | ForEach {Get-Random -input ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9'))})
$nextAuthSecret = -join ((1..32) | ForEach {Get-Random -input ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9'))})

# Iniciar Backend
Write-Host "🚀 Iniciando Backend en puerto $BackendPort..." -ForegroundColor Yellow

$backendEnvVars = @(
    "-e", "DATABASE_URL=$DatabaseUrl",
    "-e", "PORT=$BackendPort",
    "-e", "NODE_ENV=production",
    "-e", "JWT_SECRET=$jwtSecret",
    "-e", "JWT_REFRESH_SECRET=$jwtSecret",
    "-e", "FRONTEND_URL=http://localhost:$FrontendPort"
)

docker run -d --name $backendContainer -p "${BackendPort}:${BackendPort}" @backendEnvVars $backendImage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error iniciando backend" -ForegroundColor Red
    exit 1
}

# Esperar a que el backend esté listo
Write-Host "⏳ Esperando a que el backend esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

do {
    Start-Sleep -Seconds 2
    $attempt++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$BackendPort/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend está listo" -ForegroundColor Green
            break
        }
    } catch {
        # Continuar intentando
    }
    
    if ($attempt -ge $maxAttempts) {
        Write-Host "❌ Timeout esperando al backend" -ForegroundColor Red
        Write-Host "📋 Logs del backend:" -ForegroundColor Yellow
        docker logs $backendContainer --tail 10
        exit 1
    }
    
    Write-Host "⏳ Intento $attempt/$maxAttempts..." -ForegroundColor Gray
} while ($true)

# Iniciar Frontend
Write-Host "🚀 Iniciando Frontend en puerto $FrontendPort..." -ForegroundColor Yellow

$frontendEnvVars = @(
    "-e", "NEXT_PUBLIC_API_URL=http://localhost:$BackendPort",
    "-e", "NEXT_PUBLIC_BACKEND_URL=http://localhost:$BackendPort",
    "-e", "BACKEND_URL=http://localhost:$BackendPort",
    "-e", "NEXTAUTH_URL=http://localhost:$FrontendPort",
    "-e", "NEXTAUTH_SECRET=$nextAuthSecret",
    "-e", "NODE_ENV=production",
    "-e", "PORT=$FrontendPort"
)

docker run -d --name $frontendContainer -p "${FrontendPort}:${FrontendPort}" @frontendEnvVars $frontendImage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error iniciando frontend" -ForegroundColor Red
    exit 1
}

# Esperar a que el frontend esté listo
Write-Host "⏳ Esperando a que el frontend esté listo..." -ForegroundColor Yellow
$attempt = 0

do {
    Start-Sleep -Seconds 3
    $attempt++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$FrontendPort" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend está listo" -ForegroundColor Green
            break
        }
    } catch {
        # Continuar intentando
    }
    
    if ($attempt -ge $maxAttempts) {
        Write-Host "❌ Timeout esperando al frontend" -ForegroundColor Red
        Write-Host "📋 Logs del frontend:" -ForegroundColor Yellow
        docker logs $frontendContainer --tail 10
        exit 1
    }
    
    Write-Host "⏳ Intento $attempt/$maxAttempts..." -ForegroundColor Gray
} while ($true)

# Verificar endpoints
Write-Host "🔍 Verificando endpoints..." -ForegroundColor Yellow

function Test-Endpoint {
    param($Url, $Name)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name - OK" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  $Name - Status: $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ $Name - Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

$backendHealth = Test-Endpoint "http://localhost:$BackendPort/health" "Backend Health"
$frontendMain = Test-Endpoint "http://localhost:$FrontendPort" "Frontend Main"

Write-Host "" -ForegroundColor White
Write-Host "🎉 ¡Contenedores iniciados exitosamente!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "🌐 URLs de prueba:" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:$BackendPort" -ForegroundColor White
Write-Host "Frontend: http://localhost:$FrontendPort" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📋 Comandos útiles:" -ForegroundColor Cyan
Write-Host "Ver logs:     ./docker-test-local.ps1 -Logs" -ForegroundColor White
Write-Host "Detener:      ./docker-test-local.ps1 -Stop" -ForegroundColor White
Write-Host "Logs backend: docker logs $backendContainer -f" -ForegroundColor White
Write-Host "Logs frontend:docker logs $frontendContainer -f" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🧪 Prueba la aplicación en tu navegador:" -ForegroundColor Green
Write-Host "http://localhost:$FrontendPort" -ForegroundColor Cyan