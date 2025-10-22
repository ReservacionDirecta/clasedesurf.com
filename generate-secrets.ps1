# Script para generar secrets seguros para Railway

Write-Host "🔐 Generando secrets seguros..." -ForegroundColor Green
Write-Host ""

Write-Host "JWT_SECRET:" -ForegroundColor Cyan
$jwtSecret = (node -e "console.log(require('crypto').randomBytes(32).toString('hex'))").Trim()
Write-Host $jwtSecret -ForegroundColor Yellow
Write-Host ""

Write-Host "JWT_REFRESH_SECRET:" -ForegroundColor Cyan
$jwtRefreshSecret = (node -e "console.log(require('crypto').randomBytes(32).toString('hex'))").Trim()
Write-Host $jwtRefreshSecret -ForegroundColor Yellow
Write-Host ""

Write-Host "NEXTAUTH_SECRET:" -ForegroundColor Cyan
$nextAuthSecret = (node -e "console.log(require('crypto').randomBytes(32).toString('hex'))").Trim()
Write-Host $nextAuthSecret -ForegroundColor Yellow
Write-Host ""

Write-Host "✅ Secrets generados exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Copia estos valores a Railway Dashboard:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Variables:" -ForegroundColor Magenta
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White
Write-Host "JWT_REFRESH_SECRET=$jwtRefreshSecret" -ForegroundColor White
Write-Host ""
Write-Host "Frontend Variables:" -ForegroundColor Magenta
Write-Host "NEXTAUTH_SECRET=$nextAuthSecret" -ForegroundColor White
Write-Host ""

# Guardar en archivo temporal (no se sube a Git)
$secretsFile = "railway-secrets.txt"
@"
# Railway Secrets - Generados el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ⚠️ NO COMPARTAS ESTE ARCHIVO

## Backend Variables
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefreshSecret

## Frontend Variables
NEXTAUTH_SECRET=$nextAuthSecret

## Instrucciones
1. Ve a Railway Dashboard
2. Selecciona tu servicio (Backend o Frontend)
3. Ve a "Variables"
4. Agrega estas variables
5. Guarda y redespliega

"@ | Out-File -FilePath $secretsFile -Encoding UTF8

Write-Host "💾 Secrets guardados en: $secretsFile" -ForegroundColor Green
Write-Host "⚠️  Este archivo NO se subirá a Git (está en .gitignore)" -ForegroundColor Yellow
