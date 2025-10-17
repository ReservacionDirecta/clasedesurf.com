# 🧪 Pruebas de Multi-Tenancy

## 📊 Datos Actuales en Railway

### Usuarios por Rol
- **ADMIN:** 1 usuario
  - admin@surfschool.com
- **SCHOOL_ADMIN:** 2 usuarios
  - yerctech@gmail.com
  - schooladmin@surfschool.com
- **INSTRUCTOR:** 7 usuarios
  - instructor@gmail.com
  - carlos.mendoza@limasurf.com
  - ana.rodriguez@limasurf.com
  - miguel.santos@limasurf.com
- **STUDENT:** 4 usuarios
  - prueba@gmail.com
  - student1@surfschool.com
  - student2@surfschool.com

### Escuelas
1. **Lima Surf Academy** (ID: 13)
   - 3 instructores
   - 3 clases
   - 8 reservas

2. **Waikiki Surf School** (ID: 14)
   - Sin instructores
   - Sin clases

## 🚀 Ejecutar Pruebas

### 1. Verificar Datos Actuales
```bash
node scripts/check-database-users.js
```

### 2. Pruebas Básicas
```bash
node scripts/test-multi-tenant.js
```

### 3. Pruebas Detalladas
```bash
node scripts/test-multi-tenant-detailed.js
```

## 🔐 Configurar Credenciales

Antes de ejecutar las pruebas, necesitas conocer las contraseñas de los usuarios.

### Opción 1: Usar Credenciales Existentes

Si conoces las contraseñas, edita el archivo:
```javascript
// scripts/test-multi-tenant-detailed.js

const credentials = {
  admin: { 
    email: 'admin@surfschool.com', 
    password: 'TU_PASSWORD_AQUI' 
  },
  schoolAdmin: { 
    email: 'yerctech@gmail.com', 
    password: 'TU_PASSWORD_AQUI' 
  },
  instructor: { 
    email: 'carlos.mendoza@limasurf.com', 
    password: 'TU_PASSWORD_AQUI' 
  },
  student: { 
    email: 'prueba@gmail.com', 
    password: 'TU_PASSWORD_AQUI' 
  }
};
```

### Opción 2: Crear Usuarios de Prueba

Puedes crear usuarios específicos para pruebas:

```bash
# Crear script de creación de usuarios de prueba
node scripts/create-test-users.js
```

## 📋 Casos de Prueba

### ADMIN
- ✅ Debe ver TODAS las escuelas
- ✅ Debe ver TODAS las clases
- ✅ Debe ver TODOS los instructores
- ✅ Debe ver TODOS los estudiantes
- ✅ Debe ver TODAS las reservas
- ✅ Debe ver TODOS los pagos

### SCHOOL_ADMIN
- ✅ Debe ver solo SU escuela
- ✅ Debe ver solo clases de SU escuela
- ✅ Debe ver solo instructores de SU escuela
- ✅ Debe ver solo estudiantes de SU escuela
- ✅ Debe ver solo reservas de SU escuela
- ✅ Debe ver solo pagos de SU escuela
- ❌ NO debe ver datos de otras escuelas

### INSTRUCTOR
- ✅ Debe ver solo SU perfil de instructor
- ✅ Debe ver clases de SU escuela
- ✅ Debe ver reservas de SU escuela
- ✅ Debe ver estudiantes con reservas en SU escuela
- ❌ NO debe ver perfiles de otros instructores
- ❌ NO debe ver datos de otras escuelas

### STUDENT
- ✅ Debe ver TODAS las clases (para reservar)
- ✅ Debe ver solo SUS reservas
- ✅ Debe ver solo SUS pagos
- ❌ NO debe ver reservas de otros estudiantes
- ❌ NO debe ver pagos de otros estudiantes
- ❌ NO debe acceder a endpoints de admin

## 🎯 Pruebas Manuales

### Probar con cURL

#### 1. Login
```bash
# Admin
curl -X POST https://clasedesurfcom-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@surfschool.com","password":"PASSWORD"}'

# Guardar el token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2. Probar Endpoints
```bash
# Ver clases
curl -H "Authorization: Bearer $TOKEN" \
  https://clasedesurfcom-production.up.railway.app/api/classes

