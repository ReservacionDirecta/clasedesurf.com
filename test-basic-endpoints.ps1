# Script básico para probar endpoints principales
Write-Host "PROBANDO ENDPOINTS BASICOS" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

$BACKEND_URL = "http://localhost:4000"
$FRONTEND_URL = "http://localhost:3000"

# Función para login
function Get-Token {
    param($email, $password)
    
    $body = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $body -ContentType "application/json"
        return $response.token
    } catch {
        Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para hacer request
function Test-Endpoint {
    param($Url, $Method = "GET", $Token = $null, $Body = $null, $Description)
    
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    
    Write-Host "Probando: $Description" -NoNewline
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $Body
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        Write-Host " OK" -ForegroundColor Green
        return $response
    } catch {
        Write-Host " ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host ""
Write-Host "1. AUTENTICACION" -ForegroundColor Yellow

$adminToken = Get-Token "admin@escuela.com" "admin123"
if ($adminToken) {
    Write-Host "Admin token obtenido" -ForegroundColor Green
} else {
    Write-Host "No se pudo obtener token de admin" -ForegroundColor Red
    exit 1
}

$studentToken = Get-Token "ana@email.com" "student123"
if ($studentToken) {
    Write-Host "Student token obtenido" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. ENDPOINTS BACKEND" -ForegroundColor Yellow

Test-Endpoint "$BACKEND_URL/schools" "GET" $adminToken $null "GET /schools"
Test-Endpoint "$BACKEND_URL/classes" "GET" $adminToken $null "GET /classes"
Test-Endpoint "$BACKEND_URL/users" "GET" $adminToken $null "GET /users"
Test-Endpoint "$BACKEND_URL/instructors" "GET" $adminToken $null "GET /instructors"
Test-Endpoint "$BACKEND_URL/reservations" "GET" $adminToken $null "GET /reservations"
Test-Endpoint "$BACKEND_URL/payments" "GET" $adminToken $null "GET /payments"

Write-Host ""
Write-Host "3. ENDPOINTS FRONTEND" -ForegroundColor Yellow

Test-Endpoint "$FRONTEND_URL/api/schools" "GET" $adminToken $null "GET /api/schools"
Test-Endpoint "$FRONTEND_URL/api/classes" "GET" $adminToken $null "GET /api/classes"
Test-Endpoint "$FRONTEND_URL/api/users" "GET" $adminToken $null "GET /api/users"
Test-Endpoint "$FRONTEND_URL/api/instructors" "GET" $adminToken $null "GET /api/instructors"

Write-Host ""
Write-Host "4. CREAR CLASE DE PRUEBA" -ForegroundColor Yellow

$newClass = @{
    title = "Clase Test $(Get-Date -Format 'HH:mm:ss')"
    description = "Clase de prueba automatica"
    date = (Get-Date).AddDays(3).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    startTime = "10:00:00"
    endTime = "12:00:00"
    duration = 120
    capacity = 8
    price = 80.0
    level = "BEGINNER"
    location = "Playa Test"
    instructorId = 1
    schoolId = 1
} | ConvertTo-Json

$createdClass = Test-Endpoint "$BACKEND_URL/classes" "POST" $adminToken $newClass "POST /classes"
if ($createdClass -and $createdClass.id) {
    Write-Host "Clase creada con ID: $($createdClass.id)" -ForegroundColor Green
    $classId = $createdClass.id
}

Write-Host ""
Write-Host "5. CREAR RESERVA DE PRUEBA" -ForegroundColor Yellow

if ($classId -and $studentToken) {
    $newReservation = @{
        classId = $classId
        specialRequest = "Primera vez surfeando"
    } | ConvertTo-Json
    
    $createdReservation = Test-Endpoint "$BACKEND_URL/reservations" "POST" $studentToken $newReservation "POST /reservations"
    if ($createdReservation -and $createdReservation.id) {
        Write-Host "Reserva creada con ID: $($createdReservation.id)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "6. PROBAR PAGINAS WEB" -ForegroundColor Yellow

$pages = @("/", "/classes", "/dashboard/instructor/classes")
foreach ($page in $pages) {
    Write-Host "Probando pagina: $page" -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "$FRONTEND_URL$page" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host " OK" -ForegroundColor Green
        } else {
            Write-Host " Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ERROR" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs para probar manualmente:"
Write-Host "Frontend: $FRONTEND_URL"
Write-Host "Backend: $BACKEND_URL"
Write-Host ""
Write-Host "Credenciales:"
Write-Host "Admin: admin@escuela.com / admin123"
Write-Host "Estudiante: ana@email.com / student123"
Write-Host "Instructor: gbarrera@clasedesurf.com / instructor123"
Write-Host ""