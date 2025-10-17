# 🧪 Guía de Pruebas Multi-Tenancy

## 📊 Datos de Prueba Creados

Se han creado **2 escuelas completas** con todos sus datos para probar el aislamiento multi-tenancy:

### 🏫 Escuela 1: Lima Surf Academy (Miraflores)

**Administrador:**
- Email: `admin@limasurf.com`
- Password: `password123`
- Rol: `SCHOOL_ADMIN`

**Instructores:**
1. **Juan Pérez** (Instructor)
   - Email: `juan.perez@limasurf.com`
   - Password: `password123`
   - Especialidad: Principiantes, Técnica avanzada

2. **María García** (Instructor)
   - Email: `maria.garcia@limasurf.com`
   - Password: `password123`
   - Especialidad: Niños, Principiantes

3. **Roberto Silva** (Head Coach)
   - Email: `roberto.silva@limasurf.com`
   - Password: `password123`
   - Especialidad: Competencia, Técnica avanzada

**Clases:**
1. Surf para Principiantes - 20 Oct 2025, 09:00
2. Surf Intermedio - 21 Oct 2025, 10:00
3. Surf Kids - 22 Oct 2025, 11:00
4. Clase Privada Avanzada - 23 Oct 2025, 14:00

**Estudiantes:**
- Pedro López (`pedro.lopez@gmail.com`)
- Ana Torres (`ana.torres@gmail.com`)
- Luis Ramírez (`luis.ramirez@gmail.com`)

**Reservas:** 3 reservas con pagos (2 pagadas, 1 pendiente)

---

### 🏫 Escuela 2: Barranco Surf School (Barranco)

**Administrador:**
- Email: `admin@barrancosurf.com`
- Password: `password123`
- Rol: `SCHOOL_ADMIN`

**Instructores:**
1. **Diego Castro** (Instructor)
   - Email: `diego.castro@barrancosurf.com`
   - Password: `password123`
   - Especialidad: Longboard, Estilo clásico

2. **Camila Rojas** (Instructor)
   - Email: `camila.rojas@barrancosurf.com`
   - Password: `password123`
   - Especialidad: Surf femenino, Fitness

3. **Fernando Paz** (Head Coach)
   - Email: `fernando.paz@barrancosurf.com`
   - Password: `password123`
   - Especialidad: Alto rendimiento, Competencia

**Clases:**
1. Longboard Session - 20 Oct 2025, 08:00
2. Surf & Yoga - 21 Oct 2025, 07:00
3. Entrenamiento Competitivo - 22 Oct 2025, 06:00
4. Surf para Mujeres - 23 Oct 2025, 09:00

**Estudiantes:**
- Carla Méndez (`carla.mendez@gmail.com`)
- Jorge Díaz (`jorge.diaz@gmail.com`)
- Patricia Luna (`patricia.luna@gmail.com`)

**Reservas:** 4 reservas con pagos (3 pagadas, 1 pendiente)

---

### 👤 Administrador Global

**Email:** `admin@surfschool.com`
**Password:** `password123`
**Rol:** `ADMIN`

Este usuario puede ver y gestionar datos de **ambas escuelas** sin restricciones.

---

## 🧪 Escenarios de Prueba

### 1. Prueba de Aislamiento - School Admin

#### Escenario A: Admin de Lima Surf Academy

1. **Login:**
   ```
   Email: admin@limasurf.com
   Password: password123
   ```

2. **Verificar que SOLO ve datos de Lima Surf:**
   - ✅ Dashboard muestra solo clases de Lima Surf
   - ✅ Lista de instructores: Juan, María, Roberto
   - ✅ Lista de clases: 4 clases de Lima Surf
   - ✅ Reservas: Solo reservas de clases de Lima Surf
   - ✅ Pagos: Solo pagos de Lima Surf
   - ❌ NO debe ver datos de Barranco Surf

