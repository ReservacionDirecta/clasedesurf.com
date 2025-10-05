# Test Backend and Frontend Connectivity
Write-Host "Testing Frontend-Backend Connectivity" -ForegroundColor Green
Write-Host ("=" * 50)

$BACKEND_URL = "http://localhost:4000"
$FRONTEND_URL = "http://localhost:3000"

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host ""
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        $content = $response.Content
        if ($content.Length -gt 100) {
            $content = $content.Substring(0, 100) + "..."
        }
        Write-Host "Response: $content" -ForegroundColor Cyan
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test Backend Direct Endpoints
Write-Host ""
Write-Host "BACKEND DIRECT ENDPOINTS:" -ForegroundColor Magenta
Test-Endpoint "$BACKEND_URL/" "Backend Root"
Test-Endpoint "$BACKEND_URL/test/123" "Backend Test Route"
Test-Endpoint "$BACKEND_URL/db-test" "Database Connection"
Test-Endpoint "$BACKEND_URL/schools" "Schools API"
Test-Endpoint "$BACKEND_URL/classes" "Classes API"

# Test Frontend Proxy Endpoints (only if frontend is running)
Write-Host ""
Write-Host "FRONTEND PROXY ENDPOINTS:" -ForegroundColor Magenta
Test-Endpoint "$FRONTEND_URL/api/schools" "Schools via Proxy"
Test-Endpoint "$FRONTEND_URL/api/classes" "Classes via Proxy"
Test-Endpoint "$FRONTEND_URL/api/instructors" "Instructors via Proxy"

Write-Host ""
Write-Host ("=" * 50)
Write-Host "Connectivity Test Complete" -ForegroundColor Green