# Plan de Implementación - Plataforma de Reservas SurfSchool

## Estado Actual del Proyecto

### Backend (Express + TypeScript + Prisma)
- ✅ Servidor Express funcionando en puerto 4000
- ✅ Prisma ORM configurado con PostgreSQL
- ✅ Autenticación JWT con refresh tokens
- ✅ Middleware de autorización por roles
- ✅ Endpoints REST para usuarios, clases, escuelas, reservas y pagos

### Frontend (Next.js 14 + App Router)
- ✅ Next.js con App Router configurado
- ✅ NextAuth integrado con backend
- ✅ Componentes UI base (Button, Input, LoadingSpinner, etc.)
- ✅ Componentes de clases (ClassCard, BookingModal)
- ✅ Página de perfil de estudiante funcional
- ✅ Páginas admin básicas (overview, schools, users)

### Infraestructura
- ✅ Prisma schema completo con todos los modelos
- ✅ Refresh tokens con rotación automática
- ✅ CORS y cookies configurados
- ✅ Variables de entorno configuradas

---

## Tareas Pendientes

### Fase 1: Validación y Seguridad

- [x] 1. Implementar validación con Zod en backend





  - [x] 1.1 Crear esquemas de validación Zod para todos los endpoints


    - Crear `backend/src/validations/auth.ts` con esquemas para register/login
    - Crear `backend/src/validations/users.ts` con esquemas para perfil
    - Crear `backend/src/validations/classes.ts` con esquemas para clases
    - Crear `backend/src/validations/reservations.ts` con esquemas para reservas
    - Crear `backend/src/validations/schools.ts` con esquemas para escuelas
    - _Requerimientos: 10.1, 10.5_
  
  - [x] 1.2 Integrar validación Zod en rutas de autenticación


    - Aplicar validación en `POST /auth/register` y `POST /auth/login`
    - Retornar errores de validación claros y específicos
    - _Requerimientos: 1.2, 10.1_
  
  - [x] 1.3 Integrar validación Zod en rutas de usuarios


    - Aplicar validación en `PUT /users/profile`
    - Validar rangos de edad, peso, altura según requerimientos
    - _Requerimientos: 2.2, 10.1_
  
  - [x] 1.4 Integrar validación Zod en rutas de clases y reservas


    - Aplicar validación en `POST /classes` y `POST /reservations`
    - Validar fechas futuras, capacidad positiva, etc.
    - _Requerimientos: 8.3, 4.4, 10.1_

- [x] 2. Mejorar seguridad de cookies y tokens





  - [x] 2.1 Configurar cookies seguras para producción


    - Actualizar `setRefreshCookie` para usar `secure: true` en producción
    - Configurar `sameSite: 'strict'` para mayor seguridad
    - _Requerimientos: 10.4_
  

  - [x] 2.2 Implementar rate limiting en endpoints críticos

    - Instalar y configurar `express-rate-limit`
    - Aplicar rate limiting a `/auth/login`, `/auth/register`
    - _Requerimientos: 10.1_

### Fase 2: Funcionalidad de Clases y Calendario

- [x] 3. Implementar página de listado de clases funcional



  - [x] 3.1 Crear componente ClassList con fetching de datos



    - Implementar `frontend/src/app/classes/page.tsx` para mostrar clases disponibles
    - Usar componente `ClassCard` existente para cada clase
    - Mostrar loading states y manejo de errores
    - _Requerimientos: 3.1, 3.4_
  
  - [x] 3.2 Implementar filtros de clases


    - Crear componente de filtros por fecha, nivel, tipo
    - Integrar con endpoint `GET /classes` con query params
    - Actualizar backend para soportar filtros en `GET /classes`
    - _Requerimientos: 3.2_
  
  - [x] 3.3 Calcular y mostrar plazas disponibles


    - Modificar endpoint `GET /classes` para incluir `availableSpots`
    - Calcular spots = capacity - reservas activas (no canceladas)
    - Mostrar disponibilidad en ClassCard
    - _Requerimientos: 3.3, 3.4_

