# Sistema de Gestión de Cookies

Sistema completo de gestión de cookies conforme a **GDPR (Europa)** y **CCPA/CPRA (California, USA)**.

## Características

- ✅ **Cumplimiento GDPR**: Consentimiento explícito antes de usar cookies no esenciales
- ✅ **Cumplimiento CCPA/CPRA**: Transparencia y opción de opt-out
- ✅ **Banner de consentimiento**: Aparece automáticamente si no hay consentimiento
- ✅ **Gestión de preferencias**: Modal completo para personalizar cookies por categoría
- ✅ **Eliminación automática**: Elimina cookies no permitidas cuando el usuario rechaza categorías
- ✅ **Persistencia**: Guarda preferencias en localStorage y cookies
- ✅ **TypeScript**: Completamente tipado

## Estructura

```
frontend/src/
├── lib/
│   └── cookies.ts                    # Utilidades para manejo de cookies
├── contexts/
│   └── CookieContext.tsx             # Contexto React para estado de cookies
├── components/
│   └── cookies/
│       ├── CookieBanner.tsx          # Banner de consentimiento
│       ├── CookiePreferences.tsx     # Modal de preferencias
│       └── CookieSettingsButton.tsx # Botón para abrir preferencias
└── hooks/
    └── useCookieConsent.ts           # Hook para verificar consentimiento
```

## Uso Básico

### 1. Verificar consentimiento en componentes

```tsx
import { useCookie } from '@/contexts/CookieContext';

function MyComponent() {
  const { isCategoryAllowed } = useCookie();
  
  const canUseAnalytics = isCategoryAllowed('analytics');
  
  useEffect(() => {
    if (canUseAnalytics) {
      // Cargar Google Analytics
    }
  }, [canUseAnalytics]);
}
```

### 2. Usar el hook de consentimiento

```tsx
import { useCookieConsent } from '@/hooks/useCookieConsent';

function AnalyticsComponent() {
  const canLoad = useCookieConsent('analytics');
  
  useEffect(() => {
    if (canLoad) {
      // Inicializar Google Analytics
      window.gtag?.('config', 'GA_MEASUREMENT_ID');
    }
  }, [canLoad]);
}
```

### 3. Cargar scripts condicionalmente

```tsx
import { useConditionalScript } from '@/hooks/useCookieConsent';

function AnalyticsScript() {
  useConditionalScript('analytics', () => {
    // Cargar script de Google Analytics
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_ID';
    script.async = true;
    document.head.appendChild(script);
    
    // Cleanup
    return () => {
      document.head.removeChild(script);
    };
  });
  
  return null;
}
```

### 4. Agregar botón de preferencias en el footer

```tsx
import CookieSettingsButton from '@/components/cookies/CookieSettingsButton';

function Footer() {
  return (
    <footer>
      {/* ... */}
      <CookieSettingsButton variant="link" />
    </footer>
  );
}
```

## Categorías de Cookies

### Essential (Esenciales)
- **Siempre activas**: No se pueden desactivar
- Incluye: cookies de sesión, autenticación, seguridad
- Ejemplo: `next-auth.session-token`

### Analytics (Análisis)
- **Opcional**: Requiere consentimiento
- Incluye: Google Analytics, métricas de uso
- Ejemplo: `_ga`, `_gid`, `_gat`

### Marketing (Marketing)
- **Opcional**: Requiere consentimiento
- Incluye: Facebook Pixel, remarketing, publicidad
- Ejemplo: `fbp`, `fbc`

### Functional (Funcionales)
- **Opcional**: Requiere consentimiento
- Incluye: preferencias de usuario, personalización
- Ejemplo: cookies de idioma, tema

## API del Contexto

```tsx
interface CookieContextType {
  preferences: CookiePreferences;           // Preferencias actuales
  hasConsent: boolean;                      // Si hay consentimiento dado
  isCategoryAllowed: (category) => boolean; // Verificar si categoría está permitida
  updatePreferences: (prefs) => void;       // Actualizar preferencias
  acceptAll: () => void;                   // Aceptar todas las cookies
  rejectAll: () => void;                   // Rechazar todas las no esenciales
  savePreferences: () => void;             // Guardar preferencias actuales
  showBanner: boolean;                     // Mostrar/ocultar banner
  setShowBanner: (show) => void;
  showPreferences: boolean;                 // Mostrar/ocultar modal
  setShowPreferences: (show) => void;
}
```

## Utilidades de Cookies

### Funciones principales

```tsx
import {
  getCookiePreferences,      // Leer preferencias
  saveCookiePreferences,      // Guardar preferencias
  hasConsent,                 // Verificar si hay consentimiento
  isCategoryAllowed,          // Verificar categoría
  removeCookiesByCategory,    // Eliminar cookies de categoría
  removeAllNonEssentialCookies, // Eliminar todas las no esenciales
  getCookiesByCategory,       // Obtener cookies por categoría
  COOKIE_DEFINITIONS          // Definiciones de todas las cookies
} from '@/lib/cookies';
```

## Agregar Nuevas Cookies

Para agregar una nueva cookie al sistema:

1. **Agregar a `COOKIE_DEFINITIONS`** en `lib/cookies.ts`:

```tsx
{
  name: 'mi-cookie',
  category: 'analytics', // o 'marketing', 'functional'
  description: 'Descripción de la cookie',
  duration: '1 año',
  provider: 'Nombre del proveedor'
}
```

2. **Agregar a `COOKIE_NAMES_BY_CATEGORY`**:

```tsx
analytics: ['_ga', '_gid', '_gat', 'mi-cookie']
```

3. **Usar condicionalmente en tu código**:

```tsx
const canUse = useCookieConsent('analytics');
if (canUse) {
  // Usar la cookie
}
```

## Cumplimiento Legal

### GDPR (Reglamento General de Protección de Datos - Europa)

- ✅ Consentimiento explícito antes de usar cookies no esenciales
- ✅ Información clara sobre qué cookies se usan
- ✅ Derecho a retirar consentimiento en cualquier momento
- ✅ Cookies esenciales claramente identificadas

### CCPA/CPRA (California Consumer Privacy Act)

- ✅ Transparencia sobre qué cookies se usan
- ✅ Opción clara de opt-out
- ✅ Información sobre derechos del consumidor
- ✅ No discriminación por opt-out

## Personalización

### Cambiar textos del banner

Edita `CookieBanner.tsx`:

```tsx
<h3>Tu título personalizado</h3>
<p>Tu descripción personalizada</p>
```

### Cambiar estilos

Los componentes usan Tailwind CSS. Puedes modificar las clases en:
- `CookieBanner.tsx`
- `CookiePreferences.tsx`

### Agregar más categorías

1. Actualiza el tipo `CookieCategory` en `lib/cookies.ts`
2. Agrega la categoría a `CATEGORIES` en `CookiePreferences.tsx`
3. Actualiza `COOKIE_NAMES_BY_CATEGORY`

## Testing

Para probar el sistema:

1. **Limpiar localStorage**:
```javascript
localStorage.removeItem('cookie-consent');
```

2. **Recargar la página**: El banner debería aparecer

3. **Probar diferentes opciones**:
   - Aceptar todas
   - Rechazar todas
   - Personalizar

4. **Verificar cookies**:
```javascript
console.log(document.cookie);
```

## Notas Importantes

- Las cookies esenciales **siempre** están activas
- El consentimiento se guarda por **1 año**
- Las preferencias se guardan en **localStorage** y **cookies**
- Las cookies no permitidas se **eliminan automáticamente**
- El banner aparece solo si **no hay consentimiento previo**

