# 🧪 Scripts de Prueba para API de Clases - Implementación Completa

## 📦 Archivos Creados

1. **`test-classes-api.ps1`** - Script de PowerShell para Windows
2. **`test-classes-api.js`** - Script de Node.js multiplataforma  
3. **`TEST_CLASSES_README.md`** - Documentación completa de uso

## ✨ Características de los Scripts

### 🎯 Pruebas Implementadas

Ambos scripts prueban el **CRUD completo** de clases:

| # | Operación | Método | Endpoint | Descripción |
|---|-----------|--------|----------|-------------|
| 1 | **Login** | POST | `/auth/login` | Autenticación y obtención de token |
| 2 | **Crear** | POST | `/classes` | Crea una clase de prueba |
| 3 | **Listar** | GET | `/classes` | Lista todas las clases |
| 4 | **Obtener** | GET | `/classes/:id` | Obtiene detalles de una clase |
| 5 | **Actualizar** | PUT | `/classes/:id` | Actualiza la clase creada |
| 6 | **Filtrar** | GET | `/classes?level=X` | Filtra clases por nivel |
| 7 | **Eliminar** | DELETE | `/classes/:id` | Elimina la clase de prueba |
| 8 | **Verificar** | GET | `/classes/:id` | Confirma la eliminación |

### 🎨 Características Visuales

- ✅ **Colores en consola** para mejor legibilidad
- 📊 **Emojis** para identificar rápidamente el estado
- 📝 **Logs detallados** de cada operación
- 🎯 **Resumen final** con estadísticas

### 🔒 Seguridad

- ✅ Usa autenticación JWT
- ✅ Incluye token en headers
- ✅ Valida respuestas del servidor
- ✅ Maneja errores correctamente

### 📋 Datos de Prueba

La clase de prueba incluye todos los campos:

```json
{
  "title": "Clase de Surf para Principiantes",
  "description": "Clase introductoria de surf en la playa",
  "date": "2025-10-15T10:00:00.000Z",
  "duration": 90,
  "capacity": 8,
  "price": 50.00,
  "level": "BEGINNER",
  "instructor": "Carlos Mendoza",
  "studentDetails": "- Juan Pérez (Primera clase)\n- María García (Repaso básico)"
}
```

## 🚀 Cómo Usar

### Opción 1: PowerShell (Recomendado para Windows)

```powershell
# Desde la raíz del proyecto
.\test-classes-api.ps1
```

### Opción 2: Node.js (Multiplataforma)

```bash
# Desde la raíz del proyecto
node test-classes-api.js
```

## ⚙️ Requisitos

1. **Backend corriendo** en `http://localhost:4000`
2. **Usuario de prueba** en la base de datos:
   - Email: `admin@limasurf.com` (School Admin de Lima Surf Academy)
   - Password: `password123`
   - Rol: `SCHOOL_ADMIN`

   **Nota**: Estas son las credenciales del seed de multi-tenancy

## 📊 Salida de Ejemplo

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

[... más pruebas ...]

=====================================
  RESUMEN DE PRUEBAS
=====================================

✅ Pruebas exitosas: 8
📊 Total: 8

🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE
```

## 🔍 Validaciones Incluidas

Los scripts validan:

- ✅ Respuestas HTTP correctas (200, 201, 404, etc.)
- ✅ Estructura de datos devueltos
- ✅ Errores de validación del backend
- ✅ Autenticación y autorización
- ✅ Creación exitosa con ID asignado
- ✅ Actualización de campos
- ✅ Eliminación correcta
- ✅ Filtros funcionando

## 🎯 Casos de Uso

### 1. Desarrollo

Ejecuta los scripts después de hacer cambios en el API para verificar que todo sigue funcionando:

```bash
# Haces cambios en el código
git add .
git commit -m "Mejoras en API de clases"

# Ejecutas pruebas
node test-classes-api.js

# Si todo pasa, haces push
git push
```

### 2. Testing Manual

Usa los scripts para probar rápidamente sin necesidad de:
- Abrir Postman
- Configurar requests manualmente
- Recordar endpoints y formatos

### 3. CI/CD

Integra los scripts en tu pipeline de CI/CD:

```yaml
# .github/workflows/test.yml
- name: Test Classes API
  run: node test-classes-api.js
```

### 4. Debugging

Si algo falla, los scripts muestran:
- Errores de validación específicos
- Status codes HTTP
- Mensajes de error del backend
- Datos enviados y recibidos

## 🛠️ Personalización

### Cambiar URL del Backend

```javascript
// En test-classes-api.js
const BACKEND_URL = 'http://localhost:5000';  // Tu puerto
```

```powershell
# En test-classes-api.ps1
$BACKEND_URL = "http://localhost:5000"  # Tu puerto
```

### Cambiar Credenciales

```javascript
// En test-classes-api.js
const loginData = {
  email: 'tu-email@ejemplo.com',
  password: 'tu-password'
};
```

### Agregar Más Pruebas

Puedes extender los scripts fácilmente:

```javascript
async function test9_createMultipleClasses() {
  log('\n9️⃣  Creando múltiples clases...', 'yellow');
  
  for (let i = 1; i <= 5; i++) {
    const newClass = {
      title: `Clase ${i}`,
      // ... más datos
    };
    
    const result = await apiRequest('POST', '/classes', newClass, TOKEN);
    
    if (result.success) {
      log(`   ✅ Clase ${i} creada`, 'green');
    }
  }
}
```

## 📈 Beneficios

1. **Ahorro de Tiempo**: Prueba 8 operaciones en segundos
2. **Consistencia**: Mismas pruebas cada vez
3. **Documentación**: Los scripts sirven como ejemplos de uso del API
4. **Debugging**: Identifica problemas rápidamente
5. **Confianza**: Verifica que todo funciona antes de deploy

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to backend"

```bash
# Verifica que el backend esté corriendo
cd backend
npm run dev
```

### Error: "Login failed"

```bash
# Ejecuta el seed de la base de datos
cd backend
npx prisma db seed
```

### Error: "Validation error"

- Revisa los logs del backend
- Verifica que el usuario tenga una escuela asignada
- Confirma que los datos cumplen las validaciones

## 📚 Recursos Relacionados

- [Documentación del API](./backend/src/routes/classes.ts)
- [Validaciones](./backend/src/validations/classes.ts)
- [Modelo de Datos](./backend/prisma/schema.prisma)
- [README de Pruebas](./TEST_CLASSES_README.md)

## 🎓 Aprendizaje

Estos scripts son excelentes para:

- Aprender cómo funciona el API
- Ver ejemplos de requests correctos
- Entender el flujo de autenticación
- Practicar testing de APIs

## 🔄 Próximas Mejoras

Ideas para extender los scripts:

- [ ] Pruebas de rendimiento (crear 100 clases)
- [ ] Pruebas de concurrencia (múltiples usuarios)
- [ ] Pruebas de validación (datos inválidos)
- [ ] Pruebas de permisos (diferentes roles)
- [ ] Integración con Jest/Mocha
- [ ] Reportes en HTML
- [ ] Screenshots de errores

## 🤝 Contribuciones

Si mejoras los scripts:

1. Documenta los cambios
2. Mantén la compatibilidad
3. Agrega comentarios explicativos
4. Actualiza el README

---

**Creado**: Octubre 2025  
**Última actualización**: Octubre 2025  
**Versión**: 1.0.0
