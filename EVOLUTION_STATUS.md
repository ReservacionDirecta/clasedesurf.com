# ✅ Evolution API - Estado Actual

## Servicios Activos

| Servicio | Estado | Puerto | URL |
|----------|--------|--------|-----|
| Evolution API | ✅ Funcionando | 8080 | http://localhost:8080 |
| PostgreSQL | ✅ Funcionando | 5432 | localhost:5432 |
| Redis | ✅ Funcionando (deshabilitado en config) | 6379 | localhost:6379 |

## Instancia de WhatsApp

- **Nombre**: surfschool
- **ID**: 257e7b56-f7e6-4fc4-96a6-8078a7a1b2fc
- **Estado**: Creada (pendiente de conexión)
- **Token**: 77BC8E0D-249D-4141-8F79-1A82461DF768
- **API Key**: change-this-api-key-for-production

## Próximos Pasos para Conectar WhatsApp

### 1. Obtener el QR Code

Abre tu navegador y ve a:
```
http://localhost:8080/instance/connect/surfschool
```

O usa este comando en PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/instance/qrcode/surfschool" `
  -Method GET `
  -Headers @{ "apikey" = "change-this-api-key-for-production" }
```

### 2. Escanear el QR con WhatsApp

1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración** > **Dispositivos vinculados**
3. Toca **Vincular un dispositivo**
4. Escanea el código QR que aparece en el navegador

### 3. Verificar la Conexión

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/instance/fetchInstances?instanceName=surfschool" `
  -Method GET `
  -Headers @{ "apikey" = "change-this-api-key-for-production" } | 
  ConvertTo-Json -Depth 10
```

Busca que `connectionStatus` sea `"open"` en lugar de `"close"`.

## Comandos Útiles

### Ver logs en tiempo real
```bash
docker compose logs -f evolution-api
```

### Reiniciar Evolution API
```bash
docker compose restart evolution-api
```

### Detener todos los servicios
```bash
docker compose down
```

### Iniciar todos los servicios
```bash
docker compose up -d
```

## Enviar un Mensaje de Prueba

Una vez conectado WhatsApp, prueba enviar un mensaje:

```powershell
$body = @{
    number = "5491112345678"  # Reemplaza con un número real
    text = "¡Hola! Este es un mensaje de prueba desde Evolution API 🏄"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/message/sendText/surfschool" `
  -Method POST `
  -Headers @{ 
    "apikey" = "change-this-api-key-for-production"
    "Content-Type" = "application/json"
  } `
  -Body $body
```

## Integración con tu Backend

Las variables ya están configuradas en `backend/.env`:

```env
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="change-this-api-key-for-production"
EVOLUTION_INSTANCE_NAME="surfschool"
```

### Ejemplo de uso en Node.js

```javascript
const axios = require('axios');

const whatsapp = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    'apikey': process.env.EVOLUTION_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Enviar confirmación de reserva
async function sendBookingConfirmation(phoneNumber, booking) {
  const message = `
🏄 ¡Reserva Confirmada!

📅 Fecha: ${booking.date}
⏰ Hora: ${booking.time}
🏖️ Clase: ${booking.className}
👤 Instructor: ${booking.instructor}

¡Nos vemos en la playa!
  `.trim();

  try {
    const response = await whatsapp.post(
      `/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`,
      {
        number: phoneNumber,
        text: message
      }
    );
    console.log('Mensaje enviado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error enviando mensaje:', error.response?.data || error.message);
    throw error;
  }
}

// Verificar estado de la instancia
async function checkWhatsAppStatus() {
  try {
    const response = await whatsapp.get(
      `/instance/fetchInstances?instanceName=${process.env.EVOLUTION_INSTANCE_NAME}`
    );
    const instance = response.data.value[0];
    return {
      connected: instance.connectionStatus === 'open',
      status: instance.connectionStatus,
      number: instance.number
    };
  } catch (error) {
    console.error('Error verificando estado:', error.message);
    return { connected: false, status: 'error' };
  }
}

module.exports = {
  sendBookingConfirmation,
  checkWhatsAppStatus
};
```

## Notas Importantes

⚠️ **Redis está deshabilitado** temporalmente debido a problemas de conexión. Esto no afecta la funcionalidad básica de Evolution API, pero puede impactar el rendimiento en producción.

✅ **La API está funcionando correctamente** y lista para conectar WhatsApp.

📚 **Documentación completa** disponible en `EVOLUTION_API_SETUP.md`

## Troubleshooting

### Si no puedes conectar WhatsApp
1. Verifica que Evolution API esté corriendo: `docker compose ps`
2. Revisa los logs: `docker compose logs evolution-api`
3. Reinicia el servicio: `docker compose restart evolution-api`

### Si necesitas resetear la instancia
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/instance/logout/surfschool" `
  -Method DELETE `
  -Headers @{ "apikey" = "change-this-api-key-for-production" }
```

Luego vuelve a conectar desde el paso 1.

## Recursos

- [Documentación Evolution API](https://doc.evolution-api.com/)
- [Guía completa de setup](./EVOLUTION_API_SETUP.md)
- [Docker Compose](./docker-compose.yml)
