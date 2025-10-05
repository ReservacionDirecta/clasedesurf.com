# Guía de Gestión de Pagos con Vouchers

## 📋 Descripción

La plataforma ahora permite a los administradores de escuelas registrar pagos recibidos y adjuntar imágenes de vouchers para confirmar las transacciones.

## ✨ Funcionalidades Implementadas

### Backend

1. **Campos Agregados al Modelo Payment:**
   - `voucherImage`: URL de la imagen del voucher
   - `voucherNotes`: Notas adicionales sobre el pago

2. **Permisos Actualizados:**
   - `SCHOOL_ADMIN` ahora puede actualizar pagos (antes solo ADMIN)
   - Endpoint `/payments/:id` acepta los nuevos campos de voucher

### Frontend

1. **Componente PaymentVoucherModal:**
   - Modal para registrar información de pago
   - Campos para método de pago, ID de transacción, URL de voucher y notas
   - Vista previa de imagen del voucher
   - Actualización del estado del pago (UNPAID, PAID, REFUNDED)

2. **Integración en Página de Reservas:**
   - Botón "Registrar Pago" en cada reserva
   - Acceso rápido desde la tabla de reservas

## 🚀 Cómo Usar

### Para Administradores de Escuela:

1. **Acceder a las Reservas:**
   ```
   Dashboard Escuela → Clases → [Seleccionar Clase] → Ver Reservas
   ```

2. **Registrar un Pago:**
   - Click en "Registrar Pago" en la fila de la reserva
   - Completar el formulario:
     - **Método de Pago**: Transferencia, Efectivo, Tarjeta, Yape, Plin, Otro
     - **ID de Transacción**: Número de operación o referencia
     - **URL de Voucher**: Link a la imagen del comprobante
     - **Notas**: Información adicional
     - **Estado**: Pendiente, Pagado, Reembolsado
   - Click en "Guardar Pago"

3. **Subir Imagen de Voucher:**
   
   Opciones para obtener URL de imagen:
   
   **Opción 1: Imgur (Recomendado)**
   - Ir a https://imgur.com/upload
   - Subir la imagen del voucher
   - Click derecho en la imagen → "Copiar dirección de imagen"
   - Pegar la URL en el campo "URL de Imagen del Voucher"

   **Opción 2: Cloudinary**
   - Crear cuenta gratuita en https://cloudinary.com
   - Subir imagen
   - Copiar URL pública

   **Opción 3: Google Drive (Público)**
   - Subir imagen a Google Drive
   - Click derecho → Compartir → Cambiar a "Cualquiera con el enlace"
   - Copiar enlace

## 📊 Flujo de Trabajo Recomendado

1. **Cliente realiza pago** (transferencia, Yape, etc.)
2. **Cliente envía voucher** (WhatsApp, email, etc.)
3. **Escuela sube voucher** a servicio de imágenes (Imgur)
4. **Escuela registra pago** en la plataforma con URL del voucher
5. **Sistema actualiza** estado de reserva automáticamente

## 🔒 Seguridad

- Solo ADMIN y SCHOOL_ADMIN pueden actualizar pagos
- Todas las operaciones requieren autenticación JWT
- URLs de vouchers se validan en el backend

## 🛠️ Campos del Formulario

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Método de Pago | Select | Sí | Forma de pago utilizada |
| ID de Transacción | Text | No | Número de operación |
| URL de Voucher | URL | No | Link a imagen del comprobante |
| Notas | Textarea | No | Información adicional |
| Estado | Select | Sí | Estado del pago |

## 📝 Métodos de Pago Soportados

- Transferencia Bancaria
- Efectivo
- Tarjeta
- Yape
- Plin
- Otro

## 🎯 Estados de Pago

- **UNPAID** (Pendiente): Pago no recibido
- **PAID** (Pagado): Pago confirmado
- **REFUNDED** (Reembolsado): Pago devuelto

## 🔄 Sincronización Automática

Cuando se actualiza el estado del pago:
- `PAID` → Reserva cambia a `PAID`
- `REFUNDED` → Reserva cambia a `CANCELED`
- `UNPAID` → Reserva cambia a `CONFIRMED`

## 💡 Tips

1. **Organización**: Usa el campo "Notas" para detalles importantes
2. **Verificación**: Siempre revisa la vista previa del voucher antes de guardar
3. **Respaldo**: Guarda copias de los vouchers en tu sistema local
4. **Nomenclatura**: Usa IDs de transacción claros y únicos

## 🐛 Troubleshooting

**Problema**: La imagen del voucher no se muestra
- **Solución**: Verifica que la URL sea pública y accesible
- **Solución**: Usa servicios como Imgur que permiten enlaces directos

**Problema**: No puedo actualizar el pago
- **Solución**: Verifica que tengas rol SCHOOL_ADMIN o ADMIN
- **Solución**: Verifica que el backend esté corriendo

**Problema**: El estado de la reserva no se actualiza
- **Solución**: Recarga la página
- **Solución**: Verifica la consola del navegador para errores

## 📞 Soporte

Para problemas o sugerencias, contacta al equipo de desarrollo.
