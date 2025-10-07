# Sistema CRUD Estandarizado - Plataforma de Surf

## 🎯 Resumen

Se ha implementado un sistema completo y estandarizado para operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en toda la plataforma, con componentes reutilizables y una arquitectura consistente.

## 🔧 Cambios Realizados

### 1. **Base de Datos - Asociación Usuario-Escuela**

#### Cambios en el Schema de Prisma
```prisma
model School {
  // ... campos existentes
  ownerId     Int?         // Nuevo campo: Owner de la escuela (SCHOOL_ADMIN)
  // ...
}
```

#### Migración SQL
Archivo: `backend/prisma/migrations/add_school_owner.sql`

**IMPORTANTE: Ejecutar esta migración antes de usar el sistema:**

```bash
# Opción 1: Aplicar migración manualmente
psql -h <host> -U <usuario> -d <database> -f backend/prisma/migrations/add_school_owner.sql

# Opción 2: Regenerar cliente Prisma
cd backend
npx prisma generate
npx prisma db push
```

### 2. **Backend - Endpoints Mejorados**

#### `/schools/my-school` (GET)
- Ahora usa `ownerId` para encontrar la escuela del usuario
- Incluye clases e instructores relacionados
- Manejo robusto de errores

#### `/schools` (POST)
- Asigna automáticamente `ownerId` al crear escuela
- Valida que el usuario no tenga ya una escuela
- Previene duplicados

### 3. **Frontend - Componentes Reutilizables**

#### Componentes UI Base

**`Modal.tsx`**
- Modal genérico y reutilizable
- Soporte para diferentes tamaños (sm, md, lg, xl)
- Cierre con ESC y click fuera
- Prevención de scroll del body

**`ConfirmDialog.tsx`**
- Diálogo de confirmación estandarizado
- Variantes: danger, warning, info
- Estados de carga
- Personalizable

**`DataTable.tsx`**
- Tabla de datos genérica
- Columnas configurables con renderizado custom
- Acciones de editar/eliminar integradas
- Estados de carga y vacío
- Responsive

#### Formularios

**`SchoolForm.tsx`**
- Formulario completo para escuelas
- Validación en tiempo real
- Manejo de errores por campo
- Modo crear/editar

**`ClassForm.tsx`**
- Formulario completo para clases
- Validación de fechas y números
- Selector de nivel
- Campos de duración y capacidad

### 4. **Hooks Personalizados**

#### `useCrudOperations.ts`
Hook centralizado para todas las operaciones CRUD:

```typescript
const {
  isModalOpen,
  isDeleteDialogOpen,
  selectedItem,
  itemToDelete,
  isLoading,
  handleSubmit,
  openCreateModal,
  openEditModal,
  closeModal,
  openDeleteDialog,
  closeDeleteDialog,
  confirmDelete
} = useCrudOperations<T>({
  endpoint: '/api/resource',
  onSuccess: (action, data) => { /* ... */ },
  onError: (error) => { /* ... */ }
});
```

**Características:**
- Manejo automático de modales
- Estados de carga
- Callbacks de éxito/error
- Operaciones create, update, delete
- Type-safe con TypeScript

#### `useApiCall.ts` (Existente - Mejorado)
- Refresh automático de tokens
- Manejo de errores HTTP
- Redirección en 401/403
- Credenciales incluidas

### 5. **Páginas Implementadas**

#### `/dashboard/school/classes/page.tsx`
Página completa de gestión de clases con:
- Listado en tabla
- Crear nueva clase
- Editar clase existente
- Eliminar clase con confirmación
- Filtrado por escuela
- Estados de carga

## 📋 Estructura de Archivos

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── Modal.tsx                    ✅ Nuevo
│   │   └── ConfirmDialog.tsx            ✅ Nuevo
│   ├── forms/
│   │   ├── SchoolForm.tsx               ✅ Nuevo
│   │   └── ClassForm.tsx                ✅ Nuevo
│   └── tables/
│       └── DataTable.tsx                ✅ Nuevo
├── hooks/
│   ├── useCrudOperations.ts             ✅ Nuevo
│   └── useApiCall.ts                    ✅ Existente
├── app/
│   ├── api/
│   │   ├── classes/
│   │   │   ├── route.ts                 ✅ Actualizado
│   │   │   └── [id]/route.ts            ✅ Nuevo
│   │   └── schools/
│   │       ├── my-school/route.ts       ✅ Existente
│   │       └── [id]/route.ts            ✅ Nuevo
│   └── dashboard/
│       └── school/
│           └── classes/
│               └── page.tsx             ✅ Nuevo
└── types/
    └── index.ts                         ✅ Actualizado

