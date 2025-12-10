@echo off
echo ============================================
echo   Verificacion de Configuracion de Resend
echo ============================================
echo.

REM Verificar si existe .env
if not exist .env (
    echo [ERROR] No se encontro el archivo .env
    echo.
    echo Crea un archivo .env copiando .env.example:
    echo   copy .env.example .env
    echo.
    pause
    exit /b 1
)

echo [OK] Archivo .env encontrado
echo.

REM Buscar RESEND_API_KEY en .env
findstr /C:"RESEND_API_KEY" .env >nul
if errorlevel 1 (
    echo [ERROR] RESEND_API_KEY no encontrada en .env
    echo.
    echo Agrega esta linea a tu archivo .env:
    echo   RESEND_API_KEY=re_JGWUMeCy_6eWnxXREMkZBdifWYnDxsH7U
    echo.
    pause
    exit /b 1
) else (
    echo [OK] RESEND_API_KEY encontrada en .env
)

REM Buscar EMAIL_FROM en .env
findstr /C:"EMAIL_FROM" .env >nul
if errorlevel 1 (
    echo [WARN] EMAIL_FROM no encontrada en .env
    echo.
    echo Se recomienda agregar:
    echo   EMAIL_FROM=info@clasedesurf.com
    echo.
) else (
    echo [OK] EMAIL_FROM encontrada en .env
)

REM Buscar FRONTEND_URL en .env
findstr /C:"FRONTEND_URL" .env >nul
if errorlevel 1 (
    echo [WARN] FRONTEND_URL no encontrada en .env
    echo.
    echo Se recomienda agregar:
    echo   FRONTEND_URL=http://localhost:3000
    echo.
) else (
    echo [OK] FRONTEND_URL encontrada en .env
)

echo.
echo ============================================
echo   Verificacion completada
echo ============================================
echo.
echo Para iniciar el servidor:
echo   npm run dev
echo.
pause
