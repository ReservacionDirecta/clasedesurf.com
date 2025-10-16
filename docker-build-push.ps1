# ============================================
# BUILD Y PUSH A DOCKER HUB
# ============================================

param(
    [string]$DockerUsername = "reservaciondirecta",
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"

# Colores
function Write-Color {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Color "============================================" "Cyan"
    Write-Color $Message "Cyan"
    Write-Color "============================================" "Cyan"
    Write-Host ""
}

# Verificar que Docker esté corriendo
Write-Header "Verificando Docker"
try {
    docker version | Out-Null
    Write-Color "OK Docker esta corriendo" "Green"
} catch {
    Write-Color "ERROR Docker no esta corriendo. Por favor inicia Docker Desktop." "Red"
    exit 1
}

# Verificar login en Docker Hub
Write-Header "Verificando login en Docker Hub"
$ErrorActionPreference = "Continue"
$loginCheck = docker info 2>&1 | Select-String "Username"
$ErrorActionPreference = "Stop"

if (-not $loginCheck) {
    Write-Color "No estas logueado en Docker Hub" "Yellow"
    Write-Color "Ejecutando docker login..." "Yellow"
    docker login
    if ($LASTEXITCODE -ne 0) {
        Write-Color "ERROR al hacer login en Docker Hub" "Red"
        exit 1
    }
}
Write-Color "OK Logueado en Docker Hub" "Green"

# Nombres de las imágenes
$BackendImage = "${DockerUsername}/clasedesurf-backend"
$FrontendImage = "${DockerUsername}/clasedesurf-frontend"

# ============================================
# BUILD BACKEND
# ============================================
Write-Header "Construyendo Backend"
Write-Color "Imagen: ${BackendImage}:${Version}" "Cyan"

Push-Location backend
try {
    Write-Color "Construyendo imagen..." "Yellow"
    docker build -t "${BackendImage}:${Version}" -t "${BackendImage}:latest" .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Color "OK Backend construido exitosamente" "Green"
    } else {
        throw "Error al construir backend"
    }
} catch {
    Write-Color "ERROR al construir backend: $_" "Red"
    Pop-Location
    exit 1
} finally {
    Pop-Location
}

# ============================================
# BUILD FRONTEND
# ============================================
Write-Header "Construyendo Frontend"
Write-Color "Imagen: ${FrontendImage}:${Version}" "Cyan"

Push-Location frontend
try {
    Write-Color "Construyendo imagen..." "Yellow"
    docker build -t "${FrontendImage}:${Version}" -t "${FrontendImage}:latest" .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Color "OK Frontend construido exitosamente" "Green"
    } else {
        throw "Error al construir frontend"
    }
} catch {
    Write-Color "ERROR al construir frontend: $_" "Red"
    Pop-Location
    exit 1
} finally {
    Pop-Location
}

# ============================================
# PUSH BACKEND
# ============================================
Write-Header "Subiendo Backend a Docker Hub"
Write-Color "Subiendo ${BackendImage}:${Version}..." "Yellow"

docker push "${BackendImage}:${Version}"
if ($LASTEXITCODE -eq 0) {
    Write-Color "OK Backend subido exitosamente" "Green"
} else {
    Write-Color "ERROR al subir backend" "Red"
    exit 1
}

if ($Version -ne "latest") {
    Write-Color "Subiendo ${BackendImage}:latest..." "Yellow"
    docker push "${BackendImage}:latest"
    if ($LASTEXITCODE -eq 0) {
        Write-Color "OK Backend:latest subido exitosamente" "Green"
    } else {
        Write-Color "ADVERTENCIA Error al subir backend:latest" "Yellow"
    }
}

# ============================================
# PUSH FRONTEND
# ============================================
Write-Header "Subiendo Frontend a Docker Hub"
Write-Color "Subiendo ${FrontendImage}:${Version}..." "Yellow"

docker push "${FrontendImage}:${Version}"
if ($LASTEXITCODE -eq 0) {
    Write-Color "OK Frontend subido exitosamente" "Green"
} else {
    Write-Color "ERROR al subir frontend" "Red"
    exit 1
}

if ($Version -ne "latest") {
    Write-Color "Subiendo ${FrontendImage}:latest..." "Yellow"
    docker push "${FrontendImage}:latest"
    if ($LASTEXITCODE -eq 0) {
        Write-Color "OK Frontend:latest subido exitosamente" "Green"
    } else {
        Write-Color "ADVERTENCIA Error al subir frontend:latest" "Yellow"
    }
}

# ============================================
# RESUMEN
# ============================================
Write-Header "Resumen"
Write-Color "Imágenes creadas y subidas:" "Green"
Write-Host ""
Write-Color "Backend:" "Cyan"
Write-Color "  docker pull ${BackendImage}:${Version}" "White"
Write-Color "  docker pull ${BackendImage}:latest" "White"
Write-Host ""
Write-Color "Frontend:" "Cyan"
Write-Color "  docker pull ${FrontendImage}:${Version}" "White"
Write-Color "  docker pull ${FrontendImage}:latest" "White"
Write-Host ""

Write-Color "Docker Hub URLs:" "Cyan"
Write-Color "  Backend:  https://hub.docker.com/r/${DockerUsername}/clasedesurf-backend" "White"
Write-Color "  Frontend: https://hub.docker.com/r/${DockerUsername}/clasedesurf-frontend" "White"
Write-Host ""

Write-Header "PROCESO COMPLETADO"
