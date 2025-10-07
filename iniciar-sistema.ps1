# Script para iniciar el sistema completo de reservas de surf
# Ejecutar desde la raiz del proyecto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INICIANDO SISTEMA DE RESERVAS DE SURF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "ERROR: No se encontraron las carpetas backend y frontend" -ForegroundColor Red
    Write-Host "Asegurate de ejecutar este script desde la carpeta raiz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "1. Verificando dependencias..." -ForegroundColor Yellow

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "   Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Node.js no esta instalado" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "   npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: npm no esta disponible" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Verificando archivos de configuracion..." -ForegroundColor Yellow

# Verificar .env files
if (Test-Path "backend/.env") {
    Write-Host "   backend/.env: OK" -ForegroundColor Green
} else {
    Write-Host "   WARNING: backend/.env no encontrado" -ForegroundColor Yellow
}

if (Test-Path "frontend/.env.local") {
    Write-Host "   frontend/.env.local: OK" -ForegroundColor Green
} else {
    Write-Host "   WARNING: frontend/.env.local no encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3. Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location backend
try {
    npm install --silent
    Write-Host "   Dependencias del backend instaladas" -ForegroundColor Green
} catch {
    Write-Host "   ERROR instalando dependencias del backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "4. Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location ../frontend
try {
    npm install --silent
    Write-Host "   Dependencias del frontend instaladas" -ForegroundColor Green
} catch {
    Write-Host "   ERROR instalando dependencias del frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "5. Verificando base de datos..." -ForegroundColor Yellow
Set-Location backend
try {
    npx prisma generate --silent
    Write-Host "   Cliente Prisma generado" -ForegroundColor Green
} catch {
    Write-Host "   WARNING: Error generando cliente Prisma" -ForegroundColor Yellow
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SISTEMA LISTO PARA INICIAR" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Abrir TERMINAL 1 y ejecutar:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Abrir TERMINAL 2 y ejecutar:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Acceder al sistema:" -ForegroundColor White
Write-Host "   URL: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Login: admin@escuela.com / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Probar endpoints:" -ForegroundColor White
Write-Host "   .\test-all-endpoints-clean.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "DOCUMENTACION:" -ForegroundColor Cyan
Write-Host "- GUIA_INICIO_RAPIDO.md" -ForegroundColor Gray
Write-Host "- RESUMEN_EJECUTIVO_FINAL.md" -ForegroundColor Gray
Write-Host "- SISTEMA_COMPLETO_IMPLEMENTADO.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Sistema de Reservas de Surf - LISTO!" -ForegroundColor Green
Write-Host ""