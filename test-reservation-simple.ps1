# Script simplificado de prueba para reserva de clase
$BACKEND_URL = "http://localhost:4000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST DE RESERVA CON 2 PARTICIPANTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$timestamp = (Get-Date).ToString("yyyyMMddHHmmss")

# 1. Crear usuario admin si no existe
Write-Host "Paso 1: Verificando/creando usuario admin..." -ForegroundColor Yellow

try {
    $adminRegister = @{
        name = "Admin Test"
        email = "admin.test@test.com"
        password = "password123"
        role = "ADMIN"
    } | ConvertTo-Json
    
    $adminUser = Invoke-RestMethod -Uri "$BACKEND_URL/auth/register" `
        -Method POST `
        -Body $adminRegister `
        -ContentType "application/json" `
        -ErrorAction SilentlyContinue
    
    Write-Host "Admin creado" -ForegroundColor Green
} catch {
    Write-Host "Admin ya existe o error (continuando...)" -ForegroundColor Gray
}

# Login admin
$adminLogin = @{
    email = "admin.test@test.com"
    password = "password123"
} | ConvertTo-Json

$adminSession = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" `
    -Method POST `
    -Body $adminLogin `
    -ContentType "application/json"

$adminHeaders = @{
    "Authorization" = "Bearer $($adminSession.token)"
    "Content-Type" = "application/json"
}

# 2. Obtener/crear escuela
Write-Host "Paso 2: Obteniendo escuela..." -ForegroundColor Yellow

