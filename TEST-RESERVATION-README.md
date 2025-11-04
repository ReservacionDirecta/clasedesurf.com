# 🧪 Script de Prueba de Reserva con Múltiples Participantes

## 📋 Resumen

Este documento describe cómo probar el flujo completo de reserva de clases con múltiples participantes, incluyendo:
- ✅ Registro de usuario estudiante
- ✅ Pre-llenado de datos del usuario logueado
- ✅ Captura de datos detallados de cada participante
- ✅ Almacenamiento en base de datos
- ✅ Visualización por parte del estudiante y escuela/coach

## 🔧 Preparación

### 1. Migraciones de Base de Datos

**IMPORTANTE**: Antes de ejecutar el script, asegúrate de que la migración de `participants` esté aplicada:

```sql
-- Esta migración debe existir en la base de datos
ALTER TABLE "reservations" ADD COLUMN "participants" JSONB;
```

**Para aplicar la migración:**

#### Opción A: Usando Prisma Migrate (Recomendado)
```powershell
cd backend
npx prisma migrate deploy
```

#### Opción B: Reiniciar el backend (aplica automáticamente)
```powershell
cd backend
npm run dev
```

El script `scripts/start.js` aplica automáticamente las migraciones pendientes al iniciar.

#### Opción C: Aplicar manualmente con SQL
Conectarse a la base de datos y ejecutar:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name='reservations' AND column_name='participants';

-- Si no existe, agregar:
ALTER TABLE "reservations" ADD COLUMN "participants" JSONB;
```

### 2. Verificar que los servicios estén corriendo

```powershell
# Backend
curl http://localhost:4000/health

# Frontend
curl http://localhost:3000
```

## 🚀 Ejecutar el Script de Prueba

### Script Disponible: `test-reservation-simple.ps1`

Este script realiza las siguientes acciones:

1. **Crea/verifica usuario admin**
   - Email: `admin.test@test.com`
   - Password: `password123`

2. **Obtiene/crea una escuela**
   - Necesaria para asociar la clase

3. **Crea una clase de prueba**
   - Capacidad: 10 personas
   - Fecha: 5 días en el futuro
   - Precio: $50 USD por persona

4. **Crea un usuario estudiante**
   - Nombre: `Maria Surfer [timestamp]`
   - Email: `maria.surf[timestamp]@test.com`
   - Password: `password123`

5. **Crea una reserva con 2 participantes**:
   - **Participante 1 (Titular)**: Maria Surfer
     - Edad: 28 años
     - Altura: 165 cm
     - Peso: 60 kg
     - Sabe nadar: Sí (Nivel: Intermedio)
     - Ha surfeado antes: No
     - Lesiones: Ninguna
     - Comentarios: "Primera vez en surf!"
   
   - **Participante 2**: Carlos Acompañante
     - Edad: 32 años
     - Altura: 178 cm
     - Peso: 75 kg
     - Sabe nadar: Sí (Nivel: Avanzado)
     - Ha surfeado antes: Sí
     - Lesiones: "Rodilla derecha recuperada"
     - Comentarios: "He surfeado antes"

6. **Verifica que el estudiante puede ver su reserva**
   - Lista todas las reservas del usuario
   - Muestra los detalles completos de participantes

### Ejecutar el Script

```powershell
cd C:\Users\yerct\clasedesurf.com
powershell -ExecutionPolicy Bypass -File .\test-reservation-simple.ps1
```

### Salida Esperada

```
========================================
TEST DE RESERVA CON 2 PARTICIPANTES
========================================

Paso 1: Verificando/creando usuario admin...
Admin creado

Paso 2: Obteniendo escuela...
Escuela: Escuela Test

Paso 3: Creando clase de prueba...
Clase creada: Clase Surf Test 20251030... (ID: X)

Paso 4: Creando usuario estudiante...
Estudiante creado: Maria Surfer 20251030...

Paso 5: Creando reserva con 2 participantes...
Participantes:
  1. Maria Surfer (Titular) - 28 anos, 165cm, 60kg
  2. Carlos Acompanante - 32 anos, 178cm, 75kg

RESERVA CREADA EXITOSAMENTE
  ID: X
  Estado: PENDING

Paso 6: Verificando que el estudiante ve su reserva...
LA CLASE SE ASIGNO CORRECTAMENTE AL ESTUDIANTE

  PARTICIPANTES GUARDADOS:
    Participante 1: Maria Surfer
      Edad: 28, Altura: 165cm, Peso: 60kg
      Nada: Si, Nivel: INTERMEDIATE
      Surfeado: No
      ...

