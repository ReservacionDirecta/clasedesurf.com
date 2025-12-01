# Verificación de Funcionalidades

## ✅ 1. Creación de Clases con Múltiples Fechas

### Funcionalidades a Verificar:

#### A. Creación por Rango de Fechas (`dateRange`)
1. **Ubicación:** `/dashboard/school/classes/new`
2. **Pasos para probar:**
   - Seleccionar "Rango de fechas" en el tipo de programación
   - Ingresar fecha de inicio (ej: 2024-12-15)
   - Ingresar fecha de fin (ej: 2024-12-20)
   - Seleccionar una hora (ej: 09:00)
   - Completar los demás campos requeridos
   - Hacer clic en "Crear Clase"

3. **Resultado esperado:**
   - Se deben crear clases para cada día del rango (6 clases en el ejemplo)
   - Todas las clases deben tener los mismos datos base
   - Todas deben tener la misma hora
   - Redirección a la lista de clases con mensaje de éxito

#### B. Creación por Fechas Específicas (`specificDates`)
1. **Pasos para probar:**
   - Seleccionar "Fechas específicas" en el tipo de programación
   - Hacer clic en el calendario para seleccionar múltiples fechas
   - Seleccionar una hora
   - Completar los demás campos requeridos
   - Hacer clic en "Crear Clase"

2. **Resultado esperado:**
   - Se deben crear clases solo para las fechas seleccionadas
   - Cada clase debe tener los mismos datos base
   - Todas deben tener la misma hora
   - Redirección a la lista de clases con mensaje de éxito

#### C. Creación Recurrente (`recurring`)
1. **Pasos para probar:**
   - Seleccionar "Recurrente" en el tipo de programación
   - Seleccionar días de la semana (ej: Lunes, Miércoles, Viernes)
   - Agregar horarios (ej: 09:00, 14:00)
   - Seleccionar fecha de inicio
   - Seleccionar número de semanas (ej: 4)
   - Completar los demás campos requeridos
   - Hacer clic en "Crear Clase"

2. **Resultado esperado:**
   - Se deben crear clases para cada combinación de día/horario por semana
   - En el ejemplo: 3 días × 2 horarios × 4 semanas = 24 clases
   - Redirección a la lista de clases con mensaje de éxito

### Endpoints Utilizados:
- `POST /api/classes/bulk` - Para creación en bloque
- `POST /api/classes` - Para creación individual

### Validaciones:
- ✅ Máximo 100 clases por operación
- ✅ Fechas deben ser futuras
- ✅ Validación de fechas válidas
- ✅ Eliminación de duplicados

---

## ✅ 2. Sistema de Códigos de Descuento

### Funcionalidades a Verificar:

#### A. Crear Cupón de Prueba (100% de descuento)
1. **Ubicación:** `/dashboard/admin/discount-codes`
2. **Pasos para crear cupón de prueba:**
   - Iniciar sesión como ADMIN
   - Ir a "Códigos de Descuento"
   - Hacer clic en "Nuevo Código"
   - Completar el formulario:
     - **Código:** `TEST100`
     - **Descripción:** `Cupón de prueba - 100% de descuento`
     - **Porcentaje:** `100`
     - **Válido desde:** Fecha actual
     - **Válido hasta:** 1 año desde hoy
     - **Activo:** ✅ Sí
     - **Usos máximos:** Dejar vacío (ilimitado)
     - **Escuela:** Dejar vacío (código global)
   - Hacer clic en "Crear"

3. **Resultado esperado:**
   - Cupón creado exitosamente
   - Aparece en la lista de códigos
   - Estado: "Activo" (badge verde)
   - Tipo: "Global" (badge púrpura)

#### B. Aplicar Código de Descuento en Reserva
1. **Ubicación:** Modal de reserva (al hacer clic en "Reservar" en una clase)
2. **Pasos para probar:**
   - Seleccionar una clase disponible
   - Hacer clic en "Reservar"
   - Completar el paso 1 (Información Personal)
   - Completar el paso 2 (Detalles)
   - En el paso 3 (Emergencia), encontrar el campo "Código de Descuento"
   - Ingresar el código: `TEST100`
   - Hacer clic en "Aplicar" o presionar Enter

3. **Resultado esperado:**
   - ✅ Campo se vuelve verde con checkmark
   - ✅ Mensaje: "Descuento de 100% aplicado"
   - ✅ Notificación toast: "¡Código 'TEST100' aplicado! Ahorras [monto]"
   - ✅ En el resumen de precio:
     - Subtotal: [precio original]
     - Descuento aplicado: -[precio completo]
     - **Total a pagar: S/ 0.00 (o $0.00 USD)**
   - ✅ Mensaje: "¡Ahorras [monto completo]!"

