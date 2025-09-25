# Plan de Implementación - Plataforma de Reservas SurfSchool

Este documento refleja el estado real del proyecto tras separar la lógica (backend) de la interfaz (frontend), crear un scaffold de backend con Prisma y exponer endpoints REST básicos. Incluye instrucciones de ejecución, verificación rápida y siguientes pasos prioritarios.

Resumen rápido (estado actual)
- Backend: scaffold Express + TypeScript + Prisma en `backend/` — servidor dev funcionando en puerto 4000.
- Frontend: Next.js (app router) en `frontend/` — UI intacta; rutas API internas convertidas a proxies que llaman al backend (`NEXT_PUBLIC_BACKEND_URL`).
- Autenticación: endpoints mínimos `POST /auth/register` y `POST /auth/login` implementados (bcrypt + JWT). NextAuth CredentialsProvider actualizado para usar `/auth/login` y propagar `backendToken` en la sesión.
- Reservas: endpoint `POST /reservations` usa Prisma y está protegido con middleware JWT; se mejoró la atomización usando transacciones en la creación (prevención básica de sobre-reservas).
- Pagos: endpoint básico creado que registra pagos y marca reservas como `PAID` (implementación de gateway pendiente).

Estado detallado por módulo

- [x] 1. Configuración inicial y base de datos
    - `backend/prisma/schema.prisma` copiado y adaptado; `npx prisma generate` ejecutado (Prisma Client generado en `backend/node_modules/@prisma/client`).
    - Nota: antes de correr migraciones asegúrate de fijar `DATABASE_URL` en el entorno del `backend`.

- [x] 2. Autenticación básica
    - Implementado: `backend/src/routes/auth.ts` con `POST /auth/register` y `POST /auth/login` (hash con bcrypt y JWT con `JWT_SECRET`).
    - Implementado: middleware `backend/src/middleware/auth.ts` que valida `Authorization: Bearer <token>` y atacha `req.userId`.
    - Frontend: `frontend/src/lib/auth.ts` (NextAuth) cambia authorize() para llamar al backend y conservar `backendToken` en el JWT/session.
    - Extendido: el middleware ahora atacha `role` y hay helper `requireRole(...)` para proteger endpoints por rol.
    - Refresh tokens: se añadió modelo `RefreshToken` en Prisma, `/auth/refresh` y `/auth/logout` en backend, y el backend envía refresh token en cookie httpOnly; NextAuth intenta refresh automáticamente.

- [x] 3. Gestión de usuarios / perfiles (parcial)
    - Implementado: `GET /users/profile` y `PUT /users/profile` en `backend/src/routes/users.ts`, protegidos por middleware JWT.
    - Pendiente: validaciones con Zod y tests de endpoints.
    - Extendido: endpoints admin `GET /users` y `GET /users/:id` añadidos (protegidos por rol ADMIN).

- [x] 4. Gestión de clases y escuelas (parcial)
    - `backend/src/routes/classes.ts` implementa list/create (CRUD básico); validar aún permisos/propietario.
    - Extendido: `backend/src/routes/schools.ts` añadido con endpoints `GET /schools`, `GET /schools/:id`, `POST /schools`, `PUT /schools/:id`.
    - Frontend: añadidos paneles admin para `overview`, `schools`, `users` y `school profile` (vistas mínimas en `frontend/src/app/dashboard/...`).

- [x] 5. Sistema de reservas (parcial)
    - `backend/src/routes/reservations.ts` con POST/GET. POST usa una transacción para comprobar capacidad y crear reserva.
    - Pendiente: filtros por fecha, límites por usuario, tests de concurrencia.

- [x] 6. Pagos (básico)
    - `backend/src/routes/payments.ts` registra pago y actualiza reserva a `PAID` (stub).
    - Pendiente: integración con Stripe, webhooks y verificación idempotente.

- [x] 7. Harden auth (roles & refresh tokens)
    - Implementado: role checks middleware (`requireRole`) y refresh token flow (DB-stored, rotated, cookie-based). Backend sets httpOnly refresh cookie and exposes `/auth/refresh` and `/auth/logout`.
    - Frontend: NextAuth updated to store `backendToken` and attempt refresh via `/api/auth/refresh` when needed. Header links and admin pages use role to display admin nav.
    - Nota: refresh tokens are stored hashed in DB; before production change cookie secure flag and tighten scope.

- [ ] 7. Frontend auth components (done wiring)
    - `frontend/src/app/(auth)/login/page.tsx` y `.../register/page.tsx` están presentes y la ruta de register/login fue cambiada para usar el backend (proxy). Ver `frontend/.env.local` para `NEXT_PUBLIC_BACKEND_URL`.

- [ ] 8. Interfaz de gestión de perfil
    - UI existente en `frontend/src/app/dashboard/student/profile/page.tsx` ahora incluye envío de `Authorization: Bearer <backendToken>` en fetches; falta añadir validaciones y mejorar UX.

