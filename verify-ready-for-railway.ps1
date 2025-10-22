# Script para verificar que todo está listo para desplegar en Railway

Write-Host "🔍 Verificando preparación para Railway..." -ForegroundColor Green
Write-Host ""

$allGood = $true

# 1. Verificar que existan los archivos de configuración
Write-Host "📁 Verificando archivos de configuración..." -ForegroundColor Cyan

$requiredFiles = @(
    "railway.json",
    "backend/railway.json",
    "frontend/railway.json",
    "backend/package.json",
    "frontend/package.json",
    "backend/prisma/schema.prisma"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file NO ENCONTRADO" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# 2. Verificar que existan los secrets
Write-Host "🔐 Verificando secrets..." -ForegroundColor Cyan

if (Test-Path "railway-secrets.txt") {
    Write-Host "  ✅ railway-secrets.txt existe" -ForegroundColor Green
    
    $secrets = Get-Content "railway-secrets.txt" -Raw
    if ($secrets -match "JWT_SECRET=\w{64}") {
        Write-Host "  ✅ JWT_SECRET generado" -ForegroundColor Green
    } else {
        Write-Host "  ❌ JWT_SECRET no válido" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($secrets -match "JWT_REFRESH_SECRET=\w{64}") {
        Write-Host "  ✅ JWT_REFRESH_SECRET generado" -ForegroundColor Green
    } else {
        Write-Host "  ❌ JWT_REFRESH_SECRET no válido" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($secrets -match "NEXTAUTH_SECRET=\w{64}") {
        Write-Host "  ✅ NEXTAUTH_SECRET generado" -ForegroundColor Green
    } else {
        Write-Host "  ❌ NEXTAUTH_SECRET no válido" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  ❌ railway-secrets.txt NO ENCONTRADO" -ForegroundColor Red
    Write-Host "  💡 Ejecuta: node generate-secrets.js" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# 3. Verificar estado de migraciones en Railway
Write-Host "🗄️  Verificando migraciones en Railway..." -ForegroundColor Cyan

$env:DATABASE_URL = "postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

try {
    $migrateStatus = npx prisma migrate status 2>&1
    
    if ($migrateStatus -match "Database schema is up to date") {
        Write-Host "  ✅ Migraciones aplicadas en Railway" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Migraciones pendientes en Railway" -ForegroundColor Yellow
        Write-Host "  💡 Ejecuta: npx prisma migrate deploy" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Error verificando migraciones" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# 4. Verificar que haya datos en Railway
Write-Host "📊 Verificando datos en Railway..." -ForegroundColor Cyan
Write-Host "  ℹ️  Verifica manualmente con: node backend/seed-test-data.js" -ForegroundColor Gray

Write-Host ""

# 5. Verificar .gitignore
Write-Host "🔒 Verificando .gitignore..." -ForegroundColor Cyan

$gitignore = Get-Content ".gitignore" -Raw

$sensitiveFiles = @(
    "railway-secrets.txt",
    "export_local_*.sql",
    ".env"
)

foreach ($pattern in $sensitiveFiles) {
    if ($gitignore -match [regex]::Escape($pattern)) {
        Write-Host "  ✅ $pattern en .gitignore" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $pattern NO está en .gitignore" -ForegroundColor Yellow
    }
}

Write-Host ""

# 6. Verificar que no haya archivos sensibles en Git
Write-Host "🔍 Verificando archivos sensibles..." -ForegroundColor Cyan

$sensitiveInGit = @()

if (Test-Path "railway-secrets.txt") {
    $gitStatus = git ls-files railway-secrets.txt 2>&1
    if ($gitStatus -match "railway-secrets.txt") {
        $sensitiveInGit += "railway-secrets.txt"
    }
}

$sqlFiles = Get-ChildItem -Filter "export_local_*.sql" -ErrorAction SilentlyContinue
foreach ($file in $sqlFiles) {
    $gitStatus = git ls-files $file.Name 2>&1
    if ($gitStatus -match $file.Name) {
        $sensitiveInGit += $file.Name
    }
}

if ($sensitiveInGit.Count -eq 0) {
    Write-Host "  ✅ No hay archivos sensibles en Git" -ForegroundColor Green
} else {
    Write-Host "  ❌ Archivos sensibles encontrados en Git:" -ForegroundColor Red
    foreach ($file in $sensitiveInGit) {
        Write-Host "    - $file" -ForegroundColor Red
    }
    Write-Host "  💡 Ejecuta: git rm --cached $file" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Resumen final
Write-Host "═══════════════════════════════════════════" -ForegroundColor White
if ($allGood) {
    Write-Host "✅ TODO LISTO PARA DESPLEGAR EN RAILWAY" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Ve a Railway Dashboard: https://railway.app/dashboard" -ForegroundColor White
    Write-Host "2. Crea un nuevo proyecto desde GitHub" -ForegroundColor White
    Write-Host "3. Configura Backend y Frontend según DEPLOY_RAILWAY.md" -ForegroundColor White
    Write-Host "4. Copia los secrets desde railway-secrets.txt" -ForegroundColor White
    Write-Host "5. Verifica el despliegue con CHECKLIST_RAILWAY.md" -ForegroundColor White
} else {
    Write-Host "⚠️  HAY PROBLEMAS QUE RESOLVER" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Por favor, corrige los errores marcados arriba antes de desplegar." -ForegroundColor White
}
Write-Host "═══════════════════════════════════════════" -ForegroundColor White
