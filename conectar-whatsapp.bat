@echo off
echo ========================================
echo   Conectar WhatsApp - Evolution API
echo ========================================
echo.

REM Verificar que Evolution API este corriendo
curl -s http://localhost:8080 >nul 2>&1
if errorlevel 1 (
    echo Evolution API no esta corriendo.
    echo Iniciando servicios...
    echo.
    docker-compose up -d
    timeout /t 10 /nobreak >nul
)

echo Abriendo interfaz de WhatsApp...
start whatsapp-qr.html

echo.
echo ========================================
echo   Instrucciones:
echo ========================================
echo.
echo 1. Espera a que aparezca el codigo QR
echo 2. Abre WhatsApp en tu telefono
echo 3. Ve a Configuracion ^> Dispositivos vinculados
echo 4. Toca "Vincular un dispositivo"
echo 5. Escanea el codigo QR
echo.
echo ========================================
echo.
pause
