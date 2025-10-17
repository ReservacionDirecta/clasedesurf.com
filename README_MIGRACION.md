# 📦 Migración de Base de Datos: Local → Railway

## 🎯 Objetivo

Transferir todos los datos de tu base de datos local `clasedesurf.com` a la base de datos de producción en Railway.

## 🚀 Inicio Rápido (2 Comandos)

```powershell
# 1. Verificar que todo esté listo
.\check-migration-requirements.ps1

# 2. Ejecutar migración (con backup de seguridad)
.\safe-migration-railway.ps1
```

## 📁 Archivos Disponibles

### Scripts Principales

| Script | Descripción |
|--------|-------------|
| **`safe-migration-railway.ps1`** | ⭐ Migración completa CON backup (RECOMENDADO) |
| **`full-migration-railway.ps1`** | Migración completa SIN backup (más rápido) |
| **`check-migration-requirements.ps1`** | Verifica requisitos antes de empezar |

### Scripts Individuales

| Script | Descripción |
|--------|-------------|
| `backup-railway-db.ps1` | Crea backup de Railway |
| `clean-railway-db.ps1` | Limpia la base de datos de Railway |
| `export-local-db.ps1` | Exporta datos de la base local |
| `migrate-local-to-railway.ps1` | Aplica esquema e importa datos |
| `verify-railway-db.ps1` | Verifica el estado de Railway |

### Documentación

| Archivo | Descripción |
|---------|-------------|
| **`INICIO_MIGRACION_RAILWAY.md`** | ⭐ Guía de inicio rápido |
| `GUIA_MIGRACION_RAILWAY.md` | Guía detallada paso a paso |
| `RESUMEN_MIGRACION_RAILWAY.md` | Resumen visual y comandos útiles |

## 🔄 Flujo del Proceso

```
┌─────────────────────────────────────────────────────────┐
│                    MIGRACIÓN SEGURA                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 🔍 Verificar requisitos                            │
│     └─ PostgreSQL, Node.js, Conexiones                │
│                                                         │
│  2. 💾 Backup de Railway (opcional pero recomendado)  │
│     └─ backup_railway_YYYYMMDD_HHMMSS.sql             │
│                                                         │
│  3. 🧹 Limpiar Railway                                 │
│     └─ Eliminar tablas, enums, migraciones            │
│                                                         │
│  4. 📤 Exportar datos locales                          │
│     └─ export_local_YYYYMMDD_HHMMSS.sql               │
│                                                         │
│  5. 🔄 Migrar a Railway                                │
│     ├─ Aplicar esquema Prisma                         │
│     └─ Importar datos                                  │
│                                                         │
│  6. ✅ Verificar migración                             │
│     └─ Contar registros, verificar usuarios           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📊 Datos que se Migran

- ✅ **9 tablas principales:**
  - users (Usuarios)
  - schools (Escuelas)
  - instructors (Instructores)
  - students (Estudiantes)
  - classes (Clases)
  - reservations (Reservas)
  - payments (Pagos)
  - instructor_reviews (Reseñas)
  - refresh_tokens (Tokens)

- ✅ **5 tipos enum:**
  - UserRole
  - ClassLevel
  - ReservationStatus
  - PaymentStatus
  - InstructorRole

## 🔧 Requisitos Previos

### Software Necesario

- ✅ **PostgreSQL Client Tools** (psql, pg_dump)
  - Descarga: https://www.postgresql.org/download/windows/
  - Verifica: `psql --version`

- ✅ **Node.js y npm**
  - Descarga: https://nodejs.org/
  - Verifica: `node --version`

- ✅ **Prisma** (en backend)
  - Instala: `cd backend && npm install`

### Conexiones

- ✅ Base de datos local corriendo
- ✅ Conexión a internet estable
- ✅ Acceso a Railway

## 🎯 Casos de Uso

### Caso 1: Primera Migración
```powershell
# Usa la migración segura con backup
.\check-migration-requirements.ps1
.\safe-migration-railway.ps1
```

### Caso 2: Railway Está Vacío
```powershell
# Puedes usar la migración rápida sin backup
.\check-migration-requirements.ps1
.\full-migration-railway.ps1
```

### Caso 3: Solo Quiero Verificar
```powershell
# Solo verifica el estado actual
.\verify-railway-db.ps1
```

### Caso 4: Solo Quiero Backup
```powershell
# Solo crea un backup de Railway
.\backup-railway-db.ps1
```

### Caso 5: Control Total (Paso a Paso)
```powershell
.\check-migration-requirements.ps1
.\backup-railway-db.ps1
.\clean-railway-db.ps1
.\export-local-db.ps1
.\migrate-local-to-railway.ps1
.\verify-railway-db.ps1
```

## 🔐 Credenciales

### Local
```
postgresql://postgres:surfschool_secure_password_2024@localhost:5432/clasedesurf.com
```

### Railway
```
postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
```

## ⚙️ Configuración Post-Migración

Después de migrar, configura estas variables en Railway:

```env
DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
NODE_ENV=production
JWT_SECRET=<genera-un-secret-seguro>
NEXTAUTH_SECRET=<genera-otro-secret-seguro>
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
```

### Generar Secrets Seguros

```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

