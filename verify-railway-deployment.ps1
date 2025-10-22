# Script para verificar el despliegue en Railway
param(
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$FrontendUrl
)

Write-Host "🔍 Verificando despliegue en Railway..." -ForegroundColor Green

# Función para hacer peticiones HTTP
function Test-Endpoint {
    param($Url, $Name)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name - OK (Status: $($response.StatusCode))" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  $Name - Warning (Status: $($response.StatusCode))" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ $Name - Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "🔍 Verificando Backend..." -ForegroundColor Yellow

# Verificar health check del backend
$backendHealth = Test-Endpoint "$BackendUrl/health" "Backend Health Check"

# Verificar endpoints principales del backend
$backendAuth = Test-Endpoint "$BackendUrl/api/auth/status" "Backend Auth Status"
$backendClasses = Test-Endpoint "$BackendUrl/api/classes" "Backend Classes API"

Write-Host "🔍 Verificando Frontend..." -ForegroundColor Yellow

# Verificar frontend principal
$frontendMain = Test-Endpoint $FrontendUrl "Frontend Main Page"

# Verificar API routes del frontend
$frontendHealth = Test-Endpoint "$FrontendUrl/api/health" "Frontend Health Check"

Write-Host "📊 Resumen de Verificación:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor White

$totalTests = 5
$passedTests = 0

if ($backendHealth) { $passedTests++ }
if ($backendAuth) { $passedTests++ }
if ($backendClasses) { $passedTests++ }
if ($frontendMain) { $passedTests++ }
if ($frontendHealth) { $passedTests++ }

Write-Host "Pruebas pasadas: $passedTests/$totalTests" -ForegroundColor White

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 ¡Despliegue verificado exitosamente!" -ForegroundColor Green
    Write-Host "✅ Todos los servicios están funcionando correctamente" -ForegroundColor Green
} elseif ($passedTests -ge 3) {
    Write-Host "⚠️  Despliegue parcialmente funcional" -ForegroundColor Yellow
    Write-Host "🔧 Algunos servicios pueden necesitar configuración adicional" -ForegroundColor Yellow
} else {
    Write-Host "❌ Problemas detectados en el despliegue" -ForegroundColor Red
    Write-Host "🛠️  Revisa los logs y la configuración" -ForegroundColor Red
}

Write-Host "" -ForegroundColor White
Write-Host "📋 Próximos pasos recomendados:" -ForegroundColor Cyan
Write-Host "1. Verificar logs: railway logs" -ForegroundColor White
Write-Host "2. Comprobar variables de entorno: railway variables" -ForegroundColor White
Write-Host "3. Ejecutar migraciones si es necesario: railway run npx prisma migrate deploy" -ForegroundColor White
Write-Host "4. Probar funcionalidades principales en el navegador" -ForegroundColor White

Write-Host "" -ForegroundColor White
Write-Host "🌐 URLs de tu aplicación:" -ForegroundColor Cyan
Write-Host "Backend:  $BackendUrl" -ForegroundColor White
Write-Host "Frontend: $FrontendUrl" -ForegroundColor White