# Verificación y Sincronización de Schema Railway

Este documento explica cómo verificar y sincronizar el schema de la base de datos de Railway con el schema local definido en Prisma.

## 📋 Información de Conexión

**URL de Railway:**
```
postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
```

## 🔍 Verificación del Schema

### Método 1: Script PowerShell (Recomendado)

Ejecuta el script de verificación desde la raíz del proyecto:

```powershell
.\verify-railway-schema.ps1
```

Este script:
- ✅ Conecta a Railway
- ✅ Verifica que todas las tablas esperadas existan
- ✅ Muestra la estructura de las tablas principales
- ✅ Verifica las relaciones (Foreign Keys)
- ✅ Genera un resumen completo

### Método 2: Script Node.js Directo

```powershell
node scripts/verify-railway-simple.js
```

### Método 3: Comparación Detallada

```powershell
node scripts/compare-schemas.js
```

Este script compara el schema local con Railway y muestra diferencias específicas.

## 📊 Tablas Esperadas

El schema debe incluir las siguientes tablas:

1. **users** - Usuarios del sistema
2. **instructors** - Instructores de surf
3. **instructor_reviews** - Reseñas de instructores
4. **students** - Estudiantes
5. **schools** - Escuelas de surf
6. **beaches** - Playas
7. **classes** - Clases de surf
8. **reservations** - Reservas
9. **payments** - Pagos
10. **refresh_tokens** - Tokens de refresco

## 🔄 Sincronización del Schema

Si encuentras diferencias o necesitas actualizar el schema de Railway:

### Opción 1: Script PowerShell (Recomendado)

```powershell
.\scripts\sync-railway-schema.ps1
```

Este script:
- ⚠️ Te pedirá confirmación antes de modificar Railway
- 🔄 Sincronizará el schema usando `prisma db push`
- ✅ Te mostrará el resultado de la operación

### Opción 2: Manual

```powershell
# 1. Ir al directorio del backend
cd backend

# 2. Establecer la URL de Railway
$env:DATABASE_URL="postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"

# 3. Sincronizar schema
npx prisma db push
```

### Opción 3: Usando Migraciones (Producción)

Para producción, es mejor usar migraciones:

```powershell
cd backend
$env:DATABASE_URL="postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"
npx prisma migrate deploy
```

## ✅ Verificación de Estructura

### Tablas Principales

#### **users** (14 columnas)
- `id` (integer, PK, autoincrement)
- `email` (text, unique, NOT NULL)
- `name` (text, NOT NULL)
- `password` (text, NOT NULL)
- `role` (UserRole enum, NOT NULL, default: STUDENT)
- `age`, `weight`, `height` (opcionales)
- `canSwim` (boolean, default: false)
- `phone`, `profilePhoto` (opcionales)
- `createdAt`, `updatedAt` (timestamps)

#### **classes** (14 columnas)
- `id` (integer, PK, autoincrement)
- `title` (text, NOT NULL)
- `description` (text, nullable)
- `date` (timestamp, NOT NULL)
- `duration` (integer, NOT NULL) - en minutos
- `capacity` (integer, NOT NULL)
- `price` (float, NOT NULL)
- `level` (ClassLevel enum, NOT NULL, default: BEGINNER)
- `instructor` (text, nullable)
- `images` (array, nullable)
- `schoolId` (integer, FK → schools.id)
- `beachId` (integer, FK → beaches.id, nullable)
- `createdAt`, `updatedAt` (timestamps)

#### **reservations** (8 columnas)
- `id` (integer, PK, autoincrement)
- `userId` (integer, FK → users.id)
- `classId` (integer, FK → classes.id)
- `status` (ReservationStatus enum, default: PENDING)
- `specialRequest` (text, nullable)
- `participants` (jsonb, nullable) - Array de datos de participantes
- `createdAt`, `updatedAt` (timestamps)

#### **payments** (11 columnas)
- `id` (integer, PK, autoincrement)
- `reservationId` (integer, FK → reservations.id, unique)
- `amount` (float, NOT NULL)
- `status` (PaymentStatus enum, default: UNPAID)
- `paymentMethod` (text, nullable)
- `transactionId` (text, nullable)
- `voucherImage` (text, nullable)
- `voucherNotes` (text, nullable)
- `paidAt` (timestamp, nullable)
- `createdAt`, `updatedAt` (timestamps)

### Relaciones (Foreign Keys)

El schema debe tener las siguientes relaciones:

1. `classes.schoolId` → `schools.id`
2. `classes.beachId` → `beaches.id`
3. `instructors.userId` → `users.id`
4. `instructors.schoolId` → `schools.id`
5. `instructor_reviews.instructorId` → `instructors.id`
6. `students.userId` → `users.id`
7. `students.schoolId` → `schools.id`
8. `reservations.userId` → `users.id`
9. `reservations.classId` → `classes.id`
10. `payments.reservationId` → `reservations.id`
11. `refresh_tokens.userId` → `users.id`

## 🚨 Solución de Problemas

### Error: "Cannot connect to Railway"

**Causa:** La URL de conexión puede haber cambiado o la base de datos no está disponible.

**Solución:**
1. Verifica la URL en el dashboard de Railway
2. Asegúrate de que el servicio de base de datos esté activo
3. Verifica las credenciales

### Error: "Table does not exist"

**Causa:** Faltan tablas en Railway.

**Solución:**
```powershell
cd backend
$env:DATABASE_URL="postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"
npx prisma db push
```

### Error: "Column mismatch"

**Causa:** El schema local tiene diferencias con Railway.

**Solución:**
1. Revisa el schema local en `backend/prisma/schema.prisma`
2. Ejecuta `npx prisma db push` para sincronizar
3. Si hay datos importantes, haz un backup primero

### Error: "Foreign key constraint violation"

**Causa:** Hay datos que violan las relaciones.

**Solución:**
1. Verifica los datos existentes
2. Limpia datos huérfanos
3. Luego sincroniza el schema

## 📝 Checklist de Verificación

Antes de desplegar a producción, verifica:

- [ ] Todas las tablas existen en Railway
- [ ] Todas las columnas están presentes
- [ ] Los tipos de datos coinciden
- [ ] Los Foreign Keys están configurados
- [ ] Los valores por defecto están establecidos
- [ ] Los índices están creados (si aplica)
- [ ] Los enums están definidos correctamente

## 🔐 Seguridad

⚠️ **IMPORTANTE:** La URL de conexión contiene credenciales sensibles.

- ✅ No commitees la URL completa en el código
- ✅ Usa variables de entorno en producción
- ✅ Rota las credenciales periódicamente
- ✅ Limita el acceso a la base de datos desde Railway

## 📚 Referencias

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Railway Database Docs](https://docs.railway.app/databases/postgresql)

## 🛠️ Scripts Disponibles

| Script | Descripción |
|-------|-------------|
| `verify-railway-schema.ps1` | Verificación rápida del schema |
| `scripts/verify-railway-simple.js` | Verificación detallada con Node.js |
| `scripts/compare-schemas.js` | Comparación completa de schemas |
| `scripts/sync-railway-schema.ps1` | Sincronización del schema |

## 📞 Soporte

Si encuentras problemas:

1. Ejecuta `.\verify-railway-schema.ps1` para diagnóstico
2. Revisa los logs de Railway
3. Verifica el schema local en `backend/prisma/schema.prisma`
4. Consulta la documentación de Prisma

