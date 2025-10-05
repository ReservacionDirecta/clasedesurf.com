# 🔧 Solución: Obtener QR Code de WhatsApp

## Problema Identificado

Evolution API v2.2.3 tiene un comportamiento específico para generar QR codes. El endpoint `/instance/connect/` devuelve `{"count": 0}` cuando la instancia está en proceso de conexión.

## ✅ Solución 1: Usar el Manager Web de Evolution API (Recomendado)

Evolution API incluye un dashboard web integrado para gestionar instancias.

### Acceder al Manager:

1. Abre tu navegador en:
```
http://localhost:8080/manager
```

2. Ingresa el API Key cuando te lo pida:
```
change-this-api-key-for-production
```

3. Busca la instancia `surfschool` en la lista

4. Haz clic en el botón **"Connect"** o **"QR Code"**

5. Escanea el QR que aparece con WhatsApp

## ✅ Solución 2: Usar curl directamente

```powershell
# PowerShell
curl -X GET "http://localhost:8080/instance/connect/surfschool" `
  -H "apikey: change-this-api-key-for-production"
```

Si devuelve `{"count": 0}`, espera 10 segundos y vuelve a intentar.

## ✅ Solución 3: Reiniciar Evolution API

A veces Evolution API necesita un reinicio para generar QR correctamente:

```bash
docker compose restart evolution-api
```

Luego espera 30 segundos y vuelve a intentar obtener el QR.

## ✅ Solución 4: Usar Pairing Code (Alternativa)

Si el QR no funciona, Evolution API puede generar un código de emparejamiento:

```powershell
$body = '{"instanceName":"surfschool","integration":"WHATSAPP-BAILEYS","number":"TU_NUMERO_CON_CODIGO_PAIS"}'

Invoke-RestMethod -Uri "http://localhost:8080/instance/create" `
  -Method POST `
  -Headers @{ 
    "apikey" = "change-this-api-key-for-production"
    "Content-Type" = "application/json"
  } `
  -Body $body
```

Reemplaza `TU_NUMERO_CON_CODIGO_PAIS` con tu número de WhatsApp (ej: `5491112345678`).

## 🔍 Verificar Estado de la Instancia

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/instance/connectionState/surfschool" `
  -Method GET `
  -Headers @{ "apikey" = "change-this-api-key-for-production" }
```

Estados posibles:
- `connecting` - Intentando conectar (esperando QR)
- `open` - Conectado exitosamente
- `close` - Desconectado

## 📱 Método Manual (Más Confiable)

1. **Accede al Manager Web:**
   ```
   http://localhost:8080/manager
   ```

2. **API Key:**
   ```
   change-this-api-key-for-production
   ```

3. **Encuentra tu instancia** `surfschool` en la lista

4. **Haz clic en "Connect"** o el ícono de QR

5. **Escanea con WhatsApp:**
   - Abre WhatsApp en tu teléfono
   - Ve a Configuración > Dispositivos vinculados
   - Toca "Vincular un dispositivo"
   - Escanea el QR

## ⚠️ Notas Importantes

1. **El QR expira en 30 segundos** - Si expira, solicita uno nuevo

2. **La instancia debe estar en estado "connecting"** para generar QR

3. **Solo un QR activo a la vez** - Si solicitas múltiples QR, solo el último es válido

4. **Después de escanear** el estado cambiará a "open"

## 🐛 Troubleshooting

### El QR no aparece
```bash
# Reiniciar Evolution API
docker compose restart evolution-api

# Esperar 30 segundos
# Volver a intentar
```

### Error 404 en endpoints
Verifica que estés usando la versión correcta de la API. Evolution API v2.2.3 puede tener endpoints diferentes a versiones anteriores.

### La instancia no conecta
```powershell
# Eliminar y recrear la instancia
Invoke-RestMethod -Uri "http://localhost:8080/instance/delete/surfschool" `
  -Method DELETE `
  -Headers @{ "apikey" = "change-this-api-key-for-production" }

# Crear nueva instancia
$body = '{"instanceName":"surfschool","integration":"WHATSAPP-BAILEYS"}'
Invoke-RestMethod -Uri "http://localhost:8080/instance/create" `
  -Method POST `
  -Headers @{ 
    "apikey" = "change-this-api-key-for-production"
    "Content-Type" = "application/json"
  } `
  -Body $body
```

## ✅ Recomendación Final

**Usa el Manager Web** (`http://localhost:8080/manager`) - Es la forma más confiable y visual de conectar WhatsApp con Evolution API.

---

**¿Necesitas ayuda?** Consulta la documentación oficial: https://doc.evolution-api.com/
