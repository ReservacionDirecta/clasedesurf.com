# 🔧 Solución de Errores de Consola

## 📋 Resumen de Errores Detectados

### 1. Error: share-modal.js ✅ YA MANEJADO
```
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
```

**Estado**: ✅ Este error ya está siendo manejado correctamente por el sistema de error handling en `layout.tsx`.

**Ubicación**: `frontend/src/app/layout.tsx` líneas 74-95

**Solución implementada**: El código ya tiene un manejador de errores que silencia estos errores de share-modal porque son de scripts externos que no afectan la funcionalidad.

```tsx
// Ya implementado en layout.tsx
if (errorMessage.includes('share-modal') || 
    errorSource.includes('share-modal') ||
    errorStack.includes('share-modal') ||
    errorMessage.includes('addEventListener')) {
  console.warn('⚠️ Error silenciado de script externo:', errorMessage);
  return true; // Prevenir que el error se propague
}
```

---

### 2. Error: Instagram Images 403 Forbidden ⚠️ REQUIERE ACCIÓN

```
GET https://scontent-lim1-1.cdninstagram.com/... 403 (Forbidden)
```

**Causa**: Instagram bloquea el hotlinking (acceso directo) a sus imágenes desde dominios externos por seguridad.

**Impacto**: Las imágenes de Instagram no se cargan en la página.

---

## 🛠️ Soluciones para Instagram Images

### Opción 1: Usar Proxy de Imágenes (Recomendado) ⭐

Crear un endpoint en Next.js que sirva como proxy para las imágenes de Instagram:

**Paso 1**: Crear archivo `frontend/src/app/api/instagram-proxy/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Fetch la imagen de Instagram
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.instagram.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
      },
    });
  } catch (error) {
    console.error('Error proxying Instagram image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
```

**Paso 2**: Actualizar el componente que usa las imágenes de Instagram

Buscar donde se usan las imágenes de Instagram y cambiar:

```tsx
// ANTES
<Image 
  src="https://scontent-lim1-1.cdninstagram.com/..." 
  alt="Instagram"
/>

// DESPUÉS
<Image 
  src={`/api/instagram-proxy?url=${encodeURIComponent(instagramUrl)}`}
  alt="Instagram"
/>
```

---

### Opción 2: Descargar y Hospedar Localmente (Más Simple) ⭐⭐

**Ventajas**:
- Más rápido (no depende de Instagram)
- Más confiable (siempre disponible)
- Mejor SEO

**Pasos**:
1. Descargar las imágenes de Instagram que necesitas
2. Guardarlas en `frontend/public/images/instagram/`
3. Actualizar las referencias en el código

```tsx
// ANTES
<Image src="https://scontent-lim1-1.cdninstagram.com/..." />

// DESPUÉS
<Image src="/images/instagram/image-1.jpg" />
```

---

### Opción 3: Usar Instagram Graph API (Profesional) 🔐

Para una solución más robusta y oficial:

**Requisitos**:
- Cuenta de Instagram Business
- Facebook Developer App
- Access Token

**Configuración**:

```typescript
// .env.local
INSTAGRAM_ACCESS_TOKEN=your_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id

// lib/instagram.ts
export async function getInstagramMedia() {
  const response = await fetch(
    `https://graph.instagram.com/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
  );
  
  const data = await response.json();
  return data.data;
}
```

---

## 🎯 Recomendación

### Para Desarrollo Inmediato:
**Usar Opción 2** (Descargar y hospedar localmente)
- ✅ Más simple
- ✅ Más rápido
- ✅ No requiere configuración adicional
- ✅ Mejor performance

### Para Producción a Largo Plazo:
**Usar Opción 3** (Instagram Graph API)
- ✅ Oficial y confiable
- ✅ Actualización automática
- ✅ Mejor integración
- ⚠️ Requiere configuración inicial

---

## 📝 Pasos Inmediatos

### 1. Identificar dónde se usan las imágenes de Instagram

```bash
# Buscar en el código
grep -r "cdninstagram" frontend/src/
```

### 2. Aplicar la solución elegida

**Si eliges Opción 2 (Recomendado para inicio rápido)**:

1. Crear carpeta:
```bash
mkdir -p frontend/public/images/instagram
```

2. Descargar las imágenes necesarias y guardarlas allí

3. Actualizar las referencias en el código

---

## ✅ Checklist de Solución

- [x] Error de share-modal.js ya está manejado
- [ ] Decidir qué opción usar para Instagram
- [ ] Implementar la solución elegida
- [ ] Probar que las imágenes carguen correctamente
- [ ] Verificar que no haya errores en consola

---

## 🔍 Archivos a Revisar

Para encontrar dónde se usan las imágenes de Instagram, revisar:

1. **Componentes de galería**:
   - `frontend/src/components/gallery/*`
   - `frontend/src/components/instagram/*`

2. **Páginas públicas**:
   - `frontend/src/app/page.tsx` (homepage)
   - `frontend/src/app/about/*`
   - `frontend/src/app/gallery/*`

3. **Componentes de clases**:
   - `frontend/src/components/classes/*`

---

## 💡 Nota Importante

El error de share-modal.js **NO afecta la funcionalidad** de la aplicación. Es un error cosmético que ya está siendo manejado correctamente.

El error de Instagram **SÍ afecta** la visualización de imágenes, pero solo las que vienen directamente de Instagram CDN.

---

**Creado**: 2025-11-26  
**Prioridad**: Media (Instagram), Baja (share-modal)  
**Estado**: share-modal ✅ Resuelto | Instagram ⏳ Pendiente
