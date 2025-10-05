@echo off
echo ========================================
echo   Surf School - Modo Desarrollo
echo ========================================
echo.

echo Iniciando solo base de datos y servicios auxiliares...
docker-compose -f docker-compose.full.yml up postgres redis -d

if errorlevel 1 (
    echo ERROR: No se pudieron iniciar los servicios
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Servicios auxiliares iniciados!
echo ========================================
echo.
echo Database:  localhost:5432
echo Redis:     localhost:6379
echo.
echo Ahora puedes ejecutar tu frontend y backend localmente:
echo.
echo Backend:
echo   cd backend
echo   npm run dev
echo.
echo Frontend:
echo   cd frontend  
echo   npm run dev
echo.
echo Para detener los servicios:
echo   docker-compose -f docker-compose.full.yml down
echo.
pause