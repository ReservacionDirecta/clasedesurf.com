# Documento de Requerimientos - Plataforma de Reservas Clase de Surf

## Introducción

La plataforma Clase de Surf, es un sistema integral de gestión de reservas para escuelas de surf que permite a los estudiantes registrarse, reservar clases y proporcionar información personal relevante (edad, peso, altura, lesiones, habilidades de natación, etc.), mientras que los administradores pueden gestionar reservas, pagos y generar reportes. El sistema está diseñado para escalar hacia un marketplace multi-escuela en fases futuras.

## Requerimientos

### Requerimiento 1: Gestión de Usuarios y Autenticación

**Historia de Usuario:** Como estudiante de surf, quiero poder registrarme y acceder a la plataforma de manera segura, para poder reservar clases y gestionar mi perfil.

#### Criterios de Aceptación

1. CUANDO un usuario nuevo accede a la plataforma ENTONCES el sistema DEBERÁ mostrar opciones de registro con email y contraseña
2. CUANDO un usuario se registra ENTONCES el sistema DEBERÁ validar que el email sea único y válido
3. CUANDO un usuario inicia sesión ENTONCES el sistema DEBERÁ autenticar las credenciales y crear una sesión segura
4. CUANDO un usuario está autenticado ENTONCES el sistema DEBERÁ mantener la sesión activa durante la navegación
5. CUANDO un usuario cierra sesión ENTONCES el sistema DEBERÁ invalidar la sesión de manera segura

### Requerimiento 2: Gestión de Perfil de Usuario

**Historia de Usuario:** Como estudiante de surf, quiero completar mi perfil con información personal relevante, para que la escuela pueda brindarme un servicio personalizado y seguro.

#### Criterios de Aceptación

1. CUANDO un usuario accede a su perfil ENTONCES el sistema DEBERÁ permitir ingresar edad, peso, altura, lesiones previas y habilidades de natación
2. CUANDO un usuario guarda su perfil ENTONCES el sistema DEBERÁ validar que los datos numéricos estén en rangos apropiados
3. SI un usuario tiene lesiones previas ENTONCES el sistema DEBERÁ permitir describir las lesiones en texto libre
4. CUANDO un usuario actualiza su perfil ENTONCES el sistema DEBERÁ guardar los cambios y mostrar confirmación
5. CUANDO un usuario visualiza su perfil ENTONCES el sistema DEBERÁ mostrar toda la información previamente guardada

### Requerimiento 3: Visualización y Selección de Clases

**Historia de Usuario:** Como estudiante de surf, quiero ver las clases disponibles en un calendario intuitivo, para poder seleccionar la clase que mejor se adapte a mi horario.

#### Criterios de Aceptación

1. CUANDO un usuario accede al listado de clases ENTONCES el sistema DEBERÁ mostrar todas las clases disponibles con fecha, hora y capacidad
2. CUANDO un usuario selecciona una fecha ENTONCES el sistema DEBERÁ filtrar las clases disponibles para esa fecha
3. SI una clase está llena ENTONCES el sistema DEBERÁ mostrarla como no disponible para reserva
4. CUANDO un usuario ve una clase ENTONCES el sistema DEBERÁ mostrar información de la escuela, ubicación y plazas disponibles
5. CUANDO un usuario selecciona una clase disponible ENTONCES el sistema DEBERÁ permitir proceder con la reserva

### Requerimiento 4: Proceso de Reserva

**Historia de Usuario:** Como estudiante de surf, quiero poder reservar una clase y agregar requerimientos especiales, para asegurar que la escuela esté preparada para mis necesidades específicas.

#### Criterios de Aceptación

1. CUANDO un usuario inicia una reserva ENTONCES el sistema DEBERÁ mostrar un formulario con sus datos de perfil pre-completados
2. CUANDO un usuario completa el formulario de reserva ENTONCES el sistema DEBERÁ permitir agregar requerimientos especiales en texto libre
3. CUANDO un usuario confirma la reserva ENTONCES el sistema DEBERÁ crear la reserva con estado "pending"
4. SI la clase alcanza su capacidad máxima ENTONCES el sistema DEBERÁ prevenir nuevas reservas
5. CUANDO se crea una reserva ENTONCES el sistema DEBERÁ mostrar instrucciones de pago y detalles de la reserva

### Requerimiento 5: Gestión de Pagos

**Historia de Usuario:** Como estudiante de surf, quiero poder realizar el pago de mi reserva de manera clara y segura, para confirmar mi participación en la clase.

#### Criterios de Aceptación

