# 🔐 Scripts para crear Super Admin

Este directorio contiene scripts para insertar un usuario Super Admin en la base de datos.

## 📋 Opciones Disponibles

### 1. SQL Directo (Hash Pre-generado)

**Archivo:** `insert-super-admin.sql`

Este archivo contiene un SQL listo para ejecutar con un hash pre-generado de la contraseña `password123`.

**Credenciales por defecto:**
- **Email:** `admin@clasedesurf.com`
- **Password:** `password123`
- **Rol:** `ADMIN`

**Ejecutar:**
```bash
# Con psql
psql -U postgres -d clasedesurf.com -f backend/scripts/insert-super-admin.sql

# O copiar y pegar el contenido en tu cliente SQL (pgAdmin, DBeaver, etc.)
```

### 2. Generador de SQL (Recomendado)

**Archivo:** `generate-super-admin.js`

Este script genera un nuevo hash de contraseña y crea un SQL personalizado.

**Uso básico (con valores por defecto):**
```bash
cd backend
node scripts/generate-super-admin.js
```

**Uso personalizado:**
```bash
cd backend
node scripts/generate-super-admin.js [email] [password] [name]
```

**Ejemplos:**
```bash
# Con valores por defecto
node scripts/generate-super-admin.js

# Personalizado
node scripts/generate-super-admin.js admin@example.com MySecurePass123 "Administrador Principal"

# Solo cambiar email
node scripts/generate-super-admin.js superadmin@clasedesurf.com
```

El script generará un archivo `insert-super-admin-generated.sql` con el SQL listo para ejecutar.

## 🔒 Seguridad

⚠️ **IMPORTANTE:**

1. **NO usar en producción sin cambiar la contraseña**
2. **NO compartir las credenciales públicamente**
3. **Cambiar la contraseña inmediatamente después del primer login**
4. **Usar contraseñas seguras en producción**

## 📝 Notas

- El hash de bcrypt se genera con 10 rounds (seguro y estándar)
- El SQL usa `ON CONFLICT` para actualizar si el email ya existe
- El script incluye una consulta SELECT para verificar la inserción

## 🛠️ Troubleshooting

### Error: "bcryptjs not found"
```bash
cd backend
npm install bcryptjs
```

### Error: "relation users does not exist"
Asegúrate de que las migraciones de Prisma estén ejecutadas:
```bash
cd backend
npx prisma migrate dev
```

### Error de conexión a la base de datos
Verifica que:
- PostgreSQL esté corriendo
- Las credenciales en `DATABASE_URL` sean correctas
- La base de datos exista

