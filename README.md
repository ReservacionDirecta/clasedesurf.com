# SurfSchool Booking Platform - Marketplace de Surf en Lima

Este es el repositorio principal para la plataforma de marketplace de escuelas de surf en Lima, Perú. El proyecto está dividido en un frontend de Next.js y un backend de Express.

## Estado Actual

La aplicación se encuentra en una fase de desarrollo activa. Las funcionalidades implementadas incluyen:

- **Marketplace de Surf:** Una página de inicio que muestra una lista de clases de surf, con la capacidad de filtrar y ordenar.
- **Perfiles de Usuario:**
    - **Perfil de Estudiante:** Los estudiantes pueden ver su información personal, el progreso de su nivel y las clases a las que han asistido.
    - **Perfil de Escuela:** Las escuelas pueden ver su información, las clases que ofrecen, los instructores que trabajan para ellas y los estudiantes inscritos en sus clases.
    - **Perfil de Instructor:** Los instructores pueden ver su información personal y las clases que tienen asignadas.
- **Autenticación:** Sistema de registro e inicio de sesión para usuarios con roles de estudiante, instructor, administrador de escuela y administrador de la plataforma.
- **Modo Oscuro:** La aplicación cuenta con un modo oscuro completamente funcional en todas sus páginas y componentes.

## Estructura del Proyecto

El proyecto está organizado en dos directorios principales:

- `frontend/`: Contiene la aplicación de Next.js.
- `backend/`: Contiene la API de Express.

Cada directorio tiene su propio `README.md` con información más detallada sobre su estructura y configuración.

## Tecnologías Utilizadas

### Frontend
- **Framework:** Next.js 14 con App Router
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Autenticación:** NextAuth.js
- **Validación:** Zod

### Backend
- **Framework:** Express
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma

## Cómo Empezar

Para ejecutar el proyecto completo, necesitarás tener dos terminales abiertas, una para el frontend y otra para el backend.

### 1. Configuración del Backend

1.  **Navega al directorio del backend:**
    ```bash
    cd backend
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Configura las variables de entorno:**
    Crea un archivo `.env` en el directorio `backend` y añade la siguiente variable:
    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/surf-school"
    ```
    Asegúrate de que la cadena de conexión a tu base de datos PostgreSQL sea correcta.
4.  **Configura y puebla la base de datos:**
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    npm run db:seed
    ```
5.  **Ejecuta el servidor de desarrollo del backend:**
    ```bash
    npm run dev
    ```
    El backend se ejecutará en `http://localhost:4000`.

### 2. Configuración del Frontend

1.  **Abre una nueva terminal y navega al directorio del frontend:**
    ```bash
    cd frontend
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Configura las variables de entorno:**
    Crea un archivo `.env.local` en el directorio `frontend` y añade las siguientes variables:
    ```
    NEXTAUTH_SECRET="tu-secreto-aqui"
    NEXTAUTH_URL="http://localhost:3000"
    ```
4.  **Ejecuta el servidor de desarrollo del frontend:**
    ```bash
    npm run dev
    ```
    El frontend se ejecutará en `http://localhost:3000`.

Una vez que ambos servidores estén en funcionamiento, puedes abrir tu navegador y visitar `http://localhost:3000` para ver la aplicación en acción.