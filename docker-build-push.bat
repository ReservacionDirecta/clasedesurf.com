@echo off
echo ========================================
echo   Surf School - Build y Push a Docker Hub
echo ========================================
echo.

REM Verificar que Docker esté corriendo
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado o no esta corriendo
    pause
    exit /b 1
)

REM Solicitar username de Docker Hub
set /p DOCKER_USERNAME="Ingresa tu username de Docker Hub: "
if "%DOCKER_USERNAME%"=="" (
    echo ERROR: Username es requerido
    pause
    exit /b 1
)

echo.
echo Username: %DOCKER_USERNAME%
echo.

REM Login a Docker Hub
echo Iniciando sesion en Docker Hub...
docker login
if errorlevel 1 (
    echo ERROR: No se pudo iniciar sesion en Docker Hub
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Construyendo imagenes...
echo ========================================
echo.

REM Build Frontend
echo Construyendo Frontend (Next.js)...
docker build -t %DOCKER_USERNAME%/surfschool-frontend:latest ./frontend
if errorlevel 1 (
    echo ERROR: Fallo al construir frontend
    pause
    exit /b 1
)

REM Build Backend
echo Construyendo Backend (Node.js)...
docker build -t %DOCKER_USERNAME%/surfschool-backend:latest ./backend
if errorlevel 1 (
    echo ERROR: Fallo al construir backend
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Subiendo imagenes a Docker Hub...
echo ========================================
echo.

REM Push Frontend
echo Subiendo Frontend...
docker push %DOCKER_USERNAME%/surfschool-frontend:latest
if errorlevel 1 (
    echo ERROR: Fallo al subir frontend
    pause
    exit /b 1
)

REM Push Backend
echo Subiendo Backend...
docker push %DOCKER_USERNAME%/surfschool-backend:latest
if errorlevel 1 (
    echo ERROR: Fallo al subir backend
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Imagenes subidas exitosamente!
echo ========================================
echo.
echo Frontend: %DOCKER_USERNAME%/surfschool-frontend:latest
echo Backend:  %DOCKER_USERNAME%/surfschool-backend:latest
echo.
echo Para usar estas imagenes, actualiza docker-compose.yml con:
echo   frontend: image: %DOCKER_USERNAME%/surfschool-frontend:latest
echo   backend:  image: %DOCKER_USERNAME%/surfschool-backend:latest
echo.
pause