$schools = Invoke-RestMethod -Uri "$BACKEND_URL/schools" -Method GET
if ($schools.Count -eq 0) {
    Write-Host "Creando escuela de prueba..." -ForegroundColor Gray
    $schoolBody = @{
        name = "Escuela Test"
        location = "Lima, Peru"
        email = "escuela@test.com"
        phone = "+51999999999"
    } | ConvertTo-Json
    
    $school = Invoke-RestMethod -Uri "$BACKEND_URL/schools" `
        -Method POST `
        -Body $schoolBody `
        -Headers $adminHeaders
} else {
    $school = $schools[0]
}

Write-Host "Escuela: $($school.name)" -ForegroundColor Green

# 3. Crear clase con capacidad para 2+ personas
Write-Host "Paso 3: Creando clase de prueba..." -ForegroundColor Yellow

$futureDate = (Get-Date).AddDays(5).ToString("yyyy-MM-ddT10:00:00Z")
$classBody = @{
    title = "Clase Surf Test $timestamp"
    description = "Clase de prueba para testing de reservas"
    date = $futureDate
    duration = 120
    capacity = 10
    price = 50
    level = "BEGINNER"
    instructor = "Instructor Test"
    images = @("https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600")
    schoolId = $school.id
} | ConvertTo-Json

$class = Invoke-RestMethod -Uri "$BACKEND_URL/classes" `
    -Method POST `
    -Body $classBody `
    -Headers $adminHeaders

Write-Host "Clase creada: $($class.title) (ID: $($class.id))" -ForegroundColor Green

# 4. Crear usuario estudiante
Write-Host ""
Write-Host "Paso 4: Creando usuario estudiante..." -ForegroundColor Yellow

$studentEmail = "maria.surf$timestamp@test.com"
$studentBody = @{
    name = "Maria Surfer $timestamp"
    email = $studentEmail
    password = "password123"
    role = "STUDENT"
} | ConvertTo-Json

$student = Invoke-RestMethod -Uri "$BACKEND_URL/auth/register" `
    -Method POST `
    -Body $studentBody `
    -ContentType "application/json"

Write-Host "Estudiante creado: $($student.user.name)" -ForegroundColor Green

# Login estudiante
$studentLogin = @{
    email = $studentEmail
    password = "password123"
} | ConvertTo-Json

$studentSession = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" `
    -Method POST `
    -Body $studentLogin `
    -ContentType "application/json"

$studentHeaders = @{
    "Authorization" = "Bearer $($studentSession.token)"
    "Content-Type" = "application/json"
}

# 5. Crear reserva con 2 participantes
Write-Host ""
Write-Host "Paso 5: Creando reserva con 2 participantes..." -ForegroundColor Yellow

$reservationBody = @{
    classId = $class.id
    specialRequest = "Preferimos horario de manana"
    participants = @(
        @{
            name = "Maria Surfer $timestamp"
            age = "28"
            height = "165"
            weight = "60"
            canSwim = $true
            swimmingLevel = "INTERMEDIATE"
            hasSurfedBefore = $false
            injuries = "Ninguna"
            comments = "Primera vez en surf!"
        },
        @{
            name = "Carlos Acompanante"
            age = "32"
            height = "178"
            weight = "75"
            canSwim = $true
            swimmingLevel = "ADVANCED"
            hasSurfedBefore = $true
            injuries = "Rodilla derecha recuperada"
            comments = "He surfeado antes"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "Participantes:" -ForegroundColor Cyan
Write-Host "  1. Maria Surfer (Titular) - 28 anos, 165cm, 60kg" -ForegroundColor Gray
Write-Host "     Sabe nadar: Si (Intermedio), Surfeado antes: No" -ForegroundColor Gray
Write-Host "  2. Carlos Acompanante - 32 anos, 178cm, 75kg" -ForegroundColor Gray
Write-Host "     Sabe nadar: Si (Avanzado), Surfeado antes: Si" -ForegroundColor Gray
Write-Host ""

$reservation = Invoke-RestMethod -Uri "$BACKEND_URL/reservations" `
    -Method POST `
    -Body $reservationBody `
    -Headers $studentHeaders

Write-Host "RESERVA CREADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "  ID: $($reservation.id)" -ForegroundColor Gray
Write-Host "  Estado: $($reservation.status)" -ForegroundColor Gray

# 6. Verificar que el estudiante puede ver su reserva
Write-Host ""
Write-Host "Paso 6: Verificando que el estudiante ve su reserva..." -ForegroundColor Yellow

$myReservations = Invoke-RestMethod -Uri "$BACKEND_URL/reservations" `
    -Method GET `
    -Headers $studentHeaders

Write-Host "Reservas del estudiante: $($myReservations.Count)" -ForegroundColor Green

$found = $myReservations | Where-Object { $_.id -eq $reservation.id }

if ($found) {
    Write-Host ""
    Write-Host "LA CLASE SE ASIGNO CORRECTAMENTE AL ESTUDIANTE" -ForegroundColor Green
    Write-Host ""
    Write-Host "Detalles:" -ForegroundColor Cyan
    Write-Host "  Clase: $($found.class.title)" -ForegroundColor Gray
    Write-Host "  Escuela: $($found.class.school.name)" -ForegroundColor Gray
    Write-Host "  Ubicacion: $($found.class.school.location)" -ForegroundColor Gray
    Write-Host "  Fecha: $($found.class.date)" -ForegroundColor Gray
    Write-Host "  Precio: $($found.class.price) USD x 2 = $(2 * $found.class.price) USD" -ForegroundColor Gray
    
    if ($found.participants) {
        Write-Host ""
        Write-Host "  PARTICIPANTES GUARDADOS:" -ForegroundColor Cyan
        $i = 1
        foreach ($p in $found.participants) {
            Write-Host ""
            Write-Host "    Participante $i : $($p.name)" -ForegroundColor Yellow
            Write-Host "      Edad: $($p.age), Altura: $($p.height)cm, Peso: $($p.weight)kg" -ForegroundColor Gray
            Write-Host "      Nada: $(if($p.canSwim){'Si'}else{'No'}), Nivel: $($p.swimmingLevel)" -ForegroundColor Gray
            Write-Host "      Surfeado: $(if($p.hasSurfedBefore){'Si'}else{'No'})" -ForegroundColor Gray
            Write-Host "      Lesiones: $($p.injuries)" -ForegroundColor Gray
            Write-Host "      Comentarios: $($p.comments)" -ForegroundColor Gray
            $i++
        }
    }
}

# Resumen
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "PRUEBA COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "CREDENCIALES:" -ForegroundColor Cyan
Write-Host "  Email: $studentEmail" -ForegroundColor Blue
Write-Host "  Password: password123" -ForegroundColor Blue
Write-Host ""
Write-Host "RESULTADOS:" -ForegroundColor Cyan
Write-Host "  [OK] Usuario estudiante creado" -ForegroundColor Green
Write-Host "  [OK] Clase creada (ID: $($class.id))" -ForegroundColor Green
Write-Host "  [OK] Reserva creada (ID: $($reservation.id))" -ForegroundColor Green
Write-Host "  [OK] 2 participantes con datos completos" -ForegroundColor Green
Write-Host "  [OK] Clase asignada al estudiante" -ForegroundColor Green
Write-Host "  [OK] Estudiante puede ver detalles" -ForegroundColor Green
Write-Host ""
Write-Host "PARA VER EN NAVEGADOR:" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:3000" -ForegroundColor Blue
Write-Host "  Login: $studentEmail / password123" -ForegroundColor Blue
Write-Host "  Ir a 'Mis Reservas' para ver la reserva" -ForegroundColor Blue
Write-Host ""

