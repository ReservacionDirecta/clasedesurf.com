# Check Services Status and Provide Instructions
Write-Host "Checking Services Status" -ForegroundColor Green
Write-Host ("=" * 50)

# Check Backend (port 4000)
Write-Host "`nChecking Backend (port 4000)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:4000/" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "   Status: $($backendResponse.StatusCode)" -ForegroundColor Cyan
    $backendData = $backendResponse.Content | ConvertFrom-Json
    Write-Host "   Message: $($backendData.message)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   To start backend: cd backend && npm start" -ForegroundColor Yellow
}

# Check Frontend (port 3000)
Write-Host "`nChecking Frontend (port 3000)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000/" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Frontend is running" -ForegroundColor Green
    Write-Host "   Status: $($frontendResponse.StatusCode)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Frontend is NOT running" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   To start frontend: cd frontend && npm run dev" -ForegroundColor Yellow
}

# Check Frontend API Test Route
Write-Host "`nChecking Frontend API Routes..." -ForegroundColor Yellow
try {
    $apiTestResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/test" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Frontend API routes are working" -ForegroundColor Green
    $apiData = $apiTestResponse.Content | ConvertFrom-Json
    Write-Host "   Backend URL configured: $($apiData.backendUrl)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Frontend API routes are NOT working" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Solution: Restart frontend server (Ctrl+C then npm run dev)" -ForegroundColor Yellow
}

# Check Proxy Connectivity
Write-Host "`nChecking Proxy Connectivity..." -ForegroundColor Yellow
try {
    $proxyResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/schools" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Proxy is working" -ForegroundColor Green
    $proxyData = $proxyResponse.Content | ConvertFrom-Json
    Write-Host "   Schools received: $($proxyData.Count)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Proxy is NOT working" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 50)
Write-Host "Service Check Complete" -ForegroundColor Green

# Provide next steps
Write-Host "`nNext Steps:" -ForegroundColor Magenta
Write-Host "1. If backend is not running: cd backend && npm start" -ForegroundColor White
Write-Host "2. If frontend is not running: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. If API routes don't work: Restart frontend (Ctrl+C then npm run dev)" -ForegroundColor White
Write-Host "4. Once both are running, test with: .\test-endpoints.ps1" -ForegroundColor White