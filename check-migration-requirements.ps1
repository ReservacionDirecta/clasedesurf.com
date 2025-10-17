# ============================================
# VERIFICAR REQUISITOS PARA MIGRACION
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   VERIFICACION DE REQUISITOS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$allOk = $true

# Verificar psql
Write-Host "Verificando PostgreSQL Client (psql)..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK psql instalado: $psqlVersion" -ForegroundColor Green
    } else {
        throw "psql no encontrado"
    }
} catch {
    Write-Host "  ERROR psql NO esta instalado" -ForegroundColor Red
    Write-Host "    Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    $allOk = $false
}

Write-Host ""

# Verificar pg_dump
Write-Host "Verificando pg_dump..." -ForegroundColor Yellow
try {
    $pgdumpVersion = pg_dump --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK pg_dump instalado: $pgdumpVersion" -ForegroundColor Green
    } else {
        throw "pg_dump no encontrado"
    }
} catch {
    Write-Host "  ERROR pg_dump NO esta instalado" -ForegroundColor Red
    Write-Host "    Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    $allOk = $false
}

Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK Node.js instalado: $nodeVersion" -ForegroundColor Green
    } else {
        throw "node no encontrado"
    }
} catch {
    Write-Host "  ERROR Node.js NO esta instalado" -ForegroundColor Red
    Write-Host "    Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    $allOk = $false
}

Write-Host ""

# Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK npm instalado: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm no encontrado"
    }
} catch {
    Write-Host "  ERROR npm NO esta instalado" -ForegroundColor Red
    $allOk = $false
}

Write-Host ""

# Verificar Prisma en backend
Write-Host "Verificando Prisma..." -ForegroundColor Yellow
if (Test-Path "backend/node_modules/.bin/prisma") {
    Write-Host "  OK Prisma instalado en backend" -ForegroundColor Green
} else {
    Write-Host "  ADVERTENCIA Prisma no encontrado en backend" -ForegroundColor Yellow
    Write-Host "    Ejecuta: cd backend && npm install" -ForegroundColor Yellow
    $allOk = $false
}

Write-Host ""

# Verificar conexion a base de datos local
Write-Host "Verificando conexion a base de datos local..." -ForegroundColor Yellow
$env:PGPASSWORD = "surfschool_secure_password_2024"
$testLocal = psql -h localhost -p 5432 -U postgres -d "clasedesurf.com" -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK Conexion exitosa a base de datos local" -ForegroundColor Green
} else {
    Write-Host "  ERROR No se pudo conectar a la base de datos local" -ForegroundColor Red
    Write-Host "    Verifica que PostgreSQL este corriendo" -ForegroundColor Yellow
    Write-Host "    Verifica las credenciales en .env" -ForegroundColor Yellow
    $allOk = $false
}

Write-Host ""

# Verificar conexion a Railway
Write-Host "Verificando conexion a Railway..." -ForegroundColor Yellow
$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
$testRailway = psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK Conexion exitosa a Railway" -ForegroundColor Green
} else {
    Write-Host "  ERROR No se pudo conectar a Railway" -ForegroundColor Red
    Write-Host "    Verifica tu conexion a internet" -ForegroundColor Yellow
    Write-Host "    Verifica que las credenciales sean correctas" -ForegroundColor Yellow
    $allOk = $false
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

if ($allOk) {
    Write-Host ""
    Write-Host "OK TODOS LOS REQUISITOS CUMPLIDOS" -ForegroundColor Green
    Write-Host ""
    Write-Host "Puedes proceder con la migracion:" -ForegroundColor White
    Write-Host "  .\safe-migration-railway.ps1" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR FALTAN ALGUNOS REQUISITOS" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instala las herramientas faltantes antes de continuar" -ForegroundColor Yellow
    Write-Host ""
}
