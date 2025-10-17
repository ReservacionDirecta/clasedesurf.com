# ============================================
# AYUDA - MIGRACIÓN A RAILWAY
# ============================================

function Show-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                            ║" -ForegroundColor Cyan
    Write-Host "║          MIGRACIÓN DE BASE DE DATOS A RAILWAY              ║" -ForegroundColor Cyan
    Write-Host "║                                                            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-QuickStart {
    Write-Host "🚀 INICIO RÁPIDO" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Opción 1: Migración Segura (CON backup)" -ForegroundColor Yellow
    Write-Host "  ────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "    .\check-migration-requirements.ps1" -ForegroundColor Cyan
    Write-Host "    .\safe-migration-railway.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Opción 2: Migración Rápida (SIN backup)" -ForegroundColor Yellow
    Write-Host "  ────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "    .\check-migration-requirements.ps1" -ForegroundColor Cyan
    Write-Host "    .\full-migration-railway.ps1" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Scripts {
    Write-Host "📜 SCRIPTS DISPONIBLES" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  Scripts Principales:" -ForegroundColor Yellow
    Write-Host "  ──────────────────" -ForegroundColor Gray
    Write-Host "    check-migration-requirements.ps1" -ForegroundColor Cyan
    Write-Host "      → Verifica que tengas todo instalado" -ForegroundColor White
    Write-Host ""
    Write-Host "    safe-migration-railway.ps1" -ForegroundColor Cyan
    Write-Host "      → Migración completa CON backup (RECOMENDADO)" -ForegroundColor White
    Write-Host ""
    Write-Host "    full-migration-railway.ps1" -ForegroundColor Cyan
    Write-Host "      → Migración completa SIN backup (más rápido)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "  Scripts Individuales:" -ForegroundColor Yellow
    Write-Host "  ───────────────────" -ForegroundColor Gray
    Write-Host "    backup-railway-db.ps1" -ForegroundColor Cyan
    Write-Host "      → Solo crear backup de Railway" -ForegroundColor White
    Write-Host ""
    Write-Host "    clean-railway-db.ps1" -ForegroundColor Cyan
    Write-Host "      → Solo limpiar Railway" -ForegroundColor White
    Write-Host ""
    Write-Host "    export-local-db.ps1" -ForegroundColor Cyan
    Write-Host "      → Solo exportar datos locales" -ForegroundColor White
    Write-Host ""
    Write-Host "    migrate-local-to-railway.ps1" -ForegroundColor Cyan
    Write-Host "      → Solo migrar a Railway" -ForegroundColor White
    Write-Host ""
    Write-Host "    verify-railway-db.ps1" -ForegroundColor Cyan
    Write-Host "      → Solo verificar estado de Railway" -ForegroundColor White
    Write-Host ""
}

function Show-Documentation {
    Write-Host "📚 DOCUMENTACIÓN" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
    Write-Host "    README_MIGRACION.md" -ForegroundColor Cyan
    Write-Host "      → Documentación principal" -ForegroundColor White
    Write-Host ""
    Write-Host "    INICIO_MIGRACION_RAILWAY.md" -ForegroundColor Cyan
    Write-Host "      → Guía de inicio rápido" -ForegroundColor White
    Write-Host ""
    Write-Host "    GUIA_MIGRACION_RAILWAY.md" -ForegroundColor Cyan
    Write-Host "      → Guía detallada paso a paso" -ForegroundColor White
    Write-Host ""
    Write-Host "    RESUMEN_MIGRACION_RAILWAY.md" -ForegroundColor Cyan
    Write-Host "      → Resumen visual y comandos útiles" -ForegroundColor White
    Write-Host ""
}

