# Script para probar todos los endpoints del sistema
# Ejecutar desde la raiz del proyecto

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PROBANDO TODOS LOS ENDPOINTS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

$BACKEND_URL = "http://localhost:4000"
$FRONTEND_URL = "http://localhost:3000"

# Funcion para hacer login y obtener token
function Get-AuthToken {
    param($email, $password)
    
    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        return $response.token
    } catch {
        Write-Host "ERROR en login: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Funcion para hacer request con token
function Invoke-AuthenticatedRequest {
    param($Uri, $Method = "GET", $Body = $null, $Token)
    
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
        return @{ Success = $true; Data = $response }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $_.Exception.Response.StatusCode }
    }
}

Write-Host ""
Write-Host "OBTENIENDO TOKENS DE AUTENTICACION" -ForegroundColor Yellow
Write-Host ""

# Obtener tokens para diferentes roles
$adminToken = Get-AuthToken "admin@escuela.com" "admin123"
$studentToken = Get-AuthToken "student@test.com" "student123"

if (-not $adminToken) {
    Write-Host "ERROR: No se pudo obtener token de admin. Verifica que el backend este corriendo." -ForegroundColor Red
    exit 1
}

Write-Host "OK: Token de ADMIN obtenido" -ForegroundColor Green
if ($studentToken) {
    Write-Host "OK: Token de STUDENT obtenido" -ForegroundColor Green
} else {
    Write-Host "WARNING: Token de STUDENT no disponible" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "PROBANDO ENDPOINTS DE ESCUELAS" -ForegroundColor Yellow
Write-Host ""

# Test Schools
Write-Host "GET /schools" -NoNewline
$result = Invoke-AuthenticatedRequest "$BACKEND_URL/schools" "GET" $null $adminToken
if ($result.Success) {
    Write-Host " OK ($($result.Data.Count) escuelas)" -ForegroundColor Green
} else {
    Write-Host " ERROR $($result.Error)" -ForegroundColor Red
}

Write-Host "GET /schools/my-school" -NoNewline
$result = Invoke-AuthenticatedRequest "$BACKEND_URL/schools/my-school" "GET" $null $adminToken
if ($result.Success) {
    Write-Host " OK" -ForegroundColor Green
    $schoolId = $result.Data.id
} else {
    Write-Host " ERROR $($result.Error)" -ForegroundColor Red
    $schoolId = 1  # Fallback
}

Write-Host ""
Write-Host "PROBANDO ENDPOINTS DE USUARIOS" -ForegroundColor Yellow
Write-Host ""

# Test Users
Write-Host "GET /users" -NoNewline
$result = Invoke-AuthenticatedRequest "$BACKEND_URL/users" "GET" $null $adminToken
if ($result.Success) {
    Write-Host " OK ($($result.Data.Count) usuarios)" -ForegroundColor Green
} else {
    Write-Host " ERROR $($result.Error)" -ForegroundColor Red
}

Write-Host ""
Write-Host "PROBANDO ENDPOINTS DE CLASES" -ForegroundColor Yellow
Write-Host ""

# Test Classes
Write-Host "GET /classes" -NoNewline
$result = Invoke-AuthenticatedRequest "$BACKEND_URL/classes" "GET" $null $adminToken
if ($result.Success) {
    Write-Host " OK ($($result.Data.Count) clases)" -ForegroundColor Green
    if ($result.Data.Count -gt 0) {
        $classId = $result.Data[0].id
    }
} else {
    Write-Host " ERROR $($result.Error)" -ForegroundColor Red
}

# Test crear clase
$newClass = @{
    title = "Clase de Prueba API"
    description = "Clase creada desde script de prueba"
    date = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    duration = 60
    capacity = 10
    price = 50.0
    level = "BEGINNER"
    instructor = "Instructor de Prueba"
    schoolId = $schoolId
} | ConvertTo-Json

Write-Host "POST /classes" -NoNewline
$result = Invoke-AuthenticatedRequest "$BACKEND_URL/classes" "POST" $newClass $adminToken
if ($result.Success) {
    Write-Host " OK Clase creada (ID: $($result.Data.id))" -ForegroundColor Green
    $createdClassId = $result.Data.id
} else {
    Write-Host " ERROR $($result.Error)" -ForegroundColor Red
}

Write-Host ""
Write-Host "PROBANDO ENDPOINTS DE INSTRUCTORES" -ForegroundColor Yellow
Write-Host ""

# Test Instructors
Write-Host "GET /instructors" -NoNewline
$result = Invoke-AuthenticatedRequest "$BACKEND_URL/instructors" "GET" $null $adminToken
if ($result.Success) {
    Write-Host " OK ($($result.Data.Count) instructores)" -ForegroundColor Green
} else {
    Write-Host " ERROR $($result.Error)" -ForegroundColor Red
}

Write-Host ""
Write-Host "PROBANDO ENDPOINTS DE RESERVACIONES" -ForegroundColor Yellow
Write-Host ""

# Test Reservations
Write-Host "GET /reservations" -NoNewline
$result = Invoke-AuthenticatedRequest "$BACKEND_URL/reservations" "GET" $null $adminToken
if ($result.Success) {
    Write-Host " OK ($($result.Data.Count) reservaciones)" -ForegroundColor Green
} else {
    Write-Host " ERROR $($result.Error)" -ForegroundColor Red
}

Write-Host ""
Write-Host "PROBANDO ENDPOINTS DE PAGOS" -ForegroundColor Yellow
Write-Host ""

# Test Payments
Write-Host "GET /payments" -NoNewline
$result = Invoke-AuthenticatedRequest "$BACKEND_URL/payments" "GET" $null $adminToken
if ($result.Success) {
    Write-Host " OK ($($result.Data.Count) pagos)" -ForegroundColor Green
} else {
    Write-Host " ERROR $($result.Error)" -ForegroundColor Red
}

Write-Host ""
Write-Host "PROBANDO ENDPOINTS DEL FRONTEND" -ForegroundColor Yellow
Write-Host ""

# Test Frontend API Routes
$frontendEndpoints = @(
    "/api/schools",
    "/api/schools/my-school",
    "/api/users",
    "/api/classes",
    "/api/instructors",
    "/api/reservations",
    "/api/payments"
)

foreach ($endpoint in $frontendEndpoints) {
    Write-Host "$endpoint" -NoNewline
    try {
        $headers = @{ "Authorization" = "Bearer $adminToken" }
        $response = Invoke-WebRequest -Uri "$FRONTEND_URL$endpoint" -Headers $headers -Method GET -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host " OK" -ForegroundColor Green
        } else {
            Write-Host " WARNING Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ERROR $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host ""
Write-Host "OK: Endpoints probados exitosamente" -ForegroundColor Green
Write-Host "WARNING: Algunos endpoints pueden requerir datos especificos" -ForegroundColor Yellow
Write-Host "ERROR: Errores encontrados requieren revision" -ForegroundColor Red
Write-Host ""
Write-Host "Sistema listo para implementar modulo de pagos avanzado" -ForegroundColor Green
Write-Host ""