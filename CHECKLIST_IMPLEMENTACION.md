# ✅ Checklist de Implementación - Sistema CRUD

## 🎯 Antes de Empezar

- [ ] Backend corriendo en puerto 4000
- [ ] Frontend corriendo en puerto 3000
- [ ] Base de datos PostgreSQL accesible
- [ ] Variables de entorno configuradas

## 📋 Paso 1: Aplicar Migración de Base de Datos

### Opción A: Script Automático (Recomendado)
- [ ] Abrir PowerShell en la raíz del proyecto
- [ ] Ejecutar: `.\apply-migration.ps1`
- [ ] Seleccionar opción 2 (Prisma DB Push)
- [ ] Verificar mensaje de éxito

### Opción B: Manual
- [ ] Abrir terminal en carpeta `backend`
- [ ] Ejecutar: `npx prisma generate`
- [ ] Ejecutar: `npx prisma db push`
- [ ] Verificar que no hay errores

### Verificación
- [ ] Conectar a la base de datos
- [ ] Ejecutar: `\d schools`
- [ ] Confirmar que existe columna `ownerId`

## 🔄 Paso 2: Reiniciar Servicios

### Backend
- [ ] Detener servidor backend (Ctrl+C)
- [ ] Ejecutar: `cd backend && npm run dev`
- [ ] Verificar que inicia sin errores
- [ ] Confirmar puerto 4000

### Frontend
- [ ] Detener servidor frontend (Ctrl+C)
- [ ] Ejecutar: `cd frontend && npm run dev`
- [ ] Verificar que inicia sin errores
- [ ] Confirmar puerto 3000

## 🧪 Paso 3: Probar Endpoint my-school

### Desde PowerShell
```powershell
# Login
$body = @{
    email = "admin@escuela.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token

# Probar my-school
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:4000/schools/my-school" -Method GET -Headers $headers
```

- [ ] Ejecutar comandos anteriores
- [ ] Verificar respuesta exitosa (200 o 404)
- [ ] Confirmar que NO hay error 500

### Desde el Navegador
- [ ] Abrir: http://localhost:3000/login
- [ ] Login con: admin@escuela.com / admin123
- [ ] Ir a: http://localhost:3000/dashboard/school
- [ ] Verificar que carga sin error 500

## 🏫 Paso 4: Crear Escuela

- [ ] Estar en: http://localhost:3000/dashboard/school
- [ ] Ver formulario de creación (si no tienes escuela)
- [ ] Llenar campos:
  - [ ] Nombre: "Surf School Costa Rica"
  - [ ] Ubicación: "Tamarindo, Guanacaste"
  - [ ] Descripción: "La mejor escuela de surf"
  - [ ] Teléfono: "+506 1234-5678"
  - [ ] Email: "info@surfschool.com"
- [ ] Click en "Crear Escuela"
- [ ] Verificar mensaje de éxito
- [ ] Confirmar que aparece información de la escuela

## 📚 Paso 5: Gestionar Clases

### Acceder a Gestión de Clases
- [ ] Click en botón "Clases" en el dashboard
- [ ] O ir a: http://localhost:3000/dashboard/school/classes
- [ ] Verificar que carga la página

### Crear Nueva Clase
- [ ] Click en "Nueva Clase"
- [ ] Verificar que abre el modal
- [ ] Llenar formulario:
  - [ ] Título: "Clase de Surf para Principiantes"
  - [ ] Descripción: "Aprende los fundamentos"
  - [ ] Fecha: Seleccionar fecha futura
  - [ ] Duración: 60 minutos
  - [ ] Nivel: Principiante
  - [ ] Capacidad: 10
  - [ ] Precio: 50
  - [ ] Instructor: "Juan Pérez"
- [ ] Click en "Crear Clase"
- [ ] Verificar que cierra el modal
- [ ] Confirmar que aparece en la tabla

### Editar Clase
- [ ] Click en ícono de editar (lápiz) en una clase
- [ ] Verificar que abre modal con datos
- [ ] Modificar precio a 55
- [ ] Click en "Actualizar"
- [ ] Verificar que cierra el modal
- [ ] Confirmar cambio en la tabla

### Eliminar Clase
- [ ] Click en ícono de eliminar (basura) en una clase
- [ ] Verificar que abre diálogo de confirmación
- [ ] Leer mensaje de confirmación
- [ ] Click en "Eliminar"
- [ ] Verificar que cierra el diálogo
- [ ] Confirmar que desaparece de la tabla

## 🎨 Paso 6: Verificar Componentes UI

### Modal
- [ ] Abre correctamente
- [ ] Cierra con botón X
- [ ] Cierra con ESC
- [ ] Cierra con click fuera
- [ ] No cierra durante carga
- [ ] Previene scroll del body

### Formularios
- [ ] Campos requeridos marcados con *
- [ ] Validación en tiempo real
- [ ] Mensajes de error claros
- [ ] Botones deshabilitados durante carga
- [ ] Texto de botón cambia a "Guardando..."

