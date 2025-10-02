# Guía de Testing - Sistema de Reservas

## 🎯 Reservas de Prueba Creadas

El sistema ahora incluye **5 reservas de prueba** con diferentes estados para testing completo.

### 📊 Resumen de Reservas

| ID | Estudiante | Clase | Estado Reserva | Estado Pago | Monto |
|----|-----------|-------|----------------|-------------|-------|
| 1 | Alice Johnson | Iniciación en Miraflores | CONFIRMED | PAID | $25 |
| 2 | Bob Williams | Intermedio en San Bartolo | PENDING | UNPAID | $35 |
| 3 | Test User | Iniciación en Miraflores | CONFIRMED | UNPAID | $25 |
| 4 | Alice Johnson | Avanzado en La Herradura | PAID | PAID | $45 |
| 5 | Test User | Intermedio en San Bartolo | CANCELED | REFUNDED | $35 |

## 🔐 Acceso al Sistema

### 1. Hacer Login

**IMPORTANTE:** Si tu token JWT expiró, necesitas hacer logout y login nuevamente.

```
Email: schooladmin@surfschool.com
Password: password123
```

### 2. Navegar a Gestión de Clases

```
http://localhost:3000/dashboard/school/classes
```

## 📋 Clases con Reservas

### Clase 1: Iniciación en Miraflores
- **ID:** 11 (puede variar)
- **Reservas:** 2 (Alice y Test User)
- **URL:** `http://localhost:3000/dashboard/school/classes/11/reservations`

**Reservas:**
1. **Alice Johnson** - CONFIRMED, PAID
   - Solicitud: "Necesito tabla más grande, tengo experiencia previa en bodyboard"
   - Edad: 28 años
   - Sabe nadar: Sí
   - Pago: $25 con tarjeta (txn_cc_001_2025)

2. **Test User** - CONFIRMED, UNPAID
   - Solicitud: "Prefiero clases por la mañana temprano"
   - Edad: 25 años
   - Sabe nadar: Sí
   - Pago: $25 pendiente

### Clase 2: Intermedio en San Bartolo
- **ID:** 12 (puede variar)
- **Reservas:** 2 (Bob y Test User cancelada)
- **URL:** `http://localhost:3000/dashboard/school/classes/12/reservations`

**Reservas:**
1. **Bob Williams** - PENDING, UNPAID
   - Solicitud: "Primera vez en el agua, necesito atención especial. No sé nadar muy bien."
   - Edad: 35 años
   - **Sabe nadar: NO** ⚠️
   - Pago: $35 pendiente

2. **Test User** - CANCELED, REFUNDED
   - Solicitud: "Tuve que cancelar por motivos personales"
   - Pago: $35 reembolsado

### Clase 3: Avanzado en La Herradura
- **ID:** 13 (puede variar)
- **Reservas:** 1 (Alice)
- **URL:** `http://localhost:3000/dashboard/school/classes/13/reservations`

**Reservas:**
1. **Alice Johnson** - PAID, PAID
   - Solicitud: "Quiero practicar maniobras avanzadas"
   - Edad: 28 años
   - Sabe nadar: Sí
   - Pago: $45 en efectivo (txn_cash_002_2025)

## 🧪 Casos de Prueba

### Caso 1: Ver Detalles Completos de Estudiante

1. Ir a cualquier clase con reservas
2. Click en "Ver Detalles" en cualquier reserva
3. **Verificar que se muestre:**
   - ✅ Nombre, email, teléfono del estudiante
   - ✅ Edad, peso, altura
   - ✅ Indicador de si sabe nadar
   - ✅ Lesiones o condiciones médicas (si aplica)
   - ✅ Solicitud especial destacada

### Caso 2: Estudiante que NO Sabe Nadar

1. Ir a Clase 2 (Intermedio en San Bartolo)
2. Ver reserva de **Bob Williams**
3. Click en "Ver Detalles"
4. **Verificar:**
   - ✅ "¿Sabe Nadar?" muestra "✗ No" en rojo
   - ✅ Solicitud especial menciona que no sabe nadar bien
   - ⚠️ Esta información es crítica para el instructor

