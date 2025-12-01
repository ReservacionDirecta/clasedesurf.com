# Instrucciones para Crear Cupón de Prueba (100% Descuento)

## 🎯 Objetivo
Crear un cupón de descuento del 100% para probar que el sistema de códigos de descuento funciona correctamente.

## 📋 Pasos para Crear el Cupón

### 1. Acceder al Panel de Administración
- Iniciar sesión como usuario con rol **ADMIN**
- Navegar a: `/dashboard/admin/discount-codes`

### 2. Crear Nuevo Código
- Hacer clic en el botón **"Nuevo Código"** (botón azul con gradiente)

### 3. Completar el Formulario

#### Campos Requeridos:
- **Código:** `TEST100`
  - Debe tener al menos 3 caracteres
  - Solo letras, números, guiones y guiones bajos
  - Se convertirá automáticamente a mayúsculas

- **Descripción:** `Cupón de prueba - 100% de descuento`
  - Campo opcional pero recomendado

- **Porcentaje de Descuento:** `100`
  - Debe estar entre 0 y 100
  - Para este cupón de prueba, usar **100**

- **Válido desde:** 
  - Fecha actual (hoy)
  - Formato: YYYY-MM-DD HH:MM
  - Ejemplo: `2024-12-15 00:00`

- **Válido hasta:**
  - 1 año desde hoy (para tener tiempo de prueba)
  - Formato: YYYY-MM-DD HH:MM
  - Ejemplo: `2025-12-15 23:59`

- **Activo:** ✅ Marcar como activo

- **Usos Máximos:** 
  - **Dejar vacío** (para usos ilimitados)
  - O poner un número alto como `1000` si quieres limitarlo

- **Escuela:**
  - **Dejar vacío** (para crear un código global válido para todas las escuelas)
  - O seleccionar una escuela específica si quieres probar códigos por escuela

### 4. Guardar
- Hacer clic en el botón **"Crear"**
- Deberías ver una notificación de éxito: "Código de descuento creado exitosamente"

## ✅ Verificación del Cupón Creado

### En la Lista de Códigos:
- ✅ El código `TEST100` debe aparecer en la tabla
- ✅ Badge verde "Activo" debe estar visible
- ✅ Badge púrpura "Global" debe estar visible (si no especificaste escuela)
- ✅ Porcentaje debe mostrar: `100%`
- ✅ Usos: `0 / ∞` (si es ilimitado)

## 🧪 Probar el Cupón

### 1. Ir a una Clase
- Navegar a cualquier página de clases
- Seleccionar una clase disponible
- Hacer clic en **"Reservar"**

### 2. Completar los Pasos
- **Paso 1:** Información Personal
  - Nombre, email, edad (mínimo 8 años)
  
- **Paso 2:** Detalles
  - Número de participantes, nivel, etc.

- **Paso 3:** Contacto de Emergencia
  - Contacto y teléfono de emergencia
  - **Aquí está el campo de código de descuento**

### 3. Aplicar el Código
- En el campo **"Código de Descuento"**, ingresar: `TEST100`
- Hacer clic en **"Aplicar"** o presionar **Enter**

### 4. Verificar Resultado

#### ✅ Resultado Esperado:
- **Campo de código:**
  - ✅ Borde verde
  - ✅ Fondo verde claro
  - ✅ Icono de checkmark verde animado

- **Mensaje:**
  - ✅ "Descuento de 100% aplicado"

- **Notificación Toast:**
  - ✅ "¡Código 'TEST100' aplicado! Ahorras [monto completo]"

- **Resumen de Precio:**
  - ✅ Subtotal: [precio original] (ej: S/ 90.00)
  - ✅ Descuento aplicado: -[precio completo] (ej: -S/ 90.00)
  - ✅ **Total a pagar: S/ 0.00**
  - ✅ Equivalente USD: $0.00
  - ✅ Mensaje: "¡Ahorras [monto completo]!"

## 🔍 Verificación Técnica

### Cálculo del Descuento (100%):
```
Precio original: S/ 90.00
Descuento (100%): S/ 90.00 × 100 / 100 = S/ 90.00
Total final: S/ 90.00 - S/ 90.00 = S/ 0.00
```

### Con Múltiples Participantes:
```
Precio por persona: S/ 90.00
Participantes: 2
Subtotal: S/ 180.00
Descuento (100%): S/ 180.00 × 100 / 100 = S/ 180.00
Total final: S/ 180.00 - S/ 180.00 = S/ 0.00
```

## ⚠️ Problemas Comunes

### El código no se aplica:
1. Verificar que el código esté activo
2. Verificar las fechas de validez
3. Verificar que no haya alcanzado el límite de usos
4. Verificar que sea código global o de la escuela correcta
5. Revisar la consola del navegador para errores

### El total no es S/ 0.00:
1. Verificar que el porcentaje sea exactamente 100
2. Verificar que el cálculo se esté haciendo correctamente
3. Revisar la consola del navegador para errores de cálculo

### El código no aparece en la lista:
1. Verificar que estés logueado como ADMIN
2. Refrescar la página
3. Verificar que el código se haya creado correctamente

## 📝 Notas Adicionales

- El cupón `TEST100` es solo para pruebas
- Puedes crear múltiples cupones de prueba con diferentes porcentajes
- Los cupones globales (sin escuela) funcionan para todas las clases
- Los cupones de escuela solo funcionan para clases de esa escuela
- El contador de usos se incrementa automáticamente cuando se completa un pago

---

**Última actualización:** Diciembre 2024