======================================
PRUEBA COMPLETADA EXITOSAMENTE
======================================
```

## 🌐 Verificación en el Navegador

Después de ejecutar el script exitosamente, el output mostrará las credenciales:

```
CREDENCIALES:
  Email: maria.surf[timestamp]@test.com
  Password: password123
```

### Pasos para verificar en el navegador:

1. Abrir `http://localhost:3000`
2. Hacer clic en "Iniciar Sesión"
3. Usar las credenciales del estudiante del output
4. Navegar a "Mis Reservas" (o `/dashboard/student/reservations`)
5. Ver los detalles de la reserva creada

**Deberías ver:**
- Título de la clase
- Fecha y hora
- Escuela y ubicación
- Lista de 2 participantes con todos sus datos:
  - Nombre
  - Edad, altura, peso
  - Nivel de natación
  - Experiencia previa en surf
  - Lesiones
  - Comentarios adicionales
- Precio total (2 × $50 = $100 USD)

## 📊 Verificación desde el Panel de Escuela/Admin

### Como Admin o School Admin:

1. Iniciar sesión como:
   - Email: `admin.test@test.com`
   - Password: `password123`

2. Ir a "Reservas" en el dashboard

3. Buscar la reserva creada por el script

4. **Verificar que se pueden ver:**
   - Datos completos de cada participante
   - Información médica (lesiones/condiciones)
   - Nivel de natación y experiencia
   - Comentarios adicionales

**Esto es crucial para que el coach/escuela pueda:**
- Preparar el equipo adecuado (tallas de wetsuit, tablas)
- Conocer el nivel de cada participante
- Estar al tanto de lesiones o condiciones médicas
- Adaptar la clase según la experiencia del grupo

## 🔍 Solución de Problemas

### Error: "Internal server error" al crear reserva

**Causa**: La columna `participants` no existe en la base de datos.

**Solución**:
```powershell
cd backend

# Verificar migraciones pendientes
npx prisma migrate status

# Aplicar migraciones
npx prisma migrate deploy

# O reiniciar el backend
npm run dev
```

### Error: "Authentication failed against database server"

**Causa**: Las credenciales de la base de datos han cambiado o son incorrectas.

**Solución**:
1. Verificar `backend/.env` o variables de entorno
2. Actualizar `DATABASE_URL` con las credenciales correctas de Railway
3. Reiniciar el backend

### Error: "No hay clases disponibles para testing"

**Causa**: No hay datos de prueba en la base de datos.

**Solución**:
El script crea automáticamente:
- Usuario admin
- Escuela
- Clase

Si aún falla, verificar que el usuario tenga permisos para crear clases (debe ser ADMIN o SCHOOL_ADMIN).

## 📝 Estructura de Datos de Participantes

Los datos de participantes se guardan en la base de datos como JSON:

```json
{
  "participants": [
    {
      "name": "Maria Surfer",
      "age": "28",
      "height": "165",
      "weight": "60",
      "canSwim": true,
      "swimmingLevel": "INTERMEDIATE",
      "hasSurfedBefore": false,
      "injuries": "Ninguna",
      "comments": "Primera vez en surf!"
    },
    {
      "name": "Carlos Acompañante",
      "age": "32",
      "height": "178",
      "weight": "75",
      "canSwim": true,
      "swimmingLevel": "ADVANCED",
      "hasSurfedBefore": true,
      "injuries": "Rodilla derecha recuperada",
      "comments": "He surfeado antes"
    }
  ]
}
```

## ✅ Verificaciones Completas

El script verifica que:

- [ ] Usuario estudiante se crea correctamente
- [ ] Clase está disponible con capacidad suficiente
- [ ] Reserva se crea con datos de 2 participantes
- [ ] Todos los campos obligatorios están completos
- [ ] La clase se asigna correctamente al estudiante
- [ ] El estudiante puede ver su reserva en el listado
- [ ] Los datos de participantes se almacenan correctamente
- [ ] El coach/escuela puede acceder a la información

## 🎯 Casos de Uso Cubiertos

1. **Usuario Logueado Reserva**:
   - Sus datos se pre-llenan automáticamente
   - Completa datos de acompañantes
   - Crea la reserva instantáneamente

2. **Usuario No Logueado (Invitado)**:
   - Llena formulario inicial
   - Es redirigido a confirmación
   - Puede registrarse con datos pre-llenados
   - Completa datos de participantes
   - Confirma la reserva

3. **Visualización del Coach/Escuela**:
   - Ve todas las reservas de su escuela
   - Accede a datos detallados de cada participante
   - Prepara la clase según la información recibida

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que las migraciones estén aplicadas
2. Revisa los logs del backend
3. Verifica que la base de datos esté accesible
4. Asegúrate de que backend y frontend estén corriendo

---

**Última actualización**: 31 de Octubre 2025
**Versión**: 1.0.0