O usa: https://generate-secret.vercel.app/32

## ⚠️ Solución de Problemas

### Error: "psql: command not found"
```powershell
# Instala PostgreSQL Client Tools
# https://www.postgresql.org/download/windows/
# Reinicia PowerShell después de instalar
```

### Error: "Connection refused" (Local)
```powershell
# Verifica que Docker esté corriendo
docker ps

# O inicia los servicios
docker-compose up -d
```

### Error: "Connection refused" (Railway)
```powershell
# Verifica tu conexión a internet
# Verifica las credenciales
# Intenta conectar manualmente:
$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway
```

### Error: "Duplicate key value"
```
Esto es normal si hay datos existentes.
El script continuará con los demás datos.
```

### Restaurar desde Backup
```powershell
# Si algo sale mal, restaura el backup
$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway -f backup_railway_YYYYMMDD_HHMMSS.sql
```

## 📈 Verificación Post-Migración

Después de la migración, verifica:

```powershell
# Ver estado completo
.\verify-railway-db.ps1

# O conecta manualmente
$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway
```

Comandos útiles en psql:
```sql
-- Ver tablas
\dt

-- Contar registros
SELECT 'users' as tabla, COUNT(*) FROM users
UNION ALL SELECT 'schools', COUNT(*) FROM schools
UNION ALL SELECT 'classes', COUNT(*) FROM classes;

-- Ver usuarios
SELECT id, email, name, role FROM users LIMIT 10;

-- Salir
\q
```

## 📝 Checklist

Antes de empezar:
- [ ] PostgreSQL Client Tools instalado
- [ ] Node.js instalado
- [ ] Base de datos local corriendo
- [ ] Conexión a internet estable
- [ ] Credenciales de Railway correctas

Durante la migración:
- [ ] Backup creado (si usas safe-migration)
- [ ] Railway limpiado
- [ ] Datos locales exportados
- [ ] Esquema Prisma aplicado
- [ ] Datos importados

Después de la migración:
- [ ] Datos verificados
- [ ] Variables de entorno configuradas
- [ ] Secrets generados
- [ ] Aplicación desplegada
- [ ] Login probado

## 🎉 ¡Listo para Empezar!

```powershell
# Ejecuta esto ahora:
.\check-migration-requirements.ps1
```

Si todo está OK, continúa con:

```powershell
.\safe-migration-railway.ps1
```

## 📚 Más Información

- **Inicio Rápido:** `INICIO_MIGRACION_RAILWAY.md`
- **Guía Detallada:** `GUIA_MIGRACION_RAILWAY.md`
- **Resumen Visual:** `RESUMEN_MIGRACION_RAILWAY.md`

---

**¿Necesitas ayuda?** Revisa los logs de cada script para más detalles.
