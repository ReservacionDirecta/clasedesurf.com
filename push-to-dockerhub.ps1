# Script para subir imagenes a Docker Hub

Write-Host "Subiendo imagenes a Docker Hub..." -ForegroundColor Cyan
Write-Host ""

# Backend
Write-Host "Subiendo Backend..." -ForegroundColor Yellow
docker push chambadigital/surfschool-backend:latest

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend latest subido OK" -ForegroundColor Green
} else {
    Write-Host "Error subiendo backend latest" -ForegroundColor Red
}

docker push chambadigital/surfschool-backend:v1.0

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend v1.0 subido OK" -ForegroundColor Green
} else {
    Write-Host "Error subiendo backend v1.0" -ForegroundColor Red
}

# Frontend
Write-Host ""
Write-Host "Subiendo Frontend..." -ForegroundColor Yellow
docker push chambadigital/surfschool-frontend:latest

if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend latest subido OK" -ForegroundColor Green
} else {
    Write-Host "Error subiendo frontend latest" -ForegroundColor Red
}

docker push chambadigital/surfschool-frontend:v1.0

if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend v1.0 subido OK" -ForegroundColor Green
} else {
    Write-Host "Error subiendo frontend v1.0" -ForegroundColor Red
}

Write-Host ""
Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifica en:" -ForegroundColor Cyan
Write-Host "  https://hub.docker.com/r/chambadigital/surfschool-backend" -ForegroundColor White
Write-Host "  https://hub.docker.com/r/chambadigital/surfschool-frontend" -ForegroundColor White
Write-Host ""
