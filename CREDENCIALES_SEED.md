# 🔐 Credenciales del Seed de Multi-Tenancy

Este archivo contiene todas las credenciales creadas por el seed de la base de datos.

## 📋 Credenciales Disponibles

### 👑 Global Admin

**Email:** `admin@surfschool.com`  
**Password:** `password123`  
**Rol:** `ADMIN`  
**Descripción:** Administrador global del sistema con acceso completo

---

### 🏫 School 1 - Lima Surf Academy

#### School Admin
**Email:** `admin@limasurf.com`  
**Password:** `password123`  
**Rol:** `SCHOOL_ADMIN`  
**Descripción:** Administrador de la escuela Lima Surf Academy

#### Head Coach
**Email:** `roberto.silva@limasurf.com`  
**Password:** `password123`  
**Rol:** `HEAD_COACH`  
**Descripción:** Entrenador principal

#### Instructores
1. **Juan Pérez**
   - Email: `juan.perez@limasurf.com`
   - Password: `password123`
   - Rol: `INSTRUCTOR`

2. **María García**
   - Email: `maria.garcia@limasurf.com`
   - Password: `password123`
   - Rol: `INSTRUCTOR`

#### Estudiante
**Email:** `pedro.lopez@gmail.com`  
**Password:** `password123`  
**Rol:** `STUDENT`

---

### 🏄 School 2 - Barranco Surf School

#### School Admin
**Email:** `admin@barrancosurf.com`  
**Password:** `password123`  
**Rol:** `SCHOOL_ADMIN`  
**Descripción:** Administrador de la escuela Barranco Surf School

#### Head Coach
**Email:** `fernando.paz@barrancosurf.com`  
**Password:** `password123`  
**Rol:** `HEAD_COACH`  
**Descripción:** Entrenador principal

#### Instructores
1. **Diego Castro**
   - Email: `diego.castro@barrancosurf.com`
   - Password: `password123`
   - Rol: `INSTRUCTOR`

2. **Camila Rojas**
   - Email: `camila.rojas@barrancosurf.com`
   - Password: `password123`
   - Rol: `INSTRUCTOR`

#### Estudiante
**Email:** `carla.mendez@gmail.com`  
**Password:** `password123`  
**Rol:** `STUDENT`

---

## 🎯 Uso en Scripts de Prueba

Los scripts de prueba (`test-classes-api.js` y `test-classes-api.ps1`) usan por defecto:

```javascript
email: 'admin@limasurf.com'
password: 'password123'
```

### Cambiar Credenciales

Si quieres probar con otro usuario, modifica la sección de login en el script:

**JavaScript:**
```javascript
const loginData = {
  email: 'admin@barrancosurf.com',  // Cambiar aquí
  password: 'password123'
};
```

**PowerShell:**
```powershell
$loginData = @{
    email = "admin@barrancosurf.com"  # Cambiar aquí
    password = "password123"
}
```

## 🔄 Regenerar Credenciales

Si necesitas regenerar las credenciales del seed:

```bash
cd backend
npx prisma db seed
```

Esto creará nuevamente todos los usuarios con las mismas credenciales.

## ⚠️ Seguridad

**IMPORTANTE**: Estas credenciales son solo para desarrollo y testing.

- ❌ **NO usar en producción**
- ❌ **NO compartir públicamente**
- ✅ Cambiar todas las contraseñas en producción
- ✅ Usar variables de entorno para credenciales sensibles

## 📝 Notas

- Todas las contraseñas son: `password123`
- Los usuarios están vinculados a sus respectivas escuelas
- El admin global puede acceder a todas las escuelas
- Los school admins solo pueden gestionar su propia escuela

---

**Última actualización**: Octubre 2025