3. **Intentar acciones:**
   - ✅ Crear nueva clase → Se crea en Lima Surf
   - ✅ Editar clase de Lima Surf → Permitido
   - ❌ Editar clase de Barranco → Bloqueado (403)
   - ✅ Ver perfil de escuela → Lima Surf Academy
   - ❌ Editar escuela de Barranco → Bloqueado

#### Escenario B: Admin de Barranco Surf School

1. **Login:**
   ```
   Email: admin@barrancosurf.com
   Password: password123
   ```

2. **Verificar que SOLO ve datos de Barranco Surf:**
   - ✅ Dashboard muestra solo clases de Barranco
   - ✅ Lista de instructores: Diego, Camila, Fernando
   - ✅ Lista de clases: 4 clases de Barranco
   - ✅ Reservas: Solo reservas de Barranco
   - ✅ Pagos: Solo pagos de Barranco
   - ❌ NO debe ver datos de Lima Surf

3. **Intentar acciones:**
   - ✅ Crear nueva clase → Se crea en Barranco
   - ✅ Editar clase de Barranco → Permitido
   - ❌ Editar clase de Lima Surf → Bloqueado (403)

---

### 2. Prueba de Aislamiento - Instructores

#### Escenario C: Instructor de Lima Surf

1. **Login:**
   ```
   Email: juan.perez@limasurf.com
   Password: password123
   ```

2. **Verificar acceso de solo lectura:**
   - ✅ Ver clases de Lima Surf
   - ✅ Ver estudiantes de Lima Surf
   - ✅ Ver ganancias de Lima Surf
   - ❌ NO puede crear/editar clases
   - ❌ NO puede ver datos de Barranco

3. **Endpoints a probar:**
   ```bash
   GET /instructor/classes
   GET /instructor/profile
   GET /instructor/students
   GET /instructor/earnings
   ```

#### Escenario D: Head Coach de Barranco

1. **Login:**
   ```
   Email: fernando.paz@barrancosurf.com
   Password: password123
   ```

2. **Verificar mismo acceso que instructor:**
   - ✅ Ver clases de Barranco
   - ✅ Ver estudiantes de Barranco
   - ✅ Ver ganancias de Barranco
   - ❌ NO puede crear/editar clases
   - ❌ NO puede ver datos de Lima Surf

---

### 3. Prueba de Admin Global

#### Escenario E: Administrador Global

1. **Login:**
   ```
   Email: admin@surfschool.com
   Password: password123
   ```

2. **Verificar acceso completo:**
   - ✅ Ver todas las escuelas
   - ✅ Ver clases de Lima Surf
   - ✅ Ver clases de Barranco Surf
   - ✅ Ver todos los instructores
   - ✅ Ver todas las reservas
   - ✅ Ver todos los pagos
   - ✅ Editar cualquier recurso
   - ✅ Sin restricciones de tenant

---

### 4. Prueba de Estudiantes

#### Escenario F: Estudiante de Lima Surf

1. **Login:**
   ```
   Email: pedro.lopez@gmail.com
   Password: password123
   ```

2. **Verificar acceso limitado:**
   - ✅ Ver solo sus propias reservas
   - ✅ Ver solo sus propios pagos
   - ✅ Ver clases públicas de cualquier escuela
   - ❌ NO puede ver reservas de otros estudiantes
   - ❌ NO puede ver datos internos de escuelas

---

## 🔍 Pruebas con API (Postman/cURL)

### Configuración

**Base URL:** `http://localhost:4000`

### 1. Obtener Token

```bash
# Login como Admin de Lima Surf
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@limasurf.com",
    "password": "password123"
  }'

# Guardar el token de la respuesta
```

### 2. Probar Endpoints con Token

