# 🚀 Pasos para Implementar el Sistema CRUD Estandarizado

## ⚠️ IMPORTANTE: Aplicar Migración Primero

Antes de usar el sistema, **DEBES** aplicar la migración de base de datos para agregar el campo `ownerId` a la tabla `schools`.

### Opción 1: Script Automático (Recomendado)
```powershell
.\apply-migration.ps1
```

Selecciona la opción 2 (Prisma DB Push) cuando se te pregunte.

### Opción 2: Manual
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Opción 3: SQL Directo
```bash
# Conectar a tu base de datos y ejecutar:
psql -h <host> -U <usuario> -d <database> -f backend/prisma/migrations/add_school_owner.sql
```

## 📝 Verificar la Migración

Después de aplicar la migración, verifica que funcionó:

```sql
-- Conectar a tu base de datos
\d schools

-- Deberías ver el campo ownerId en la tabla
```

## 🔄 Reiniciar Servicios

1. **Backend:**
```bash
cd backend
npm run dev
```

2. **Frontend:**
```bash
cd frontend
npm run dev
```

## ✅ Probar el Sistema

### 1. Probar Endpoint de Escuela

**Opción A: Desde el navegador**
- Ir a: http://localhost:3000/dashboard/school
- Debería cargar sin error 500

**Opción B: Desde PowerShell**
```powershell
# Primero, obtener token de autenticación
$loginBody = @{
    email = "admin@escuela.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

# Probar endpoint my-school
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:4000/schools/my-school" -Method GET -Headers $headers
```

### 2. Crear una Escuela

1. Iniciar sesión como SCHOOL_ADMIN:
   - Email: `admin@escuela.com`
   - Password: `admin123`

2. Ir a: http://localhost:3000/dashboard/school

3. Si no tienes escuela, verás el formulario de creación

4. Llenar el formulario:
   - Nombre: "Surf School Costa Rica"
   - Ubicación: "Tamarindo, Guanacaste"
   - Descripción: "La mejor escuela de surf"
   - Teléfono: "+506 1234-5678"
   - Email: "info@surfschool.com"

5. Click en "Crear Escuela"

### 3. Gestionar Clases

1. Ir a: http://localhost:3000/dashboard/school/classes

2. Click en "Nueva Clase"

3. Llenar el formulario:
   - Título: "Clase de Surf para Principiantes"
   - Descripción: "Aprende los fundamentos del surf"
   - Fecha: Seleccionar fecha futura
   - Duración: 60 minutos
   - Nivel: Principiante
   - Capacidad: 10
   - Precio: 50
   - Instructor: "Juan Pérez"

4. Click en "Crear Clase"

5. Deberías ver la clase en la tabla

### 4. Editar una Clase

1. En la tabla de clases, click en el ícono de editar (lápiz)

2. Modificar algún campo (ej: cambiar precio a 55)

3. Click en "Actualizar"

4. Verificar que el cambio se reflejó

### 5. Eliminar una Clase

1. En la tabla de clases, click en el ícono de eliminar (basura)

2. Confirmar la eliminación en el diálogo

3. Verificar que la clase desapareció de la tabla

## 🐛 Solución de Problemas

### Error: "No school found for this user"

**Causa:** El usuario no tiene una escuela asociada o la migración no se aplicó.

**Solución:**
1. Verificar que la migración se aplicó correctamente
2. Crear una escuela desde el dashboard
3. Verificar que el usuario tiene rol SCHOOL_ADMIN

### Error: "Failed to fetch school data"

**Causa:** El backend no está corriendo o hay un error en el endpoint.

**Solución:**
1. Verificar que el backend está corriendo en puerto 4000
2. Revisar logs del backend: `cd backend && npm run dev`
3. Verificar que DATABASE_URL está configurada en backend/.env

### Error: "Token invalid, redirecting to login"

**Causa:** El token JWT expiró o es inválido.

**Solución:**
1. Cerrar sesión y volver a iniciar sesión
2. Verificar que JWT_SECRET está configurado en backend/.env

### Modal no se cierra

**Causa:** Hay un proceso en curso (isLoading = true).

**Solución:**
1. Esperar a que termine el proceso
2. Si está bloqueado, refrescar la página

### Formulario no envía

**Causa:** Hay errores de validación.

**Solución:**
1. Revisar que todos los campos requeridos (*) están llenos
2. Verificar que los formatos son correctos (email, números, etc.)
3. Abrir DevTools (F12) y revisar la consola

## 📊 Verificar en Base de Datos

Puedes verificar que los datos se guardaron correctamente:

```sql
-- Ver escuelas con sus owners
SELECT id, name, location, "ownerId" FROM schools;

-- Ver clases de una escuela
SELECT id, title, date, price, level, "schoolId" FROM classes WHERE "schoolId" = 1;

-- Ver usuarios SCHOOL_ADMIN
SELECT id, name, email, role FROM users WHERE role = 'SCHOOL_ADMIN';
```

## 🎯 Próximos Pasos

Una vez que el sistema básico funciona:

1. **Implementar gestión de usuarios** (admin)
   - Usar `UserForm.tsx` ya creado
   - Crear página `/dashboard/admin/users/page.tsx`

2. **Implementar gestión de reservaciones**
   - Crear `ReservationForm.tsx`
   - Crear página `/dashboard/school/reservations/page.tsx`

3. **Implementar gestión de pagos**
   - Crear `PaymentForm.tsx`
   - Crear página `/dashboard/school/payments/page.tsx`

4. **Implementar gestión de instructores**
   - Crear `InstructorForm.tsx`
   - Crear página `/dashboard/school/instructors/page.tsx`

5. **Mejorar perfil de escuela**
   - Agregar upload de logo/cover
   - Usar `SchoolForm.tsx` en modo edición

## 📚 Recursos

- **Documentación completa:** Ver `SISTEMA_CRUD_ESTANDARIZADO.md`
- **Estructura de archivos:** Ver sección en documentación
- **Ejemplos de uso:** Ver código en `/dashboard/school/classes/page.tsx`

## 🆘 Soporte

Si encuentras problemas:

1. Revisar logs del backend y frontend
2. Verificar que todas las dependencias están instaladas
3. Confirmar que las variables de entorno están configuradas
4. Revisar la documentación de cada componente
5. Usar DevTools del navegador para debugging

## ✨ Características Implementadas

- ✅ Sistema de modales reutilizable
- ✅ Diálogos de confirmación
- ✅ Tablas de datos genéricas
- ✅ Formularios con validación
- ✅ Hook CRUD centralizado
- ✅ Manejo de errores consistente
- ✅ Estados de carga
- ✅ Responsive design
- ✅ Asociación usuario-escuela
- ✅ Gestión completa de clases

## 🎉 ¡Listo!

El sistema está configurado y listo para usar. Sigue los pasos de prueba para verificar que todo funciona correctamente.
