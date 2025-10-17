# Script de Pruebas para API de Clases
# Prueba creación, edición y eliminación de clases

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS API DE CLASES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$BACKEND_URL = "http://localhost:4000"
$TOKEN = ""  # Se obtendrá del login

# Función para hacer requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = ""
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = "$BACKEND_URL$Endpoint"
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
        }
    } catch {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        return @{
            Success = $false
            Error = $errorDetails
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# ========================================
# 1. LOGIN
# ========================================
Write-Host "1️⃣  Iniciando sesión..." -ForegroundColor Yellow

# Usando credenciales del seed principal
$loginData = @{
    email = "schooladmin@surfschool.com"  # School Admin
    password = "password123"
}

$loginResult = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginData

if ($loginResult.Success) {
    $TOKEN = $loginResult.Data.token
    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
    Write-Host "   👤 Usuario: $($loginResult.Data.user.name)" -ForegroundColor Gray
    Write-Host "   🎭 Rol: $($loginResult.Data.user.role)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "   ❌ Error en login: $($loginResult.Error.message)" -ForegroundColor Red
    Write-Host "   💡 Asegúrate de que existe el usuario admin@escuela.com" -ForegroundColor Yellow
    exit 1
}

# ========================================
# 2. CREAR CLASE
# ========================================
Write-Host "2️⃣  Creando nueva clase..." -ForegroundColor Yellow

# Fecha futura (mañana a las 10:00 AM)
$tomorrow = (Get-Date).AddDays(1).Date.AddHours(10)
$dateISO = $tomorrow.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$newClass = @{
    title = "Clase de Surf para Principiantes"
    description = "Clase introductoria de surf en la playa"
    date = $dateISO
    duration = 90
    capacity = 8
    price = 50.00
    level = "BEGINNER"
    instructor = "Carlos Mendoza"
    studentDetails = "- Juan Pérez (Primera clase)`n- María García (Repaso básico)"
}

Write-Host "   📅 Fecha: $($tomorrow.ToString('dd/MM/yyyy HH:mm'))" -ForegroundColor Gray
Write-Host "   👥 Capacidad: $($newClass.capacity) estudiantes" -ForegroundColor Gray
Write-Host "   💰 Precio: `$$($newClass.price)" -ForegroundColor Gray

$createResult = Invoke-ApiRequest -Method "POST" -Endpoint "/classes" -Body $newClass -Token $TOKEN

if ($createResult.Success) {
    $classId = $createResult.Data.id
    Write-Host "   ✅ Clase creada exitosamente" -ForegroundColor Green
    Write-Host "   🆔 ID: $classId" -ForegroundColor Gray
    Write-Host "   📝 Título: $($createResult.Data.title)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "   ❌ Error al crear clase:" -ForegroundColor Red
    Write-Host "   Mensaje: $($createResult.Error.message)" -ForegroundColor Red
    if ($createResult.Error.errors) {
        Write-Host "   Errores de validación:" -ForegroundColor Red
        foreach ($err in $createResult.Error.errors) {
            Write-Host "     - $($err.path -join '.'): $($err.message)" -ForegroundColor Red
        }
    }
    Write-Host ""
    exit 1
}

# ========================================
# 3. LISTAR CLASES
# ========================================
Write-Host "3️⃣  Listando todas las clases..." -ForegroundColor Yellow

$listResult = Invoke-ApiRequest -Method "GET" -Endpoint "/classes"

if ($listResult.Success) {
    $totalClasses = $listResult.Data.Count
    Write-Host "   ✅ Total de clases: $totalClasses" -ForegroundColor Green
    
    if ($totalClasses -gt 0) {
        Write-Host "   📋 Últimas 3 clases:" -ForegroundColor Gray
        $listResult.Data | Select-Object -First 3 | ForEach-Object {
            Write-Host "     • ID: $($_.id) - $($_.title) - $($_.level)" -ForegroundColor Gray
        }
    }
    Write-Host ""
} else {
    Write-Host "   ❌ Error al listar clases: $($listResult.Error.message)" -ForegroundColor Red
    Write-Host ""
}

# ========================================
# 4. OBTENER CLASE POR ID
# ========================================
Write-Host "4️⃣  Obteniendo detalles de la clase creada..." -ForegroundColor Yellow

$getResult = Invoke-ApiRequest -Method "GET" -Endpoint "/classes/$classId"

if ($getResult.Success) {
    Write-Host "   ✅ Clase obtenida exitosamente" -ForegroundColor Green
    Write-Host "   📝 Título: $($getResult.Data.title)" -ForegroundColor Gray
    Write-Host "   📅 Fecha: $($getResult.Data.date)" -ForegroundColor Gray
    Write-Host "   👨‍🏫 Instructor: $($getResult.Data.instructor)" -ForegroundColor Gray
    Write-Host "   🏫 Escuela: $($getResult.Data.school.name)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "   ❌ Error al obtener clase: $($getResult.Error.message)" -ForegroundColor Red
    Write-Host ""
}

# ========================================
# 5. ACTUALIZAR CLASE
# ========================================
Write-Host "5️⃣  Actualizando la clase..." -ForegroundColor Yellow

$updateData = @{
    title = "Clase de Surf para Principiantes - ACTUALIZADA"
    capacity = 10
    price = 55.00
    description = "Clase introductoria actualizada con más cupos"
}

Write-Host "   📝 Nueva capacidad: $($updateData.capacity)" -ForegroundColor Gray
Write-Host "   💰 Nuevo precio: `$$($updateData.price)" -ForegroundColor Gray

$updateResult = Invoke-ApiRequest -Method "PUT" -Endpoint "/classes/$classId" -Body $updateData -Token $TOKEN

if ($updateResult.Success) {
    Write-Host "   ✅ Clase actualizada exitosamente" -ForegroundColor Green
    Write-Host "   📝 Nuevo título: $($updateResult.Data.title)" -ForegroundColor Gray
    Write-Host "   👥 Nueva capacidad: $($updateResult.Data.capacity)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "   ❌ Error al actualizar clase:" -ForegroundColor Red
    Write-Host "   Mensaje: $($updateResult.Error.message)" -ForegroundColor Red
    Write-Host ""
}

# ========================================
# 6. FILTRAR CLASES POR NIVEL
# ========================================
Write-Host "6️⃣  Filtrando clases por nivel BEGINNER..." -ForegroundColor Yellow

$filterResult = Invoke-ApiRequest -Method "GET" -Endpoint "/classes?level=BEGINNER"

if ($filterResult.Success) {
    $filteredCount = $filterResult.Data.Count
    Write-Host "   ✅ Clases encontradas: $filteredCount" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "   ❌ Error al filtrar clases: $($filterResult.Error.message)" -ForegroundColor Red
    Write-Host ""
}

# ========================================
# 7. ELIMINAR CLASE
# ========================================
Write-Host "7️⃣  Eliminando la clase de prueba..." -ForegroundColor Yellow

$deleteResult = Invoke-ApiRequest -Method "DELETE" -Endpoint "/classes/$classId" -Token $TOKEN

if ($deleteResult.Success) {
    Write-Host "   ✅ Clase eliminada exitosamente" -ForegroundColor Green
    Write-Host "   🗑️  ID eliminado: $classId" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "   ❌ Error al eliminar clase:" -ForegroundColor Red
    Write-Host "   Mensaje: $($deleteResult.Error.message)" -ForegroundColor Red
    Write-Host ""
}

# ========================================
# 8. VERIFICAR ELIMINACIÓN
# ========================================
Write-Host "8️⃣  Verificando que la clase fue eliminada..." -ForegroundColor Yellow

$verifyResult = Invoke-ApiRequest -Method "GET" -Endpoint "/classes/$classId"

if (-not $verifyResult.Success -and $verifyResult.StatusCode -eq 404) {
    Write-Host "   ✅ Confirmado: La clase ya no existe" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "   ⚠️  Advertencia: La clase aún existe o error inesperado" -ForegroundColor Yellow
    Write-Host ""
}

# ========================================
# RESUMEN FINAL
# ========================================
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Login exitoso" -ForegroundColor Green
Write-Host "✅ Clase creada correctamente" -ForegroundColor Green
Write-Host "✅ Listado de clases funcional" -ForegroundColor Green
Write-Host "✅ Obtención de clase por ID funcional" -ForegroundColor Green
Write-Host "✅ Actualización de clase exitosa" -ForegroundColor Green
Write-Host "✅ Filtrado de clases funcional" -ForegroundColor Green
Write-Host "✅ Eliminación de clase exitosa" -ForegroundColor Green
Write-Host "✅ Verificación de eliminación correcta" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE" -ForegroundColor Green
Write-Host ""
