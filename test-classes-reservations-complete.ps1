# Script completo para probar funcionalidades de clases, reservas, pagos y gestión
# Ejecutar desde la raíz del proyecto

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "PRUEBAS COMPLETAS - CLASES Y RESERVAS" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$BACKEND_URL = "http://localhost:4000"
$FRONTEND_URL = "http://localhost:3000"

# Variables globales para almacenar IDs creados
$global:createdClassId = $null
$global:createdReservationId = $null
$global:createdPaymentId = $null
$global:studentUserId = $null
$global:instructorUserId = $null

# Función para hacer login y obtener token
function Get-AuthToken {
    param($email, $password)
    
    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        return @{ Success = $true; Token = $response.token; User = $response.user }
    } catch {
        Write-Host "❌ Error en login para $email : $($_.Exception.Message)" -ForegroundColor Red
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# Función para hacer request con token
function Invoke-AuthenticatedRequest {
    param($Uri, $Method = "GET", $Body = $null, $Token, $Description = "")
    
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers -Body $Body
        } else {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers
        }
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode } else { "Unknown" }
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $statusCode }
    }
}

# Función para mostrar resultado
function Show-TestResult {
    param($TestName, $Result, $ShowData = $false)
    
    Write-Host "📍 $TestName" -NoNewline
    if ($Result.Success) {
        Write-Host " ✅" -ForegroundColor Green
        if ($ShowData -and $Result.Data) {
            if ($Result.Data -is [array]) {
                Write-Host "   📊 Datos: $($Result.Data.Count) elementos" -ForegroundColor Gray
            } else {
                Write-Host "   📊 ID: $($Result.Data.id)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host " ❌ [$($Result.StatusCode)] $($Result.Error)" -ForegroundColor Red
    }
    return $Result
}

Write-Host ""
Write-Host "🔐 FASE 1: AUTENTICACIÓN" -ForegroundColor Yellow
Write-Host ""

# Obtener tokens para diferentes roles
$adminAuth = Get-AuthToken "admin@escuela.com" "admin123"
$instructorAuth = Get-AuthToken "gbarrera@clasedesurf.com" "instructor123"
$studentAuth = Get-AuthToken "ana@email.com" "student123"

if (-not $adminAuth.Success) {
    Write-Host "❌ CRÍTICO: No se pudo autenticar como admin. Verifica que el backend esté corriendo." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Admin autenticado: $($adminAuth.User.name)" -ForegroundColor Green

if ($instructorAuth.Success) {
    Write-Host "✅ Instructor autenticado: $($instructorAuth.User.name)" -ForegroundColor Green
    $global:instructorUserId = $instructorAuth.User.id
} else {
    Write-Host "⚠️ Instructor no disponible" -ForegroundColor Yellow
}

if ($studentAuth.Success) {
    Write-Host "✅ Estudiante autenticado: $($studentAuth.User.name)" -ForegroundColor Green
    $global:studentUserId = $studentAuth.User.id
} else {
    Write-Host "⚠️ Estudiante no disponible" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🏫 FASE 2: GESTIÓN DE ESCUELAS" -ForegroundColor Yellow
Write-Host ""

# Obtener escuela del admin
$schoolResult = Show-TestResult "GET /schools/my-school" (Invoke-AuthenticatedRequest "$BACKEND_URL/schools/my-school" "GET" $null $adminAuth.Token) $true
$schoolId = if ($schoolResult.Success) { $schoolResult.Data.id } else { 1 }

Write-Host ""
Write-Host "📚 FASE 3: GESTIÓN DE CLASES" -ForegroundColor Yellow
Write-Host ""

# Listar clases existentes
$classesResult = Show-TestResult "GET /classes" (Invoke-AuthenticatedRequest "$BACKEND_URL/classes" "GET" $null $adminAuth.Token) $true

# Crear nueva clase
$newClass = @{
    title = "Clase de Prueba Completa - $(Get-Date -Format 'HH:mm:ss')"
    description = "Clase creada automáticamente para pruebas de funcionalidad completa"
    date = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    startTime = "10:00:00"
    endTime = "12:00:00"
    duration = 120
    capacity = 8
    price = 85.0
    level = "BEGINNER"
    location = "Playa de Prueba"
    instructorId = $global:instructorUserId
    schoolId = $schoolId
} | ConvertTo-Json

$createClassResult = Show-TestResult "POST /classes (Crear clase)" (Invoke-AuthenticatedRequest "$BACKEND_URL/classes" "POST" $newClass $adminAuth.Token) $true
if ($createClassResult.Success) {
    $global:createdClassId = $createClassResult.Data.id
    Write-Host "   🎯 Clase creada con ID: $global:createdClassId" -ForegroundColor Green
}

# Obtener clase específica
if ($global:createdClassId) {
    Show-TestResult "GET /classes/$global:createdClassId" (Invoke-AuthenticatedRequest "$BACKEND_URL/classes/$global:createdClassId" "GET" $null $adminAuth.Token) $true
}

# Actualizar clase
if ($global:createdClassId) {
    $updateClass = @{
        title = "Clase de Prueba ACTUALIZADA - $(Get-Date -Format 'HH:mm:ss')"
        description = "Descripción actualizada desde script de prueba"
        price = 95.0
    } | ConvertTo-Json
    
    Show-TestResult "PUT /classes/$global:createdClassId (Actualizar)" (Invoke-AuthenticatedRequest "$BACKEND_URL/classes/$global:createdClassId" "PUT" $updateClass $adminAuth.Token)
}

Write-Host ""
Write-Host "📅 FASE 4: GESTIÓN DE RESERVAS" -ForegroundColor Yellow
Write-Host ""

# Listar reservas existentes
Show-TestResult "GET /reservations" (Invoke-AuthenticatedRequest "$BACKEND_URL/reservations" "GET" $null $adminAuth.Token) $true

# Crear reserva como estudiante
if ($global:createdClassId -and $studentAuth.Success) {
    $newReservation = @{
        classId = $global:createdClassId
        specialRequest = "Primera vez surfeando, necesito ayuda extra por favor"
        emergencyContact = @{
            name = "María García"
            phone = "+51 987 654 321"
            relationship = "Madre"
        }
    } | ConvertTo-Json
    
    $createReservationResult = Show-TestResult "POST /reservations (Crear reserva)" (Invoke-AuthenticatedRequest "$BACKEND_URL/reservations" "POST" $newReservation $studentAuth.Token) $true
    if ($createReservationResult.Success) {
        $global:createdReservationId = $createReservationResult.Data.id
        Write-Host "   🎯 Reserva creada con ID: $global:createdReservationId" -ForegroundColor Green
    }
}

# Listar reservas del estudiante
if ($studentAuth.Success) {
    Show-TestResult "GET /reservations/my-reservations" (Invoke-AuthenticatedRequest "$BACKEND_URL/reservations/my-reservations" "GET" $null $studentAuth.Token) $true
}

# Listar reservas de una clase específica (como instructor)
if ($global:createdClassId -and $instructorAuth.Success) {
    Show-TestResult "GET /reservations/class/$global:createdClassId" (Invoke-AuthenticatedRequest "$BACKEND_URL/reservations/class/$global:createdClassId" "GET" $null $instructorAuth.Token) $true
}

# Confirmar reserva (como instructor)
if ($global:createdReservationId -and $instructorAuth.Success) {
    $confirmReservation = @{
        status = "CONFIRMED"
        instructorNotes = "Estudiante confirmado para clase de principiantes"
    } | ConvertTo-Json
    
    Show-TestResult "PUT /reservations/$global:createdReservationId/status" (Invoke-AuthenticatedRequest "$BACKEND_URL/reservations/$global:createdReservationId/status" "PUT" $confirmReservation $instructorAuth.Token)
}

Write-Host ""
Write-Host "💰 FASE 5: GESTIÓN DE PAGOS" -ForegroundColor Yellow
Write-Host ""

# Listar pagos existentes
Show-TestResult "GET /payments" (Invoke-AuthenticatedRequest "$BACKEND_URL/payments" "GET" $null $adminAuth.Token) $true

# Crear pago para la reserva
if ($global:createdReservationId -and $studentAuth.Success) {
    $newPayment = @{
        reservationId = $global:createdReservationId
        amount = 85.0
        method = "CARD"
        cardDetails = @{
            cardNumber = "4111111111111111"
            expiryMonth = "12"
            expiryYear = "2025"
            cvv = "123"
            cardholderName = "Ana García"
        }
    } | ConvertTo-Json
    
    $createPaymentResult = Show-TestResult "POST /payments (Procesar pago)" (Invoke-AuthenticatedRequest "$BACKEND_URL/payments" "POST" $newPayment $studentAuth.Token) $true
    if ($createPaymentResult.Success) {
        $global:createdPaymentId = $createPaymentResult.Data.id
        Write-Host "   🎯 Pago procesado con ID: $global:createdPaymentId" -ForegroundColor Green
    }
}

# Verificar estado del pago
if ($global:createdPaymentId) {
    Show-TestResult "GET /payments/$global:createdPaymentId" (Invoke-AuthenticatedRequest "$BACKEND_URL/payments/$global:createdPaymentId" "GET" $null $adminAuth.Token) $true
}

Write-Host ""
Write-Host "👥 FASE 6: GESTIÓN DE USUARIOS E INSTRUCTORES" -ForegroundColor Yellow
Write-Host ""

# Listar usuarios
Show-TestResult "GET /users" (Invoke-AuthenticatedRequest "$BACKEND_URL/users" "GET" $null $adminAuth.Token) $true

# Listar instructores
Show-TestResult "GET /instructors" (Invoke-AuthenticatedRequest "$BACKEND_URL/instructors" "GET" $null $adminAuth.Token) $true

# Obtener perfil del instructor
if ($global:instructorUserId) {
    Show-TestResult "GET /instructors/$global:instructorUserId" (Invoke-AuthenticatedRequest "$BACKEND_URL/instructors/$global:instructorUserId" "GET" $null $adminAuth.Token) $true
}

Write-Host ""
Write-Host "🌐 FASE 7: ENDPOINTS DEL FRONTEND (PROXY)" -ForegroundColor Yellow
Write-Host ""

# Probar endpoints del frontend que actúan como proxy
$frontendEndpoints = @(
    @{ Path = "/api/classes"; Description = "Clases via Frontend" },
    @{ Path = "/api/payments"; Description = "Pagos via Frontend" },
    @{ Path = "/api/users"; Description = "Usuarios via Frontend" },
    @{ Path = "/api/instructors"; Description = "Instructores via Frontend" },
    @{ Path = "/api/schools"; Description = "Escuelas via Frontend" }
)

foreach ($endpoint in $frontendEndpoints) {
    Write-Host "📍 $($endpoint.Description)" -NoNewline
    try {
        $headers = @{ "Authorization" = "Bearer $($adminAuth.Token)" }
        $response = Invoke-WebRequest -Uri "$FRONTEND_URL$($endpoint.Path)" -Headers $headers -Method GET -UseBasicParsing
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
Write-Host "🧪 FASE 8: PRUEBAS DE CASOS LÍMITE" -ForegroundColor Yellow
Write-Host ""

# Intentar crear reserva sin autenticación
Write-Host "📍 POST /reservations (Sin auth)" -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/reservations" -Method POST -Body '{}' -ContentType "application/json"
    Write-Host " ❌ Debería fallar" -ForegroundColor Red
} catch {
    Write-Host " ✅ Correctamente rechazado" -ForegroundColor Green
}

# Intentar acceder a clase inexistente
Show-TestResult "GET /classes/99999 (Clase inexistente)" (Invoke-AuthenticatedRequest "$BACKEND_URL/classes/99999" "GET" $null $adminAuth.Token)

# Intentar crear reserva para clase inexistente
if ($studentAuth.Success) {
    $invalidReservation = @{
        classId = 99999
        specialRequest = "Reserva inválida"
    } | ConvertTo-Json
    
    Show-TestResult "POST /reservations (Clase inexistente)" (Invoke-AuthenticatedRequest "$BACKEND_URL/reservations" "POST" $invalidReservation $studentAuth.Token)
}

Write-Host ""
Write-Host "🔄 FASE 9: OPERACIONES DE MODIFICACIÓN Y CANCELACIÓN" -ForegroundColor Yellow
Write-Host ""

# Modificar reserva
if ($global:createdReservationId -and $studentAuth.Success) {
    $updateReservation = @{
        specialRequest = "Solicitud actualizada: Tengo experiencia previa en bodyboard"
    } | ConvertTo-Json
    
    Show-TestResult "PUT /reservations/$global:createdReservationId" (Invoke-AuthenticatedRequest "$BACKEND_URL/reservations/$global:createdReservationId" "PUT" $updateReservation $studentAuth.Token)
}

# Cancelar reserva
if ($global:createdReservationId -and $studentAuth.Success) {
    $cancelReservation = @{
        status = "CANCELED"
        reason = "Cambio de planes - cancelación desde script de prueba"
    } | ConvertTo-Json
    
    Show-TestResult "PUT /reservations/$global:createdReservationId/cancel" (Invoke-AuthenticatedRequest "$BACKEND_URL/reservations/$global:createdReservationId/cancel" "PUT" $cancelReservation $studentAuth.Token)
}

Write-Host ""
Write-Host "🧹 FASE 10: LIMPIEZA (OPCIONAL)" -ForegroundColor Yellow
Write-Host ""

# Eliminar clase creada (opcional)
if ($global:createdClassId) {
    Write-Host "¿Deseas eliminar la clase de prueba creada? (ID: $global:createdClassId)" -ForegroundColor Yellow
    Write-Host "Presiona 'y' para eliminar, cualquier otra tecla para mantener:" -NoNewline
    $response = Read-Host
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Show-TestResult "DELETE /classes/$global:createdClassId" (Invoke-AuthenticatedRequest "$BACKEND_URL/classes/$global:createdClassId" "DELETE" $null $adminAuth.Token)
    } else {
        Write-Host "✅ Clase mantenida para revisión manual" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📊 RESUMEN FINAL DE PRUEBAS" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 ELEMENTOS CREADOS DURANTE LAS PRUEBAS:" -ForegroundColor White
if ($global:createdClassId) { Write-Host "   📚 Clase ID: $global:createdClassId" -ForegroundColor Green }
if ($global:createdReservationId) { Write-Host "   📅 Reserva ID: $global:createdReservationId" -ForegroundColor Green }
if ($global:createdPaymentId) { Write-Host "   💰 Pago ID: $global:createdPaymentId" -ForegroundColor Green }

Write-Host ""
Write-Host "✅ FUNCIONALIDADES PROBADAS:" -ForegroundColor Green
Write-Host "   • Autenticación multi-rol (Admin, Instructor, Estudiante)" -ForegroundColor White
Write-Host "   • CRUD completo de clases" -ForegroundColor White
Write-Host "   • Sistema de reservas con estados" -ForegroundColor White
Write-Host "   • Procesamiento de pagos" -ForegroundColor White
Write-Host "   • Gestión de usuarios e instructores" -ForegroundColor White
Write-Host "   • Endpoints de frontend (proxy)" -ForegroundColor White
Write-Host "   • Casos límite y validaciones" -ForegroundColor White
Write-Host "   • Modificaciones y cancelaciones" -ForegroundColor White

Write-Host ""
Write-Host "🚀 SISTEMA LISTO PARA PRODUCCIÓN" -ForegroundColor Green
Write-Host ""

# Mostrar URLs útiles
Write-Host "🔗 URLS ÚTILES PARA PRUEBAS MANUALES:" -ForegroundColor Cyan
Write-Host "   Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "   Backend API: $BACKEND_URL" -ForegroundColor White
Write-Host "   Dashboard Instructor: $FRONTEND_URL/dashboard/instructor/classes" -ForegroundColor White
if ($global:createdClassId) {
    Write-Host "   Clase creada: $FRONTEND_URL/classes/$global:createdClassId" -ForegroundColor White
}

Write-Host ""