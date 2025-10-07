# Script para probar el login del instructor creado
$BACKEND_URL = "http://localhost:4000"

Write-Host "Probando login del instructor..." -ForegroundColor Yellow

$loginData = @{
    email = "admin@escuela.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Datos de login:" -ForegroundColor Cyan
Write-Host $loginData

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "Login exitoso!" -ForegroundColor Green
    Write-Host "Usuario: $($response.user.name)" -ForegroundColor Green
    Write-Host "Email: $($response.user.email)" -ForegroundColor Green
    Write-Host "Role: $($response.user.role)" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "Error en login:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Intentar obtener más detalles del error
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
}