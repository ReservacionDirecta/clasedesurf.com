# Script para probar la creación de instructor
$BACKEND_URL = "http://localhost:4000"

Write-Host "Obteniendo token de admin..." -ForegroundColor Yellow

# Primero hacer login como admin
$loginData = @{
    email = "admin@escuela.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Token obtenido exitosamente" -ForegroundColor Green
    
    # Ahora crear instructor
    Write-Host "Creando instructor..." -ForegroundColor Yellow
    
    $instructorData = @{
        userData = @{
            name = "Test Instructor 2"
            email = "test2@instructor.com"
            phone = "+51999888777"
            password = "test123"
            role = "INSTRUCTOR"
        }
        bio = "Instructor de prueba creado por script"
        yearsExperience = 2
        specialties = @("Surf para principiantes")
        certifications = @()
        sendWelcomeEmail = $true
    } | ConvertTo-Json -Depth 3
    
    Write-Host "Datos del instructor:" -ForegroundColor Cyan
    Write-Host $instructorData
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $createResponse = Invoke-RestMethod -Uri "$BACKEND_URL/instructors/create-with-user" -Method POST -Body $instructorData -Headers $headers
    
    Write-Host "Instructor creado exitosamente!" -ForegroundColor Green
    Write-Host "ID: $($createResponse.id)" -ForegroundColor Green
    Write-Host "Usuario: $($createResponse.user.name)" -ForegroundColor Green
    Write-Host "Email: $($createResponse.user.email)" -ForegroundColor Green
    
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
}