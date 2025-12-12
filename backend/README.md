# Backend - SurfSchool API

Backend desarrollado en **Express.js** y **TypeScript**, utilizando **Prisma ORM** con **PostgreSQL**.

## 🚀 Características Técnicas

- **Arquitectura RESTful**: Controladores, rutas y servicios organizados.
- **Base de Datos**: PostgreSQL con esquema relacional robusto.
- **ORM**: Prisma para manejo de datos tipado y migraciones.
- **Autenticación**: JWT (JSON Web Tokens) con sistema de Refresh Tokens.
- **Validación**: Zod para validación estricta de payloads.
- **Gestión de Archivos**: Carga de imágenes (Multer) para escuelas y clases.

## 🛠 Comandos Principales

### Instalación
```bash
npm install
```

### Base de Datos
```bash
# Generar cliente de Prisma (necesario tras cambios en schema)
npx prisma generate

# Crear y aplicar migraciones
npx prisma migrate dev --name <nombre_migracion>

# Poblar base de datos con datos de prueba
npm run seed
```

### Desarrollo
```bash
# Iniciar servidor en modo desarrollo (hot-reload)
npm run dev
```

## 📚 Estructura de API (Endpoints Clave)

### Clases (`/api/classes`)
- `GET /` - Listar clases (con filtros).
- `POST /` - Crear nueva clase (Admin/SchoolAdmin).
- `DELETE /:id` - **Soft Delete** (Mueve a papelera).
- `GET /deleted` - Ver papelera de reciclaje.
- `POST /:id/restore` - Restaurar clase desde papelera.
- `POST /:id/duplicate` - Duplicar clase existente (+7 días).

### Reservas (`/api/reservations`)
- `GET /` - Listar reservas del usuario o escuela.
- `POST /` - Crear reserva.
- `PUT /:id/status` - Cambiar estado (CONFIRMED, CANCELED).

### Pagos (`/api/payments`)
- `POST /` - Registrar pago/voucher.
- `PUT /:id` - Validar o rechazar pago.

## 🔄 Soft Delete

Implementamos un sistema de **eliminación suave** para la entidad `Class`.
- El campo `deletedAt` marca la fecha de eliminación.
- Las clases eliminadas no aparecen en listados públicos (`GET /`).
- Se pueden recuperar o duplicar, manteniendo la integridad de reservas pasadas.

## 🧪 Testing

```bash
# (Pendiente de configuración completa de Jest)
npm test
```
