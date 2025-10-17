# 🧪 Scripts de Prueba para API de Clases

Este directorio contiene scripts automatizados para probar todas las funcionalidades del API de clases (CRUD completo).

## 📋 Contenido

- **`test-classes-api.ps1`**: Script de PowerShell para Windows
- **`test-classes-api.js`**: Script de Node.js multiplataforma

## 🎯 Funcionalidades Probadas

Los scripts prueban las siguientes operaciones:

1. ✅ **Login** - Autenticación de usuario
2. ✅ **Crear Clase** - POST /classes
3. ✅ **Listar Clases** - GET /classes
4. ✅ **Obtener Clase por ID** - GET /classes/:id
5. ✅ **Actualizar Clase** - PUT /classes/:id
6. ✅ **Filtrar Clases** - GET /classes?level=BEGINNER
7. ✅ **Eliminar Clase** - DELETE /classes/:id
8. ✅ **Verificar Eliminación** - Confirma que la clase fue eliminada

## 🚀 Uso

### Opción 1: PowerShell (Windows)

```powershell
# Ejecutar desde la raíz del proyecto
.\test-classes-api.ps1
```

### Opción 2: Node.js (Multiplataforma)

```bash
# Ejecutar desde la raíz del proyecto
node test-classes-api.js
```

## ⚙️ Requisitos Previos

### Para ambos scripts:

1. **Backend corriendo** en `http://localhost:4000`
   ```bash
   cd backend
   npm run dev
   ```

2. **Usuario de prueba** debe existir en la base de datos:
   - Email: `admin@limasurf.com` (School Admin de Lima Surf Academy)
   - Password: `password123`
   - Rol: `SCHOOL_ADMIN`

   **Nota**: Estas son las credenciales del seed de multi-tenancy. Si usas otras credenciales, modifica los scripts.

### Para el script de Node.js:

- Node.js v18 o superior (para soporte de `fetch`)

## 📊 Salida Esperada

Si todo funciona correctamente, verás una salida similar a:

```
=====================================
  PRUEBAS API DE CLASES
=====================================

1️⃣  Iniciando sesión...
   ✅ Login exitoso
   👤 Usuario: Administrador
   🎭 Rol: SCHOOL_ADMIN

2️⃣  Creando nueva clase...
   📅 Fecha: 15/10/2025 10:00
   👥 Capacidad: 8 estudiantes
   💰 Precio: $50
   ✅ Clase creada exitosamente
   🆔 ID: 123
   📝 Título: Clase de Surf para Principiantes

3️⃣  Listando todas las clases...
   ✅ Total de clases: 5
   📋 Últimas 3 clases:
     • ID: 123 - Clase de Surf para Principiantes - BEGINNER
     • ID: 122 - Clase Intermedia - INTERMEDIATE
     • ID: 121 - Clase Avanzada - ADVANCED

4️⃣  Obteniendo detalles de la clase creada...
   ✅ Clase obtenida exitosamente
   📝 Título: Clase de Surf para Principiantes
   📅 Fecha: 2025-10-15T10:00:00.000Z
   👨‍🏫 Instructor: Carlos Mendoza
   🏫 Escuela: Escuela de Surf Lima

5️⃣  Actualizando la clase...
   📝 Nueva capacidad: 10
   💰 Nuevo precio: $55
   ✅ Clase actualizada exitosamente
   📝 Nuevo título: Clase de Surf para Principiantes - ACTUALIZADA
   👥 Nueva capacidad: 10

6️⃣  Filtrando clases por nivel BEGINNER...
   ✅ Clases encontradas: 3

7️⃣  Eliminando la clase de prueba...
   ✅ Clase eliminada exitosamente
   🗑️  ID eliminado: 123

8️⃣  Verificando que la clase fue eliminada...
   ✅ Confirmado: La clase ya no existe

=====================================
  RESUMEN DE PRUEBAS
=====================================

✅ Pruebas exitosas: 8
📊 Total: 8

🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE
```

## 🔧 Configuración

### Cambiar URL del Backend

Si tu backend corre en un puerto diferente, modifica la variable al inicio del script:

**PowerShell:**
```powershell
$BACKEND_URL = "http://localhost:4000"  # Cambiar aquí
```

**Node.js:**
```javascript
const BACKEND_URL = 'http://localhost:4000';  // Cambiar aquí
```

### Cambiar Credenciales de Login

Si usas diferentes credenciales, modifica la sección de login:

**PowerShell:**
```powershell
$loginData = @{
    email = "tu-email@ejemplo.com"
    password = "tu-password"
}
```

**Node.js:**
```javascript
const loginData = {
  email: 'tu-email@ejemplo.com',
  password: 'tu-password'
};
```

## 🐛 Solución de Problemas

### Error: "No se puede conectar al backend"

- Verifica que el backend esté corriendo: `http://localhost:4000`
- Revisa que no haya un firewall bloqueando el puerto

### Error: "Login failed"

- Verifica que el usuario `admin@escuela.com` exista en la base de datos
- Confirma que la contraseña sea `admin123`
- Ejecuta el seed de la base de datos si es necesario:
  ```bash
  cd backend
  npx prisma db seed
  ```

### Error: "Validation error" al crear clase

- Verifica que el usuario tenga una escuela asignada
- Revisa los logs del backend para más detalles
- Asegúrate de que el campo `schoolId` se esté resolviendo correctamente

### Error: "Class date must be in the future"

- El script crea clases para mañana automáticamente
- Si el error persiste, verifica la zona horaria del servidor

## 📝 Notas

- Los scripts crean una clase de prueba y la eliminan al final
- No afectan las clases existentes en la base de datos
- Los logs detallados aparecen tanto en la consola como en la terminal del backend
- El script de Node.js requiere Node.js v18+ para soporte nativo de `fetch`

## 🔍 Debugging

Para ver más detalles durante la ejecución:

1. **Revisa la consola** donde ejecutas el script
2. **Revisa la terminal del backend** (puerto 4000) para ver los logs del servidor
3. **Revisa la base de datos** directamente si es necesario:
   ```bash
   cd backend
   npx prisma studio
   ```

## 📚 Recursos Adicionales

- [Documentación del API de Clases](./backend/src/routes/classes.ts)
- [Esquema de Validación](./backend/src/validations/classes.ts)
- [Modelo Prisma](./backend/prisma/schema.prisma)

## 🤝 Contribuir

Si encuentras algún problema o quieres agregar más pruebas:

1. Crea un issue describiendo el problema
2. Propón mejoras o nuevas pruebas
3. Envía un pull request con tus cambios

---

**Última actualización**: Octubre 2025
