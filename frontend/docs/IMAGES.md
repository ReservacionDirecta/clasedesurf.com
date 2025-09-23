# Sistema de Imágenes - Surf en Lima

Este documento describe el sistema de gestión de imágenes específicas para el marketplace de surf en Lima, Perú.

## Arquitectura del Sistema

### 📁 Archivo Principal: `lima-beach-images.ts`

El sistema centraliza todas las imágenes de surf en un solo archivo para facilitar el mantenimiento y garantizar la consistencia visual.

```typescript
// Estructura principal
export const limaBeachImages = {
  beaches: { ... },      // Imágenes por playa específica
  waterSports: { ... },  // Imágenes por nivel de surf
  classTypes: { ... },   // Imágenes por tipo de clase
  hero: { ... }         // Imagen principal del Hero
}
```

## Categorización de Imágenes

### 🏖️ Por Playa (beaches)
Cada playa de Lima tiene imágenes específicas que reflejan sus características:

- **Miraflores**: Surf urbano con vista a la ciudad
- **San Bartolo**: Playa clásica de surf limeño
- **Chorrillos**: La Herradura, olas técnicas
- **Callao**: Ambiente familiar y principiantes
- **Punta Negra**: Olas grandes y desafiantes
- **Punta Hermosa**: Surf profesional

### 🏄‍♂️ Por Nivel (waterSports.surf)
Imágenes adaptadas al nivel de experiencia:

- **beginner**: Surfistas aprendiendo, olas pequeñas
- **intermediate**: Surfistas en acción, técnica básica
- **advanced**: Maniobras técnicas, surf en tubo
- **expert**: Olas grandes, surf profesional
- **kids**: Ambiente familiar y seguro
- **private**: Instrucción personalizada
- **intensive**: Entrenamiento intensivo

### 🎯 Por Tipo de Clase (classTypes)
Imágenes específicas para cada modalidad:

- **GROUP**: Clases grupales, ambiente social
- **PRIVATE**: Instrucción uno-a-uno
- **KIDS**: Surf infantil seguro
- **INTENSIVE**: Entrenamiento avanzado
- **SEMI_PRIVATE**: Grupos pequeños

## Funciones de Utilidad

### `getBeachImage(location, activity, level)`
Obtiene la imagen más apropiada basada en:
- **location**: Nombre de la playa
- **activity**: Tipo de actividad (siempre 'surf')
- **level**: Nivel de experiencia

### `getClassTypeImage(type)`
Retorna imagen específica para el tipo de clase.

### `getSurfImageByLevel(level)`
Obtiene imagen basada únicamente en el nivel de experiencia.

### `getHeroImage()`
Retorna la imagen principal para el Hero (surf al atardecer).

## Mapeo de Ubicaciones

El sistema incluye un mapeo inteligente de ubicaciones:

```typescript
const locationMap = {
  'Playa Makaha': 'Miraflores',
  'Playa Waikiki': 'San Bartolo',
  'Playa La Herradura': 'Chorrillos',
  'Playa Redondo': 'Callao',
  'Punta Rocas': 'Punta Negra',
  'Playa Señoritas': 'Punta Hermosa',
  'Costa Verde': 'Miraflores',
  'Barranco': 'Miraflores',
  'La Pampilla': 'Callao',
  'Agua Dulce': 'Chorrillos'
}
```

## Optimización de Imágenes

### Parámetros de Unsplash
Todas las imágenes utilizan parámetros optimizados:
- `q=80`: Calidad 80% (balance calidad/tamaño)
- `w=600`: Ancho 600px para tarjetas
- `w=1920`: Ancho 1920px para Hero
- `auto=format`: Formato automático (WebP cuando sea posible)
- `fit=crop`: Recorte inteligente
- `ixlib=rb-4.0.3`: Versión de la librería

### Responsive Design
- **Tarjetas**: 600px de ancho, escalable
- **Hero**: 1920px para pantallas grandes
- **Lazy loading**: Carga diferida automática

## Mantenimiento

### Agregar Nueva Playa
1. Añadir entrada en `beaches` object
2. Actualizar `locationMap` si es necesario
3. Verificar que la imagen sea de surf real

### Cambiar Imagen
1. Buscar nueva imagen en Unsplash con términos: "surf", "surfing", "wave"
2. Copiar ID de la imagen (parte después de `/photo-`)
3. Reemplazar en la URL manteniendo parámetros

### Validación de Imágenes
Antes de agregar una imagen, verificar que:
- ✅ Muestre surf real (no otros deportes)
- ✅ Sea de buena calidad visual
- ✅ Represente el nivel/tipo correcto
- ✅ Tenga licencia apropiada en Unsplash

## Ejemplos de Uso

### En Componentes
```typescript
import { getBeachImage, getClassTypeImage } from '@/lib/lima-beach-images'

// Obtener imagen por ubicación y nivel
const imageUrl = getBeachImage('Miraflores', 'surf', 'beginner')

// Obtener imagen por tipo de clase
const classImage = getClassTypeImage('GROUP')
```

### En ClassCard
```typescript
const getClassImage = (type: string, level: string) => {
  if (classData.location) {
    return getBeachImage(classData.location, 'surf', level)
  }
  return getClassTypeImage(type)
}
```

## Roadmap

### Futuras Mejoras
- [ ] Integración con API de imágenes locales
- [ ] Sistema de upload para escuelas
- [ ] Galería de imágenes por instructor
- [ ] Imágenes de equipamiento (tablas, neoprenos)
- [ ] Videos cortos de surf en Lima
- [ ] Integración con redes sociales de escuelas

### Consideraciones Técnicas
- Migración a CDN propio para mayor control
- Implementación de WebP/AVIF para mejor compresión
- Sistema de fallbacks para imágenes no disponibles
- Métricas de rendimiento de carga de imágenes