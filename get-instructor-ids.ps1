# Script para obtener IDs de instructores disponibles
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

Write-Host "Token obtenido, consultando instructores..." -ForegroundColor Green

try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $instructors = Invoke-RestMethod -Uri "$BACKEND_URL/instructors" -Headers $headers -Method GET
    
    Write-Host ""
    Write-Host "INSTRUCTORES DISPONIBLES:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    
    foreach ($instructor in $instructors) {
        Write-Host "ID: $($instructor.id) - $($instructor.user.name)" -ForegroundColor White
        Write-Host "   Email: $($instructor.user.email)" -ForegroundColor Gray
        Write-Host "   User ID: $($instructor.userId)" -ForegroundColor Gray
        Write-Host "   School ID: $($instructor.schoolId)" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Obtener el ID del primer instructor para usar en pruebas
    if ($instructors.Count -gt 0) {
        $firstInstructorId = $instructors[0].userId
        Write-Host "USAR PARA PRUEBAS: instructorId = $firstInstructorId" -ForegroundColor Green
    }
    
} catch {
    Write-Host "Error consultando instructores: $($_.Exception.Message)" -ForegroundColor Red
}