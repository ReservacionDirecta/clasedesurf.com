# 🚀 Resumen: Migración a Railway

## 📦 Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `check-migration-requirements.ps1` | Verifica que tengas todas las herramientas necesarias |
| `clean-railway-db.ps1` | Limpia completamente la base de datos de Railway |
| `export-local-db.ps1` | Exporta los datos de tu base local |
| `migrate-local-to-railway.ps1` | Migra los datos a Railway |
| `verify-railway-db.ps1` | Verifica el estado de Railway después de la migración |
| `full-migration-railway.ps1` | **Ejecuta todo el proceso automáticamente** |
| `GUIA_MIGRACION_RAILWAY.md` | Guía detallada paso a paso |

## ⚡ Inicio Rápido (3 Comandos)

```powershell
# 1. Verificar requisitos
.\check-migration-requirements.ps1

# 2. Ejecutar migración completa
.\full-migration-railway.ps1

# 3. Verificar resultado
.\verify-railway-db.ps1
```

## 🎯 Proceso Completo

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  LOCAL (clasedesurf.com)  ──────────►  RAILWAY (railway)   │
│                                                             │
│  1. ✓ Verificar requisitos                                 │
│  2. ✓ Limpiar Railway                                      │
│  3. ✓ Exportar datos locales                               │
│  4. ✓ Aplicar esquema Prisma                               │
│  5. ✓ Importar datos                                       │
│  6. ✓ Verificar migración                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Credenciales

### Base de Datos Local
```
Host: localhost
Port: 5432
User: postgres
Password: surfschool_secure_password_2024
Database: clasedesurf.com
```

### Base de Datos Railway
```
Host: hopper.proxy.rlwy.net
Port: 14816
User: postgres
Password: BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb
Database: railway
```

### URL de Conexión Railway
```
postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
```

## 📊 Datos que se Migran

- ✅ **users** - Usuarios del sistema
- ✅ **schools** - Escuelas de surf
- ✅ **instructors** - Instructores
- ✅ **students** - Estudiantes
- ✅ **classes** - Clases programadas
- ✅ **reservations** - Reservas de clases
- ✅ **payments** - Pagos y comprobantes
- ✅ **instructor_reviews** - Reseñas de instructores
- ✅ **refresh_tokens** - Tokens de autenticación

## ⚙️ Variables de Entorno para Railway

Después de la migración, configura estas variables en Railway:

```env
# Base de datos
DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway

# Entorno
NODE_ENV=production

# Seguridad (CAMBIAR ESTOS VALORES)
JWT_SECRET=genera-un-secret-seguro-de-32-caracteres
NEXTAUTH_SECRET=genera-otro-secret-seguro-de-32-caracteres

# URLs (CAMBIAR POR TU DOMINIO)
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
```

### Generar Secrets Seguros

```powershell
# En PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

O usa: https://generate-secret.vercel.app/32

## 🔍 Comandos Útiles

### Conectarse a Railway manualmente
```powershell
$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway
```

### Ver tablas
```sql
\dt
```

### Contar registros
```sql
SELECT 
  'users' as tabla, COUNT(*) as total FROM users
UNION ALL
  SELECT 'schools', COUNT(*) FROM schools
UNION ALL
  SELECT 'classes', COUNT(*) FROM classes;
```

### Ver usuarios
```sql
SELECT id, email, name, role FROM users LIMIT 10;
```

### Salir de psql
```sql
\q
```

## ⚠️ Solución de Problemas

### Error: "psql: command not found"
**Solución:** Instala PostgreSQL Client Tools
- Descarga: https://www.postgresql.org/download/windows/
- Durante instalación, selecciona "Command Line Tools"
- Reinicia PowerShell

### Error: "Connection refused" (Local)
**Solución:** 
```powershell
# Verifica que PostgreSQL esté corriendo
docker ps
# O si usas PostgreSQL nativo:
Get-Service postgresql*
```

### Error: "Connection refused" (Railway)
**Solución:**
- Verifica tu conexión a internet
- Verifica que las credenciales sean correctas
- Railway puede estar en mantenimiento (poco común)

### Error: "Duplicate key value"
**Solución:** Esto es normal si hay datos existentes. El script continuará.

### Error al aplicar migraciones
**Solución:**
```powershell
cd backend
npx prisma migrate reset --force
npx prisma migrate deploy
cd ..
```

## 📝 Checklist Post-Migración

- [ ] Datos migrados correctamente
- [ ] Variables de entorno configuradas en Railway
- [ ] Secrets de JWT y NextAuth generados
- [ ] URLs actualizadas con tu dominio
- [ ] Aplicación desplegada en Railway
- [ ] Login funciona con usuarios existentes
- [ ] Todas las funcionalidades probadas

## 🎉 Siguiente Paso

Una vez completada la migración:

1. **Actualiza las variables de entorno en Railway**
2. **Despliega tu aplicación**
3. **Prueba el sistema completo**
4. **Configura tu dominio personalizado** (opcional)

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de cada script
2. Consulta `GUIA_MIGRACION_RAILWAY.md` para más detalles
3. Verifica que todos los requisitos estén instalados

---

**Última actualización:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
