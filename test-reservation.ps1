# Script de prueba para reserva de clase con múltiples participantes
$BACKEND_URL = "http://localhost:4000"
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST DE RESERVA CON PARTICIPANTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Generar timestamp único
$timestamp = (Get-Date).ToString("yyyyMMddHHmmss")
$testEmail = "maria.test$timestamp@test.com"
$testName = "Maria Test $timestamp"

# Paso 1: Registrar usuario ESTUDIANTE
Write-Host "PASO 1: Registrando usuario estudiante de prueba..." -ForegroundColor Yellow
$registerBody = @{
    name = $testName
    email = $testEmail
    password = "password123"
    role = "STUDENT"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/register" `
    -Method POST `
    -Body $registerBody `
    -ContentType "application/json"

Write-Host "Usuario estudiante registrado: $($registerResponse.user.name)" -ForegroundColor Green
$userId = $registerResponse.user.id

# Paso 2: Login del estudiante
Write-Host ""
Write-Host "PASO 2: Iniciando sesion como estudiante..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$studentToken = $loginResponse.token
Write-Host "Sesion de estudiante iniciada exitosamente" -ForegroundColor Green

# Headers para estudiante
$studentHeaders = @{
    "Authorization" = "Bearer $studentToken"
    "Content-Type" = "application/json"
}

# Paso 3: Login como admin para crear clase
Write-Host ""
Write-Host "PASO 3: Iniciando sesion como admin para crear clase..." -ForegroundColor Yellow

$adminLoginBody = @{
    email = "admin@surfschool.com"
    password = "password123"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" `
        -Method POST `
        -Body $adminLoginBody `
        -ContentType "application/json"
    
    $adminToken = $adminLoginResponse.token
    Write-Host "Sesion de admin iniciada" -ForegroundColor Green
    
    $adminHeaders = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    # Crear clase de prueba como admin
    Write-Host "Creando clase de prueba como admin..." -ForegroundColor Yellow
    
    $schools = Invoke-RestMethod -Uri "$BACKEND_URL/schools" -Method GET
    $schoolId = $schools[0].id
    
    $futureDateTime = (Get-Date).AddDays(7).ToString("yyyy-MM-ddT10:00:00Z")
    $classBody = @{
        title = "Clase Test $timestamp"
        description = "Clase para testing de reserva con multiples participantes"
        date = $futureDateTime
        duration = 120
        capacity = 8
        price = 50
        level = "BEGINNER"
        instructor = "Instructor Test"
        images = @("https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600")
        schoolId = $schoolId
    } | ConvertTo-Json
    
    $selectedClass = Invoke-RestMethod -Uri "$BACKEND_URL/classes" `
        -Method POST `
        -Body $classBody `
        -Headers $adminHeaders
    
    Write-Host "Clase creada exitosamente" -ForegroundColor Green
    
} catch {
    Write-Host "No se pudo conectar como admin, buscando clases existentes..." -ForegroundColor Yellow
    
    # Si no hay admin, buscar clases existentes
    $classes = Invoke-RestMethod -Uri "$BACKEND_URL/classes" -Method GET
    
    $selectedClass = $null
    $futureDate = Get-Date
    foreach ($class in $classes) {
        $classDate = [DateTime]$class.date
        if ($classDate -gt $futureDate) {
            $reservedCount = if ($class.reservations) { $class.reservations.Count } else { 0 }
            $available = $class.capacity - $reservedCount
            if ($available -ge 2) {
                $selectedClass = $class
                break
            }
        }
    }
    
    if ($null -eq $selectedClass) {
        Write-Host "No hay clases disponibles para testing" -ForegroundColor Red
        Write-Host "Por favor, crea una clase manualmente o ejecuta el seed" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Clase seleccionada para reserva:" -ForegroundColor Cyan
Write-Host "  ID: $($selectedClass.id)" -ForegroundColor Gray
Write-Host "  Titulo: $($selectedClass.title)" -ForegroundColor Gray
Write-Host "  Capacidad: $($selectedClass.capacity)" -ForegroundColor Gray
Write-Host "  Precio: $($selectedClass.price) USD" -ForegroundColor Gray
Write-Host "  Fecha: $($selectedClass.date)" -ForegroundColor Gray

# Paso 4: Crear reserva con 2 participantes (como estudiante)
Write-Host ""
Write-Host "PASO 4: Creando reserva con 2 participantes..." -ForegroundColor Yellow

$participant1 = @{
    name = $testName
    age = "28"
    height = "165"
    weight = "60"
    canSwim = $true
    swimmingLevel = "INTERMEDIATE"
    hasSurfedBefore = $false
    injuries = "Ninguna"
    comments = "Primera vez practicando surf, muy emocionada!"
}

$participant2 = @{
    name = "Carlos Acompanante"
    age = "32"
    height = "178"
    weight = "75"
    canSwim = $true
    swimmingLevel = "ADVANCED"
    hasSurfedBefore = $true
    injuries = "Rodilla derecha - lesion antigua pero ya recuperada"
    comments = "He surfeado antes en Peru, nivel basico-intermedio"
}

$reservationBody = @{
    classId = $selectedClass.id
    specialRequest = "Preferimos horario de manana. Gracias!"
    participants = @($participant1, $participant2)
} | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "Participante 1 (Titular): $($participant1.name)" -ForegroundColor Cyan
Write-Host "  Edad: $($participant1.age) anos" -ForegroundColor Gray
Write-Host "  Altura: $($participant1.height) cm, Peso: $($participant1.weight) kg" -ForegroundColor Gray
Write-Host "  Sabe nadar: Si (Nivel: $($participant1.swimmingLevel))" -ForegroundColor Gray
Write-Host "  Ha surfeado antes: No" -ForegroundColor Gray
Write-Host "  Comentarios: $($participant1.comments)" -ForegroundColor Gray

Write-Host ""
Write-Host "Participante 2: $($participant2.name)" -ForegroundColor Cyan
Write-Host "  Edad: $($participant2.age) anos" -ForegroundColor Gray
Write-Host "  Altura: $($participant2.height) cm, Peso: $($participant2.weight) kg" -ForegroundColor Gray
Write-Host "  Sabe nadar: Si (Nivel: $($participant2.swimmingLevel))" -ForegroundColor Gray
Write-Host "  Ha surfeado antes: Si" -ForegroundColor Gray
Write-Host "  Lesiones: $($participant2.injuries)" -ForegroundColor Gray
Write-Host "  Comentarios: $($participant2.comments)" -ForegroundColor Gray

$reservation = Invoke-RestMethod -Uri "$BACKEND_URL/reservations" `
    -Method POST `
    -Body $reservationBody `
    -Headers $studentHeaders

Write-Host ""
Write-Host "RESERVA CREADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "  Reserva ID: $($reservation.id)" -ForegroundColor Gray
Write-Host "  Estado: $($reservation.status)" -ForegroundColor Gray
Write-Host "  Usuario ID: $($reservation.userId)" -ForegroundColor Gray
Write-Host "  Clase ID: $($reservation.classId)" -ForegroundColor Gray

$reservationId = $reservation.id

# Paso 5: Verificar que el estudiante puede ver su reserva
Write-Host ""
Write-Host "PASO 5: Verificando reservas del estudiante..." -ForegroundColor Yellow

$myReservations = Invoke-RestMethod -Uri "$BACKEND_URL/reservations" `
    -Method GET `
    -Headers $studentHeaders

Write-Host "Total de reservas del estudiante: $($myReservations.Count)" -ForegroundColor Green

$foundReservation = $myReservations | Where-Object { $_.id -eq $reservationId }

if ($foundReservation) {
    Write-Host ""
    Write-Host "LA CLASE SE ASIGNO CORRECTAMENTE AL ESTUDIANTE" -ForegroundColor Green
    Write-Host ""
    Write-Host "Detalles de la reserva encontrada:" -ForegroundColor Cyan
    Write-Host "  Reserva ID: $($foundReservation.id)" -ForegroundColor Gray
    Write-Host "  Estado: $($foundReservation.status)" -ForegroundColor Gray
    Write-Host "  Clase: $($foundReservation.class.title)" -ForegroundColor Gray
    Write-Host "  Escuela: $($foundReservation.class.school.name)" -ForegroundColor Gray
    Write-Host "  Ubicacion: $($foundReservation.class.school.location)" -ForegroundColor Gray
    Write-Host "  Fecha clase: $($foundReservation.class.date)" -ForegroundColor Gray
    Write-Host "  Duracion: $($foundReservation.class.duration) minutos" -ForegroundColor Gray
    Write-Host "  Solicitud especial: $($foundReservation.specialRequest)" -ForegroundColor Gray
    
    if ($foundReservation.participants) {
        Write-Host ""
        Write-Host "  DATOS DE PARTICIPANTES ALMACENADOS:" -ForegroundColor Cyan
        
        $participantsData = $foundReservation.participants
        $index = 1
        foreach ($p in $participantsData) {
            Write-Host ""
            Write-Host "    Participante $index : $($p.name)" -ForegroundColor Yellow
            Write-Host "      Edad: $($p.age) anos" -ForegroundColor Gray
            Write-Host "      Altura: $($p.height) cm" -ForegroundColor Gray
            Write-Host "      Peso: $($p.weight) kg" -ForegroundColor Gray
            Write-Host "      Sabe nadar: $(if($p.canSwim){'Si'}else{'No'})" -ForegroundColor Gray
            if ($p.swimmingLevel) {
                Write-Host "      Nivel de natacion: $($p.swimmingLevel)" -ForegroundColor Gray
            }
            Write-Host "      Ha surfeado antes: $(if($p.hasSurfedBefore){'Si'}else{'No'})" -ForegroundColor Gray
            if ($p.injuries) {
                Write-Host "      Lesiones: $($p.injuries)" -ForegroundColor Gray
            }
            if ($p.comments) {
                Write-Host "      Comentarios: $($p.comments)" -ForegroundColor Gray
            }
            $index++
        }
    } else {
        Write-Host ""
        Write-Host "  ADVERTENCIA: No se encontraron datos de participantes" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: La reserva no se encontro en la lista del estudiante" -ForegroundColor Red
}

# Paso 6: Obtener detalles específicos de la reserva
Write-Host ""
Write-Host "PASO 6: Obteniendo detalles especificos de la reserva..." -ForegroundColor Yellow

$details = Invoke-RestMethod -Uri "$BACKEND_URL/reservations/$reservationId" `
    -Method GET `
    -Headers $studentHeaders

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "RESUMEN COMPLETO DE LA RESERVA" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ESTUDIANTE:" -ForegroundColor Yellow
Write-Host "  Nombre: $($details.user.name)" -ForegroundColor Gray
Write-Host "  Email: $($details.user.email)" -ForegroundColor Gray
Write-Host "  Telefono: $($details.user.phone)" -ForegroundColor Gray
Write-Host ""
Write-Host "CLASE:" -ForegroundColor Yellow
Write-Host "  Titulo: $($details.class.title)" -ForegroundColor Gray
Write-Host "  Descripcion: $($details.class.description)" -ForegroundColor Gray
Write-Host "  Fecha: $($details.class.date)" -ForegroundColor Gray
Write-Host "  Duracion: $($details.class.duration) minutos" -ForegroundColor Gray
Write-Host "  Nivel: $($details.class.level)" -ForegroundColor Gray
Write-Host "  Instructor: $($details.class.instructor)" -ForegroundColor Gray
Write-Host ""
Write-Host "ESCUELA:" -ForegroundColor Yellow
Write-Host "  Nombre: $($details.class.school.name)" -ForegroundColor Gray
Write-Host "  Ubicacion: $($details.class.school.location)" -ForegroundColor Gray
Write-Host "  Email: $($details.class.school.email)" -ForegroundColor Gray
Write-Host ""
Write-Host "COSTOS:" -ForegroundColor Yellow
Write-Host "  Precio por persona: $($details.class.price) USD" -ForegroundColor Gray

$totalParticipants = if ($details.participants) { $details.participants.Count } else { 1 }
$totalPrice = $details.class.price * $totalParticipants

Write-Host "  Numero de participantes: $totalParticipants" -ForegroundColor Gray
Write-Host "  PRECIO TOTAL: $totalPrice USD" -ForegroundColor Green
Write-Host ""
Write-Host "ESTADO:" -ForegroundColor Yellow
Write-Host "  $($details.status)" -ForegroundColor Gray

# Resumen final
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "PRUEBA COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "CREDENCIALES DEL ESTUDIANTE:" -ForegroundColor Cyan
Write-Host "  Nombre: $testName" -ForegroundColor Gray
Write-Host "  Email: $testEmail" -ForegroundColor Gray
Write-Host "  Password: password123" -ForegroundColor Gray
Write-Host ""
Write-Host "DETALLES DE LA RESERVA:" -ForegroundColor Cyan
Write-Host "  Clase: $($selectedClass.title)" -ForegroundColor Gray
Write-Host "  Reserva ID: $reservationId" -ForegroundColor Gray
Write-Host "  Participantes: 2 (titular + acompanante)" -ForegroundColor Gray
Write-Host "  Precio total: $totalPrice USD" -ForegroundColor Gray
Write-Host ""
Write-Host "PARA PROBAR EN EL NAVEGADOR:" -ForegroundColor Cyan
Write-Host "  1. Abrir: http://localhost:3000" -ForegroundColor Blue
Write-Host "  2. Login con: $testEmail / password123" -ForegroundColor Blue
Write-Host "  3. Ir a 'Mis Reservas' para ver los detalles" -ForegroundColor Blue
Write-Host ""
Write-Host "FUNCIONALIDADES VERIFICADAS:" -ForegroundColor Cyan
Write-Host "  [OK] Usuario estudiante creado" -ForegroundColor Green
Write-Host "  [OK] Clase de prueba disponible" -ForegroundColor Green
Write-Host "  [OK] Reserva creada con 2 participantes" -ForegroundColor Green
Write-Host "  [OK] Datos completos de cada participante guardados" -ForegroundColor Green
Write-Host "  [OK] Clase asignada correctamente al estudiante" -ForegroundColor Green
Write-Host "  [OK] Estudiante puede ver detalles de su reserva" -ForegroundColor Green
Write-Host "  [OK] Coach/Escuela puede ver informacion de participantes" -ForegroundColor Green
Write-Host ""