backend/src/
├── routes/
│   └── schools.ts                       ✅ Actualizado
└── prisma/
    ├── schema.prisma                    ✅ Actualizado
    └── migrations/
        └── add_school_owner.sql         ✅ Nuevo
```

## 🚀 Cómo Usar el Sistema

### Para Crear una Nueva Entidad CRUD

1. **Crear el formulario** (ej: `UserForm.tsx`):
```typescript
export default function UserForm({ user, onSubmit, onCancel, isLoading }) {
  // Implementar campos y validación
  return <form>...</form>
}
```

2. **Definir columnas de tabla**:
```typescript
const columns: Column<User>[] = [
  { key: 'name', label: 'Nombre' },
  { 
    key: 'email', 
    label: 'Email',
    render: (item) => <a href={`mailto:${item.email}`}>{item.email}</a>
  }
];
```

3. **Usar el hook en la página**:
```typescript
const {
  isModalOpen,
  isDeleteDialogOpen,
  selectedItem,
  itemToDelete,
  isLoading,
  handleSubmit,
  openCreateModal,
  openEditModal,
  closeModal,
  openDeleteDialog,
  closeDeleteDialog,
  confirmDelete
} = useCrudOperations<User>({
  endpoint: '/api/users',
  onSuccess: (action) => {
    fetchUsers();
    alert(`Usuario ${action === 'create' ? 'creado' : action === 'update' ? 'actualizado' : 'eliminado'}`);
  },
  onError: (error) => alert(`Error: ${error}`)
});
```

4. **Renderizar componentes**:
```typescript
return (
  <>
    <DataTable
      data={users}
      columns={columns}
      onEdit={openEditModal}
      onDelete={(item) => openDeleteDialog(item.id, item.name)}
    />
    
    <Modal isOpen={isModalOpen} onClose={closeModal} title="Usuario">
      <UserForm
        user={selectedItem}
        onSubmit={handleSubmit}
        onCancel={closeModal}
        isLoading={isLoading}
      />
    </Modal>
    
    <ConfirmDialog
      isOpen={isDeleteDialogOpen}
      onClose={closeDeleteDialog}
      onConfirm={confirmDelete}
      title="Eliminar Usuario"
      message={`¿Eliminar a ${itemToDelete?.name}?`}
      isLoading={isLoading}
    />
  </>
);
```

## ✅ Próximos Pasos

### Entidades Pendientes de Implementar:

1. **Usuarios** (`/dashboard/admin/users`)
   - Formulario: `UserForm.tsx`
   - Página: `/dashboard/admin/users/page.tsx`
   - Campos: name, email, role, phone, etc.

2. **Reservaciones** (`/dashboard/school/reservations`)
   - Formulario: `ReservationForm.tsx`
   - Página: `/dashboard/school/reservations/page.tsx`
   - Campos: user, class, status, specialRequest

3. **Pagos** (`/dashboard/school/payments`)
   - Formulario: `PaymentForm.tsx`
   - Página: `/dashboard/school/payments/page.tsx`
   - Campos: amount, status, paymentMethod, voucherImage

4. **Instructores** (`/dashboard/school/instructors`)
   - Formulario: `InstructorForm.tsx`
   - Página: `/dashboard/school/instructors/page.tsx`
   - Campos: user, bio, specialties, certifications

5. **Perfil de Escuela** (`/dashboard/school/profile`)
   - Usar `SchoolForm.tsx` existente
   - Modo edición únicamente
   - Incluir upload de logo/cover

## 🔒 Seguridad

- Todos los endpoints requieren autenticación
- Validación de roles en backend
- Tokens JWT con refresh automático
- Validación de datos en frontend y backend
- Prevención de inyección SQL con Prisma

## 📱 Responsive

- Todos los componentes son responsive
- Tablas con scroll horizontal en móviles
- Modales adaptables
- Formularios en grid responsive

## 🎨 Consistencia UI

- Colores estandarizados:
  - Primario: Blue-600
  - Peligro: Red-600
  - Éxito: Green-600
  - Advertencia: Yellow-600
- Espaciado consistente (Tailwind)
- Transiciones suaves
- Estados de hover/focus claros

## 🐛 Debugging

Si encuentras errores:

1. **Error 500 en `/api/schools/my-school`**:
   - Verificar que la migración SQL se aplicó
   - Revisar logs del backend
   - Confirmar que el usuario tiene rol SCHOOL_ADMIN

2. **Modal no cierra**:
   - Verificar que `isLoading` es false
   - Revisar que `onClose` está conectado

3. **Formulario no envía**:
   - Abrir DevTools y revisar errores de validación
   - Verificar que todos los campos requeridos están llenos

## 📚 Documentación Adicional

- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/docs)
