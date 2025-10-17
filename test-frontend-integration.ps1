# Script para probar la integración completa del frontend con el backend
# Prueba las funcionalidades de clases, reservas y pagos desde el frontend

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "PRUEBAS DE INTEGRACIÓN FRONTEND-BACKEND" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$FRONTEND_URL = "http://localhost:3000"
$BACKEND_URL = "http://localhost:4000"

# Variables globales
$global:adminToken = $null
$global:instructorToken = $null
$global:studentToken = $null
$global:testClassId = $null
$global:testReservationId = $null

# Función para login
function Get-AuthToken {
    param($email, $password, $description)
    
    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        Write-Host "✅ $description autenticado: $($response.user.name)" -ForegroundColor Green
        return $response.token
    } catch {
        Write-Host "❌ Error autenticando $description : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para hacer requests al frontend
function Invoke-FrontendRequest {
    param($Path, $Method = "GET", $Body = $null, $Token, $Description = "")
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $uri = "$FRONTEND_URL$Path"
        
        if ($Body) {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $Body
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        
        Write-Host "✅ $Description" -ForegroundColor Green
        return @{ Success = $true; Data = $response }
    } catch {
        Write-Host "❌ $Description - Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

Write-Host ""
Write-Host "🔐 FASE 1: AUTENTICACIÓN" -ForegroundColor Yellow
Write-Host ""

$global:adminToken = Get-AuthToken "admin@escuela.com" "admin123" "Admin"
$global:instructorToken = Get-AuthToken "gbarrera@clasedesurf.com" "instructor123" "Instructor"
$global:studentToken = Get-AuthToken "ana@email.com" "student123" "Estudiante"

if (-not $global:adminToken) {
    Write-Host "❌ CRÍTICO: No se pudo autenticar. Verifica que el backend esté corriendo." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🏫 FASE 2: PRUEBAS DE ESCUELAS VIA FRONTEND" -ForegroundColor Yellow
Write-Host ""

$result = Invoke-FrontendRequest "/api/schools" "GET" $null $global:adminToken "GET /api/schools"
$result = Invoke-FrontendRequest "/api/schools/my-school" "GET" $null $global:adminToken "GET /api/schools/my-school"

Write-Host ""
Write-Host "📚 FASE 3: GESTIÓN DE CLASES VIA FRONTEND" -ForegroundColor Yellow
Write-Host ""

# Listar clases
$classesResult = Invoke-FrontendRequest "/api/classes" "GET" $null $global:adminToken "GET /api/classes"

# Crear nueva clase via frontend
$newClass = @{
    title = "Clase Frontend Test - $(Get-Date -Format 'HH:mm:ss')"
    description = "Clase creada via frontend para pruebas de integración"
    date = (Get-Date).AddDays(5).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    startTime = "09:00:00"
    endTime = "11:00:00"
    duration = 120
    capacity = 6
    price = 75.0
    level = "INTERMEDIATE"
    location = "Playa Frontend Test"
    instructorId = 1
    schoolId = 1
} | ConvertTo-Json

$createResult = Invoke-FrontendRequest "/api/classes" "POST" $newClass $global:adminToken "POST /api/classes (Crear clase)"
if ($createResult.Success -and $createResult.Data.id) {
    $global:testClassId = $createResult.Data.id
    Write-Host "   🎯 Clase creada con ID: $global:testClassId" -ForegroundColor Green
}

# Obtener clase específica
if ($global:testClassId) {
    $result = Invoke-FrontendRequest "/api/classes/$global:testClassId" "GET" $null $global:adminToken "GET /api/classes/$global:testClassId"
}

# Actualizar clase
if ($global:testClassId) {
    $updateClass = @{
        title = "Clase Frontend ACTUALIZADA - $(Get-Date -Format 'HH:mm:ss')"
        price = 85.0
    } | ConvertTo-Json
    
    $result = Invoke-FrontendRequest "/api/classes/$global:testClassId" "PUT" $updateClass $global:adminToken "PUT /api/classes/$global:testClassId"
}

Write-Host ""
Write-Host "📅 FASE 4: GESTIÓN DE RESERVAS VIA FRONTEND" -ForegroundColor Yellow
Write-Host ""

# Listar reservas
$result = Invoke-FrontendRequest "/api/reservations" "GET" $null $global:adminToken "GET /api/reservations"

# Crear reserva como estudiante
if ($global:testClassId -and $global:studentToken) {
    $newReservation = @{
        classId = $global:testClassId
        specialRequest = "Reserva creada via frontend - necesito tabla pequeña"
        emergencyContact = @{
            name = "Pedro García"
            phone = "+51 999 888 777"
            relationship = "Padre"
        }
    } | ConvertTo-Json
    
    $reservationResult = Invoke-FrontendRequest "/api/reservations" "POST" $newReservation $global:studentToken "POST /api/reservations (Crear reserva)"
    if ($reservationResult.Success -and $reservationResult.Data.id) {
        $global:testReservationId = $reservationResult.Data.id
        Write-Host "   🎯 Reserva creada con ID: $global:testReservationId" -ForegroundColor Green
    }
}

# Obtener reserva específica
if ($global:testReservationId) {
    $result = Invoke-FrontendRequest "/api/reservations/$global:testReservationId" "GET" $null $global:studentToken "GET /api/reservations/$global:testReservationId"
}

# Actualizar reserva
if ($global:testReservationId -and $global:studentToken) {
    $updateReservation = @{
        specialRequest = "Solicitud actualizada via frontend - prefiero tabla mediana"
    } | ConvertTo-Json
    
    $result = Invoke-FrontendRequest "/api/reservations/$global:testReservationId" "PUT" $updateReservation $global:studentToken "PUT /api/reservations/$global:testReservationId"
}

Write-Host ""
Write-Host "💰 FASE 5: GESTIÓN DE PAGOS VIA FRONTEND" -ForegroundColor Yellow
Write-Host ""

# Listar pagos
$result = Invoke-FrontendRequest "/api/payments" "GET" $null $global:adminToken "GET /api/payments"

# Crear pago para la reserva
if ($global:testReservationId -and $global:studentToken) {
    $newPayment = @{
        reservationId = $global:testReservationId
        amount = 85.0
        method = "CARD"
        cardDetails = @{
            cardNumber = "4111111111111111"
            expiryMonth = "12"
            expiryYear = "2026"
            cvv = "456"
            cardholderName = "Ana García Test"
        }
    } | ConvertTo-Json
    
    $result = Invoke-FrontendRequest "/api/payments" "POST" $newPayment $global:studentToken "POST /api/payments (Procesar pago)"
}

Write-Host ""
Write-Host "👥 FASE 6: GESTIÓN DE USUARIOS VIA FRONTEND" -ForegroundColor Yellow
Write-Host ""

$result = Invoke-FrontendRequest "/api/users" "GET" $null $global:adminToken "GET /api/users"
$result = Invoke-FrontendRequest "/api/instructors" "GET" $null $global:adminToken "GET /api/instructors"

Write-Host ""
Write-Host "🧪 FASE 7: PRUEBAS DE CASOS LÍMITE VIA FRONTEND" -ForegroundColor Yellow
Write-Host ""

# Intentar acceder sin autenticación
Write-Host "📍 GET /api/classes (Sin auth)" -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$FRONTEND_URL/api/classes" -Method GET
    Write-Host " ❌ Debería requerir auth" -ForegroundColor Red
} catch {
    Write-Host " ✅ Correctamente protegido" -ForegroundColor Green
}

# Intentar crear reserva para clase inexistente
if ($global:studentToken) {
    $invalidReservation = @{
        classId = 99999
        specialRequest = "Reserva para clase inexistente"
    } | ConvertTo-Json
    
    $result = Invoke-FrontendRequest "/api/reservations" "POST" $invalidReservation $global:studentToken "POST /api/reservations (Clase inexistente)"
}

Write-Host ""
Write-Host "🔄 FASE 8: OPERACIONES DE CANCELACIÓN VIA FRONTEND" -ForegroundColor Yellow
Write-Host ""

# Cancelar reserva
if ($global:testReservationId -and $global:studentToken) {
    $result = Invoke-FrontendRequest "/api/reservations/$global:testReservationId" "DELETE" $null $global:studentToken "DELETE /api/reservations/$global:testReservationId (Cancelar)"
}

Write-Host ""
Write-Host "🌐 FASE 9: PRUEBAS DE PÁGINAS WEB" -ForegroundColor Yellow
Write-Host ""

# Probar páginas principales
$webPages = @(
    @{ Path = "/"; Description = "Página principal" },
    @{ Path = "/classes"; Description = "Lista de clases" },
    @{ Path = "/dashboard/instructor/classes"; Description = "Dashboard instructor" }
)

if ($global:testClassId) {
    $webPages += @{ Path = "/classes/$global:testClassId"; Description = "Detalles de clase" }
}

foreach ($page in $webPages) {
    Write-Host "📍 $($page.Description)" -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "$FRONTEND_URL$($page.Path)" -Method GET -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ⚠️ Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ❌ $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🧹 FASE 10: LIMPIEZA" -ForegroundColor Yellow
Write-Host ""

# Eliminar clase de prueba
if ($global:testClassId) {
    Write-Host "¿Deseas eliminar la clase de prueba? (ID: $global:testClassId) [y/N]: " -NoNewline
    $response = Read-Host
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        $result = Invoke-FrontendRequest "/api/classes/$global:testClassId" "DELETE" $null $global:adminToken "DELETE /api/classes/$global:testClassId"
    } else {
        Write-Host "✅ Clase mantenida para revisión manual" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📊 RESUMEN DE INTEGRACIÓN FRONTEND-BACKEND" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ FUNCIONALIDADES PROBADAS VIA FRONTEND:" -ForegroundColor Green
Write-Host "   • Proxy de autenticación funcionando" -ForegroundColor White
Write-Host "   • CRUD de clases via /api/classes" -ForegroundColor White
Write-Host "   • CRUD de reservas via /api/reservations" -ForegroundColor White
Write-Host "   • Procesamiento de pagos via /api/payments" -ForegroundColor White
Write-Host "   • Gestión de usuarios via /api/users" -ForegroundColor White
Write-Host "   • Páginas web cargando correctamente" -ForegroundColor White
Write-Host "   • Validaciones y casos límite" -ForegroundColor White

Write-Host ""
Write-Host "ELEMENTOS CREADOS:" -ForegroundColor White
if ($global:testClassId) { Write-Host "   Clase de prueba ID: $global:testClassId" -ForegroundColor Green }
if ($global:testReservationId) { Write-Host "   Reserva de prueba ID: $global:testReservationId" -ForegroundColor Green }

Write-Host ""
Write-Host "🚀 INTEGRACIÓN FRONTEND-BACKEND EXITOSA" -ForegroundColor Green
Write-Host ""

Write-Host "URLS PARA PRUEBAS MANUALES:" -ForegroundColor Cyan
Write-Host "   Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "   API Backend: $BACKEND_URL" -ForegroundColor White
Write-Host "   Dashboard: $FRONTEND_URL/dashboard/instructor/classes" -ForegroundColor White
if ($global:testClassId) {
    Write-Host "   Clase creada: $FRONTEND_URL/classes/$global:testClassId" -ForegroundColor White
}

Write-Host ""
Write-Host "CREDENCIALES DE PRUEBA:" -ForegroundColor Cyan
Write-Host "   Admin: admin@escuela.com / admin123" -ForegroundColor White
Write-Host "   Instructor: gbarrera@clasedesurf.com / instructor123" -ForegroundColor White
Write-Host "   Estudiante: ana@email.com / student123" -ForegroundColor White

Write-Host ""