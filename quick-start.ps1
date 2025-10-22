# 🚀 Script de Inicio Rápido - Clasedesurf.com
# Este script te guía desde cero hasta tener la aplicación funcionando en Railway

param(
    [switch]$SkipPrerequisites = $false,
    [switch]$SkipLocalTest = $false,
    [switch]$AutoDeploy = $false
)

Write-Host "🏄‍♂️ ¡Bienvenido a Clasedesurf.com!" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor White
Write-Host "Este script te ayudará a configurar y desplegar la aplicación completa." -ForegroundColor White
Write-Host "" -ForegroundColor White

# Función para verificar comandos
function Test-Command {
    param([string]$Command)
    try {
        & $Command --version 2>$null | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Función para solicitar input del usuario
function Get-UserInput {
    param([string]$Prompt, [string]$Default = "")
    
    if ($Default) {
        $input = Read-Host "$Prompt (default: $Default)"
        if ([string]::IsNullOrWhiteSpace($input)) {
            return $Default
        }
        return $input
    } else {
        return Read-Host $Prompt
    }
}

# Paso 1: Verificar prerrequisitos
if (-not $SkipPrerequisites) {
    Write-Host "📋 Paso 1: Verificando prerrequisitos..." -ForegroundColor Yellow
    
    $prerequisites = @{
        "docker" = "Docker"
        "node" = "Node.js"
        "npm" = "NPM"
    }
    
    $missingPrereqs = @()
    
    foreach ($cmd in $prerequisites.Keys) {
        if (Test-Command $cmd) {
            Write-Host "✅ $($prerequisites[$cmd]) encontrado" -ForegroundColor Green
        } else {
            Write-Host "❌ $($prerequisites[$cmd]) no encontrado" -ForegroundColor Red
            $missingPrereqs += $prerequisites[$cmd]
        }
    }
    
    if ($missingPrereqs.Count -gt 0) {
        Write-Host "" -ForegroundColor White
        Write-Host "⚠️  Faltan prerrequisitos:" -ForegroundColor Yellow
        foreach ($prereq in $missingPrereqs) {
            Write-Host "   - $prereq" -ForegroundColor Red
        }
        Write-Host "" -ForegroundColor White
        Write-Host "📥 Instala los prerrequisitos faltantes:" -ForegroundColor Cyan
        Write-Host "   Docker: https://docs.docker.com/get-docker/" -ForegroundColor White
        Write-Host "   Node.js: https://nodejs.org/" -ForegroundColor White
        Write-Host "" -ForegroundColor White
        
        $continue = Read-Host "¿Continuar de todos modos? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Host "❌ Instalación cancelada" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "✅ Prerrequisitos verificados" -ForegroundColor Green
} else {
    Write-Host "⏭️  Saltando verificación de prerrequisitos" -ForegroundColor Yellow
}

# Paso 2: Configuración inicial
Write-Host "" -ForegroundColor White
Write-Host "⚙️  Paso 2: Configuración inicial..." -ForegroundColor Yellow

Write-Host "Vamos a configurar algunos parámetros básicos:" -ForegroundColor White

$registry = Get-UserInput "Registry de Docker" "clasedesurf"
$tag = Get-UserInput "Tag para las imágenes" "latest"

Write-Host "" -ForegroundColor White
Write-Host "📊 Configuración:" -ForegroundColor Cyan
Write-Host "Registry: $registry" -ForegroundColor White
Write-Host "Tag: $tag" -ForegroundColor White

# Paso 3: Instalar dependencias
Write-Host "" -ForegroundColor White
Write-Host "📦 Paso 3: Instalando dependencias..." -ForegroundColor Yellow

Write-Host "Instalando dependencias del backend..." -ForegroundColor Gray
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias del backend" -ForegroundColor Red
    exit 1
}

Write-Host "Instalando dependencias del frontend..." -ForegroundColor Gray
Set-Location ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias del frontend" -ForegroundColor Red
    exit 1
}

Set-Location ..
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

# Paso 4: Construir imágenes Docker
Write-Host "" -ForegroundColor White
Write-Host "🐳 Paso 4: Construyendo imágenes Docker..." -ForegroundColor Yellow

& ./docker-build-local.ps1 -Registry $registry -Tag $tag -All

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error construyendo imágenes Docker" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Imágenes Docker construidas exitosamente" -ForegroundColor Green

# Paso 5: Pruebas locales (opcional)
if (-not $SkipLocalTest) {
    Write-Host "" -ForegroundColor White
    Write-Host "🧪 Paso 5: Probando aplicación localmente..." -ForegroundColor Yellow
    
    $testLocal = Read-Host "¿Quieres probar la aplicación localmente antes de desplegar? (Y/n)"
    
    if ($testLocal -ne "n" -and $testLocal -ne "N") {
        Write-Host "Iniciando pruebas locales..." -ForegroundColor Gray
        
        & ./docker-test-local.ps1 -Registry $registry -Tag $tag
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Pruebas locales exitosas" -ForegroundColor Green
            Write-Host "" -ForegroundColor White
            Write-Host "🌐 La aplicación está corriendo en:" -ForegroundColor Cyan
            Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
            Write-Host "   Backend:  http://localhost:4000" -ForegroundColor White
            Write-Host "" -ForegroundColor White
            
            $continueTest = Read-Host "Prueba la aplicación y presiona Enter para continuar con el despliegue..."
            
            # Detener contenedores de prueba
            Write-Host "Deteniendo contenedores de prueba..." -ForegroundColor Gray
            & ./docker-test-local.ps1 -Stop
        } else {
            Write-Host "⚠️  Problemas en las pruebas locales" -ForegroundColor Yellow
            $continueDeploy = Read-Host "¿Continuar con el despliegue de todos modos? (y/N)"
            if ($continueDeploy -ne "y" -and $continueDeploy -ne "Y") {
                Write-Host "❌ Despliegue cancelado" -ForegroundColor Red
                exit 1
            }
        }
    }
} else {
    Write-Host "⏭️  Saltando pruebas locales" -ForegroundColor Yellow
}

