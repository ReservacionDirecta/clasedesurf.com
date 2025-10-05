# Documento de Requerimientos - Integración de Notificaciones WhatsApp

## Introducción

La integración de notificaciones WhatsApp mediante Evolution API permitirá a la plataforma Clase de Surf enviar notificaciones automáticas a los estudiantes sobre el estado de sus reservas, recordatorios de clases y confirmaciones de pago a través de WhatsApp, mejorando la comunicación y experiencia del usuario.

## Requerimientos

### Requerimiento 1: Configuración de Evolution API

**Historia de Usuario:** Como administrador del sistema, quiero tener Evolution API dockerizado y configurado, para poder enviar mensajes de WhatsApp desde la plataforma.

#### Criterios de Aceptación

1. CUANDO se inicia el sistema ENTONCES Evolution API DEBERÁ ejecutarse en un contenedor Docker
2. CUANDO Evolution API se inicia ENTONCES el sistema DEBERÁ exponer el puerto 8080 para comunicación
3. CUANDO se configura Evolution API ENTONCES el sistema DEBERÁ usar una API key segura para autenticación
4. CUANDO Evolution API está activo ENTONCES el sistema DEBERÁ permitir crear y gestionar instancias de WhatsApp
5. CUANDO se reinicia el sistema ENTONCES Evolution API DEBERÁ mantener las instancias configuradas

### Requerimiento 2: Gestión de Instancias WhatsApp

**Historia de Usuario:** Como administrador del sistema, quiero poder conectar cuentas de WhatsApp Business, para enviar notificaciones desde números oficiales de la escuela.

#### Criterios de Aceptación

1. CUANDO un administrador crea una instancia ENTONCES el sistema DEBERÁ generar un código QR para vincular WhatsApp
2. CUANDO se escanea el código QR ENTONCES el sistema DEBERÁ confirmar la conexión exitosa
3. CUANDO una instancia está conectada ENTONCES el sistema DEBERÁ mostrar el estado como "connected"
4. SI una instancia se desconecta ENTONCES el sistema DEBERÁ notificar al administrador
5. CUANDO se elimina una instancia ENTONCES el sistema DEBERÁ desconectar la sesión de WhatsApp

### Requerimiento 3: Notificaciones de Reserva

**Historia de Usuario:** Como estudiante de surf, quiero recibir una notificación por WhatsApp cuando creo una reserva, para tener confirmación inmediata de mi clase.

#### Criterios de Aceptación

1. CUANDO un estudiante crea una reserva ENTONCES el sistema DEBERÁ enviar un mensaje de WhatsApp con los detalles
2. CUANDO se envía la notificación ENTONCES el mensaje DEBERÁ incluir fecha, hora, ubicación y precio de la clase
3. SI el estudiante no tiene número de teléfono ENTONCES el sistema DEBERÁ omitir la notificación sin fallar
4. CUANDO el envío falla ENTONCES el sistema DEBERÁ registrar el error pero no bloquear la reserva
5. CUANDO se envía el mensaje ENTONCES el sistema DEBERÁ guardar el registro del envío

### Requerimiento 4: Notificaciones de Pago

**Historia de Usuario:** Como estudiante de surf, quiero recibir confirmación por WhatsApp cuando mi pago es procesado, para tener evidencia de mi transacción.

#### Criterios de Aceptación

1. CUANDO un pago es confirmado ENTONCES el sistema DEBERÁ enviar un mensaje de WhatsApp al estudiante
2. CUANDO se envía la notificación ENTONCES el mensaje DEBERÁ incluir monto pagado, método de pago y número de reserva
3. CUANDO el pago es exitoso ENTONCES el sistema DEBERÁ incluir instrucciones para el día de la clase
4. SI el envío falla ENTONCES el sistema DEBERÁ reintentar hasta 3 veces
5. CUANDO se completa el envío ENTONCES el sistema DEBERÁ actualizar el estado de notificación

### Requerimiento 5: Recordatorios de Clase

**Historia de Usuario:** Como estudiante de surf, quiero recibir un recordatorio por WhatsApp 24 horas antes de mi clase, para no olvidar mi reserva.

#### Criterios de Aceptación

1. CUANDO faltan 24 horas para una clase ENTONCES el sistema DEBERÁ enviar un recordatorio automático
2. CUANDO se envía el recordatorio ENTONCES el mensaje DEBERÁ incluir hora, ubicación y recomendaciones
3. SI la reserva está cancelada ENTONCES el sistema NO DEBERÁ enviar el recordatorio
4. CUANDO se envía el recordatorio ENTONCES el sistema DEBERÁ marcar la notificación como enviada
5. SI el envío falla ENTONCES el sistema DEBERÁ registrar el error para revisión manual

