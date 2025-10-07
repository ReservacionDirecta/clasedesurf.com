# Verificar configuración
Write-Host "Verificando configuración..." -ForegroundColor Yellow

# Puertos
Write-Host "Puerto 4000:" -NoNewline
$port4000 = netstat -ano | findstr ":4000"
if ($port4000) {
    Write-Host " OCUPADO" -ForegroundColor Red
} else {
    Write-Host " LIBRE" -ForegroundColor Green
}

Write-Host "Puerto 3000:" -NoNewline
$port3000 = netstat -ano | findstr ":3000"
if ($port3000) {
    Write-Host " OCUPADO" -ForegroundColor Red
} else {
    Write-Host " LIBRE" -ForegroundColor Green
}

# Configuración backend
$serverConfig = Get-Content "backend/src/server.ts" | Select-String "const port"
Write-Host "Backend puerto: $($serverConfig.Line.Trim())" -ForegroundColor Gray

# Configuración frontend
$backendUrl = Get-Content "frontend/.env.local" | Select-String "NEXT_PUBLIC_BACKEND_URL"
Write-Host "Frontend URL: $($backendUrl.Line.Trim())" -ForegroundColor Gray

Write-Host ""
Write-Host "PARA INICIAR:" -ForegroundColor Cyan
Write-Host "1. Terminal 1: cd backend && npm run start" -ForegroundColor White
Write-Host "2. Terminal 2: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Abrir: http://localhost:3000" -ForegroundColor White