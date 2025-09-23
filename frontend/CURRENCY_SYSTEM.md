# Sistema de Monedas - Clase de Surf

## 🌎 Localización: Lima, Perú

La plataforma **clasedesurf.com** está inicialmente localizada en Lima, Perú, con planes de expansión a nuevos destinos y escuelas de surf.

## 💰 Sistema Dual de Monedas

### **Monedas Soportadas**
- **USD (Dólares Americanos)**: Moneda base para precios
- **PEN (Soles Peruanos)**: Moneda local mostrada automáticamente

### **Tipo de Cambio**
- **Tipo de cambio actual**: 1 USD = 3.75 PEN (aproximado)
- **Actualización**: Simulado diariamente (en producción se conectaría a una API de tipos de cambio)
- **Fuente**: Preparado para integrar con APIs como CurrencyAPI, ExchangeRate-API, o Banco Central de Perú

## 🎯 **Implementación Técnica**

### **Archivos Principales**
```
frontend/src/lib/currency.ts          # Lógica de conversión
frontend/src/components/ui/PriceDisplay.tsx  # Componente de precios
```

### **Funciones Principales**

#### `getCurrentExchangeRate()`
```typescript
// Retorna el tipo de cambio actual
{
  usd: 1,
  pen: 3.75,
  rate: 3.75,
  lastUpdated: Date
}
```

#### `formatDualCurrency(usdAmount)`
```typescript
// Convierte USD a PEN y formatea ambos
formatDualCurrency(25) // USD
// Retorna:
{
  usd: "$25",
  pen: "S/ 94",
  penAmount: 93.75
}
```

#### `PriceDisplay` Component
- Muestra precios en ambas monedas
- Permite alternar entre USD y PEN como moneda principal
- Incluye tipo de cambio actualizado
- Responsive y accesible

## 💳 **Experiencia de Usuario**

### **Visualización de Precios**
1. **Moneda Principal**: Soles peruanos (PEN) - más relevante para usuarios locales
2. **Moneda Secundaria**: Dólares (USD) - referencia internacional
3. **Tipo de Cambio**: Visible en texto pequeño para transparencia

### **Ejemplo Visual**
```
S/ 94          <- Precio principal (PEN)
$25 USD        <- Precio secundario (USD)
(TC: S/ 3.75)  <- Tipo de cambio
```

### **Interactividad**
- **Click en precio**: Alterna entre PEN y USD como moneda principal
- **Tooltip**: Muestra información del tipo de cambio
- **Actualización**: Indicador de cuándo se actualizó el tipo de cambio

## 🏄‍♂️ **Precios de Clases Actualizados**

### **Clases en Lima, Perú**

| Clase | USD | PEN | Ubicación |
|-------|-----|-----|-----------|
| **Iniciación** | $25 | S/ 94 | Playa Makaha - Miraflores |
| **Perfeccionamiento** | $35 | S/ 131 | Playa Waikiki - San Bartolo |
| **Clase Privada** | $60 | S/ 225 | Playa La Herradura - Chorrillos |
| **Surf para Niños** | $20 | S/ 75 | Playa Redondo - Callao |
| **Intensivo Weekend** | $80 | S/ 300 | Playa Punta Rocas - Punta Negra |
| **Surf Avanzado** | $45 | S/ 169 | Playa Señoritas - Punta Hermosa |

### **Playas de Lima Incluidas**
- 🏖️ **Miraflores**: Playa Makaha (principiantes)
- 🏖️ **San Bartolo**: Playa Waikiki (intermedio)
- 🏖️ **Chorrillos**: Playa La Herradura (privadas)
- 🏖️ **Callao**: Playa Redondo (niños)
- 🏖️ **Punta Negra**: Playa Punta Rocas (intensivos)
- 🏖️ **Punta Hermosa**: Playa Señoritas (avanzado)

## 🌍 **Expansión Multi-Destino**

### **Concepto de Marketplace**
- **Base actual**: Lima, Perú
- **Expansión planificada**: Otras ciudades costeras de Perú y Latinoamérica
- **Modelo**: Cada escuela puede registrarse y gestionar sus propias clases
- **Monedas**: Sistema preparado para múltiples monedas según el país

### **Destinos Futuros Potenciales**
- 🇵🇪 **Perú**: Máncora, Huanchaco, Chicama
- 🇪🇨 **Ecuador**: Montañita, Salinas
- 🇨🇴 **Colombia**: Santa Marta, Cartagena
- 🇨🇷 **Costa Rica**: Tamarindo, Jacó
- 🇲🇽 **México**: Puerto Escondido, Sayulita

### **Registro de Nuevas Escuelas**
- Call-to-action en Hero section
- Enlace "Nuevos Destinos" en footer
- Formulario de registro para escuelas interesadas
- Sistema de comisiones configurable por región

## 🔧 **Configuración Técnica**

### **Variables de Entorno**
```env
# Tipo de cambio (en producción usar API externa)
EXCHANGE_RATE_API_KEY=your_api_key
DEFAULT_EXCHANGE_RATE=3.75

# Configuración regional
DEFAULT_COUNTRY=PE
DEFAULT_CURRENCY=PEN
SECONDARY_CURRENCY=USD
```

### **APIs de Tipo de Cambio Recomendadas**
1. **CurrencyAPI**: https://currencyapi.com/
2. **ExchangeRate-API**: https://exchangerate-api.com/
3. **Banco Central de Perú**: API oficial
4. **Fixer.io**: Datos financieros confiables

### **Implementación Futura**
```typescript
// Función para obtener tipo de cambio real
async function fetchExchangeRate() {
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
  const data = await response.json()
  return data.rates.PEN
}
```

## 📱 **Responsive Design**

### **Mobile (< 768px)**
- Precio principal más grande
- Tipo de cambio en línea separada
- Botón de alternancia simplificado

### **Desktop (> 1024px)**
- Precios lado a lado
- Hover effects para alternancia
- Información de tipo de cambio en tooltip

## 🎨 **Branding Actualizado**

### **Información de Contacto**
- **Teléfono**: +51 1 234 5678 (Perú)
- **Email**: info@clasedesurf.com
- **Ubicación**: Lima, Perú
- **Dominio**: clasedesurf.com

### **Mensaje de Marca**
- "Tu escuela de surf de confianza en Lima, Perú"
- "Expandiéndose a nuevos destinos"
- "Conectamos surfistas con las mejores escuelas"

## ✅ **Estado Actual**

### **Completamente Implementado**
- ✅ Sistema dual de monedas (USD/PEN)
- ✅ Componente PriceDisplay interactivo
- ✅ Conversión automática con tipo de cambio
- ✅ Precios actualizados para Lima, Perú
- ✅ Playas reales de Lima en las clases
- ✅ Branding actualizado a "Clase de Surf"
- ✅ Información de contacto peruana
- ✅ Call-to-action para expansión

### **Preparado para Producción**
- 🔄 Integración con API de tipo de cambio real
- 🔄 Sistema de registro de nuevas escuelas
- 🔄 Soporte para múltiples países/monedas
- 🔄 Geolocalización automática de usuarios

**El sistema está completamente funcional y listo para el mercado peruano, con una base sólida para la expansión internacional.** 🏄‍♂️🌎