### Caso 3: Confirmar Reserva Pendiente

1. Ir a Clase 2
2. Ver reserva de **Bob Williams** (PENDING)
3. **Opción A - Desde la tabla:**
   - Click en "Confirmar"
   - Verificar que cambia a CONFIRMED

4. **Opción B - Desde el modal:**
   - Click en "Ver Detalles"
   - Click en "Confirmar Reserva"
   - Verificar cambio de estado

### Caso 4: Marcar Pago como Recibido

1. Ir a Clase 1
2. Ver reserva de **Test User** (UNPAID)
3. **Opción A - Desde la tabla:**
   - Click en "Marcar Pagado"
   - Verificar que cambia a PAID

4. **Opción B - Desde el modal:**
   - Click en "Ver Detalles"
   - Click en "Marcar como Pagado"
   - Verificar cambio de estado y fecha de pago

### Caso 5: Ver Información de Pago Completa

1. Ir a Clase 1
2. Ver reserva de **Alice Johnson**
3. Click en "Ver Detalles"
4. **Verificar sección de Pago:**
   - ✅ Estado: PAID (azul)
   - ✅ Monto: $25
   - ✅ Método: credit_card
   - ✅ ID Transacción: txn_cc_001_2025
   - ✅ Fecha de pago: 10 Ene 2025

### Caso 6: Cancelar Reserva

1. Ir a cualquier clase
2. Ver una reserva activa (no cancelada)
3. **Opción A - Desde la tabla:**
   - Click en "Cancelar"
   - Verificar cambio a CANCELED

4. **Opción B - Desde el modal:**
   - Click en "Ver Detalles"
   - Click en "Cancelar Reserva"
   - Confirmar en el diálogo
   - Verificar cambio de estado

### Caso 7: Ver Estadísticas de la Clase

1. Ir a cualquier clase con reservas
2. **Verificar tarjetas de estadísticas:**
   - ✅ Capacidad total
   - ✅ Número de reservas
   - ✅ Plazas disponibles
   - ✅ Ingresos (solo pagos PAID)

**Ejemplo Clase 1:**
- Capacidad: 8
- Reservas: 2
- Disponibles: 6
- Ingresos: $25 (solo Alice pagó)

### Caso 8: Reserva Cancelada con Reembolso

1. Ir a Clase 2
2. Ver reserva de **Test User** (CANCELED)
3. Click en "Ver Detalles"
4. **Verificar:**
   - ✅ Estado reserva: CANCELED (rojo)
   - ✅ Estado pago: REFUNDED (badge especial)
   - ✅ Monto reembolsado: $35
   - ✅ ID de transacción de reembolso

## 🎨 Elementos Visuales a Verificar

### Badges de Estado

**Estados de Reserva:**
- 🟢 CONFIRMED - Verde
- 🔵 PAID - Azul
- 🟡 PENDING - Amarillo
- 🔴 CANCELED - Rojo
- 🟣 COMPLETED - Púrpura

**Estados de Pago:**
- 🔵 PAID - Azul
- 🟡 UNPAID - Amarillo
- 🟠 REFUNDED - Naranja/Rojo

### Alertas Especiales

- ⚠️ **Lesiones médicas** - Fondo rojo con icono
- 💬 **Solicitudes especiales** - Fondo amarillo
- 🏊 **No sabe nadar** - Texto rojo con ✗

## 📱 Testing Responsive

### Desktop
1. Abrir en pantalla completa
2. Verificar grid de 2 columnas en modal
3. Verificar tabla completa visible

### Tablet
1. Reducir ventana a ~768px
2. Verificar grid adaptativo
3. Verificar scroll horizontal en tabla si necesario

### Mobile
1. Reducir ventana a ~375px
2. Verificar columna única en modal
3. Verificar scroll vertical funcional
4. Verificar botones accesibles

## 🔄 Flujo Completo de Testing

### Flujo Recomendado:

