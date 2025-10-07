# Probar que los servicios estén funcionando
Write-Host "Probando servicios activos..." -ForegroundColor Yellow

# Probar backend
Write-Host "Backend (puerto 4000):" -NoNewline
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:4000/" -Method GET -TimeoutSec 5
    Write-Host " OK" -ForegroundColor Green
    Write-Host "  Mensaje: $($backendResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host " ERROR" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

# Probar frontend
Write-Host "Frontend (puerto 3000):" -NoNewline
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host " OK (Status: $($frontendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host " ERROR" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

# Probar login
Write-Host "Login de prueba:" -NoNewline
try {
    $loginData = @{
        email = "admin@escuela.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/auth/login" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 5
    Write-Host " OK" -ForegroundColor Green
    Write-Host "  Usuario: $($loginResponse.user.name)" -ForegroundColor Gray
} catch {
    Write-Host " ERROR" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "RESULTADO:" -ForegroundColor Cyan
Write-Host "Si todo muestra OK, puedes acceder a:" -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host "Login: admin@escuela.com / admin123" -ForegroundColor Yellow