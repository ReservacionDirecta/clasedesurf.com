# 🚀 Guía de Migración: Local → Railway

Esta guía te ayudará a transferir los datos de tu base de datos local a Railway de forma segura.

## 📋 Requisitos Previos

1. **PostgreSQL Client Tools instalado** (psql, pg_dump)
   - Verifica con: `psql --version`
   - Si no está instalado: [Descargar PostgreSQL](https://www.postgresql.org/download/windows/)

2. **Node.js y npm** para ejecutar Prisma
   - Verifica con: `node --version`

3. **Acceso a ambas bases de datos**
   - Local: `clasedesurf.com` en localhost:5432
   - Railway: Credenciales proporcionadas

## 🔄 Proceso de Migración (3 Pasos)

### Paso 1: Limpiar Base de Datos Railway

```powershell
.\clean-railway-db.ps1
```

Este script:
- ✅ Elimina todas las tablas existentes en Railway
- ✅ Elimina los tipos enum
- ✅ Limpia las migraciones de Prisma
- ⚠️ **ADVERTENCIA**: Esto borra TODOS los datos en Railway

### Paso 2: Exportar Datos Locales

```powershell
.\export-local-db.ps1
```

Este script:
- ✅ Exporta todos los datos de tu base local
- ✅ Genera un archivo `export_local_YYYYMMDD_HHMMSS.sql`
- ✅ Usa formato compatible con Railway

### Paso 3: Migrar a Railway

```powershell
.\migrate-local-to-railway.ps1
```

Este script:
- ✅ Aplica el esquema de Prisma a Railway
- ✅ Importa los datos exportados
- ✅ Verifica que los datos se importaron correctamente

## 🔍 Verificación

Después de la migración, verifica que todo esté correcto:

```powershell
.\verify-railway-db.ps1
```

Este script muestra:
- 📊 Tablas existentes
- 📈 Conteo de registros por tabla
- 👥 Primeros 10 usuarios

## 🎯 Proceso Completo (Comando por Comando)

```powershell
# 1. Limpiar Railway
.\clean-railway-db.ps1

# 2. Exportar local
.\export-local-db.ps1

# 3. Migrar a Railway
.\migrate-local-to-railway.ps1

# 4. Verificar
.\verify-railway-db.ps1
```

## 📝 Variables de Entorno para Railway

Después de la migración, asegúrate de configurar estas variables en Railway:

```env
DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway

NODE_ENV=production

JWT_SECRET=tu-jwt-secret-super-seguro-de-32-caracteres
NEXTAUTH_SECRET=tu-nextauth-secret-super-seguro-de-32-caracteres

FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
```

## ⚠️ Solución de Problemas

### Error: "psql: command not found"

Instala PostgreSQL Client Tools:
1. Descarga PostgreSQL desde https://www.postgresql.org/download/windows/
2. Durante la instalación, asegúrate de seleccionar "Command Line Tools"
3. Reinicia PowerShell

### Error: "Connection refused"

Verifica que:
- Tu base de datos local esté corriendo
- Las credenciales sean correctas
- Railway permita conexiones desde tu IP

### Error: "Duplicate key value violates unique constraint"

Esto es normal si hay datos existentes. El script continuará con los demás datos.

### Error al aplicar migraciones de Prisma

```powershell
cd backend
npx prisma migrate reset --force
npx prisma migrate deploy
cd ..
```

## 🔐 Seguridad

- ❌ **NO** compartas los archivos de exportación (contienen datos sensibles)
- ❌ **NO** subas los archivos `.sql` a Git
- ✅ Los archivos `export_local_*.sql` están en `.gitignore`
- ✅ Cambia las credenciales después de la migración si es necesario

## 📊 Datos que se Migran

- ✅ Usuarios (users)
- ✅ Escuelas (schools)
- ✅ Instructores (instructors)
- ✅ Estudiantes (students)
- ✅ Clases (classes)
- ✅ Reservas (reservations)
- ✅ Pagos (payments)
- ✅ Reseñas de instructores (instructor_reviews)
- ✅ Tokens de refresco (refresh_tokens)

## 🎉 Siguiente Paso

Una vez completada la migración:

1. Actualiza las variables de entorno en Railway
2. Despliega tu aplicación
3. Prueba el login con usuarios existentes
4. Verifica que todas las funcionalidades trabajen correctamente

## 📞 Conexión Directa a Railway (Opcional)

Si necesitas conectarte manualmente:

```powershell
$env:PGPASSWORD = "BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway
```

Comandos útiles en psql:
```sql
-- Ver tablas
\dt

-- Ver usuarios
SELECT * FROM users;

-- Contar registros
SELECT COUNT(*) FROM users;

-- Salir
\q
```

---

**¿Necesitas ayuda?** Revisa los logs de cada script para más detalles sobre cualquier error.
