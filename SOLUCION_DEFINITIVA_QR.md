# 🔧 Solución Definitiva: QR Code no se genera

## Problema Identificado

Evolution API v2.2.3 con Baileys tiene un bug conocido donde la instancia entra en un loop de reconexión constante y nunca genera el QR code. Esto se evidencia en los logs:

```
[ChannelStartupService] Browser: Evolution API,Chrome...
[ChannelStartupService] Baileys version env: 2,3000,1015901307
[ChannelStartupService] Group Ignore: false
```

Estos mensajes se repiten cada 2-3 segundos, indicando que Baileys se está reiniciando constantemente.

## ✅ SOLUCIÓN 1: Usar una versión anterior de Evolution API (RECOMENDADO)

### Paso 1: Editar docker-compose.yml

Cambia la línea de la imagen de Evolution API:

```yaml
# ANTES:
image: atendai/evolution-api:latest

# DESPUÉS:
image: atendai/evolution-api:v2.1.1
```

### Paso 2: Reiniciar servicios

```bash
docker compose down
docker compose up -d
```

### Paso 3: Crear instancia

```powershell
$body = '{"instanceName":"surfschool","integration":"WHATSAPP-BAILEYS"}'
Invoke-RestMethod -Uri "http://localhost:8080/instance/create" `
  -Method POST `
  -Headers @{ 
    "apikey" = "change-this-api-key-for-production"
    "Content-Type" = "application/json"
  } `
  -Body $body
```

### Paso 4: Obtener QR

Abre el Manager Web:
```
http://localhost:8080/manager
```

---

## ✅ SOLUCIÓN 2: Usar Pairing Code en lugar de QR

WhatsApp ahora soporta códigos de emparejamiento de 8 dígitos como alternativa al QR.

### Paso 1: Crear instancia con tu número

```powershell
$body = '{
  "instanceName":"surfschool",
  "integration":"WHATSAPP-BAILEYS",
  "number":"TU_NUMERO_AQUI"
}'

Invoke-RestMethod -Uri "http://localhost:8080/instance/create" `
  -Method POST `
  -Headers @{ 
    "apikey" = "change-this-api-key-for-production"
    "Content-Type" = "application/json"
  } `
  -Body $body
```

Reemplaza `TU_NUMERO_AQUI` con tu número de WhatsApp en formato internacional (ej: `5491112345678`).

### Paso 2: Obtener código de emparejamiento

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/instance/connect/surfschool" `
  -Method GET `
  -Headers @{ "apikey" = "change-this-api-key-for-production" }
```

Esto debería devolver un `pairingCode` de 8 dígitos.

### Paso 3: Ingresar código en WhatsApp

1. Abre WhatsApp en tu teléfono
2. Ve a Configuración > Dispositivos vinculados
3. Toca "Vincular un dispositivo"
4. Toca "Vincular con número de teléfono"
5. Ingresa el código de 8 dígitos

---

## ✅ SOLUCIÓN 3: Usar Evolution API Cloud (Alternativa)

Si las soluciones locales no funcionan, considera usar Evolution API en la nube:

### Opciones:
1. **Railway** - https://railway.app
2. **Render** - https://render.com
3. **DigitalOcean** - https://www.digitalocean.com

Estas plataformas suelen tener mejor compatibilidad con Baileys.

---

## ✅ SOLUCIÓN 4: Usar alternativa a Evolution API

Si Evolution API sigue dando problemas, considera estas alternativas:

### 1. Baileys directo
```bash
npm install @whiskeysockets/baileys
```

Implementa Baileys directamente en tu backend Node.js.

### 2. WPPConnect
```bash
npm install @wppconnect-team/wppconnect
```

Alternativa más estable que usa Puppeteer.

### 3. Venom-bot
```bash
npm install venom-bot
```

Otra alternativa popular y estable.

---

## 🔍 Diagnóstico Adicional

### Verificar si el problema es de Baileys

```powershell
# Ver logs completos
docker compose logs evolution-api --tail=200 | Out-File logs.txt

# Buscar errores específicos
Select-String -Path logs.txt -Pattern "error|fail|crash|exception" -Context 3
```

### Verificar versión de Baileys

Los logs muestran:
```
Baileys version env: 2,3000,1015901307
```

Esto es Baileys v2.3000.1015901307, que puede tener bugs conocidos.

---

## 📋 Checklist de Troubleshooting

- [ ] Redis está habilitado y funcionando
- [ ] PostgreSQL está funcionando
- [ ] Evolution API responde en http://localhost:8080
- [ ] La instancia no está en loop de reconexión
- [ ] Los logs no muestran errores críticos
- [ ] Probé con versión anterior de Evolution API
- [ ] Probé con pairing code
- [ ] Probé desde el Manager Web

---

## 🎯 Recomendación Final

**OPCIÓN MÁS CONFIABLE:**

1. **Cambiar a Evolution API v2.1.1** (versión estable anterior)
2. **Usar el Manager Web** para conectar
3. **Si no funciona, usar Pairing Code** en lugar de QR

---

## 📞 Soporte

Si ninguna solución funciona:

1. **Documentación oficial:** https://doc.evolution-api.com/
2. **GitHub Issues:** https://github.com/EvolutionAPI/evolution-api/issues
3. **Discord:** https://evolution-api.com/discord

---

**Nota:** Este problema es conocido en Evolution API v2.2.3 y está siendo trabajado por los desarrolladores.
