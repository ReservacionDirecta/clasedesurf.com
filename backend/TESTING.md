# Guía de Testing - SurfSchool Booking Platform

## Usuarios de Prueba

La base de datos incluye usuarios de prueba para facilitar el desarrollo y testing de la aplicación. Todos los usuarios comparten la misma contraseña: `password123`

### Credenciales de Acceso

#### 👨‍💼 Administrador del Sistema
```
Email: admin@surfschool.com
Password: password123
Rol: ADMIN
```
**Permisos:**
- Acceso completo al dashboard administrativo
- Gestión de todas las escuelas
- Gestión de usuarios
- Generación de reportes y payouts
- Vista de todas las reservas y pagos

#### 🏫 Administrador de Escuela
```
Email: schooladmin@surfschool.com
Password: password123
Rol: SCHOOL_ADMIN
Escuela: Lima Surf Academy
```
**Permisos:**
- Gestión de clases de su escuela
- Vista de reservas de su escuela
- Gestión de pagos de su escuela
- Acceso a reportes de su escuela

#### 🏄 Estudiantes

**Estudiante 1 - Alice Johnson**
```
Email: student1@surfschool.com
Password: password123
Rol: STUDENT
Edad: 28 años
Sabe nadar: Sí
```
- Tiene 1 reserva confirmada

**Estudiante 2 - Bob Williams**
```
Email: student2@surfschool.com
Password: password123
Rol: STUDENT
Edad: 35 años
Sabe nadar: No
```
- Tiene 1 reserva pendiente

**Usuario de Prueba General**
```
Email: test@test.com
Password: password123
Rol: STUDENT
Edad: 25 años
Sabe nadar: Sí
```
- Usuario limpio sin reservas para testing

## Datos de Prueba Incluidos

### Escuelas

#### Lima Surf Academy
- **Ubicación:** Miraflores, Lima
- **Descripción:** Pioneering surf school in Lima with over 8 years of experience
- **Email:** contact@limasurf.com
- **Teléfono:** +5112345678

#### Waikiki Surf School
- **Ubicación:** San Bartolo, Lima
- **Descripción:** Specializing in intermediate and advanced surf techniques
- **Email:** info@waikikisurf.pe
- **Teléfono:** +5118765432

### Clases Programadas

#### Clase 1: Iniciación en Miraflores
- **Escuela:** Lima Surf Academy
- **Nivel:** BEGINNER
- **Fecha:** 15 de Enero, 2025 - 08:00 AM
- **Duración:** 120 minutos
- **Capacidad:** 8 personas
- **Precio:** $25
- **Descripción:** Aprende surf en la icónica Playa Makaha

#### Clase 2: Intermedio en San Bartolo
- **Escuela:** Waikiki Surf School
- **Nivel:** INTERMEDIATE
- **Fecha:** 16 de Enero, 2025 - 04:00 PM
- **Duración:** 120 minutos
- **Capacidad:** 6 personas
- **Precio:** $35
- **Descripción:** Perfecciona tu técnica en Playa Waikiki

#### Clase 3: Avanzado en La Herradura
- **Escuela:** Lima Surf Academy
- **Nivel:** ADVANCED
- **Fecha:** 17 de Enero, 2025 - 09:00 AM
- **Duración:** 120 minutos
- **Capacidad:** 4 personas
- **Precio:** $45
- **Descripción:** Para surfistas con experiencia

### Reservas Existentes

1. **Alice Johnson** → Clase de Iniciación (CONFIRMED)
2. **Bob Williams** → Clase Intermedia (PENDING)

## Comandos de Base de Datos

### Ejecutar Seed (Poblar Base de Datos)

Para crear todos los datos de prueba:

```bash
cd backend
npx prisma db seed
```

Este comando:
1. Limpia todos los datos existentes
2. Crea usuarios de prueba
3. Crea escuelas
4. Crea clases
5. Crea reservas de ejemplo

### Regenerar Cliente Prisma

Si modificas el esquema de Prisma:

```bash
npx prisma generate
```

### Crear y Aplicar Migraciones

Después de modificar `schema.prisma`:

```bash
npx prisma migrate dev --name nombre_de_la_migracion
```

### Resetear Base de Datos Completa

⚠️ **ADVERTENCIA:** Esto eliminará TODOS los datos