# Paso 6: Configurar Railway
Write-Host "" -ForegroundColor White
Write-Host "🚂 Paso 6: Configurando Railway..." -ForegroundColor Yellow

# Verificar Railway CLI
if (-not (Test-Command "railway")) {
    Write-Host "❌ Railway CLI no encontrado" -ForegroundColor Red
    Write-Host "📥 Instálalo con: npm install -g @railway/cli" -ForegroundColor Yellow
    
    $installRailway = Read-Host "¿Quieres instalarlo ahora? (Y/n)"
    if ($installRailway -ne "n" -and $installRailway -ne "N") {
        Write-Host "Instalando Railway CLI..." -ForegroundColor Gray
        npm install -g @railway/cli
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error instalando Railway CLI" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Railway CLI instalado" -ForegroundColor Green
    } else {
        Write-Host "❌ Railway CLI es necesario para continuar" -ForegroundColor Red
        exit 1
    }
}

# Verificar login en Railway
Write-Host "Verificando autenticación en Railway..." -ForegroundColor Gray
railway whoami 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "🔐 No estás logueado en Railway" -ForegroundColor Yellow
    Write-Host "Abriendo login de Railway..." -ForegroundColor Gray
    
    railway login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error en el login de Railway" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Railway configurado correctamente" -ForegroundColor Green

# Paso 7: Desplegar en Railway
Write-Host "" -ForegroundColor White
Write-Host "🚀 Paso 7: Desplegando en Railway..." -ForegroundColor Yellow

if (-not $AutoDeploy) {
    Write-Host "¿Estás listo para desplegar en Railway?" -ForegroundColor Cyan
    Write-Host "Esto creará los servicios y desplegará la aplicación." -ForegroundColor White
    
    $deploy = Read-Host "¿Continuar con el despliegue? (Y/n)"
    if ($deploy -eq "n" -or $deploy -eq "N") {
        Write-Host "❌ Despliegue cancelado por el usuario" -ForegroundColor Yellow
        Write-Host "💡 Puedes desplegar más tarde con: ./deploy-railway.ps1" -ForegroundColor Gray
        exit 0
    }
}

Write-Host "Iniciando despliegue..." -ForegroundColor Gray

& ./deploy-railway.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Despliegue completado" -ForegroundColor Green

# Paso 8: Configuración final
Write-Host "" -ForegroundColor White
Write-Host "⚙️  Paso 8: Configuración final..." -ForegroundColor Yellow

Write-Host "📋 Próximos pasos manuales:" -ForegroundColor Cyan
Write-Host "1. Ve a Railway Dashboard: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Configura las variables de entorno necesarias" -ForegroundColor White
Write-Host "3. Agrega PostgreSQL addon si no lo has hecho" -ForegroundColor White
Write-Host "4. Ejecuta las migraciones de base de datos" -ForegroundColor White
Write-Host "" -ForegroundColor White

$openDashboard = Read-Host "¿Abrir Railway Dashboard ahora? (Y/n)"
if ($openDashboard -ne "n" -and $openDashboard -ne "N") {
    Start-Process "https://railway.app/dashboard"
}

# Resumen final
Write-Host "" -ForegroundColor White
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
Write-Host "✅ Imágenes Docker construidas" -ForegroundColor Green
if (-not $SkipLocalTest) {
    Write-Host "✅ Pruebas locales realizadas" -ForegroundColor Green
}
Write-Host "✅ Aplicación desplegada en Railway" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "Ver logs:           railway logs" -ForegroundColor White
Write-Host "Variables:          railway variables" -ForegroundColor White
Write-Host "Ejecutar migración: railway run npx prisma migrate deploy" -ForegroundColor White
Write-Host "Verificar deploy:   ./verify-railway-deployment.ps1" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📚 Documentación:" -ForegroundColor Cyan
Write-Host "Guía completa:      RAILWAY_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "Variables de env:   RAILWAY_ENV_VARIABLES.md" -ForegroundColor White
Write-Host "Docker:             DOCKER_BUILD_GUIDE.md" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🏄‍♂️ ¡Tu marketplace de surf está listo!" -ForegroundColor Cyan