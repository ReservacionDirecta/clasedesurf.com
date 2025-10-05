@echo off
echo ========================================
echo   Evolution API - Inicio Rapido
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

echo Levantando servicios...
docker-compose up -d

if errorlevel 1 (
    echo.
    echo ERROR: No se pudieron iniciar los servicios
    echo Verifica que Docker Desktop este ejecutandose
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Servicios iniciados correctamente!
echo ========================================
echo.
echo Evolution API: http://localhost:8080
echo PostgreSQL:    localhost:5432
echo Redis:         localhost:6379
echo.
echo API Key: change-this-api-key-for-production
echo.
echo Para ver los logs:
echo   docker-compose logs -f evolution-api
echo.
echo Para detener los servicios:
echo   docker-compose down
echo.
echo Consulta EVOLUTION_API_SETUP.md para mas informacion
echo.
pause
