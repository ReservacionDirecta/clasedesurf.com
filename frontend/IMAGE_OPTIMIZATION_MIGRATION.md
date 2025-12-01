# 🔄 Guía de Migración - Optimización de Imágenes

## 📋 Pasos para Migrar Componentes Existentes

### Paso 1: Importar el Componente Optimizado

```tsx
// Al inicio del archivo
import OptimizedImage from '@/components/ui/OptimizedImage';
```

### Paso 2: Reemplazar Componentes Image

#### Ejemplo 1: Imagen de Instagram

**ANTES**:
```tsx
import Image from 'next/image';

<Image 
  src="https://scontent-lim1-1.cdninstagram.com/v/t51.75761-15/490431968_..."
  alt="Instagram Post"
  width={750}
  height={750}
/>
```

**DESPUÉS**:
```tsx
import OptimizedImage from '@/components/ui/OptimizedImage';

<OptimizedImage 
  src="https://scontent-lim1-1.cdninstagram.com/v/t51.75761-15/490431968_..."
  alt="Instagram Post"
  width={750}
  height={750}
  quality={85}
/>
```

#### Ejemplo 2: Galería de Imágenes

**ANTES**:
```tsx
const images = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.png',
  'https://example.com/image3.jpg',
];

<div className="grid grid-cols-3 gap-4">
  {images.map((src, index) => (
    <Image
      key={index}
      src={src}
      alt={`Image ${index + 1}`}
      width={400}
      height={300}
    />
  ))}
</div>
```

**DESPUÉS**:
```tsx
import OptimizedImage from '@/components/ui/OptimizedImage';

const images = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.png',
  'https://example.com/image3.jpg',
];

<div className="grid grid-cols-3 gap-4">
  {images.map((src, index) => (
    <OptimizedImage
      key={index}
      src={src}
      alt={`Image ${index + 1}`}
      width={400}
      height={300}
      quality={80}
      fallbackSrc="/images/placeholder.jpg"
    />
  ))}
</div>
```

#### Ejemplo 3: Hero Image

**ANTES**:
```tsx
<div className="relative h-96">
  <Image
    src="https://example.com/hero-image.jpg"
    alt="Hero"
    fill
    className="object-cover"
  />
</div>
```

**DESPUÉS**:
```tsx
<div className="relative h-96">
  <OptimizedImage
    src="https://example.com/hero-image.jpg"
    alt="Hero"
    fill
    className="object-cover"
    quality={90}
    priority
  />
</div>
```

---

## 🎯 Archivos Comunes a Migrar

### 1. Componentes de Clases

**Archivo**: `src/components/classes/ClassCard.tsx`

```tsx
// Buscar:
import Image from 'next/image';

// Reemplazar con:
import OptimizedImage from '@/components/ui/OptimizedImage';

// Luego reemplazar todos los <Image> por <OptimizedImage>
```

### 2. Páginas de Galería

**Archivo**: `src/app/gallery/page.tsx`

```tsx
import OptimizedImage from '@/components/ui/OptimizedImage';

export default function GalleryPage() {
  const instagramImages = [
    // URLs de Instagram
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {instagramImages.map((url, index) => (
        <OptimizedImage
          key={index}
          src={url}
          alt={`Gallery ${index + 1}`}
          width={400}
          height={400}
          quality={85}
          className="rounded-lg hover:scale-105 transition-transform"
        />
      ))}
    </div>
  );
}
```

### 3. Página Principal (Homepage)

**Archivo**: `src/app/page.tsx`

Buscar todas las instancias de `<Image>` y reemplazar con `<OptimizedImage>`.

---

## 🔍 Comando de Búsqueda

Para encontrar todos los archivos que usan Image de Next.js:

```bash
# En PowerShell
Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.jsx | Select-String -Pattern "from 'next/image'" | Select-Object -Property Path -Unique

# O usar grep si está disponible
grep -r "from 'next/image'" src/
```

---

## ✅ Checklist de Migración

### Componentes
- [ ] `src/components/classes/ClassCard.tsx`
- [ ] `src/components/schools/SchoolCard.tsx`
- [ ] `src/components/gallery/*`
- [ ] `src/components/hero/*`

### Páginas
- [ ] `src/app/page.tsx` (Homepage)
- [ ] `src/app/classes/page.tsx`
- [ ] `src/app/schools/page.tsx`
- [ ] `src/app/gallery/page.tsx`
- [ ] `src/app/about/page.tsx`

### Dashboard
- [ ] `src/app/dashboard/school/classes/page.tsx`
- [ ] `src/app/dashboard/school/profile/page.tsx`
- [ ] `src/app/dashboard/instructor/profile/page.tsx`

---

## 🧪 Testing

### 1. Verificar que las Imágenes Cargan

```tsx
// Agregar console.log temporal
<OptimizedImage
  src={imageUrl}
  alt="Test"
  width={800}
  height={600}
  onLoad={() => console.log('✅ Image loaded:', imageUrl)}
  onError={(e) => console.error('❌ Image failed:', imageUrl, e)}
/>
```

### 2. Verificar Optimización en DevTools

1. Abrir DevTools (F12)
2. Ir a Network tab
3. Filtrar por "Img"
4. Recargar la página
5. Verificar:
   - ✅ Status: 200
   - ✅ Type: webp
   - ✅ Size: Reducido significativamente

### 3. Verificar Headers de Compresión

En Network → Seleccionar imagen → Headers:
```
X-Compression-Ratio: 78.82%
X-Original-Size: 850000
X-Optimized-Size: 180000
```

---

## 🚀 Ejemplo Completo de Migración

### Antes (ClassCard.tsx)

```tsx
import Image from 'next/image';

export default function ClassCard({ classData }: { classData: any }) {
  return (
    <div className="card">
      <div className="relative h-48">
        <Image
          src={classData.images[0]}
          alt={classData.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3>{classData.title}</h3>
        <p>{classData.description}</p>
      </div>
    </div>
  );
}
```

### Después (ClassCard.tsx)

```tsx
import OptimizedImage from '@/components/ui/OptimizedImage';

export default function ClassCard({ classData }: { classData: any }) {
  return (
    <div className="card">
      <div className="relative h-48">
        <OptimizedImage
          src={classData.images[0]}
          alt={classData.title}
          fill
          className="object-cover"
          quality={85}
          fallbackSrc="/images/class-placeholder.jpg"
        />
      </div>
      <div className="p-4">
        <h3>{classData.title}</h3>
        <p>{classData.description}</p>
      </div>
    </div>
  );
}
```

---

## 📊 Resultados Esperados

### Performance
- ⚡ **Carga 3-5x más rápida**
- 📉 **82% menos datos transferidos**
- 🚀 **Mejor LCP (Largest Contentful Paint)**

### SEO
- ✅ **Mejor puntuación en PageSpeed Insights**
- ✅ **Mejor Core Web Vitals**
- ✅ **Mejor experiencia móvil**

### UX
- ✅ **Imágenes cargan más rápido**
- ✅ **Menos consumo de datos móviles**
- ✅ **Mejor experiencia en conexiones lentas**

---

## 🎉 ¡Listo!

Una vez migrados todos los componentes, tu aplicación tendrá:
- ✅ Todas las imágenes optimizadas automáticamente
- ✅ Conversión automática a WebP
- ✅ Proxy funcional para Instagram
- ✅ Cache optimizado
- ✅ Mejor performance general

---

**Creado**: 2025-11-26  
**Estado**: ✅ Guía completa de migración