### Tabla
- [ ] Muestra datos correctamente
- [ ] Botones de acción visibles
- [ ] Hover en filas funciona
- [ ] Responsive en móvil
- [ ] Estado vacío se muestra correctamente

### Diálogo de Confirmación
- [ ] Mensaje claro
- [ ] Botones correctos
- [ ] Variante danger (rojo)
- [ ] No cierra durante carga

## 🔍 Paso 7: Verificar en Base de Datos

```sql
-- Ver escuelas con owners
SELECT id, name, location, "ownerId" FROM schools;

-- Ver clases
SELECT id, title, date, price, level, "schoolId" FROM classes;

-- Ver usuarios SCHOOL_ADMIN
SELECT id, name, email, role FROM users WHERE role = 'SCHOOL_ADMIN';
```

- [ ] Ejecutar queries anteriores
- [ ] Verificar que los datos coinciden
- [ ] Confirmar relaciones correctas

## 🐛 Paso 8: Probar Casos de Error

### Validación de Formularios
- [ ] Intentar crear clase sin título
- [ ] Intentar crear clase sin fecha
- [ ] Intentar crear clase con capacidad 0
- [ ] Intentar crear clase con precio negativo
- [ ] Verificar mensajes de error

### Autenticación
- [ ] Cerrar sesión
- [ ] Intentar acceder a /dashboard/school/classes
- [ ] Verificar redirección a login
- [ ] Login nuevamente
- [ ] Verificar que funciona

### Permisos
- [ ] Login como STUDENT
- [ ] Intentar acceder a /dashboard/school
- [ ] Verificar redirección apropiada

## 📱 Paso 9: Probar Responsive

### Desktop (1920x1080)
- [ ] Tabla se ve completa
- [ ] Modal centrado
- [ ] Formulario en 2 columnas

### Tablet (768x1024)
- [ ] Tabla con scroll horizontal
- [ ] Modal adaptado
- [ ] Formulario en 2 columnas

### Mobile (375x667)
- [ ] Tabla con scroll horizontal
- [ ] Modal ocupa casi toda la pantalla
- [ ] Formulario en 1 columna
- [ ] Botones táctiles grandes

## 🎯 Paso 10: Verificar Performance

### Tiempos de Carga
- [ ] Página carga en < 2 segundos
- [ ] Modal abre instantáneamente
- [ ] Formulario responde rápido
- [ ] Tabla renderiza en < 1 segundo

### Estados de Carga
- [ ] Spinner visible durante fetch
- [ ] Botones muestran "Guardando..."
- [ ] Tabla muestra skeleton/spinner
- [ ] No hay flashes de contenido

## 📊 Paso 11: Verificar Logs

### Backend Logs
- [ ] No hay errores en consola
- [ ] Requests se registran correctamente
- [ ] Respuestas son 200/201/204
- [ ] No hay warnings de Prisma

### Frontend Logs
- [ ] No hay errores en DevTools
- [ ] No hay warnings de React
- [ ] Network tab muestra requests exitosos
- [ ] No hay memory leaks

## ✅ Paso 12: Checklist Final

### Funcionalidad
- [ ] ✅ Crear escuela funciona
- [ ] ✅ Ver escuela funciona
- [ ] ✅ Crear clase funciona
- [ ] ✅ Editar clase funciona
- [ ] ✅ Eliminar clase funciona
- [ ] ✅ Validaciones funcionan
- [ ] ✅ Estados de carga funcionan

### UI/UX
- [ ] ✅ Modales funcionan correctamente
- [ ] ✅ Formularios son intuitivos
- [ ] ✅ Tabla es legible
- [ ] ✅ Mensajes son claros
- [ ] ✅ Responsive funciona

### Seguridad
- [ ] ✅ Autenticación funciona
- [ ] ✅ Autorización funciona
- [ ] ✅ Tokens se refrescan
- [ ] ✅ Validaciones en frontend
- [ ] ✅ Validaciones en backend

### Performance
- [ ] ✅ Carga rápida
- [ ] ✅ Sin memory leaks
- [ ] ✅ Sin errores en consola
- [ ] ✅ Optimizado para móvil

## 🎉 ¡Completado!

Si todos los checkboxes están marcados, el sistema está funcionando correctamente.

## 📝 Notas Adicionales

### Problemas Encontrados
```
Problema 1: _______________________
Solución: _________________________

Problema 2: _______________________
Solución: _________________________
```

### Mejoras Sugeridas
```
1. _______________________________
2. _______________________________
3. _______________________________
```

### Tiempo Total de Implementación
```
Migración: _____ minutos
Pruebas: _____ minutos
Ajustes: _____ minutos
Total: _____ minutos
```

---

**Fecha de Verificación:** _______________  
**Verificado por:** _______________  
**Estado:** [ ] Aprobado [ ] Requiere ajustes
