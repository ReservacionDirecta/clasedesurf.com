# Script para configurar variables de entorno en Railway
param(
    [Parameter(Mandatory=$true)]
    [string]$BackendDomain,
    
    [Parameter(Mandatory=$true)]
    [string]$FrontendDomain,
    
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl
)

Write-Host "🔧 Configurando variables de entorno para Railway..." -ForegroundColor Green

# Generar secretos seguros
$JwtSecret = -join ((1..32) | ForEach {Get-Random -input ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9'))})
$JwtRefreshSecret = -join ((1..32) | ForEach {Get-Random -input ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9'))})
$NextAuthSecret = -join ((1..32) | ForEach {Get-Random -input ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9'))})

Write-Host "📦 Configurando Backend..." -ForegroundColor Yellow
Set-Location backend

# Variables del Backend
railway variables set DATABASE_URL="$DatabaseUrl"
railway variables set PORT=4000
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$JwtSecret"
railway variables set JWT_REFRESH_SECRET="$JwtRefreshSecret"
railway variables set FRONTEND_URL="https://$FrontendDomain"
railway variables set WHATSAPP_ENABLED=false

Write-Host "✅ Variables del Backend configuradas" -ForegroundColor Green

Write-Host "🌐 Configurando Frontend..." -ForegroundColor Yellow
Set-Location ../frontend

# Variables del Frontend
railway variables set NEXT_PUBLIC_API_URL="https://$BackendDomain"
railway variables set NEXT_PUBLIC_BACKEND_URL="https://$BackendDomain"
railway variables set BACKEND_URL="https://$BackendDomain"
railway variables set NEXTAUTH_URL="https://$FrontendDomain"
railway variables set NEXTAUTH_SECRET="$NextAuthSecret"
railway variables set NODE_ENV=production
railway variables set NEXT_TELEMETRY_DISABLED=1

Write-Host "✅ Variables del Frontend configuradas" -ForegroundColor Green

Set-Location ..

Write-Host "🎉 Configuración completada!" -ForegroundColor Green
Write-Host "📋 Secretos generados:" -ForegroundColor Cyan
Write-Host "JWT_SECRET: $JwtSecret" -ForegroundColor White
Write-Host "JWT_REFRESH_SECRET: $JwtRefreshSecret" -ForegroundColor White
Write-Host "NEXTAUTH_SECRET: $NextAuthSecret" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "⚠️  Guarda estos secretos en un lugar seguro!" -ForegroundColor Yellow