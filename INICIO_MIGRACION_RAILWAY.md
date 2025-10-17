# 🎯 Inicio Rápido: Migración a Railway

## ⚡ Opción 1: Migración Rápida (Recomendada)

Si confías en el proceso y quieres hacerlo todo de una vez:

```powershell
# Verificar requisitos
.\check-migration-requirements.ps1

# Ejecutar migración completa (SIN backup previo)
.\full-migration-railway.ps1
```

## 🛡️ Opción 2: Migración Segura (Con Backup)

Si quieres un backup de Railway antes de limpiar:

```powershell
# Verificar requisitos
.\check-migration-requirements.ps1

# Ejecutar migración segura (CON backup previo)
.\safe-migration-railway.ps1
```

## 🔧 Opción 3: Paso a Paso (Control Total)

Si prefieres ejecutar cada paso manualmente:

```powershell
# 1. Verificar requisitos
.\check-migration-requirements.ps1

# 2. (Opcional) Crear backup de Railway
.\backup-railway-db.ps1

# 3. Limpiar Railway
.\clean-railway-db.ps1

# 4. Exportar datos locales
.\export-local-db.ps1

# 5. Migrar a Railway
.\migrate-local-to-railway.ps1

# 6. Verificar resultado
.\verify-railway-db.ps1
```

## 📊 ¿Qué Script Usar?

| Script | Descripción | Cuándo Usarlo |
|--------|-------------|---------------|
| `check-migration-requirements.ps1` | Verifica herramientas instaladas | **Siempre primero** |
| `safe-migration-railway.ps1` | Migración completa con backup | **Primera vez** o datos importantes en Railway |
| `full-migration-railway.ps1` | Migración completa sin backup | Railway está vacío o no importan los datos |
| `backup-railway-db.ps1` | Solo crear backup | Antes de hacer cambios manuales |
| `verify-railway-db.ps1` | Solo verificar estado | Después de cualquier cambio |

## ⏱️ Tiempo Estimado

- **Verificación de requisitos:** 30 segundos
- **Backup de Railway:** 10-30 segundos (depende del tamaño)
- **Limpieza de Railway:** 5 segundos
- **Exportación local:** 10-60 segundos (depende del tamaño)
- **Migración a Railway:** 30-120 segundos
- **Verificación:** 10 segundos

**Total:** 2-5 minutos aproximadamente

## 🎯 Mi Recomendación

Para tu primera migración, usa la **Opción 2 (Migración Segura)**:

```powershell
.\check-migration-requirements.ps1
.\safe-migration-railway.ps1
```

Esto te da:
- ✅ Backup automático de Railway
- ✅ Proceso completo automatizado
- ✅ Verificación al final
- ✅ Mensajes claros de progreso

## 📋 Después de la Migración

1. **Configura las variables de entorno en Railway:**

```env
DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
NODE_ENV=production
JWT_SECRET=tu-secret-seguro-aqui
NEXTAUTH_SECRET=tu-secret-seguro-aqui
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
```

2. **Genera secrets seguros:**

```powershell
# Generar un secret aleatorio de 32 caracteres
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

3. **Despliega tu aplicación en Railway**

4. **Prueba el login con usuarios existentes**

## ⚠️ Antes de Empezar

- [ ] PostgreSQL Client Tools instalado (psql, pg_dump)
- [ ] Node.js y npm instalados
- [ ] Base de datos local corriendo
- [ ] Conexión a internet estable
- [ ] Credenciales de Railway correctas

## 🆘 Si Algo Sale Mal

### Restaurar desde backup
```powershell
$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f backup_railway_YYYYMMDD_HHMMSS.sql
```

### Volver a intentar
```powershell
# Limpiar y volver a empezar
.\clean-railway-db.ps1
.\migrate-local-to-railway.ps1
```

### Verificar estado
```powershell
.\verify-railway-db.ps1
```

## 📚 Documentación Completa

- `GUIA_MIGRACION_RAILWAY.md` - Guía detallada paso a paso
- `RESUMEN_MIGRACION_RAILWAY.md` - Resumen visual y comandos útiles

## 🚀 ¡Empecemos!

```powershell
# Copia y pega esto en PowerShell:
.\check-migration-requirements.ps1
```

Si todo está OK, continúa con:

```powershell
.\safe-migration-railway.ps1
```

---

**¿Listo?** Abre PowerShell en la carpeta del proyecto y ejecuta el primer comando. 🎉
