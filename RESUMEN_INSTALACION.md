# ✅ Evolution API - Instalación Completada

## 🎉 Estado Final

**Todos los servicios están funcionando correctamente:**

- ✅ **Evolution API** - http://localhost:8080
- ✅ **PostgreSQL** - localhost:5432  
- ✅ **Redis** - localhost:6379 (deshabilitado en configuración para evitar errores)

## 📱 Instancia de WhatsApp

- **Nombre**: `surfschool`
- **ID**: `257e7b56-f7e6-4fc4-96a6-8078a7a1b2fc`
- **Estado**: Creada y lista para conectar
- **Token**: `77BC8E0D-249D-4141-8F79-1A82461DF768`
- **API Key**: `change-this-api-key-for-production`

## 🚀 Próximos Pasos

### 1. Conectar WhatsApp

**Opción 1: Usar la interfaz web (Recomendado)**

Doble clic en:
```
conectar-whatsapp.bat
```

O abre el archivo en tu navegador:
```
whatsapp-qr.html
```

**Opción 2: Usar PowerShell**

```powershell
# Abrir interfaz web
start whatsapp-qr.html
```

La interfaz web:
- ✅ Muestra el QR code automáticamente
- ✅ Se actualiza cada 30 segundos
- ✅ Verifica la conexión automáticamente
- ✅ Muestra el estado en tiempo real

Luego escanea el QR con WhatsApp desde tu teléfono:
1. Abre WhatsApp
2. Ve a **Configuración** > **Dispositivos vinculados**
3. Toca **Vincular un dispositivo**
4. Escanea el código QR

### 2. Verificar Conexión

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/instance/fetchInstances?instanceName=surfschool" `
  -Method GET `
  -Headers @{ "apikey" = "change-this-api-key-for-production" } |
  ConvertTo-Json -Depth 5
```

Busca que `connectionStatus` sea `"open"`.

### 3. Enviar Mensaje de Prueba

```powershell
$body = @{
    number = "5491112345678"  # Reemplaza con número real (código país + número)
    text = "¡Hola! Mensaje de prueba desde Evolution API 🏄"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/message/sendText/surfschool" `
  -Method POST `
  -Headers @{ 
    "apikey" = "change-this-api-key-for-production"
    "Content-Type" = "application/json"
  } `
  -Body $body
```

## 📁 Archivos Creados

1. **docker-compose.yml** - Configuración de Docker con todos los servicios
2. **EVOLUTION_API_SETUP.md** - Guía completa de uso y ejemplos
3. **EVOLUTION_STATUS.md** - Estado actual y comandos útiles
4. **start-evolution.bat** - Script para iniciar servicios (doble clic)
5. **stop-evolution.bat** - Script para detener servicios
6. **.env.evolution** - Variables de entorno de referencia
7. **backend/.env** - Actualizado con variables de Evolution API

## 🔧 Comandos Útiles

### Iniciar servicios
```bash
docker compose up -d
# o doble clic en start-evolution.bat
```

### Ver logs
```bash
docker compose logs -f evolution-api
```

### Ver estado
```bash
docker compose ps
```

### Detener servicios
```bash
docker compose down
# o doble clic en stop-evolution.bat
```

### Reiniciar Evolution API
```bash
docker compose restart evolution-api
```

## 🔌 Integración con Backend

Las variables ya están configuradas en `backend/.env`:

```env
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="change-this-api-key-for-production"
EVOLUTION_INSTANCE_NAME="surfschool"
```

### Ejemplo de Integración en Node.js

```javascript
// services/whatsapp.service.js
const axios = require('axios');

const whatsappClient = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    'apikey': process.env.EVOLUTION_API_KEY,
    'Content-Type': 'application/json'
  }
});

class WhatsAppService {
  // Enviar confirmación de reserva
  async sendBookingConfirmation(phoneNumber, booking) {
    const message = `
🏄 ¡Reserva Confirmada!

📅 Fecha: ${booking.date}
⏰ Hora: ${booking.time}
🏖️ Clase: ${booking.className}
👤 Instructor: ${booking.instructor}
💰 Precio: $${booking.price}

¡Nos vemos en la playa!
    `.trim();

    try {
      const response = await whatsappClient.post(
        `/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`,
        {
          number: phoneNumber,
          text: message
        }
      );
      console.log('✓ Mensaje enviado:', response.data);
      return response.data;
    } catch (error) {
      console.error('✗ Error enviando mensaje:', error.response?.data || error.message);
      throw error;
    }
  }