- [ ] 4. Implementar flujo completo de reservas



  - [ ] 4.1 Conectar BookingModal con backend
    - Implementar submit handler que llame a `POST /reservations`
    - Incluir token de autenticación en la petición
    - Manejar respuestas de éxito y error
    - _Requerimientos: 4.1, 4.2, 4.3_
  
  - [ ] 4.2 Crear página de confirmación de reserva
    - Mostrar detalles de la reserva creada
    - Mostrar instrucciones de pago
    - Incluir botón para ir a "Mis Reservas"
    - _Requerimientos: 4.5_
  
  - [x] 4.3 Implementar página "Mis Reservas" funcional
    - ✅ Implementado `frontend/src/app/reservations/page.tsx`
    - ✅ Fetch reservas del usuario desde `GET /reservations`
    - ✅ Mostrar estado de cada reserva (pending, paid, canceled)
    - ✅ Permitir ver detalles de cada reserva
    - ⚠️ Botón "Cancelar Reserva" no está conectado al backend
    - _Requerimientos: 6.1, 6.2, 6.4, 6.5_

### Fase 3: Sistema de Pagos

**⚠️ NOTA:** Sistema de pagos manual implementado en `backend/src/routes/payments.ts` con endpoints funcionales. Falta decidir si se integra Stripe o se mantiene sistema manual.

- [ ] 5. Integrar Stripe para pagos (o completar sistema manual)
  
  **Estado Actual:** Sistema manual de pagos implementado:
  - ✅ `POST /payments` - Crear registro de pago
  - ✅ `GET /payments` - Listar pagos (multi-tenant)
  - ✅ `PUT /payments/:id` - Actualizar estado de pago
  - ✅ Actualización automática de estado de reserva cuando pago es PAID
  - ❌ Falta UI en frontend para gestionar pagos
  - ❌ Falta integración con Stripe (si se decide usar)
  
  - [ ] 5.1 Configurar Stripe en backend (SOLO si se decide usar Stripe)
    - Instalar `stripe` package en backend
    - Configurar API keys en variables de entorno
    - Crear `backend/src/services/stripe.ts` con cliente Stripe
    - _Requerimientos: 5.1_
  
  - [ ] 5.2 Implementar creación de Payment Intent
    - Crear endpoint `POST /payments/create-intent`
    - Generar Payment Intent con monto de la reserva
    - Retornar client_secret al frontend
    - _Requerimientos: 5.2_
  
  - [ ] 5.3 Implementar webhook de Stripe
    - Crear endpoint `POST /payments/webhook`
    - Verificar firma del webhook
    - Actualizar estado de reserva cuando pago es exitoso
    - Implementar idempotencia con `transactionId`
    - _Requerimientos: 5.3, 5.4_
  
  - [ ] 5.4 Crear UI de pago en frontend
    - Instalar `@stripe/stripe-js` y `@stripe/react-stripe-js`
    - Crear componente de formulario de pago
    - Integrar con Payment Intent del backend
    - Mostrar confirmación de pago exitoso
    - _Requerimientos: 5.2, 5.3_

### Fase 4: Dashboard Administrativo

- [ ] 6. Mejorar dashboard administrativo
  - [ ] 6.1 Implementar calendario de reservas para admin
    - Crear componente de calendario en `frontend/src/components/dashboard/`
    - Mostrar todas las reservas con colores por estado
    - Permitir filtrar por fecha y escuela
    - _Requerimientos: 7.1, 7.2_
  
  - [x] 6.2 Implementar gestión de reservas para admin
    - ✅ Vista de detalle de reserva implementada en múltiples dashboards
    - ⚠️ Confirmar pagos manualmente (backend existe, falta UI)
    - ⚠️ Cancelar reservas (endpoint falta o no está conectado)
    - ✅ Actualización de estados en backend
    - _Requerimientos: 7.3, 7.4, 7.5_
  
  - [x] 6.3 Implementar gestión de clases para admin
    - ✅ Formulario para crear nuevas clases implementado
    - ✅ Formulario para editar clases existentes implementado
    - ✅ Validaciones implementadas
    - _Requerimientos: 8.2, 8.4, 8.5_
  
  - [x] 6.4 Implementar gestión de escuelas para admin
    - ✅ Página `frontend/src/app/dashboard/admin/schools/page.tsx` implementada
    - ✅ Formulario para crear/editar escuelas implementado
    - ✅ Lista de escuelas con información básica
    - _Requerimientos: 8.1_

### Fase 5: Reportes y Estadísticas

