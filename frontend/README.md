# Frontend - SurfSchool Platform

Aplicación web moderna construida con **Next.js 14 (App Router)**, **TypeScript** y **Tailwind CSS**.

## 🎨 Características de UI/UX

- **Diseño Responsive**: Optimizado para móviles, tablets y escritorio.
- **Componentes Modernos**: Uso de `lucide-react` para iconografía consistente.
- **Gestión de Estado**: React Hooks y Context API para manejo de sesión y notificaciones.
- **Feedback Visual**: Toasts, modales de confirmación y estados de carga (skeletons).

## 🛠 Stack Tecnológico

- **Framework**: Next.js 14
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Autenticación**: NextAuth.js (v4)
- **Fechas**: date-fns (o nativo JS)

## 📂 Estructura del Proyecto

```
src/
├── app/                    # Rutas (App Router)
│   ├── (auth)/            # Login, Registro
│   ├── dashboard/         # Paneles protegidos
│   │   ├── admin/         # Super Admin
│   │   ├── school/        # Admin de Escuela
│   │   └── student/       # Estudiante
│   └── ...
├── components/            # Componentes Reutilizables
│   ├── ui/               # Botones, Cards, Inputs
│   └── ...
├── contexts/              # Context Providers (Toast, Auth)
├── services/              # Cliente HTTP para API Backend
└── types/                 # Definiciones de TypeScript
```

## 🚀 Funcionalidades Clave Implementadas

### 1. Gestión de Reservas (Escuela)
- **Vista de Tarjetas**: Visualización rápida de capacidad, ingresos y estados.
- **Filtros Avanzados**: Búsqueda por nombre, email, teléfono y estados de pago.
- **Acciones Rápidas**: Confirmar, Cancelar o Registrar Pago desde el listado.

### 2. Gestión de Clases
- **CRUD Completo**: Crear, editar, ver detalle.
- **Papelera de Reciclaje**: Nueva interfaz para ver y restaurar clases eliminadas.
- **Duplicación**: Funcionalidad para copiar clases exitosas.

### 3. Experiencia Estudiante
- **Catálogo de Clases**: Exploración visual de horarios.
- **Perfil Completo**: Gestión de datos personales y médicos.

## 💻 Desarrollo

### Instalación
```bash
npm install
```

### Ejecutar Localmente
```bash
npm run dev
```
La aplicación correrá en `http://localhost:3000`.

### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_aqui
```