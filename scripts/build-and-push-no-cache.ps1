param(
    [Parameter(Mandatory = $true)]
    [string]$DockerUsername,
    [string]$Version = "v1.0.2",
    [switch]$SkipLogin,
    [string]$RailwayProjectId = "5b9527ff-cf02-405e-989f-f1120848d679"
)

$ErrorActionPreference = "Stop"

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

function Confirm-DockerRunning {
    Write-Header "Checking Docker"
    try {
        docker version | Out-Null
        Write-Color "Docker is running" "Green"
    }
    catch {
        Write-Color "Docker Desktop is not running. Please start it and try again." "Red"
        exit 1
    }
}

function Confirm-DockerLogin {
    if ($SkipLogin) {
        Write-Color "Skipping Docker Hub login check (SkipLogin flag provided)." "Yellow"
        return
    }

    Write-Header "Checking Docker Hub login"

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $infoOutput = (& docker info 2>&1)
    $infoExitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousPreference

    if ($infoExitCode -ne 0) {
        Write-Color "docker info reported warnings or errors:" "Yellow"
        Write-Host $infoOutput
        Write-Color "Attempting docker login anyway..." "Yellow"
        docker login
        if ($LASTEXITCODE -ne 0) {
            Write-Color "Login failed" "Red"
            exit 1
        }
        Write-Color "Authenticated with Docker Hub" "Green"
        return
    }

    $loginCheck = $infoOutput | Select-String "Username"
    if (-not $loginCheck) {
        Write-Color "You are not logged in to Docker Hub" "Yellow"
        Write-Color "Running docker login..." "Yellow"
        docker login
        if ($LASTEXITCODE -ne 0) {
            Write-Color "Login failed" "Red"
            exit 1
        }
    }
    Write-Color "Authenticated with Docker Hub" "Green"
}

function Invoke-Build {
    param(
        [string]$Folder,
        [string]$ImageName,
        [string]$VersionTag
    )

    Push-Location $Folder
    try {
        Write-Color "Building ${ImageName}:${VersionTag}" "Yellow"
        docker build --no-cache -t "${ImageName}:${VersionTag}" -t "${ImageName}:latest" .
        if ($LASTEXITCODE -ne 0) {
            throw "Docker build failed for ${ImageName}"
        }
        Write-Color "Build completed for ${ImageName}" "Green"
    }
    finally {
        Pop-Location
    }
}

function Invoke-WithRetry {
    param(
        [ScriptBlock]$Action,
        [int]$MaxAttempts = 5,
        [int]$InitialDelaySeconds = 3,
        [string]$ActionName = "operation"
    )

    $attempt = 1
    $delay = $InitialDelaySeconds
    while ($true) {
        $output = & $Action 2>&1
        if ($LASTEXITCODE -eq 0) {
            if ($output) { Write-Host $output }
            return
        }

        # Muestra salida del intento fallido para diagnóstico
        if ($output) { Write-Host $output }

        if ($attempt -ge $MaxAttempts) {
            throw "Failed to complete $ActionName after $attempt attempts. Last exit code: $LASTEXITCODE"
        }

        Write-Color ("$ActionName failed (attempt {0}/{1}). Retrying in {2}s..." -f $attempt, $MaxAttempts, $delay) "Yellow"
        Start-Sleep -Seconds $delay
        $attempt++
        $delay = [Math]::Min($delay * 2, 60)
    }
}

function Push-Image {
    param(
        [string]$ImageName,
        [string]$VersionTag
    )

    Write-Color "Pushing ${ImageName}:${VersionTag}" "Magenta"
    Invoke-WithRetry -Action { docker push "${ImageName}:${VersionTag}" } -MaxAttempts 6 -InitialDelaySeconds 3 -ActionName "docker push ${ImageName}:${VersionTag}"

    Write-Color "Pushing ${ImageName}:latest" "Magenta"
    Invoke-WithRetry -Action { docker push "${ImageName}:latest" } -MaxAttempts 6 -InitialDelaySeconds 3 -ActionName "docker push ${ImageName}:latest"
}

function Deploy-To-Railway {
    param([string]$ProjectId)

    Write-Header "Deploying to Railway"

    # Check for Railway CLI
    if (-not (Get-Command "railway" -ErrorAction SilentlyContinue)) {
        Write-Color "Railway CLI not found. Please install it with 'npm i -g @railway/cli'" "Red"
        Write-Color "Skipping Railway deployment." "Yellow"
        return
    }

    try {
        # Link Project (suppress output to avoid clutter, or show if debugging needed)
        Write-Color "Linking to Railway project $ProjectId..." "Yellow"
        # We allow this to fail if already linked or interactive, but we try standard link
        railway link $ProjectId 2>&1 | Out-Host
        
        # Deploy Backend
        if (Test-Path "backend") {
            Write-Color "Triggering deployment for Backend..." "Magenta"
            # Attempt to deploy service 'backend'. If service doesn't exist by that name, it might error.
            railway up --service backend --detach 2>&1 | Out-Host
        }
        else {
            Write-Color "Backend folder not found, skipping backend deployment." "Yellow"
        }

        # Deploy Frontend
        if (Test-Path "frontend") {
            Write-Color "Triggering deployment for Frontend..." "Magenta"
            railway up --service frontend --detach 2>&1 | Out-Host
        }
        else {
            Write-Color "Frontend folder not found, skipping frontend deployment." "Yellow"
        }

        Write-Color "Railway deployment triggered successfully." "Green"
        Write-Color "Monitor status at: https://railway.app/project/$ProjectId" "Cyan"

    }
    catch {
        Write-Color "Failed to deploy to Railway: $_" "Red"
        # We don't exit here to ensure we still report the Docker Hub success
    }
}

if (-not $DockerUsername) {
    Write-Color "Docker username is required." "Red"
    exit 1
}

$backendImage = "$DockerUsername/clasedesurf-backend"
$frontendImage = "$DockerUsername/clasedesurf-frontend"

Write-Color "Docker Hub Username: $DockerUsername" "White"
Write-Color "Version Tag: $Version" "White"
Write-Color "Railway Project ID: $RailwayProjectId" "White"

Confirm-DockerRunning
Confirm-DockerLogin

Write-Header "Building backend image"
Invoke-Build -Folder "backend" -ImageName $backendImage -VersionTag $Version

Write-Header "Building frontend image"
Invoke-Build -Folder "frontend" -ImageName $frontendImage -VersionTag $Version

Write-Header "Pushing images"
Push-Image -ImageName $backendImage -VersionTag $Version
Push-Image -ImageName $frontendImage -VersionTag $Version

# Trigger Railway Deployment
Deploy-To-Railway -ProjectId $RailwayProjectId

Write-Header "Done"
Write-Color "Images published:" "Green"
Write-Color "  ${backendImage}:${Version}" "Green"
Write-Color "  ${backendImage}:latest" "Green"
Write-Color "  ${frontendImage}:${Version}" "Green"
Write-Color "  ${frontendImage}:latest" "Green"
Write-Color "Railway deployment triggered for Project: $RailwayProjectId" "Cyan"
