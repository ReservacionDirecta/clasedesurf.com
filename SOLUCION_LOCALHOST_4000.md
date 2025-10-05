# 🔧 Solución a Errores de localhost:4000

## 🚨 Problema Identificado
El frontend estaba haciendo llamadas directas a `localhost:4000` en lugar de usar las rutas API proxy, causando errores de conexión en producción.

## ✅ Soluciones Implementadas

### 1. **Archivos Corregidos**

#### **Dashboard de Escuela**
- **Archivo:** `frontend/src/app/dashboard/school/page.tsx`
- **Cambio:** Reemplazado llamadas directas por rutas proxy
- **Antes:** `fetch('${BACKEND}/classes')`
- **Después:** `fetch('/api/classes')`

#### **Dashboard de Clases**
- **Archivo:** `frontend/src/app/dashboard/school/classes/page.tsx`
- **Cambio:** Reemplazado llamadas directas por rutas proxy
- **Corrección:** Arreglado error de sintaxis con `}` extra

#### **Dashboard de Instructores**
- **Archivo:** `frontend/src/app/dashboard/school/instructors/page.tsx`
- **Cambio:** Reemplazado llamadas directas por rutas proxy
- **Nuevo:** Creada ruta API `/api/instructors`

### 2. **Nueva Ruta API Creada**
- **Archivo:** `frontend/src/app/api/instructors/route.ts`
- **Función:** Proxy para llamadas a instructores
- **Métodos:** GET, POST, PUT, DELETE

### 3. **Utilidad API Creada**
- **Archivo:** `frontend/src/lib/api.ts`
- **Función:** Centralizar llamadas API con autenticación automática
- **Beneficios:** Código más limpio y mantenible

## 🚀 Imágenes Docker Actualizadas

### **Backend**
```bash
docker build -t chambadigital/surfschool-backend:latest ./backend
docker push chambadigital/surfschool-backend:latest
```
- ✅ Acepta campo `role` en registro
- ✅ Validación actualizada con Zod

### **Frontend**
```bash
docker build -t chambadigital/surfschool-frontend:latest ./frontend
docker push chambadigital/surfschool-frontend:latest
```
- ✅ Página de registro mejorada con selector de roles
- ✅ Llamadas API corregidas para usar rutas proxy
- ✅ Nueva ruta API para instructores

## 📋 Archivos Pendientes de Corrección

Los siguientes archivos aún tienen llamadas directas a `localhost:4000`:

### **Admin Dashboard**
- `frontend/src/app/dashboard/admin/overview/page.tsx`
- `frontend/src/app/dashboard/admin/users/page.tsx`
- `frontend/src/app/dashboard/admin/reports/page.tsx`
- `frontend/src/app/dashboard/admin/payments/page.tsx`
- `frontend/src/app/dashboard/admin/schools/page.tsx`
- `frontend/src/app/dashboard/admin/reservations/page.tsx`
- `frontend/src/app/dashboard/admin/users/[id]/page.tsx`
- `frontend/src/app/dashboard/admin/classes/page.tsx`

### **School Dashboard**
- `frontend/src/app/dashboard/school/profile/page.tsx`
- `frontend/src/app/dashboard/school/classes/new/page.tsx`
- `frontend/src/app/dashboard/school/classes/[id]/edit/page.tsx`
- `frontend/src/app/dashboard/school/classes/[id]/reservations/page.tsx`

### **Componentes**
- `frontend/src/components/payments/PaymentVoucherModal.tsx`

## 🔄 Próximos Pasos

### **Para Aplicar Cambios:**
1. **Redeploy en Railway:**
   - Backend: Fuerza redespliegue
   - Frontend: Fuerza redespliegue

### **Para Corregir Archivos Restantes:**
Usar el patrón establecido:
```typescript
// Antes
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const res = await fetch(`${BACKEND}/endpoint`, { headers });

// Después
const res = await fetch('/api/endpoint');
```

### **Usar la Utilidad API:**
```typescript
import { api } from '@/lib/api';

// GET request
const data = await api.get('/users');

// POST request
const result = await api.post('/users', { name, email });
```

## ✅ Resultado Esperado

Después del redespliegue:
- ✅ **No más errores** de `localhost:4000`
- ✅ **Dashboard de escuela** funcionando
- ✅ **Dashboard de clases** funcionando
- ✅ **Dashboard de instructores** funcionando
- ✅ **Registro con roles** funcionando

## 🧪 Pruebas Recomendadas

1. **Login como School Admin**
2. **Navegar a Dashboard de Escuela**
3. **Ver lista de clases**
4. **Ver lista de instructores**
5. **Registrar nuevo usuario con rol**

¡Los errores de conexión deberían estar resueltos! 🎉