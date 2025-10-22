# Script de monitoreo continuo para Railway
param(
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$FrontendUrl,
    
    [int]$IntervalSeconds = 300,  # 5 minutos por defecto
    [int]$MaxFailures = 3,
    [switch]$SendAlerts = $false,
    [string]$SlackWebhook = "",
    [switch]$Continuous = $false
)

Write-Host "📊 Monitor de Railway - Clasedesurf.com" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor White
Write-Host "Backend:  $BackendUrl" -ForegroundColor Gray
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Gray
Write-Host "Intervalo: $IntervalSeconds segundos" -ForegroundColor Gray
Write-Host "" -ForegroundColor White

# Contadores
$backendFailures = 0
$frontendFailures = 0
$totalChecks = 0
$startTime = Get-Date

# Función para verificar endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [int]$TimeoutSeconds = 30
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec $TimeoutSeconds -ErrorAction Stop
        
        $responseTime = $response.Headers.'X-Response-Time'
        if (-not $responseTime) {
            $responseTime = "N/A"
        }
        
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            ResponseTime = $responseTime
            Error = $null
        }
    } catch {
        return @{
            Success = $false
            StatusCode = $null
            ResponseTime = $null
            Error = $_.Exception.Message
        }
    }
}

# Función para enviar alerta
function Send-Alert {
    param(
        [string]$Message,
        [string]$Type = "warning"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $emoji = if ($Type -eq "error") { "🚨" } elseif ($Type -eq "warning") { "⚠️" } else { "ℹ️" }
    
    Write-Host "$emoji [$timestamp] $Message" -ForegroundColor $(if ($Type -eq "error") { "Red" } elseif ($Type -eq "warning") { "Yellow" } else { "Cyan" })
    
    # Enviar a Slack si está configurado
    if ($SendAlerts -and $SlackWebhook) {
        try {
            $payload = @{
                text = "$emoji Clasedesurf Monitor: $Message"
                username = "Railway Monitor"
                icon_emoji = ":surfer:"
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri $SlackWebhook -Method Post -Body $payload -ContentType "application/json" -ErrorAction SilentlyContinue
        } catch {
            Write-Host "❌ Error enviando alerta a Slack: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Función para mostrar estadísticas
function Show-Statistics {
    $uptime = (Get-Date) - $startTime
    $uptimeStr = "{0:dd}d {0:hh}h {0:mm}m {0:ss}s" -f $uptime
    
    Write-Host "" -ForegroundColor White
    Write-Host "📊 Estadísticas de Monitoreo:" -ForegroundColor Cyan
    Write-Host "Tiempo de monitoreo: $uptimeStr" -ForegroundColor White
    Write-Host "Total de verificaciones: $totalChecks" -ForegroundColor White
    Write-Host "Fallos del backend: $backendFailures" -ForegroundColor White
    Write-Host "Fallos del frontend: $frontendFailures" -ForegroundColor White
    
    if ($totalChecks -gt 0) {
        $backendUptime = [math]::Round((($totalChecks - $backendFailures) / $totalChecks) * 100, 2)
        $frontendUptime = [math]::Round((($totalChecks - $frontendFailures) / $totalChecks) * 100, 2)
        
        Write-Host "Uptime del backend: $backendUptime%" -ForegroundColor White
        Write-Host "Uptime del frontend: $frontendUptime%" -ForegroundColor White
    }
    Write-Host "" -ForegroundColor White
}

# Función principal de verificación
function Perform-HealthCheck {
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "🔍 [$timestamp] Verificando servicios..." -ForegroundColor Yellow
    
    # Verificar Backend
    $backendResult = Test-Endpoint "$BackendUrl/health" "Backend"
    if ($backendResult.Success) {
        Write-Host "✅ Backend OK (Status: $($backendResult.StatusCode))" -ForegroundColor Green
        $backendFailures = 0  # Reset contador de fallos
    } else {
        $backendFailures++
        Write-Host "❌ Backend FAIL ($($backendResult.Error))" -ForegroundColor Red
        
        if ($backendFailures -ge $MaxFailures) {
            Send-Alert "Backend ha fallado $backendFailures veces consecutivas: $($backendResult.Error)" "error"
        }
    }
    
    # Verificar Frontend
    $frontendResult = Test-Endpoint $FrontendUrl "Frontend"
    if ($frontendResult.Success) {
        Write-Host "✅ Frontend OK (Status: $($frontendResult.StatusCode))" -ForegroundColor Green
        $frontendFailures = 0  # Reset contador de fallos
    } else {
        $frontendFailures++
        Write-Host "❌ Frontend FAIL ($($frontendResult.Error))" -ForegroundColor Red
        
        if ($frontendFailures -ge $MaxFailures) {
            Send-Alert "Frontend ha fallado $frontendFailures veces consecutivas: $($frontendResult.Error)" "error"
        }
    }
    
    # Verificar endpoints adicionales
    $apiResult = Test-Endpoint "$BackendUrl/api/classes" "API Classes"
    if ($apiResult.Success) {
        Write-Host "✅ API Classes OK" -ForegroundColor Green
    } else {
        Write-Host "⚠️  API Classes FAIL" -ForegroundColor Yellow
    }
    
    $totalChecks++
    
    # Mostrar estadísticas cada 10 verificaciones
    if ($totalChecks % 10 -eq 0) {
        Show-Statistics
    }
}

# Verificación inicial
Write-Host "🚀 Iniciando monitoreo..." -ForegroundColor Green
Send-Alert "Monitoreo iniciado para Backend: $BackendUrl y Frontend: $FrontendUrl" "info"

# Loop principal
do {
    try {
        Perform-HealthCheck
        
        if ($Continuous) {
            Write-Host "⏳ Esperando $IntervalSeconds segundos..." -ForegroundColor Gray
            Start-Sleep -Seconds $IntervalSeconds
        }
    } catch {
        Write-Host "❌ Error en el monitoreo: $($_.Exception.Message)" -ForegroundColor Red
        Send-Alert "Error en el sistema de monitoreo: $($_.Exception.Message)" "error"
        
        if ($Continuous) {
            Start-Sleep -Seconds 60  # Esperar 1 minuto antes de reintentar
        }
    }
} while ($Continuous)

# Mostrar estadísticas finales
if (-not $Continuous) {
    Show-Statistics
    Write-Host "✅ Verificación completada" -ForegroundColor Green
}

# Ejemplo de uso:
Write-Host "" -ForegroundColor White
Write-Host "💡 Ejemplos de uso:" -ForegroundColor Cyan
Write-Host "Verificación única:" -ForegroundColor White
Write-Host "  ./monitor-railway.ps1 -BackendUrl 'https://backend.railway.app' -FrontendUrl 'https://frontend.railway.app'" -ForegroundColor Gray
Write-Host "" -ForegroundColor White
Write-Host "Monitoreo continuo:" -ForegroundColor White
Write-Host "  ./monitor-railway.ps1 -BackendUrl 'https://backend.railway.app' -FrontendUrl 'https://frontend.railway.app' -Continuous -IntervalSeconds 300" -ForegroundColor Gray
Write-Host "" -ForegroundColor White
Write-Host "Con alertas de Slack:" -ForegroundColor White
Write-Host "  ./monitor-railway.ps1 -BackendUrl 'https://backend.railway.app' -FrontendUrl 'https://frontend.railway.app' -Continuous -SendAlerts -SlackWebhook 'https://hooks.slack.com/...'" -ForegroundColor Gray