# Ver instructores
curl -H "Authorization: Bearer $TOKEN" \
  https://clasedesurfcom-production.up.railway.app/api/instructors

# Ver reservas
curl -H "Authorization: Bearer $TOKEN" \
  https://clasedesurfcom-production.up.railway.app/api/reservations
```

### Probar desde el Frontend

1. **Login como SCHOOL_ADMIN**
   - Email: yerctech@gmail.com
   - Ir a /dashboard/school/classes
   - Verificar que solo ve clases de su escuela

2. **Login como INSTRUCTOR**
   - Email: carlos.mendoza@limasurf.com
   - Ir a /dashboard/instructor
   - Verificar que solo ve su perfil y clases de su escuela

3. **Login como STUDENT**
   - Email: prueba@gmail.com
   - Ir a /dashboard/student/reservations
   - Verificar que solo ve sus propias reservas

## 📊 Resultados Esperados

### Escenario 1: SCHOOL_ADMIN ve solo su escuela
```json
// GET /api/classes con token de yerctech@gmail.com
// Todas las clases deben tener schoolId: 13 (o la escuela del admin)
[
  {
    "id": 1,
    "title": "Clase 1",
    "schoolId": 13,  // ✓ Misma escuela
    ...
  },
  {
    "id": 2,
    "title": "Clase 2",
    "schoolId": 13,  // ✓ Misma escuela
    ...
  }
]
```

### Escenario 2: INSTRUCTOR ve solo su perfil
```json
// GET /api/instructors con token de instructor
// Solo debe devolver su propio perfil
[
  {
    "id": 63,
    "userId": 63,
    "schoolId": 13,
    "user": {
      "email": "carlos.mendoza@limasurf.com"
    }
  }
]
```

### Escenario 3: STUDENT ve solo sus reservas
```json
// GET /api/reservations con token de student
// Todas las reservas deben tener userId del estudiante
[
  {
    "id": 1,
    "userId": 2,  // ✓ ID del estudiante
    "classId": 1,
    ...
  }
]
```

## 🐛 Problemas Comunes

### Error 401: Unauthorized
- Verifica que el token sea válido
- Verifica que el token no haya expirado
- Verifica que el header Authorization esté correcto

### Error 403: Forbidden
- ✅ Esto es CORRECTO si intentas acceder a datos de otra escuela
- Verifica que el usuario tenga el rol correcto

### Error 404: Not Found
- Verifica que el recurso exista
- Verifica que el recurso pertenezca a la escuela del usuario

### Datos de Otras Escuelas Visibles
- ❌ Esto es un BUG
- Verifica que el middleware multi-tenant esté aplicado
- Verifica que el filtro WHERE incluya schoolId

## 📝 Crear Reporte de Pruebas

Después de ejecutar las pruebas, documenta los resultados:

```markdown
## Resultados de Pruebas Multi-Tenancy

Fecha: 2025-10-16
Versión: 1.0.0

### ADMIN
- ✅ Ver todas las escuelas: PASS
- ✅ Ver todas las clases: PASS
- ✅ Ver todos los instructores: PASS

### SCHOOL_ADMIN
- ✅ Ver solo su escuela: PASS
- ✅ Ver solo sus clases: PASS
- ❌ Puede ver otras escuelas: FAIL

### INSTRUCTOR
- ✅ Ver solo su perfil: PASS
- ✅ Ver clases de su escuela: PASS

### STUDENT
- ✅ Ver todas las clases: PASS
- ✅ Ver solo sus reservas: PASS
```

## 🎯 Próximos Pasos

1. **Ejecutar pruebas básicas**
   ```bash
   node scripts/check-database-users.js
   ```

2. **Configurar credenciales en el script**
   - Editar `scripts/test-multi-tenant-detailed.js`
   - Agregar contraseñas reales

3. **Ejecutar pruebas detalladas**
   ```bash
   node scripts/test-multi-tenant-detailed.js
   ```

4. **Revisar resultados**
   - Verificar que todas las pruebas pasen
   - Documentar cualquier fallo

5. **Corregir problemas** (si los hay)
   - Revisar logs del backend
   - Verificar middleware multi-tenant
   - Ajustar filtros WHERE

---

**Nota:** Las contraseñas no están incluidas por seguridad. Usa las contraseñas que configuraste al crear los usuarios.
