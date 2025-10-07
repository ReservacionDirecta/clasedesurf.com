# Probar el instructor Gabriel Barrera creado
Write-Host "Probando instructor Gabriel Barrera..." -ForegroundColor Yellow

# Probar login del instructor
Write-Host "Login del instructor:" -NoNewline
try {
    $loginData = @{
        email = "gbarrera@clasedesurf.com"
        password = "instruc123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host " OK" -ForegroundColor Green
    Write-Host "  Nombre: $($loginResponse.user.name)" -ForegroundColor Gray
    Write-Host "  Email: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($loginResponse.user.role)" -ForegroundColor Gray
    
    $token = $loginResponse.token
    
    # Probar obtener perfil de instructor
    Write-Host "Perfil de instructor:" -NoNewline
    try {
        $headers = @{ "Authorization" = "Bearer $token" }
        $instructorResponse = Invoke-RestMethod -Uri "http://localhost:4000/instructors" -Headers $headers -Method GET
        
        $gabriel = $instructorResponse | Where-Object { $_.user.email -eq "gbarrera@clasedesurf.com" }
        if ($gabriel) {
            Write-Host " OK" -ForegroundColor Green
            Write-Host "  ID: $($gabriel.id)" -ForegroundColor Gray
            Write-Host "  Experiencia: $($gabriel.yearsExperience) años" -ForegroundColor Gray
            Write-Host "  Rating: $($gabriel.rating)" -ForegroundColor Gray
            Write-Host "  Escuela: $($gabriel.school.name)" -ForegroundColor Gray
            Write-Host "  Especialidades: $($gabriel.specialties -join ', ')" -ForegroundColor Gray
        } else {
            Write-Host " NO ENCONTRADO" -ForegroundColor Red
        }
    } catch {
        Write-Host " ERROR" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host " ERROR" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "CREDENCIALES DEL INSTRUCTOR:" -ForegroundColor Cyan
Write-Host "Email: gbarrera@clasedesurf.com" -ForegroundColor White
Write-Host "Password: instruc123" -ForegroundColor White
Write-Host ""
Write-Host "Puedes usar estas credenciales para:" -ForegroundColor Yellow
Write-Host "1. Hacer login en http://localhost:3000" -ForegroundColor White
Write-Host "2. Completar el perfil del instructor" -ForegroundColor White
Write-Host "3. Probar la funcionalidad desde la perspectiva del instructor" -ForegroundColor White