function Show-Process {
    Write-Host "🔄 PROCESO DE MIGRACIÓN" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  1. 🔍 Verificar requisitos" -ForegroundColor Yellow
    Write-Host "     └─ PostgreSQL, Node.js, Conexiones" -ForegroundColor White
    Write-Host ""
    Write-Host "  2. 💾 Backup de Railway (opcional)" -ForegroundColor Yellow
    Write-Host "     └─ backup_railway_YYYYMMDD_HHMMSS.sql" -ForegroundColor White
    Write-Host ""
    Write-Host "  3. 🧹 Limpiar Railway" -ForegroundColor Yellow
    Write-Host "     └─ Eliminar tablas, enums, migraciones" -ForegroundColor White
    Write-Host ""
    Write-Host "  4. 📤 Exportar datos locales" -ForegroundColor Yellow
    Write-Host "     └─ export_local_YYYYMMDD_HHMMSS.sql" -ForegroundColor White
    Write-Host ""
    Write-Host "  5. 🔄 Migrar a Railway" -ForegroundColor Yellow
    Write-Host "     ├─ Aplicar esquema Prisma" -ForegroundColor White
    Write-Host "     └─ Importar datos" -ForegroundColor White
    Write-Host ""
    Write-Host "  6. ✅ Verificar migración" -ForegroundColor Yellow
    Write-Host "     └─ Contar registros, verificar usuarios" -ForegroundColor White
    Write-Host ""
}

function Show-Credentials {
    Write-Host "🔐 CREDENCIALES" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Base de Datos Local:" -ForegroundColor Yellow
    Write-Host "    Host: localhost" -ForegroundColor White
    Write-Host "    Port: 5432" -ForegroundColor White
    Write-Host "    User: postgres" -ForegroundColor White
    Write-Host "    Database: clasedesurf.com" -ForegroundColor White
    Write-Host ""
    Write-Host "  Base de Datos Railway:" -ForegroundColor Yellow
    Write-Host "    Host: hopper.proxy.rlwy.net" -ForegroundColor White
    Write-Host "    Port: 14816" -ForegroundColor White
    Write-Host "    User: postgres" -ForegroundColor White
    Write-Host "    Database: railway" -ForegroundColor White
    Write-Host ""
}

function Show-NextSteps {
    Write-Host "📋 SIGUIENTES PASOS" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Después de la migración:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Configurar variables de entorno en Railway" -ForegroundColor White
    Write-Host "     - DATABASE_URL" -ForegroundColor Cyan
    Write-Host "     - JWT_SECRET" -ForegroundColor Cyan
    Write-Host "     - NEXTAUTH_SECRET" -ForegroundColor Cyan
    Write-Host "     - FRONTEND_URL" -ForegroundColor Cyan
    Write-Host "     - NEXT_PUBLIC_API_URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  2. Desplegar aplicación en Railway" -ForegroundColor White
    Write-Host ""
    Write-Host "  3. Probar login con usuarios existentes" -ForegroundColor White
    Write-Host ""
}

function Show-Menu {
    Show-Header
    
    Write-Host "¿Qué deseas hacer?" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  [1] Ver inicio rápido" -ForegroundColor Cyan
    Write-Host "  [2] Ver scripts disponibles" -ForegroundColor Cyan
    Write-Host "  [3] Ver proceso de migración" -ForegroundColor Cyan
    Write-Host "  [4] Ver credenciales" -ForegroundColor Cyan
    Write-Host "  [5] Ver documentación" -ForegroundColor Cyan
    Write-Host "  [6] Ver siguientes pasos" -ForegroundColor Cyan
    Write-Host "  [7] Ver todo" -ForegroundColor Cyan
    Write-Host "  [0] Salir" -ForegroundColor Red
    Write-Host ""
    
    $choice = Read-Host "Selecciona una opción"
    
    Write-Host ""
    
    switch ($choice) {
        "1" { Show-QuickStart }
        "2" { Show-Scripts }
        "3" { Show-Process }
        "4" { Show-Credentials }
        "5" { Show-Documentation }
        "6" { Show-NextSteps }
        "7" {
            Show-QuickStart
            Show-Scripts
            Show-Process
            Show-Credentials
            Show-Documentation
            Show-NextSteps
        }
        "0" { 
            Write-Host "¡Hasta luego!" -ForegroundColor Green
            return
        }
        default {
            Write-Host "Opción no válida" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Presiona Enter para volver al menú o 'q' para salir"
    
    if ($continue -ne "q") {
        Show-Menu
    }
}

# Ejecutar menú
Show-Menu