1. CUANDO se crea una reserva ENTONCES el sistema DEBERÁ generar un registro de pago con estado "unpaid"
2. CUANDO un usuario realiza el pago ENTONCES el sistema DEBERÁ permitir registrar el pago manualmente por el administrador
3. CUANDO se confirma un pago ENTONCES el sistema DEBERÁ cambiar el estado de la reserva a "paid"
4. CUANDO un pago es registrado ENTONCES el sistema DEBERÁ mostrar el monto, fecha y estado del pago
5. SI un pago no se realiza en tiempo determinado ENTONCES el sistema DEBERÁ permitir cancelar la reserva

### Requerimiento 6: Panel de Usuario

**Historia de Usuario:** Como estudiante de surf, quiero ver el historial de mis reservas y su estado actual, para hacer seguimiento de mis clases programadas y pasadas.

#### Criterios de Aceptación

1. CUANDO un usuario accede a su panel ENTONCES el sistema DEBERÁ mostrar todas sus reservas ordenadas por fecha
2. CUANDO un usuario ve una reserva ENTONCES el sistema DEBERÁ mostrar fecha, hora, escuela, estado y detalles de pago
3. SI una reserva está pendiente de pago ENTONCES el sistema DEBERÁ mostrar opciones para completar el pago
4. CUANDO un usuario tiene reservas futuras ENTONCES el sistema DEBERÁ destacarlas visualmente
5. CUANDO un usuario ve reservas pasadas ENTONCES el sistema DEBERÁ mostrar el historial completo con estados finales

### Requerimiento 7: Dashboard Administrativo

**Historia de Usuario:** Como administrador de escuela de surf, quiero gestionar todas las reservas y pagos desde un panel centralizado, para tener control completo sobre las operaciones de mi escuela.

#### Criterios de Aceptación

1. CUANDO un administrador accede al dashboard ENTONCES el sistema DEBERÁ mostrar un calendario con todas las reservas
2. CUANDO un administrador ve el calendario ENTONCES el sistema DEBERÁ usar colores diferentes para estados (pendiente, pagada, cancelada)
3. CUANDO un administrador selecciona una reserva ENTONCES el sistema DEBERÁ mostrar detalles completos del estudiante y la reserva
4. CUANDO un administrador confirma un pago ENTONCES el sistema DEBERÁ permitir cambiar el estado de "pending" a "paid"
5. CUANDO un administrador cancela una reserva ENTONCES el sistema DEBERÁ cambiar el estado a "canceled" y liberar la plaza

### Requerimiento 8: Gestión de Escuelas y Clases

**Historia de Usuario:** Como administrador del sistema, quiero gestionar las escuelas registradas y sus clases programadas, para mantener la información actualizada en la plataforma.

#### Criterios de Aceptación

1. CUANDO se registra una escuela ENTONCES el sistema DEBERÁ almacenar nombre, ubicación y datos de contacto
2. CUANDO una escuela programa una clase ENTONCES el sistema DEBERÁ permitir definir fecha, hora, capacidad máxima y precio
3. CUANDO se crea una clase ENTONCES el sistema DEBERÁ validar que la fecha sea futura y la capacidad sea mayor a cero
4. CUANDO se modifica una clase ENTONCES el sistema DEBERÁ verificar que no afecte reservas existentes
5. SI una clase tiene reservas ENTONCES el sistema DEBERÁ prevenir su eliminación

### Requerimiento 9: Reportes y Estadísticas

**Historia de Usuario:** Como administrador de escuela, quiero generar reportes de ventas y estadísticas de mis clases, para analizar el rendimiento de mi negocio.

#### Criterios de Aceptación

1. CUANDO un administrador solicita un reporte ENTONCES el sistema DEBERÁ permitir filtrar por rango de fechas
2. CUANDO se genera un reporte de pagos ENTONCES el sistema DEBERÁ mostrar ingresos totales, reservas pagadas y pendientes
3. CUANDO se genera un reporte de clases ENTONCES el sistema DEBERÁ mostrar ocupación promedio y clases más populares
4. CUANDO un administrador exporta reportes ENTONCES el sistema DEBERÁ generar archivos en formato CSV
5. CUANDO se visualizan estadísticas ENTONCES el sistema DEBERÁ mostrar gráficos de tendencias y métricas clave

### Requerimiento 10: Validaciones y Seguridad

**Historia de Usuario:** Como usuario del sistema, quiero que mis datos estén protegidos y que el sistema valide correctamente la información, para garantizar la seguridad y confiabilidad de la plataforma.

#### Criterios de Aceptación

1. CUANDO un usuario ingresa datos ENTONCES el sistema DEBERÁ validar formatos y rangos apropiados
2. CUANDO se accede a datos sensibles ENTONCES el sistema DEBERÁ verificar permisos de usuario
3. SI un usuario intenta acceder a recursos no autorizados ENTONCES el sistema DEBERÁ denegar el acceso
4. CUANDO se almacenan contraseñas ENTONCES el sistema DEBERÁ usar hash seguro
5. CUANDO ocurre un error ENTONCES el sistema DEBERÁ mostrar mensajes informativos sin exponer información sensible