# 🔐 Credenciales de Usuarios de Prueba

## 📋 Usuarios Creados en Railway

### 👑 **ADMIN - Administrador Principal**
- **Email:** `admin@clasedesurf.com`
- **Contraseña:** `admin123`
- **Rol:** `ADMIN`
- **Descripción:** Acceso completo al sistema, puede gestionar todo

### 🏫 **SCHOOL_ADMIN - Director de Escuela**
- **Email:** `director@escuelalimasurf.com`
- **Contraseña:** `school123`
- **Rol:** `SCHOOL_ADMIN`
- **Descripción:** Puede gestionar su escuela, clases e instructores

### 🏄‍♂️ **INSTRUCTOR - Instructor de Surf**
- **Email:** `carlos@instructor.com`
- **Contraseña:** `instructor123`
- **Rol:** `INSTRUCTOR`
- **Descripción:** Instructor certificado con 5 años de experiencia

Credenciales creadas:
Email: gbarrera@clasedesurf.com

Contraseña temporal: instruc123

* Comparte estas credenciales con el instructor de forma segura

### 🌊 **ESTUDIANTES**

#### **Estudiante 1 - Principiante**
- **Email:** `maria@estudiante.com`
- **Contraseña:** `student123`
- **Rol:** `STUDENT`
- **Perfil:** 25 años, sabe nadar, sin lesiones

#### **Estudiante 2 - Intermedio**
- **Email:** `diego@estudiante.com`
- **Contraseña:** `student123`
- **Rol:** `STUDENT`
- **Perfil:** 30 años, sabe nadar, lesión menor en rodilla

#### **Estudiante 3 - No sabe nadar**
- **Email:** `ana@estudiante.com`
- **Contraseña:** `student123`
- **Rol:** `STUDENT`
- **Perfil:** 22 años, NO sabe nadar

---

## 🏫 Escuela Creada

### **Lima Surf School**
- **Ubicación:** Miraflores, Lima
- **Teléfono:** +51 999 123 456
- **Email:** info@limasurfschool.com
- **Instructor:** Carlos Mendoza

---

## 📚 Clases Creadas

### **Clase 1: Surf para Principiantes**
- **Nivel:** BEGINNER
- **Precio:** S/. 80.00
- **Duración:** 2 horas
- **Capacidad:** 8 estudiantes

### **Clase 2: Surf Intermedio - Perfeccionamiento**
- **Nivel:** INTERMEDIATE
- **Precio:** S/. 120.00
- **Duración:** 2.5 horas
- **Capacidad:** 6 estudiantes

---

## 🚀 Cómo Ejecutar el Script

### **Opción 1: Railway Dashboard**
1. Ve a tu proyecto en Railway
2. Abre la base de datos PostgreSQL
3. Ve a la pestaña "Query"
4. Copia y pega el contenido de `create_test_users.sql`
5. Ejecuta el script

### **Opción 2: Herramienta Externa (pgAdmin, DBeaver, etc.)**
1. Conecta usando estos datos:
   - **Host:** `hopper.proxy.rlwy.net`
   - **Puerto:** `14816`
   - **Usuario:** `postgres`
   - **Contraseña:** `BJrFcoA0nIvEWPxvQLJHJfzYPiHMOrkhb`
   - **Base de datos:** `railway`
2. Ejecuta el script `create_test_users.sql`

### **Opción 3: Línea de comandos (si tienes psql instalado)**
```bash
PGPASSWORD=BJrFcoA0nIvEWPxvQLJHJfzYPiHMOrkhb psql -h hopper.proxy.rlwy.net -U postgres -p 14816 -d railway -f create_test_users.sql
```

---

## ✅ Verificación

Después de ejecutar el script, puedes verificar que todo se creó correctamente:

```sql
-- Ver usuarios creados
SELECT id, name, email, role, "canSwim", age FROM users ORDER BY role, name;

-- Ver escuelas e instructores
SELECT 
  s.name as school_name,
  u.name as instructor_name,
  u.email as instructor_email
FROM schools s
LEFT JOIN instructors i ON s.id = i."schoolId"
LEFT JOIN users u ON i."userId" = u.id;

-- Ver clases disponibles
SELECT title, level, price, capacity, date FROM classes ORDER BY date;
```

---

## 🧪 Pruebas Recomendadas

1. **Login como Admin:** Verificar acceso completo
2. **Login como School Admin:** Verificar gestión de escuela
3. **Login como Student:** Verificar perfil y reservas
4. **Crear reservas:** Probar el flujo completo
5. **Actualizar perfiles:** Verificar funcionalidad

¡Ya tienes usuarios de prueba para todos los roles del sistema! 🎉