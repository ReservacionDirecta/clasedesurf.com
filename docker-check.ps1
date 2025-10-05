# Script para verificar el estado de la aplicación Docker

Write-Host "`n=== SURF SCHOOL - VERIFICACIÓN DE SERVICIOS ===`n" -ForegroundColor Cyan

# Verificar Docker
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker no está instalado o no está corriendo" -ForegroundColor Red
    exit 1
}

# Verificar servicios
Write-Host "`n2. Verificando servicios Docker..." -ForegroundColor Yellow
try {
    $services = docker-compose -f docker-compose.full.yml ps --format "table {{.Name}}\t{{.Status}}"
    Write-Host $services -ForegroundColor White
} catch {
    Write-Host "   ❌ Error al verificar servicios" -ForegroundColor Red
}

# Verificar conectividad
Write-Host "`n3. Verificando conectividad..." -ForegroundColor Yellow

# Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "   ✅ Frontend (Next.js): http://localhost:3000 - Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend no responde en http://localhost:3000" -ForegroundColor Red
}

# Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "   ✅ Backend (Node.js): http://localhost:4000 - Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend no responde en http://localhost:4000/health" -ForegroundColor Red
}

# Nginx
try {
    $response = Invoke-WebRequest -Uri "http://localhost:80" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "   ✅ Nginx (Proxy): http://localhost:80 - Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Nginx no responde en http://localhost:80" -ForegroundColor Red
}

# PostgreSQL
Write-Host "`n4. Verificando base de datos..." -ForegroundColor Yellow
try {
    $pgResult = docker exec surfschool-postgres pg_isready -U postgres
    if ($pgResult -like "*accepting connections*") {
        Write-Host "   ✅ PostgreSQL: localhost:5432 - Conectado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ PostgreSQL: No está listo" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error al verificar PostgreSQL" -ForegroundColor Red
}

# Redis
Write-Host "`n5. Verificando Redis..." -ForegroundColor Yellow
try {
    $redisResult = docker exec surfschool-redis redis-cli ping
    if ($redisResult -eq "PONG") {
        Write-Host "   ✅ Redis: localhost:6379 - Conectado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Redis: No responde" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error al verificar Redis" -ForegroundColor Red
}

# Resumen
Write-Host "`n=== RESUMEN ===`n" -ForegroundColor Cyan
Write-Host "🌐 Aplicación principal: http://localhost:3000" -ForegroundColor White
Write-Host "🔧 API Backend: http://localhost:4000" -ForegroundColor White
Write-Host "⚡ Nginx Proxy: http://localhost:80" -ForegroundColor White
Write-Host "🗄️  Base de datos: localhost:5432" -ForegroundColor White
Write-Host "🚀 Cache Redis: localhost:6379" -ForegroundColor White

Write-Host "`n📊 Para ver logs:" -ForegroundColor Yellow
Write-Host "   docker-compose -f docker-compose.full.yml logs -f" -ForegroundColor Gray

Write-Host "`n🛑 Para detener:" -ForegroundColor Yellow
Write-Host "   docker-stop.bat" -ForegroundColor Gray

Write-Host "`n===============================================`n" -ForegroundColor Cyan