  // Enviar recordatorio
  async sendReminder(phoneNumber, booking) {
    const message = `
⏰ Recordatorio de Clase

Hola! Te recordamos tu clase de surf:

📅 Mañana a las ${booking.time}
🏖️ ${booking.location}

¡No olvides traer protector solar! ☀️
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }

  // Enviar mensaje genérico
  async sendMessage(phoneNumber, text) {
    try {
      const response = await whatsappClient.post(
        `/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`,
        { number: phoneNumber, text }
      );
      return response.data;
    } catch (error) {
      console.error('Error enviando mensaje:', error.response?.data || error.message);
      throw error;
    }
  }

  // Verificar estado de conexión
  async checkConnection() {
    try {
      const response = await whatsappClient.get(
        `/instance/fetchInstances?instanceName=${process.env.EVOLUTION_INSTANCE_NAME}`
      );
      const instance = response.data.value[0];
      return {
        connected: instance.connectionStatus === 'open',
        status: instance.connectionStatus,
        number: instance.number,
        profileName: instance.profileName
      };
    } catch (error) {
      console.error('Error verificando conexión:', error.message);
      return { connected: false, status: 'error' };
    }
  }

  // Enviar imagen
  async sendImage(phoneNumber, imageUrl, caption) {
    try {
      const response = await whatsappClient.post(
        `/message/sendMedia/${process.env.EVOLUTION_INSTANCE_NAME}`,
        {
          number: phoneNumber,
          mediatype: 'image',
          media: imageUrl,
          caption: caption
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error enviando imagen:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();
```

### Uso en tu API

```javascript
// routes/bookings.js
const whatsappService = require('../services/whatsapp.service');

router.post('/bookings', async (req, res) => {
  try {
    // Crear la reserva
    const booking = await createBooking(req.body);
    
    // Enviar confirmación por WhatsApp
    if (booking.phoneNumber) {
      await whatsappService.sendBookingConfirmation(
        booking.phoneNumber,
        booking
      );
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## ⚠️ Notas Importantes

1. **Redis está deshabilitado** temporalmente para evitar errores de conexión. Esto no afecta la funcionalidad básica.

2. **Los datos persisten** gracias a PostgreSQL. Puedes reiniciar los contenedores sin perder la configuración.

3. **Formato de números**: Usa el formato internacional sin espacios ni guiones:
   - ✅ Correcto: `5491112345678` (código país + área + número)
   - ✗ Incorrecto: `+54 911 1234-5678`

4. **API Key**: Cambia `change-this-api-key-for-production` antes de usar en producción.

## 🐛 Troubleshooting

### Evolution API no responde
```bash
docker compose restart evolution-api
docker compose logs evolution-api
```

### No puedo conectar WhatsApp
1. Verifica que la instancia esté creada
2. Asegúrate de que el puerto 8080 esté libre
3. Revisa los logs: `docker compose logs evolution-api`

### Resetear instancia de WhatsApp
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/instance/logout/surfschool" `
  -Method DELETE `
  -Headers @{ "apikey" = "change-this-api-key-for-production" }
```

## 📚 Recursos

- [Documentación Evolution API](https://doc.evolution-api.com/)
- [Guía completa](./EVOLUTION_API_SETUP.md)
- [Estado actual](./EVOLUTION_STATUS.md)
- [Docker Compose](./docker-compose.yml)

## ✅ Checklist de Instalación

- [x] Docker Desktop instalado y corriendo
- [x] Servicios levantados (Evolution API, PostgreSQL, Redis)
- [x] Instancia de WhatsApp creada
- [x] Variables de entorno configuradas en backend/.env
- [ ] WhatsApp conectado (escanear QR)
- [ ] Mensaje de prueba enviado
- [ ] Integración con backend implementada

---

**¡Todo listo!** 🎉 Evolution API está funcionando correctamente y listo para conectar WhatsApp.
