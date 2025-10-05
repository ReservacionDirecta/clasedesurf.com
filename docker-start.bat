@echo off
echo ========================================
echo   Surf School - Iniciando Aplicacion
echo ========================================
echo.

echo Verificando Docker Desktop...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado o no esta en el PATH
    echo Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker encontrado!
echo.

echo Construyendo y levantando servicios...
docker-compose -f docker-compose.full.yml up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: No se pudieron iniciar los servicios
    echo Verifica que Docker Desktop este ejecutandose
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Aplicacion iniciada correctamente!
echo ========================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:4000
echo Database:  localhost:5432
echo Nginx:     http://localhost:80
echo.
echo Para ver los logs:
echo   docker-compose -f docker-compose.full.yml logs -f
echo.
echo Para detener los servicios:
echo   docker-compose -f docker-compose.full.yml down
echo.
pause