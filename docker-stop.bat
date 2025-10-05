@echo off
echo ========================================
echo   Surf School - Deteniendo Aplicacion
echo ========================================
echo.

docker-compose -f docker-compose.full.yml down

echo.
echo Aplicacion detenida
echo.
pause