- [ ] 9. Calendar, booking UI y demás (pendiente)
    - Componentes `BookingModal`, `QuickBookingEngine`, `ClassCard` existen. Faltan filtros avanzados, calendario y wiring final para pagos.

Navbar updates
- `frontend/src/components/layout/Header.tsx` actualizado para incluir enlaces: `Mi Perfil` (a `/dashboard/student/profile`), `Escuelas` (a `/dashboard/admin/schools`) y un enlace `Admin` visible sólo si `session.user.role === 'ADMIN'`.

Cómo ejecutar (desarrollo local - PowerShell)

1) Backend — instalar, generar Prisma Client y correr migraciones (asegúrate de definir `DATABASE_URL` y `JWT_SECRET` en el entorno o en `backend/.env`):

```powershell
cd C:\Users\yerct\clasedesurf.com\backend
npm install
# Ajusta la variable DATABASE_URL antes de correr migraciones. Ejemplo (local Postgres):
$env:DATABASE_URL = 'postgres://postgres:password@localhost:5432/clasedesurf'
$env:JWT_SECRET = 'dev-secret-change-me'
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Salida esperada: "Backend listening on port 4000" y logs de rutas montadas.

2) Frontend — configurar `NEXT_PUBLIC_BACKEND_URL` y lanzar dev server:

```powershell
cd C:\Users\yerct\clasedesurf.com\frontend
# En frontend/.env.local asegúrate: NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
npm install
npm run dev
```

Salida esperada: Next.js corriendo en http://localhost:3000 y las rutas `/api/*` del frontend actuando como proxys hacia el backend.

Pruebas rápidas (smoke tests)

- Registrar un usuario (desde la UI o con curl): POST a `http://localhost:3000/api/auth/register` (frontend proxy) y confirmar respuesta 201.
- Login: desde la UI de login (NextAuth Credentials) o POST directo a `http://localhost:4000/auth/login` y comprobar que la respuesta contiene `{ user, token }`.
- Acceder al perfil: una vez logueado, abrir `/dashboard/student/profile` y confirmar que el fetch al backend a `GET /users/profile` devuelve datos (Authorization header debe contener `backendToken` desde la sesión NextAuth).

Cambios de código importantes (ubicaciones)

- Frontend changes:
    - `frontend/src/app/api/auth/register/route.ts` — ahora hace POST al backend `${NEXT_PUBLIC_BACKEND_URL}/auth/register` en lugar de usar Prisma localmente.
    - `frontend/src/lib/auth.ts` — NextAuth CredentialsProvider cambia authorize() para POST `/auth/login` al backend y guarda `backendToken` en token/session.
    - `frontend/src/app/dashboard/student/profile/page.tsx` — incluye Authorization header en fetches con `session.backendToken`.
    - `frontend/.env.local` — deberías tener `NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"`.

- Backend changes:
    - `backend/src/routes/auth.ts` — register/login; usa bcryptjs y jsonwebtoken.
    - `backend/src/middleware/auth.ts` — `requireAuth` valida Bearer token y atacha `req.userId`.
    - `backend/src/routes/users.ts`, `reservations.ts`, `payments.ts`, `classes.ts` — ahora usan `requireAuth` donde aplica.
    - `backend/prisma/schema.prisma` — modelo y enums copiados/adaptados desde el frontend-schema.

Requerimientos y cobertura actual (resumen)
- Implementado: autenticación básica, persistencia con Prisma, endpoints CRUD básicos para usuarios, clases, reservas y pagos (estado básico).
- Parcial: validaciones robustas, tests automatizados, integración de pagos y hardening de seguridad (roles, refresh tokens, rate limits).

Prioridades siguientes (recomendado)
1. (Alta) Harden auth: añadir refresh tokens, rol-based middleware y tests de autorización.
2. (Alta) Integrar Stripe (o gateway elegido) con endpoints webhook seguros e idempotentes.
3. (Med) Añadir tests de integración (Jest/Vitest) y una GitHub Actions básica para lint/tests.
4. (Med) Implementar filtros/calendario de clases y mejorar UX de booking.

Notas finales y acuerdos
- El diseño actual mueve todo acceso a base de datos al backend en `backend/`; el frontend actúa como UI + proxy. Esto evita que Prisma se ejecute en el proceso Next.js.
- Antes de desplegar, fija valores seguros en `DATABASE_URL` y `JWT_SECRET`. Cambia `JWT_SECRET` por una variable fuerte y considera refresh tokens y rotación.
- Si quieres, continúo ahora con cualquiera de las prioridades: (A) refresh tokens + role checks, (B) Stripe + webhooks, (C) tests + CI. Indica la opción o pido seguir con la opción por defecto: (A).

---
Última actualización: 2025-09-23 — Documentado por el equipo de desarrollo (ediciones automáticas desde el agente). 