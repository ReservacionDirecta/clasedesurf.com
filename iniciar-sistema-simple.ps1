# Script simplificado para iniciar el sistema
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SISTEMA DE RESERVAS DE SURF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Node.js version:" -ForegroundColor Yellow
node --version

Write-Host ""
Write-Host "INSTRUCCIONES PARA INICIAR:" -ForegroundColor Green
Write-Host ""
Write-Host "1. TERMINAL 1 - Backend:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. TERMINAL 2 - Frontend:" -ForegroundColor Cyan  
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. ACCEDER AL SISTEMA:" -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3000" -ForegroundColor White
Write-Host "   Login: admin@escuela.com / admin123" -ForegroundColor White
Write-Host ""
Write-Host "4. PROBAR ENDPOINTS:" -ForegroundColor Cyan
Write-Host "   .\test-all-endpoints-clean.ps1" -ForegroundColor White
Write-Host ""
Write-Host "DOCUMENTACION DISPONIBLE:" -ForegroundColor Yellow
Write-Host "- GUIA_INICIO_RAPIDO.md" -ForegroundColor Gray
Write-Host "- RESUMEN_EJECUTIVO_FINAL.md" -ForegroundColor Gray
Write-Host "- SISTEMA_COMPLETO_IMPLEMENTADO.md" -ForegroundColor Gray
Write-Host "- INDICE_DOCUMENTACION.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Sistema listo para usar!" -ForegroundColor Green
Write-Host ""