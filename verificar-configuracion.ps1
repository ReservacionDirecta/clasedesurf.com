# Script para verificar la configuración antes de iniciar
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO CONFIGURACIÓN DEL SISTEMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Verificando puertos..." -ForegroundColor Yellow

# Verificar puerto 3000 (Frontend)
$port3000 = netstat -ano | findstr ":3000"
if ($port3000) {
    Write-Host "   Puerto 3000: OCUPADO" -ForegroundColor Red
    Write-Host "   $port3000" -ForegroundColor Gray
} else {
    Write-Host "   Puerto 3000: LIBRE" -ForegroundColor Green
}

# Verificar puerto 4000 (Backend)
$port4000 = netstat -ano | findstr ":4000"
if ($port4000) {
    Write-Host "   Puerto 4000: OCUPADO" -ForegroundColor Red
    Write-Host "   $port4000" -ForegroundColor Gray
} else {
    Write-Host "   Puerto 4000: LIBRE" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Verificando configuración del backend..." -ForegroundColor Yellow

# Verificar archivo server.ts
$serverConfig = Get-Content "backend/src/server.ts" | Select-String "const port"
Write-Host "   Configuración del puerto: $($serverConfig.Line.Trim())" -ForegroundColor Gray

Write-Host ""
Write-Host "3. Verificando configuración del frontend..." -ForegroundColor Yellow

# Verificar .env.local
if (Test-Path "frontend/.env.local") {
    $backendUrl = Get-Content "frontend/.env.local" | Select-String "NEXT_PUBLIC_BACKEND_URL"
    Write-Host "   Backend URL: $($backendUrl.Line.Trim())" -ForegroundColor Gray
} else {
    Write-Host "   ERROR: frontend/.env.local no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Verificando dependencias..." -ForegroundColor Yellow

# Verificar node_modules del backend
if (Test-Path "backend/node_modules") {
    Write-Host "   Backend node_modules: OK" -ForegroundColor Green
} else {
    Write-Host "   Backend node_modules: FALTA (ejecutar npm install)" -ForegroundColor Red
}

# Verificar node_modules del frontend
if (Test-Path "frontend/node_modules") {
    Write-Host "   Frontend node_modules: OK" -ForegroundColor Green
} else {
    Write-Host "   Frontend node_modules: FALTA (ejecutar npm install)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTRUCCIONES PARA INICIAR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "TERMINAL 1 - Backend:" -ForegroundColor Yellow
Write-Host "cd backend" -ForegroundColor White
Write-Host "npm run start" -ForegroundColor White
Write-Host ""
Write-Host "TERMINAL 2 - Frontend:" -ForegroundColor Yellow
Write-Host "cd frontend" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "ACCEDER AL SISTEMA:" -ForegroundColor Yellow
Write-Host "http://localhost:3000" -ForegroundColor White
Write-Host "Login: admin@escuela.com / admin123" -ForegroundColor White
Write-Host ""