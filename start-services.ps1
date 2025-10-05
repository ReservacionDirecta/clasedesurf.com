# Start Backend and Frontend Services
Write-Host "Starting Backend and Frontend Services" -ForegroundColor Green
Write-Host ("=" * 50)

# Check if services are already running
Write-Host "Checking existing services..." -ForegroundColor Yellow

# Check backend port 4000
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/" -Method GET -TimeoutSec 2 -ErrorAction Stop
    $backendRunning = $true
    Write-Host "Backend is already running on port 4000" -ForegroundColor Green
}
catch {
    Write-Host "Backend is not running on port 4000" -ForegroundColor Red
}

# Check frontend port 3000
$frontendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -Method GET -TimeoutSec 2 -ErrorAction Stop
    $frontendRunning = $true
    Write-Host "Frontend is already running on port 3000" -ForegroundColor Green
}
catch {
    Write-Host "Frontend is not running on port 3000" -ForegroundColor Red
}

Write-Host ""

# Start Backend if not running
if (-not $backendRunning) {
    Write-Host "Starting Backend..." -ForegroundColor Yellow
    Write-Host "Please run this command in a separate terminal:" -ForegroundColor Cyan
    Write-Host "cd backend && npm start" -ForegroundColor White
    Write-Host ""
}

# Start Frontend if not running
if (-not $frontendRunning) {
    Write-Host "Starting Frontend..." -ForegroundColor Yellow
    Write-Host "Please run this command in a separate terminal:" -ForegroundColor Cyan
    Write-Host "cd frontend && npm run dev" -ForegroundColor White
    Write-Host ""
}

if ($backendRunning -and $frontendRunning) {
    Write-Host "Both services are running! Testing connectivity..." -ForegroundColor Green
    Write-Host ""
    
    # Run connectivity test
    & .\test-endpoints.ps1
}
else {
    Write-Host "Please start the services manually and then run:" -ForegroundColor Yellow
    Write-Host ".\test-endpoints.ps1" -ForegroundColor White
}