```bash
npx prisma migrate reset
```

Este comando:
1. Elimina la base de datos
2. Crea una nueva base de datos
3. Aplica todas las migraciones
4. Ejecuta el seed automáticamente

### Ver Base de Datos con Prisma Studio

Para explorar los datos visualmente:

```bash
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555`

## Flujos de Testing Recomendados

### Testing de Autenticación

1. **Login como Estudiante**
   - Usar `test@test.com` / `password123`
   - Verificar redirección al dashboard de estudiante
   - Verificar que solo se muestren opciones de estudiante

2. **Login como Admin**
   - Usar `admin@surfschool.com` / `password123`
   - Verificar acceso al dashboard administrativo
   - Verificar permisos de gestión completa

3. **Login como School Admin**
   - Usar `schooladmin@surfschool.com` / `password123`
   - Verificar acceso solo a datos de su escuela

### Testing de Reservas

1. **Crear Nueva Reserva**
   - Login como `test@test.com`
   - Navegar a listado de clases
   - Seleccionar una clase disponible
   - Completar formulario de reserva
   - Verificar creación con estado PENDING

2. **Ver Reservas Existentes**
   - Login como `student1@surfschool.com`
   - Navegar a "Mis Reservas"
   - Verificar que se muestre la reserva confirmada

### Testing de Dashboard Administrativo

1. **Gestión de Escuelas**
   - Login como admin
   - Navegar a "Manage Schools"
   - Verificar listado de escuelas
   - Probar edición de escuela

2. **Gestión de Clases**
   - Login como school admin
   - Navegar a "Mis Clases"
   - Verificar listado de clases de su escuela
   - Probar creación de nueva clase

3. **Gestión de Pagos**
   - Login como admin
   - Navegar a reservas
   - Cambiar estado de pago de PENDING a PAID
   - Verificar actualización

## Estructura de Roles y Permisos

### STUDENT (Estudiante)
- ✅ Ver clases disponibles
- ✅ Crear reservas
- ✅ Ver sus propias reservas
- ✅ Actualizar su perfil
- ❌ Acceso a dashboards administrativos

### SCHOOL_ADMIN (Administrador de Escuela)
- ✅ Todo lo de STUDENT
- ✅ Gestionar clases de su escuela
- ✅ Ver reservas de su escuela
- ✅ Gestionar pagos de su escuela
- ✅ Ver reportes de su escuela
- ❌ Acceso a otras escuelas
- ❌ Gestión de usuarios del sistema

### ADMIN (Administrador del Sistema)
- ✅ Acceso completo a todo
- ✅ Gestión de todas las escuelas
- ✅ Gestión de usuarios
- ✅ Generación de payouts
- ✅ Reportes globales
- ✅ Configuración del sistema

## Variables de Entorno Necesarias

Asegúrate de tener configurado el archivo `.env` en el backend:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/clasedesurf.com"
JWT_SECRET="tu-secreto-jwt-super-seguro"
PORT=4000
```

## Troubleshooting

### Error: "Table does not exist"

**Solución:** Ejecutar migraciones
```bash
npx prisma migrate dev
```

### Error: "Cannot find module '@prisma/client'"

**Solución:** Generar cliente Prisma
```bash
npx prisma generate
```

### Error: "Unique constraint failed"

**Solución:** Los datos ya existen, resetear base de datos
```bash
npx prisma migrate reset
```

### Seed no se ejecuta

**Solución:** Verificar configuración en `package.json`
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## Notas Importantes

1. **Contraseñas:** Todas las contraseñas de prueba están hasheadas con bcrypt (10 rounds)
2. **Fechas:** Las clases están programadas para Enero 2025 (fechas futuras)
3. **Datos Limpios:** El seed limpia todos los datos existentes antes de crear nuevos
4. **Producción:** ⚠️ NUNCA ejecutar el seed en producción, solo en desarrollo

## Próximos Pasos

Después de ejecutar el seed, puedes:

1. Iniciar el backend: `npm run dev`
2. Iniciar el frontend: `cd ../frontend && npm run dev`
3. Acceder a la aplicación en `http://localhost:3000`
4. Probar login con cualquiera de los usuarios de prueba
5. Explorar las diferentes funcionalidades según el rol

## Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Guía de Seeding](https://www.prisma.io/docs/guides/database/seed-database)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