- [ ] 7. Implementar sistema de reportes
  
  **Estado Actual:** Endpoint básico de stats implementado en `backend/src/routes/stats.ts`
  
  - [x] 7.1 Crear endpoint de estadísticas generales
    - ✅ Endpoint `GET /stats` implementado (verificar ruta exacta)
    - ✅ Calcula ingresos totales, reservas por estado
    - ⚠️ Falta exportación y visualizaciones avanzadas
    - _Requerimientos: 9.2, 9.3_
  
  - [ ] 7.2 Crear endpoint de reportes con filtros
    - Crear `GET /admin/reports` con filtros por fecha
    - Permitir filtrar por escuela, clase, estado
    - _Requerimientos: 9.1_
  
  - [ ] 7.3 Implementar exportación de reportes a CSV
    - Crear función para convertir datos a formato CSV
    - Crear endpoint `GET /admin/reports/export`
    - Implementar descarga en frontend
    - _Requerimientos: 9.4_
  
  - [ ] 7.4 Crear visualizaciones de estadísticas
    - Instalar librería de gráficos (recharts o similar)
    - Crear componentes de gráficos para dashboard
    - Mostrar tendencias de reservas y pagos
    - _Requerimientos: 9.5_

### Fase 6: Testing

- [ ] 8. Implementar tests automatizados
  - [ ] 8.1 Configurar Jest para backend
    - Instalar Jest y dependencias de testing
    - Configurar `jest.config.js` para TypeScript
    - Crear setup para tests con base de datos de prueba
    - _Requerimientos: Testing Strategy_
  
  - [ ] 8.2 Escribir tests de integración para autenticación
    - Test de registro de usuario exitoso
    - Test de login con credenciales válidas/inválidas
    - Test de refresh token flow
    - Test de autorización por roles
    - _Requerimientos: 1.2, 1.3, 1.4, 10.2_
  
  - [ ] 8.3 Escribir tests de integración para reservas
    - Test de creación de reserva exitosa
    - Test de prevención de sobre-reservas
    - Test de validación de capacidad
    - Test de cancelación de reserva
    - _Requerimientos: 4.3, 4.4_
  
  - [ ] 8.4 Escribir tests de integración para pagos
    - Test de creación de pago
    - Test de actualización de estado de reserva
    - Test de webhook de Stripe (mock)
    - _Requerimientos: 5.3, 5.4_
  
  - [ ] 8.5 Configurar CI con GitHub Actions
    - Crear workflow `.github/workflows/test.yml`
    - Ejecutar linting y tests en cada PR
    - Configurar base de datos de prueba en CI
    - _Requerimientos: Testing Strategy_

### Fase 7: Mejoras de UX y Pulido

- [ ] 9. Mejorar experiencia de usuario
  - [ ] 9.1 Implementar notificaciones toast
    - Instalar librería de notificaciones (react-hot-toast o similar)
    - Mostrar notificaciones en acciones exitosas/fallidas
    - _Requerimientos: UX general_
  
  - [ ] 9.2 Mejorar estados de carga
    - Añadir skeletons en lugar de spinners simples
    - Implementar loading states consistentes
    - _Requerimientos: UX general_
  
  - [ ] 9.3 Implementar manejo de errores consistente
    - Crear componente de error boundary
    - Mostrar mensajes de error amigables
    - Implementar retry automático donde aplique
    - _Requerimientos: 10.5_
  
  - [ ] 9.4 Mejorar responsive design
    - Verificar que todas las páginas funcionen en móvil
    - Ajustar BookingModal para móvil
    - Optimizar tablas de admin para pantallas pequeñas
    - _Requerimientos: UX general_

---

## Cómo Ejecutar (Desarrollo Local)

### Backend
```powershell
cd backend
npm install
$env:DATABASE_URL = 'postgresql://user:password@localhost:5432/clasedesurf'
$env:JWT_SECRET = 'dev-secret-change-me'
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Frontend
```powershell
cd frontend
npm install
# Asegurar que .env.local tenga: NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
npm run dev
```

---

## Notas Importantes

- Todas las tareas están organizadas por prioridad y dependencias
- Cada tarea referencia los requerimientos específicos del documento de requerimientos
- Las fases 1-3 son críticas para funcionalidad básica
- Las fases 4-7 añaden funcionalidad administrativa y pulido
- Antes de producción, revisar seguridad de cookies y tokens (Fase 1)

---

Última actualización: 2025-01-10

---

## 📝 Notas de Revisión

**Revisión realizada:** 2025-01-10

### Estado Real vs Documentado
- El proyecto está más avanzado de lo que refleja este documento
- Sistema de pagos manual implementado (no documentado originalmente)
- Dashboards administrativos más completos de lo esperado
- Falta integración completa entre algunos componentes UI y backend

### Ver documento de revisión completa: `REVISION_TAREAS.md` 