```bash
# Ver clases (debe mostrar solo de Lima Surf)
curl http://localhost:4000/classes \
  -H "Authorization: Bearer <TOKEN>"

# Ver instructores (debe mostrar solo de Lima Surf)
curl http://localhost:4000/instructors \
  -H "Authorization: Bearer <TOKEN>"

# Ver reservas (debe mostrar solo de Lima Surf)
curl http://localhost:4000/reservations \
  -H "Authorization: Bearer <TOKEN>"

# Ver pagos (debe mostrar solo de Lima Surf)
curl http://localhost:4000/payments \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Intentar Cross-Tenant Access (Debe Fallar)

```bash
# Login como Admin de Lima Surf
TOKEN_LIMA="<token_lima_surf>"

# Intentar editar clase de Barranco (debe retornar 403)
curl -X PUT http://localhost:4000/classes/<ID_CLASE_BARRANCO> \
  -H "Authorization: Bearer $TOKEN_LIMA" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked"}'
```

---

## 📊 Resultados Esperados

### ✅ Comportamiento Correcto

| Usuario | Acción | Resultado Esperado |
|---------|--------|-------------------|
| Admin Lima Surf | Ver clases | Solo clases de Lima Surf |
| Admin Lima Surf | Editar clase de Lima | ✅ Permitido |
| Admin Lima Surf | Editar clase de Barranco | ❌ 403 Forbidden |
| Instructor Lima | Ver clases | Solo clases de Lima Surf |
| Instructor Lima | Crear clase | ❌ 403 Forbidden |
| Admin Barranco | Ver clases | Solo clases de Barranco |
| Admin Barranco | Editar clase de Barranco | ✅ Permitido |
| Admin Barranco | Editar clase de Lima | ❌ 403 Forbidden |
| Admin Global | Ver todas las clases | ✅ Todas las escuelas |
| Admin Global | Editar cualquier clase | ✅ Permitido |
| Estudiante | Ver sus reservas | ✅ Solo propias |
| Estudiante | Ver reservas de otros | ❌ No visible |

---

## 🐛 Reporte de Problemas

Si encuentras algún problema durante las pruebas:

1. **Verificar token JWT:**
   - ¿El token es válido?
   - ¿El token tiene el rol correcto?

2. **Verificar logs del backend:**
   - Revisar consola del servidor
   - Buscar errores de autorización

3. **Verificar base de datos:**
   ```sql
   -- Ver escuelas
   SELECT id, name, "ownerId" FROM schools;
   
   -- Ver clases por escuela
   SELECT id, title, "schoolId" FROM classes;
   
   -- Ver instructores por escuela
   SELECT id, "userId", "schoolId" FROM instructors;
   ```

4. **Documentar el problema:**
   - Usuario utilizado
   - Acción intentada
   - Respuesta recibida
   - Respuesta esperada

---

## 🎯 Checklist de Pruebas

- [ ] Admin Lima Surf solo ve datos de Lima Surf
- [ ] Admin Barranco solo ve datos de Barranco
- [ ] Admin Lima no puede editar clases de Barranco
- [ ] Admin Barranco no puede editar clases de Lima
- [ ] Instructor Lima solo ve datos de Lima (solo lectura)
- [ ] Instructor Barranco solo ve datos de Barranco (solo lectura)
- [ ] Head Coach tiene mismo acceso que Instructor
- [ ] Admin Global ve todos los datos
- [ ] Admin Global puede editar cualquier recurso
- [ ] Estudiantes solo ven sus propias reservas
- [ ] Endpoints `/instructor/*` funcionan correctamente
- [ ] Banner de contexto de escuela se muestra en frontend
- [ ] No hay fugas de datos entre escuelas

---

## 📝 Notas Adicionales

- Todos los passwords son: `password123`
- El backend debe estar corriendo en `http://localhost:4000`
- El frontend debe estar corriendo en `http://localhost:3000`
- Los datos de prueba se pueden regenerar ejecutando:
  ```bash
  npx tsx prisma/seed-multitenancy.ts
  ```

---

**¡Sistema Multi-Tenancy listo para probar!** 🚀