### Requerimiento 6: Notificaciones de Cancelación

**Historia de Usuario:** Como estudiante de surf, quiero recibir notificación por WhatsApp si mi reserva es cancelada, para estar informado de cambios.

#### Criterios de Aceptación

1. CUANDO una reserva es cancelada ENTONCES el sistema DEBERÁ enviar un mensaje de WhatsApp al estudiante
2. CUANDO se envía la notificación ENTONCES el mensaje DEBERÁ incluir el motivo de cancelación si está disponible
3. SI la cancelación incluye reembolso ENTONCES el mensaje DEBERÁ indicar el proceso de reembolso
4. CUANDO se cancela por el administrador ENTONCES el mensaje DEBERÁ incluir información de contacto
5. CUANDO se envía el mensaje ENTONCES el sistema DEBERÁ registrar la notificación de cancelación

### Requerimiento 7: Plantillas de Mensajes

**Historia de Usuario:** Como administrador del sistema, quiero poder personalizar las plantillas de mensajes de WhatsApp, para mantener una comunicación consistente con la marca.

#### Criterios de Aceptación

1. CUANDO se configura el sistema ENTONCES el administrador DEBERÁ poder definir plantillas de mensajes
2. CUANDO se crea una plantilla ENTONCES el sistema DEBERÁ permitir usar variables dinámicas (nombre, fecha, etc.)
3. SI se actualiza una plantilla ENTONCES los nuevos mensajes DEBERÁN usar la versión actualizada
4. CUANDO se envía un mensaje ENTONCES el sistema DEBERÁ reemplazar las variables con datos reales
5. CUANDO se visualizan plantillas ENTONCES el sistema DEBERÁ mostrar una vista previa con datos de ejemplo

### Requerimiento 8: Registro y Monitoreo

**Historia de Usuario:** Como administrador del sistema, quiero ver el historial de mensajes enviados y su estado, para monitorear la comunicación con los estudiantes.

#### Criterios de Aceptación

1. CUANDO se envía un mensaje ENTONCES el sistema DEBERÁ registrar fecha, destinatario, tipo y estado
2. CUANDO un administrador consulta el historial ENTONCES el sistema DEBERÁ mostrar todos los mensajes enviados
3. SI un mensaje falla ENTONCES el sistema DEBERÁ mostrar el motivo del error
4. CUANDO se filtra el historial ENTONCES el sistema DEBERÁ permitir filtrar por fecha, tipo y estado
5. CUANDO se exporta el historial ENTONCES el sistema DEBERÁ generar un archivo CSV con los registros

### Requerimiento 9: Configuración y Seguridad

**Historia de Usuario:** Como administrador del sistema, quiero que la integración con Evolution API sea segura y configurable, para proteger los datos de los usuarios.

#### Criterios de Aceptación

1. CUANDO se configura Evolution API ENTONCES las credenciales DEBERÁN almacenarse en variables de entorno
2. CUANDO se comunica con Evolution API ENTONCES todas las peticiones DEBERÁN incluir autenticación
3. SI las credenciales son inválidas ENTONCES el sistema DEBERÁ rechazar las peticiones
4. CUANDO se almacenan números de teléfono ENTONCES el sistema DEBERÁ validar el formato internacional
5. CUANDO se accede a la configuración ENTONCES solo usuarios con rol ADMIN DEBERÁN tener acceso

### Requerimiento 10: Manejo de Errores y Reintentos

**Historia de Usuario:** Como desarrollador del sistema, quiero que el sistema maneje errores de envío de manera robusta, para garantizar que las notificaciones importantes lleguen a los usuarios.

#### Criterios de Aceptación

1. CUANDO un envío falla ENTONCES el sistema DEBERÁ implementar reintentos con backoff exponencial
2. SI Evolution API no está disponible ENTONCES el sistema DEBERÁ encolar los mensajes para envío posterior
3. CUANDO se alcanza el límite de reintentos ENTONCES el sistema DEBERÁ notificar al administrador
4. SI un número es inválido ENTONCES el sistema DEBERÁ marcar el mensaje como fallido sin reintentar
5. CUANDO se recupera la conexión ENTONCES el sistema DEBERÁ procesar los mensajes encolados
