# Script para obtener IDs de escuelas disponibles
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

Write-Host "Obteniendo token..." -ForegroundColor Yellow
$token = Get-Token

if (-not $token) {
    Write-Host "No se pudo obtener token" -ForegroundColor Red
    exit 1
}

Write-Host "Token obtenido, consultando escuelas..." -ForegroundColor Green

try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $schools = Invoke-RestMethod -Uri "$BACKEND_URL/schools" -Headers $headers -Method GET
    
    Write-Host ""
    Write-Host "ESCUELAS DISPONIBLES:" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    
    foreach ($school in $schools) {
        Write-Host "ID: $($school.id) - $($school.name)" -ForegroundColor White
        Write-Host "   Ubicación: $($school.location)" -ForegroundColor Gray
        Write-Host "   Owner ID: $($school.ownerId)" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Obtener el ID de la primera escuela para usar en pruebas
    if ($schools.Count -gt 0) {
        $firstSchoolId = $schools[0].id
        Write-Host "USAR PARA PRUEBAS: schoolId = $firstSchoolId" -ForegroundColor Green
    }
    
} catch {
    Write-Host "Error consultando escuelas: $($_.Exception.Message)" -ForegroundColor Red
}