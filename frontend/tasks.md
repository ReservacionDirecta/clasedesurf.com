# Proyecto: SurfSchool Booking Platform - Lista de Tareas Completa

## Fase 1: MVP - Plataforma de Reservas para una Sola Escuela

### Módulo 1: Configuración y Arquitectura del Proyecto
- [x] **Tarea 1.1:** Configurar el entorno de desarrollo con Next.js, TypeScript, and Tailwind CSS.
- [x] **Tarea 1.2:** Estructurar el proyecto: carpetas para componentes, Vistas, servicios, y tipos.
- [x] **Tarea 1.3:** Implementar Prisma ORM y conectar con la base de datos (PostgreSQL).
- [x] **Tarea 1.4:** Definir el esquema inicial de la base de datos en `schema.prisma`.
- [x] **Tarea 1.5:** Configurar NextAuth.js para autenticación (Credentials y OAuth con Google/Facebook).
- [x] **Tarea 1.6:** Configurar ESLint, Prettier y Husky para calidad de código y git hooks.

### Módulo 2: Autenticación y Perfil de Usuario
- [x] **Tarea 2.1:** Crear Vistas de Registro e Inicio de Sesión.
- [x] **Tarea 2.2:** Implementar la lógica de registro de nuevos usuarios (API y Frontend).
- [ ] **Tarea 2.3:** Implementar la lógica de autenticación (API y Frontend).
- [ ] **Tarea 2.4:** Proteger rutas y componentes basado en la sesión del usuario.
- [ ] **Tarea 2.5:** Crear la Vista de Perfil de Usuario para ver y actualizar información personal (edad, peso, talla, lesiones, etc.).
- [ ] **Tarea 2.6:** Implementar la lógica para actualizar el perfil de usuario (API y Frontend).

### Módulo 3: Gestión de Clases (Admin)
- [ ] **Tarea 3.1:** Crear un Dashboard de Administrador (Vista inicial).
- [ ] **Tarea 3.2:** Implementar la funcionalidad para CREAR nuevas clases (nombre, descripción, nivel, horario, cupos, precio).
- [ ] **Tarea 3.3:** Implementar la funcionalidad para LEER (listar) todas las clases.
- [ ] **Tarea 3.4:** Implementar la funcionalidad para ACTUALIZAR la información de una clase.
- [ ] **Tarea 3.5:** Implementar la funcionalidad para ELIMINAR una clase.

### Módulo 4: Visualización y Reserva de Clases (Estudiante)
- [ ] **Tarea 4.1:** Crear una Vista para listar todas las clases disponibles para los estudiantes.
- [ ] **Tarea 4.2:** Implementar filtros básicos (por nivel, por fecha).
- [ ] **Tarea 4.3:** Crear la Vista de detalle para cada clase.
- [ ] **Tarea 4.4:** Implementar el motor de reservas: lógica para crear una nueva reserva.
- [ ] **Tarea 4.5:** Integrar un modal o Vista de confirmación de reserva.
- [ ] **Tarea 4.6:** Implementar la lógica para que un estudiante vea "Mis Reservas".

### Módulo 5: Pagos y Notificaciones
- [ ] **Tarea 5.1:** Integrar una pasarela de pagos (ej. Stripe).
- [ ] **Tarea 5.2:** Asociar pagos a las reservas.
- [ ] **Tarea 5.3:** Configurar un servicio de envío de emails (ej. Resend, SendGrid).
- [ ] **Tarea 5.4:** Implementar notificaciones por email para confirmación de reserva y recordatorios.

## Fase 2: Transformación a Marketplace Multi-Escuela

### Módulo 6: Arquitectura Multi-Escuela
- [ ] **Tarea 6.1:** Actualizar el `schema.prisma` para incluir el modelo `School`.
- [ ] **Tarea 6.2:** Asociar Usuarios (instructores), Clases y Reservas a una `School`.
- [ ] **Tarea 6.3:** Crear roles de usuario más granulares (SuperAdmin, SchoolAdmin, Instructor, Student).

### Módulo 7: Portal de Escuelas (School Admin)
- [ ] **Tarea 7.1:** Crear un proceso de registro para nuevas escuelas.
- [ ] **Tarea 7.2:** Desarrollar un Dashboard para administradores de escuela.
- [ ] **Tarea 7.3:** Permitir a los `SchoolAdmin` gestionar su propio perfil de escuela, instructores, y clases.
- [ ] **Tarea 7.4:** Implementar un sistema de reportes de reservas y ganancias por escuela.

### Módulo 8: Marketplace Público
- [ ] **Tarea 8.1:** Rediseñar la landing page para reflejar el modelo de marketplace.
- [ ] **Tarea 8.2:** Implementar un motor de búsqueda y filtros avanzados (por ubicación, precio, calificación de escuela, etc.).
- [ ] **Tarea 8.3:** Crear perfiles públicos para cada escuela con su listado de clases, instructores y reseñas.
- [ ] **Tarea 8.4:** Implementar un sistema de reseñas y calificaciones para clases y escuelas.

## Fase 3: Características Avanzadas y Escalabilidad

### Módulo 9: Gestión de Equipamiento y Recursos
- [ ] **Tarea 9.1:** Actualizar el `schema.prisma` para incluir modelos de `Equipment` (tablas, trajes).
- [ ] **Tarea 9.2:** Implementar la lógica para alquilar equipamiento durante el proceso de reserva.
- [ ] **Tarea 9.3:** Desarrollar un sistema de inventario de equipamiento para administradores.

### Módulo 10: Dashboards y Analíticas
- [ ] **Tarea 10.1:** Crear un Dashboard de SuperAdmin para visualizar estadísticas globales del marketplace.
- [ ] **Tarea 10.2:** Generar reportes avanzados (ej. clases más populares, horas pico, ingresos por período).
- [ ] **Tarea 10.3:** Integrar una herramienta de analítica (ej. Vercel Analytics).

### Módulo 11: Optimización y Pruebas
- [ ] **Tarea 11.1:** Implementar Pruebas Unitarias y de Integración (con Jest y React Testing Library).
- [ ] **Tarea 11.2:** Implementar Pruebas End-to-End (con Cypress o Playwright).
- [ ] **Tarea 11.3:** Optimizar el rendimiento del frontend (imágenes, lazy loading, code splitting).
- [ ] **Tarea 11.4:** Optimizar las consultas a la base de datos y la lógica del backend.
- [ ] **Tarea 11.5:** Realizar una auditoría de seguridad y accesibilidad (WCAG).

### Módulo 12: Despliegue y Mantenimiento
- [ ] **Tarea 12.1:** Configurar un pipeline de Integración Continua y Despliegue Continuo (CI/CD) con GitHub Actions.
- [ ] **Tarea 12.2:** Desplegar la aplicación en Vercel o una plataforma similar.
- [ ] **Tarea 12.3:** Configurar monitoreo y sistema de alertas para la aplicación en producción.