#### C. Validación de Código Inválido
1. **Pasos para probar:**
   - Ingresar un código que no existe (ej: `INVALIDO`)
   - Hacer clic en "Aplicar"

2. **Resultado esperado:**
   - ❌ Campo se vuelve rojo con X
   - ❌ Mensaje de error: "Código de descuento inválido o inactivo"
   - ❌ Notificación toast de error
   - ❌ El precio no cambia

#### D. Validación de Código Expirado
1. **Pasos para probar:**
   - Crear un código con fecha de validez pasada
   - Intentar aplicarlo

2. **Resultado esperado:**
   - ❌ Mensaje: "Este código de descuento ha expirado"

#### E. Validación de Código con Límite de Usos
1. **Pasos para probar:**
   - Crear un código con maxUses = 1
   - Aplicarlo una vez
   - Intentar aplicarlo de nuevo

2. **Resultado esperado:**
   - ❌ Mensaje: "Este código de descuento ha alcanzado su límite de usos"

### Endpoints Utilizados:
- `GET /api/discount-codes` - Listar códigos
- `POST /api/discount-codes` - Crear código
- `POST /api/discount-codes/validate` - Validar código
- `POST /api/payments` - Crear pago con descuento

### Validaciones del Backend:
- ✅ Código debe existir y estar activo
- ✅ Fecha actual debe estar entre validFrom y validTo
- ✅ Si tiene maxUses, verificar que usedCount < maxUses
- ✅ Si es código de escuela, verificar que coincida con la clase
- ✅ Calcular descuento correctamente (amount * percentage / 100)
- ✅ Para 100%: finalAmount debe ser 0

---

## 🧪 Casos de Prueba Específicos

### Caso 1: Clase con Rango de 7 Días
- **Input:** 
  - Fecha inicio: 2024-12-15
  - Fecha fin: 2024-12-21
  - Hora: 09:00
- **Output esperado:** 7 clases creadas (una por cada día)

### Caso 2: Clase con 5 Fechas Específicas
- **Input:**
  - Fechas: 2024-12-15, 2024-12-17, 2024-12-19, 2024-12-21, 2024-12-23
  - Hora: 14:00
- **Output esperado:** 5 clases creadas

### Caso 3: Cupón 100% en Clase de S/ 90
- **Input:**
  - Precio clase: S/ 90.00
  - Código: TEST100 (100%)
  - Participantes: 1
- **Output esperado:**
  - Subtotal: S/ 90.00
  - Descuento: -S/ 90.00
  - Total: S/ 0.00
  - USD equivalente: $0.00

### Caso 4: Cupón 100% en Clase con 2 Participantes
- **Input:**
  - Precio clase: S/ 90.00
  - Código: TEST100 (100%)
  - Participantes: 2
- **Output esperado:**
  - Subtotal: S/ 180.00
  - Descuento: -S/ 180.00
  - Total: S/ 0.00

---

## 📝 Notas Importantes

1. **Moneda Base:** Todas las clases usan PEN (Soles Peruanos) como moneda base
2. **Conversión USD:** Se muestra automáticamente según el tipo de cambio del día
3. **Códigos Globales:** Los códigos sin schoolId son válidos para todas las escuelas
4. **Códigos de Escuela:** Solo válidos para clases de esa escuela específica
5. **Límite de Clases:** Máximo 100 clases por operación de creación en bloque

---

## 🔧 Solución de Problemas

### Si las clases no se crean:
1. Verificar que las fechas sean futuras
2. Verificar que el rango no exceda 100 días
3. Revisar la consola del navegador para errores
4. Verificar que el usuario tenga rol SCHOOL_ADMIN o ADMIN

### Si el código de descuento no funciona:
1. Verificar que el código esté activo
2. Verificar las fechas de validez
3. Verificar que no haya alcanzado el límite de usos
4. Verificar que sea código global o de la escuela correcta
5. Revisar la consola del navegador para errores de API

---

## ✅ Checklist de Verificación

### Creación de Clases:
- [ ] Crear clase única funciona
- [ ] Crear clases por rango de fechas funciona
- [ ] Crear clases por fechas específicas funciona
- [ ] Crear clases recurrentes funciona
- [ ] Validación de máximo 100 clases funciona
- [ ] Validación de fechas futuras funciona

### Códigos de Descuento:
- [ ] Crear código de descuento funciona
- [ ] Aplicar código válido funciona
- [ ] Aplicar código 100% muestra total en S/ 0.00
- [ ] Validación de código inválido funciona
- [ ] Validación de código expirado funciona
- [ ] Validación de límite de usos funciona
- [ ] El descuento se guarda correctamente en el pago

---

**Última actualización:** Diciembre 2024