1. **Login** como school admin
2. **Dashboard** → Ver estadísticas generales
3. **Gestionar Clases** → Ver lista de clases
4. **Clase 1** → Ver reservas
5. **Ver Detalles** de Alice → Revisar información completa
6. **Cerrar modal** → Volver a lista
7. **Ver Detalles** de Test User → Ver pago pendiente
8. **Marcar como Pagado** → Confirmar cambio
9. **Clase 2** → Ver reservas
10. **Ver Detalles** de Bob → Ver que no sabe nadar
11. **Confirmar Reserva** → Cambiar de PENDING a CONFIRMED
12. **Ver estadísticas** actualizadas

## 🐛 Troubleshooting

### Token JWT Expirado

**Error:** "JWT expired"

**Solución:**
1. Ir a `http://localhost:3000/clear-session`
2. O hacer logout manual
3. Login nuevamente con `schooladmin@surfschool.com`

### No se ven las reservas

**Posibles causas:**
1. IDs de clases diferentes después del seed
2. Token expirado
3. Backend no corriendo

**Solución:**
1. Verificar que backend esté corriendo en puerto 4000
2. Hacer login nuevamente
3. Verificar IDs de clases en la lista

### Modal no se cierra

**Solución:**
- Click en botón "Cerrar"
- Click en X en la esquina superior derecha
- Click fuera del modal (en el overlay oscuro)

## 📊 Datos de Estudiantes para Testing

### Alice Johnson (student1@surfschool.com)
- Edad: 28 años
- Peso: 65 kg
- Altura: 170 cm
- Sabe nadar: Sí
- Teléfono: +5119876545
- **2 reservas activas**

### Bob Williams (student2@surfschool.com)
- Edad: 35 años
- Peso: 80 kg
- Altura: 180 cm
- **Sabe nadar: NO** ⚠️
- Teléfono: +5119876546
- **1 reserva pendiente**

### Test User (test@test.com)
- Edad: 25 años
- Peso: 70 kg
- Altura: 175 cm
- Sabe nadar: Sí
- Teléfono: +5119876547
- **1 reserva confirmada, 1 cancelada**

## ✅ Checklist de Funcionalidades

### Vista de Lista
- [ ] Ver todas las reservas de una clase
- [ ] Ver nombre y email de estudiantes
- [ ] Ver estados con colores
- [ ] Ver solicitudes especiales (truncadas)
- [ ] Botón "Ver Detalles" funcional
- [ ] Acciones rápidas (Confirmar, Cancelar, Marcar Pagado)

### Modal de Detalles
- [ ] Información completa del estudiante
- [ ] Datos físicos (edad, peso, altura)
- [ ] Indicador de natación
- [ ] Lesiones destacadas (si aplica)
- [ ] Estado de reserva con fechas
- [ ] Solicitud especial completa
- [ ] Información de pago detallada
- [ ] ID de transacción visible
- [ ] Detalles de la clase
- [ ] Botones de acción funcionales

### Acciones
- [ ] Confirmar reserva pendiente
- [ ] Marcar pago como recibido
- [ ] Cancelar reserva con confirmación
- [ ] Actualización en tiempo real
- [ ] Estados de carga durante operaciones
- [ ] Mensajes de error si falla

### Estadísticas
- [ ] Capacidad correcta
- [ ] Número de reservas actualizado
- [ ] Plazas disponibles calculadas
- [ ] Ingresos solo de pagos confirmados

## 🎓 Información para Instructores

El sistema proporciona toda la información necesaria para que los instructores preparen las clases:

### Antes de la Clase:
1. Revisar lista de estudiantes confirmados
2. Verificar quiénes saben nadar
3. Leer solicitudes especiales
4. Revisar lesiones o condiciones médicas
5. Preparar equipamiento según peso/altura

### Durante el Check-in:
1. Verificar pagos pendientes
2. Confirmar asistencia
3. Asignar equipamiento apropiado

### Después de la Clase:
1. Marcar clase como completada
2. Procesar pagos pendientes
3. Actualizar estados según corresponda

---

**Última actualización:** 2 de Octubre, 2025
**Versión del Sistema:** 1.0.0
