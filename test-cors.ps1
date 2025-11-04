# ============================================
# TEST CORS CONFIGURATION
# ============================================

param(
    [string]$BackendUrl = "https://clasesde-pe-backend-production.up.railway.app",
    [string]$FrontendUrl = "https://clasedesurfcom-production.up.railway.app"
)

$ErrorActionPreference = "Stop"

# Colores
function Write-Color {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Color "============================================" "Cyan"
    Write-Color $Message "Cyan"
    Write-Color "============================================" "Cyan"
    Write-Host ""
}

Write-Header "Testing CORS Configuration"

# Test 1: Health Check
Write-Color "1. Testing Backend Health Check..." "Yellow"
try {
    $healthResponse = Invoke-RestMethod -Uri "$BackendUrl/health" -Method GET
    Write-Color "✅ Backend is healthy" "Green"
    Write-Color "   Status: $($healthResponse.status)" "White"
    Write-Color "   Uptime: $([math]::Round($healthResponse.uptime, 2)) seconds" "White"
} catch {
    Write-Color "❌ Backend health check failed: $($_.Exception.Message)" "Red"
    exit 1
}

# Test 2: CORS Preflight Request
Write-Color "2. Testing CORS Preflight Request..." "Yellow"
try {
    $headers = @{
        'Origin' = $FrontendUrl
        'Access-Control-Request-Method' = 'GET'
        'Access-Control-Request-Headers' = 'Content-Type,Authorization'
    }
    
    $preflightResponse = Invoke-WebRequest -Uri "$BackendUrl/classes" -Method OPTIONS -Headers $headers -UseBasicParsing
    
    if ($preflightResponse.StatusCode -eq 200) {
        Write-Color "✅ CORS Preflight successful" "Green"
        
        # Check CORS headers
        $corsHeaders = $preflightResponse.Headers
        if ($corsHeaders['Access-Control-Allow-Origin']) {
            Write-Color "   ✅ Access-Control-Allow-Origin: $($corsHeaders['Access-Control-Allow-Origin'])" "Green"
        } else {
            Write-Color "   ❌ Missing Access-Control-Allow-Origin header" "Red"
        }
        
        if ($corsHeaders['Access-Control-Allow-Methods']) {
            Write-Color "   ✅ Access-Control-Allow-Methods: $($corsHeaders['Access-Control-Allow-Methods'])" "Green"
        }
        
        if ($corsHeaders['Access-Control-Allow-Headers']) {
            Write-Color "   ✅ Access-Control-Allow-Headers: $($corsHeaders['Access-Control-Allow-Headers'])" "Green"
        }
        
        if ($corsHeaders['Access-Control-Allow-Credentials']) {
            Write-Color "   ✅ Access-Control-Allow-Credentials: $($corsHeaders['Access-Control-Allow-Credentials'])" "Green"
        }
    }
} catch {
    Write-Color "❌ CORS Preflight failed: $($_.Exception.Message)" "Red"
}

# Test 3: Actual API Request with Origin
Write-Color "3. Testing API Request with Origin..." "Yellow"
try {
    $headers = @{
        'Origin' = $FrontendUrl
        'Content-Type' = 'application/json'
    }
    
    $apiResponse = Invoke-RestMethod -Uri "$BackendUrl/classes" -Method GET -Headers $headers
    Write-Color "✅ API request successful" "Green"
    Write-Color "   Classes found: $($apiResponse.Count)" "White"
} catch {
    Write-Color "❌ API request failed: $($_.Exception.Message)" "Red"
    Write-Color "   This might be expected if there are no classes in the database" "Yellow"
}

# Test 4: Test with different origins
Write-Color "4. Testing with different origins..." "Yellow"

$testOrigins = @(
    "http://localhost:3000",
    "http://localhost:3001", 
    "https://clasedesurfcom-production.up.railway.app",
    "https://clasesde-pe-production.up.railway.app",
    "https://invalid-origin.com"
)

foreach ($origin in $testOrigins) {
    try {
        $headers = @{
            'Origin' = $origin
            'Access-Control-Request-Method' = 'GET'
        }
        
        $response = Invoke-WebRequest -Uri "$BackendUrl/health" -Method OPTIONS -Headers $headers -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Color "   ✅ $origin - Allowed" "Green"
        } else {
            Write-Color "   ❌ $origin - Blocked" "Red"
        }
    } catch {
        if ($origin -eq "https://invalid-origin.com") {
            Write-Color "   ✅ $origin - Correctly blocked" "Green"
        } else {
            Write-Color "   ❌ $origin - Unexpected error: $($_.Exception.Message)" "Red"
        }
    }
}

Write-Header "CORS Test Complete"
Write-Color "Backend URL: $BackendUrl" "Cyan"
Write-Color "Frontend URL: $FrontendUrl" "Cyan"
Write-Host ""
Write-Color "If you're still experiencing CORS issues:" "Yellow"
Write-Color "1. Make sure the backend is deployed with the latest image" "White"
Write-Color "2. Check Railway environment variables" "White"
Write-Color "3. Verify the frontend URL is correct" "White"
Write-Color "4. Check browser developer tools for detailed error messages" "White"