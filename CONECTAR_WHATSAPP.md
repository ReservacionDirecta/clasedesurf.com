# 📱 Cómo Conectar WhatsApp - Guía Definitiva

## ✅ Estado Actual

Todos los servicios están funcionando correctamente:
- ✅ Evolution API - http://localhost:8080
- ✅ PostgreSQL - localhost:5432
- ✅ Redis - localhost:6379

Instancia creada: **surfschool**

---

## 🚀 MÉTODO RECOMENDADO: Manager Web

Este es el método más confiable y visual para conectar WhatsApp.

### Paso 1: Abrir Manager Web

Abre tu navegador en:
```
http://localhost:8080/manager
```

O ejecuta:
```bash
start http://localhost:8080/manager
```

### Paso 2: Ingresar API Key

Cuando te pida autenticación, ingresa:
```
change-this-api-key-for-production
```

### Paso 3: Encontrar tu Instancia

En el Manager verás una lista de instancias. Busca:
- **Nombre:** surfschool
- **Estado:** close o connecting

### Paso 4: Conectar

Haz clic en uno de estos botones (dependiendo de la interfaz):
- 🔗 **Connect**
- 📱 **QR Code**
- ⚡ **Start**

El QR code aparecerá en pantalla.

### Paso 5: Escanear con WhatsApp

1. Abre **WhatsApp** en tu teléfono
2. Ve a **Configuración** (⚙️)
3. Toca **Dispositivos vinculados**
4. Toca **Vincular un dispositivo**
5. **Escanea el QR** que aparece en el Manager

### Paso 6: Verificar Conexión

Después de escanear:
- El estado cambiará a **"open"** o **"connected"**
- Verás tu número de teléfono
- Verás tu nombre de perfil

¡Listo! WhatsApp está conectado. 🎉

---

## 🔧 MÉTODO ALTERNATIVO: Scripts de PowerShell

Si prefieres usar la terminal:

### Opción A: Script Automático

```powershell
# Ejecutar el script de prueba
powershell -ExecutionPolicy Bypass -File test-qr.ps1
```

Este script:
- Verifica que Evolution API esté funcionando
- Intenta obtener el QR code
- Si tiene éxito, abre un archivo HTML con el QR

### Opción B: Comandos Manuales

```powershell
# 1. Verificar estado de la instancia
Invoke-RestMethod -Uri "http://localhost:8080/instance/connectionState/surfschool" `
  -Method GET `
  -Headers @{ "apikey" = "change-this-api-key-for-production" }

# 2. Intentar obtener QR (puede no funcionar siempre)
Invoke-RestMethod -Uri "http://localhost:8080/instance/connect/surfschool" `
  -Method GET `
  -Headers @{ "apikey" = "change-this-api-key-for-production" }
```

**Nota:** El método de PowerShell puede no funcionar siempre debido a cómo Evolution API maneja los QR codes. El Manager Web es más confiable.

---

## 📊 Verificar que WhatsApp está Conectado

### Método 1: Manager Web

Ve a http://localhost:8080/manager y verifica que el estado sea **"open"**.

### Método 2: PowerShell

```powershell
$instance = Invoke-RestMethod -Uri "http://localhost:8080/instance/fetchInstances?instanceName=surfschool" `
  -Method GET `
  -Headers @{ "apikey" = "change-this-api-key-for-production" }

Write-Host "Estado: $($instance.connectionStatus)"
Write-Host "Número: $($instance.number)"
Write-Host "Perfil: $($instance.profileName)"
```

Si `connectionStatus` es **"open"**, estás conectado. ✅

---

## 🧪 Enviar Mensaje de Prueba

Una vez conectado, prueba enviar un mensaje:

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

**Formato del número:**
- ✅ Correcto: `5491112345678` (código país + área + número, sin espacios)
- ❌ Incorrecto: `+54 911 1234-5678`

---

## 🐛 Troubleshooting

### El Manager Web no carga

```bash
# Verificar que Evolution API esté corriendo
docker compose ps

# Si no está corriendo, iniciarlo
docker compose up -d

# Ver logs
docker compose logs evolution-api --tail=20
```

### El QR no aparece

1. **Refresca la página** del Manager (F5)
2. **Haz clic en "Connect"** nuevamente
3. **Espera 10 segundos** - A veces tarda en generarse

### Error de autenticación en Manager

Verifica que estés usando el API Key correcto:
```
change-this-api-key-for-production
```

### La instancia no conecta

```powershell
# Eliminar la instancia
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

# Volver a intentar conectar desde el Manager
```

### El QR expira muy rápido

Los QR codes de WhatsApp expiran en **30 segundos**. Si expira:
1. Haz clic en "Connect" nuevamente
2. Se generará un nuevo QR
3. Escanéalo rápidamente

---

## 📚 Recursos Adicionales

- **Manager Web:** http://localhost:8080/manager
- **Documentación Evolution API:** https://doc.evolution-api.com/
- **Guía de instalación:** RESUMEN_INSTALACION.md
- **Solución de problemas:** SOLUCION_PROBLEMAS.md
- **Nota sobre Redis:** NOTA_REDIS.md

---

## ✅ Checklist de Conexión

- [ ] Evolution API está corriendo (http://localhost:8080)
- [ ] Abrí el Manager Web
- [ ] Ingresé el API Key
- [ ] Encontré la instancia "surfschool"
- [ ] Hice clic en "Connect"
- [ ] Apareció el QR code
- [ ] Escaneé con WhatsApp
- [ ] El estado cambió a "open"
- [ ] Envié un mensaje de prueba

---

## 🎯 Próximos Pasos

Una vez conectado WhatsApp:

1. **Integrar con tu backend** - Ver ejemplos en RESUMEN_INSTALACION.md
2. **Enviar confirmaciones de reserva** automáticamente
3. **Configurar webhooks** para recibir mensajes
4. **Personalizar mensajes** según tus necesidades

---

**¿Problemas?** Revisa SOLUCION_QR.md para más opciones.

**¡Éxito conectando WhatsApp!** 🎉
