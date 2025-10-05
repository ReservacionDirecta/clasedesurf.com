# Evolution API - Configuración Local con Docker

## Requisitos Previos
- Docker Desktop instalado y ejecutándose
- Puerto 8080 disponible (Evolution API)
- Puerto 5432 disponible (PostgreSQL)
- Puerto 6379 disponible (Redis)

## Inicio Rápido

### 1. Levantar los servicios
```bash
docker-compose up -d
```

### 2. Verificar que los contenedores están corriendo
```bash
docker-compose ps
```

Deberías ver 3 servicios activos:
- `evolution-api` (puerto 8080)
- `surfschool-postgres` (puerto 5432)
- `surfschool-redis` (puerto 6379)

### 3. Ver los logs de Evolution API
```bash
docker-compose logs -f evolution-api
```

### 4. Acceder a la API
La API estará disponible en: `http://localhost:8080`

## Configuración

### API Key
Por defecto, el API Key es: `change-this-api-key-for-production`

**IMPORTANTE:** Cambia este valor en el archivo `docker-compose.yml` antes de usar en producción.

### Endpoints Principales

#### Crear una instancia de WhatsApp
```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: change-this-api-key-for-production" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "surfschool",
    "qrcode": true
  }'
```

#### Obtener QR Code
```bash
curl -X GET http://localhost:8080/instance/connect/surfschool \
  -H "apikey: change-this-api-key-for-production"
```

#### Listar instancias
```bash
curl -X GET http://localhost:8080/instance/fetchInstances \
  -H "apikey: change-this-api-key-for-production"
```

#### Enviar mensaje
```bash
curl -X POST http://localhost:8080/message/sendText/surfschool \
  -H "apikey: change-this-api-key-for-production" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5491112345678",
    "text": "Hola desde Evolution API!"
  }'
```

## Integración con tu Backend

### Actualizar backend/.env
Agrega estas variables a tu archivo `backend/.env`:

```env
# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=change-this-api-key-for-production
EVOLUTION_INSTANCE_NAME=surfschool
```

### Ejemplo de integración en Node.js
```javascript
const axios = require('axios');

const evolutionAPI = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    'apikey': process.env.EVOLUTION_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Enviar mensaje de confirmación de reserva
async function sendBookingConfirmation(phoneNumber, bookingDetails) {
  try {
    const response = await evolutionAPI.post(
      `/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`,
      {
        number: phoneNumber,
        text: `¡Reserva confirmada! 🏄\n\nFecha: ${bookingDetails.date}\nHora: ${bookingDetails.time}\nClase: ${bookingDetails.className}`
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}
```

## Comandos Útiles

### Detener los servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (CUIDADO: borra todos los datos)
```bash
docker-compose down -v
```

### Reiniciar Evolution API
```bash
docker-compose restart evolution-api
```

### Ver logs en tiempo real
```bash
docker-compose logs -f
```

### Acceder al contenedor de Evolution API
```bash
docker exec -it evolution-api sh
```

## Webhooks (Opcional)

Si quieres recibir eventos de WhatsApp en tu backend, configura un webhook:

```bash
curl -X POST http://localhost:8080/webhook/set/surfschool \
  -H "apikey: change-this-api-key-for-production" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://host.docker.internal:4000/api/webhooks/whatsapp",
    "webhook_by_events": true,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "CONNECTION_UPDATE"
    ]
  }'
```

**Nota:** Usa `host.docker.internal` en lugar de `localhost` para que el contenedor pueda acceder a tu backend local.

## Troubleshooting

### Puerto 8080 ya en uso
Cambia el puerto en `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Usa 8081 en lugar de 8080
```

### No se puede conectar a la base de datos
Verifica que PostgreSQL esté corriendo:
```bash
docker-compose ps postgres
```

### Resetear instancia de WhatsApp
```bash
curl -X DELETE http://localhost:8080/instance/logout/surfschool \
  -H "apikey: change-this-api-key-for-production"
```

## Documentación Oficial
- Evolution API: https://doc.evolution-api.com/
- Docker: https://docs.docker.com/

## Seguridad

⚠️ **IMPORTANTE para Producción:**
1. Cambia el `AUTHENTICATION_API_KEY`
2. Usa variables de entorno seguras
3. Configura HTTPS con un reverse proxy (nginx/traefik)
4. Restringe el acceso a los puertos de base de datos
5. Usa contraseñas fuertes para PostgreSQL
