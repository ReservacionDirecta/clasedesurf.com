# ============================================
# MIGRACIÓN COMPLETA: LOCAL → RAILWAY
# ============================================
# Este script ejecuta todo el proceso de migración automáticamente

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   MIGRACIÓN COMPLETA: LOCAL → RAILWAY      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script realizará los siguientes pasos:" -ForegroundColor Yellow
Write-Host "  1. Limpiar la base de datos de Railway" -ForegroundColor White
Write-Host "  2. Exportar datos de la base local" -ForegroundColor White
Write-Host "  3. Aplicar esquema de Prisma a Railway" -ForegroundColor White
Write-Host "  4. Importar datos a Railway" -ForegroundColor White
Write-Host "  5. Verificar la migración" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos actuales en Railway" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "¿Deseas continuar? Escribe 'SI' para proceder"

if ($confirm -ne "SI") {
    Write-Host ""
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PASO 1/5: Limpiando base de datos Railway" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

& .\clean-railway-db.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error en el paso 1. Abortando migración." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PASO 2/5: Exportando base de datos local" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

& .\export-local-db.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error en el paso 2. Abortando migración." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PASO 3-4/5: Migrando a Railway" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

& .\migrate-local-to-railway.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  Advertencia: Hubo errores durante la migración" -ForegroundColor Yellow
    Write-Host "Continuando con la verificación..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PASO 5/5: Verificando migración" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

& .\verify-railway-db.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      ✓ MIGRACIÓN COMPLETADA                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 SIGUIENTE PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Actualiza las variables de entorno en Railway:" -ForegroundColor White
Write-Host "   DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Configura las demás variables de entorno:" -ForegroundColor White
Write-Host "   - JWT_SECRET" -ForegroundColor Cyan
Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor Cyan
Write-Host "   - FRONTEND_URL" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_API_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Despliega tu aplicación en Railway" -ForegroundColor White
Write-Host ""
Write-Host "4. Prueba el login con tus usuarios existentes" -ForegroundColor White
Write-Host ""
Write-Host "📖 Para más detalles, consulta: GUIA_MIGRACION_RAILWAY.md" -ForegroundColor Yellow
Write-Host ""
