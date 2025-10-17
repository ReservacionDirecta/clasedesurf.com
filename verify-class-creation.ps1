# Script para verificar que la clase se creó correctamente
$BACKEND_URL = "http://localhost:4000"

# Función para login
function Get-Token {
    $body = @{
        email = "admin@escuela.com"
        password = "admin123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $body -ContentType "application/json"
        return $response.token
    } catch {
        Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "VERIFICANDO CREACION DE CLASE" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

$token = Get-Token
if (-not $token) {
    exit 1
}

try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $classes = Invoke-RestMethod -Uri "$BACKEND_URL/classes" -Headers $headers -Method GET
    
    Write-Host ""
    Write-Host "CLASES DISPONIBLES:" -ForegroundColor Yellow
    Write-Host "==================" -ForegroundColor Yellow
    
    foreach ($class in $classes) {
        Write-Host ""
        Write-Host "ID: $($class.id) - $($class.title)" -ForegroundColor White
        Write-Host "   Fecha: $($class.date)" -ForegroundColor Gray
        Write-Host "   Precio: S/. $($class.price)" -ForegroundColor Gray
        Write-Host "   Capacidad: $($class.capacity)" -ForegroundColor Gray
        Write-Host "   Instructor: $($class.instructor)" -ForegroundColor Gray
        Write-Host "   Escuela: $($class.school.name)" -ForegroundColor Gray
        Write-Host "   Cupos disponibles: $($class.availableSpots)" -ForegroundColor Gray
        
        if ($class.id -eq 28) {
            Write-Host "   ✅ ESTA ES LA CLASE RECIEN CREADA!" -ForegroundColor Green
        }
    }
    
    # Buscar la clase ID 28
    $newClass = $classes | Where-Object { $_.id -eq 28 }
    if ($newClass) {
        Write-Host ""
        Write-Host "✅ CONFIRMADO: La clase ID 28 se creó exitosamente" -ForegroundColor Green
        Write-Host "   Título: $($newClass.title)" -ForegroundColor White
        Write-Host "   Disponible para reservas: $($newClass.availableSpots) cupos" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ No se encontró la clase ID 28" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error consultando clases: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "PROBANDO FRONTEND:" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000/classes/28" -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Página frontend carga correctamente" -ForegroundColor Green
        Write-Host "   URL: http://localhost:3000/classes/28" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️ Error cargando página frontend: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""