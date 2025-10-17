# Script para probar creación de clase con datos correctos
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

Write-Host "PROBANDO CREACION DE CLASE CON DATOS CORRECTOS" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Obteniendo token..." -ForegroundColor Yellow
$token = Get-Token

if (-not $token) {
    Write-Host "No se pudo obtener token" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Token obtenido" -ForegroundColor Green

Write-Host ""
Write-Host "2. Consultando escuelas disponibles..." -ForegroundColor Yellow

try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $schools = Invoke-RestMethod -Uri "$BACKEND_URL/schools" -Headers $headers -Method GET
    
    if ($schools.Count -eq 0) {
        Write-Host "❌ No hay escuelas disponibles" -ForegroundColor Red
        exit 1
    }
    
    $schoolId = $schools[0].id
    Write-Host "✅ Usando escuela: $($schools[0].name) (ID: $schoolId)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error consultando escuelas: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Creando clase de prueba..." -ForegroundColor Yellow

# Crear clase con datos válidos
$newClass = @{
    title = "Clase de Prueba Corregida - $(Get-Date -Format 'HH:mm:ss')"
    description = "Clase creada con datos correctos para verificar funcionamiento"
    date = (Get-Date).AddDays(5).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    duration = 120
    capacity = 8
    price = 85.0
    level = "BEGINNER"
    instructor = "Gabriel Barrera"
    schoolId = $schoolId
} | ConvertTo-Json

Write-Host "Datos a enviar:" -ForegroundColor Gray
Write-Host $newClass -ForegroundColor Gray

try {
    $createdClass = Invoke-RestMethod -Uri "$BACKEND_URL/classes" -Method POST -Headers $headers -Body $newClass -ContentType "application/json"
    
    Write-Host "✅ CLASE CREADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Detalles de la clase creada:" -ForegroundColor Cyan
    Write-Host "ID: $($createdClass.id)" -ForegroundColor White
    Write-Host "Título: $($createdClass.title)" -ForegroundColor White
    Write-Host "Fecha: $($createdClass.date)" -ForegroundColor White
    Write-Host "Precio: S/. $($createdClass.price)" -ForegroundColor White
    Write-Host "Capacidad: $($createdClass.capacity)" -ForegroundColor White
    Write-Host "Nivel: $($createdClass.level)" -ForegroundColor White
    Write-Host "Instructor: $($createdClass.instructor)" -ForegroundColor White
    
    $classId = $createdClass.id
    
} catch {
    Write-Host "❌ Error creando clase:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Mostrar detalles del error si está disponible
    if ($_.Exception.Response) {
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Detalles del error:" -ForegroundColor Yellow
            Write-Host $errorBody -ForegroundColor Yellow
        } catch {
            Write-Host "No se pudieron obtener detalles del error" -ForegroundColor Yellow
        }
    }
    exit 1
}

Write-Host ""
Write-Host "4. Verificando que la clase se creó correctamente..." -ForegroundColor Yellow

try {
    $retrievedClass = Invoke-RestMethod -Uri "$BACKEND_URL/classes/$classId" -Headers $headers -Method GET
    Write-Host "✅ Clase verificada correctamente" -ForegroundColor Green
    Write-Host "Cupos disponibles: $($retrievedClass.availableSpots)" -ForegroundColor White
    
} catch {
    Write-Host "⚠️ Error verificando clase: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "5. Probando creación de reserva para la clase..." -ForegroundColor Yellow

# Intentar login como estudiante
$studentBody = @{
    email = "student1@surfschool.com"
    password = "student123"
} | ConvertTo-Json

try {
    $studentAuth = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $studentBody -ContentType "application/json"
    $studentToken = $studentAuth.token
    Write-Host "✅ Estudiante autenticado: $($studentAuth.user.name)" -ForegroundColor Green
    
    # Crear reserva
    $newReservation = @{
        classId = $classId
        specialRequest = "Reserva de prueba desde script automatizado"
    } | ConvertTo-Json
    
    $studentHeaders = @{ "Authorization" = "Bearer $studentToken" }
    $createdReservation = Invoke-RestMethod -Uri "$BACKEND_URL/reservations" -Method POST -Headers $studentHeaders -Body $newReservation -ContentType "application/json"
    
    Write-Host "✅ RESERVA CREADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "ID de reserva: $($createdReservation.id)" -ForegroundColor White
    Write-Host "Estado: $($createdReservation.status)" -ForegroundColor White
    
} catch {
    Write-Host "⚠️ No se pudo crear reserva de prueba: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 PRUEBA COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs para verificar:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000/classes/$classId" -ForegroundColor White
Write-Host "API: http://localhost:4000/classes/$classId" -ForegroundColor White
Write-Host ""
Write-Host "La clase creada tiene ID: $classId" -ForegroundColor Green
Write-Host ""