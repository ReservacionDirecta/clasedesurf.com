# Script para probar la generación de QR en Evolution API

$API_URL = "http://localhost:8080"
$API_KEY = "change-this-api-key-for-production"
$INSTANCE = "surfschool"

Write-Host "`n=== TEST EVOLUTION API - QR CODE ===`n" -ForegroundColor Cyan

# Test 1: Verificar que la API responde
Write-Host "1. Verificando API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $API_URL -Method GET -UseBasicParsing
    Write-Host "   ✅ API responde (Status: $($response.StatusCode))`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API no responde`n" -ForegroundColor Red
    exit
}

# Test 2: Verificar instancia
Write-Host "2. Verificando instancia..." -ForegroundColor Yellow
try {
    $instance = Invoke-RestMethod -Uri "$API_URL/instance/fetchInstances?instanceName=$INSTANCE" `
        -Method GET `
        -Headers @{ "apikey" = $API_KEY }
    
    Write-Host "   Nombre: $($instance.name)" -ForegroundColor White
    Write-Host "   Estado: $($instance.connectionStatus)" -ForegroundColor White
    Write-Host "   Token: $($instance.token)`n" -ForegroundColor White
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 3: Intentar obtener QR
Write-Host "3. Solicitando QR code..." -ForegroundColor Yellow
try {
    $qr = Invoke-RestMethod -Uri "$API_URL/instance/connect/$INSTANCE" `
        -Method GET `
        -Headers @{ "apikey" = $API_KEY }
    
    if ($qr.base64) {
        Write-Host "   ✅ QR generado exitosamente!" -ForegroundColor Green
        Write-Host "   Longitud base64: $($qr.base64.Length) caracteres`n" -ForegroundColor White
        
        # Guardar QR en archivo HTML
        $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>QR Code - WhatsApp</title>
    <style>
        body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
        }
        .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        img { 
            max-width: 400px; 
            border: 2px solid #ddd;
            border-radius: 10px;
        }
        h1 { color: #333; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏄 Surf School - WhatsApp QR</h1>
        <p>Escanea este código con WhatsApp</p>
        <img src="$($qr.base64)" alt="QR Code">
        <p style="margin-top: 20px; font-size: 14px;">
            El código expira en 30 segundos.<br>
            Si expira, recarga esta página.
        </p>
    </div>
</body>
</html>
"@
        $html | Out-File -FilePath "qr-simple.html" -Encoding UTF8
        Write-Host "   📄 QR guardado en: qr-simple.html" -ForegroundColor Cyan
        Write-Host "   🌐 Abriendo en navegador...`n" -ForegroundColor Cyan
        Start-Process "qr-simple.html"
        
    } elseif ($qr.pairingCode) {
        Write-Host "   ✅ Código de emparejamiento: $($qr.pairingCode)`n" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  QR no disponible. Respuesta:" -ForegroundColor Yellow
        $qr | ConvertTo-Json -Depth 3
        Write-Host ""
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 4: Verificar logs
Write-Host "4. Últimas líneas de log:" -ForegroundColor Yellow
docker compose logs evolution-api --tail=10 2>$null | Select-String -Pattern "surfschool" | Select-Object -Last 3

Write-Host "`n=== FIN DEL TEST ===`n" -ForegroundColor Cyan
