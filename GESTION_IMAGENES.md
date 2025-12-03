# Gestión de Imágenes Persistentes - Opciones y Recomendaciones

## Problema Actual

Las imágenes subidas localmente se pierden en cada deploy porque:

- Docker containers son efímeros
- El sistema de archivos del container se resetea en cada deploy
- Railway no persiste archivos locales entre deploys

## Soluciones Disponibles

### ✅ Opción 1: Cloudinary (RECOMENDADO)

**Ventajas:**

- ✅ Gratuito hasta 25GB de almacenamiento
- ✅ Transformaciones automáticas (resize, compress, optimize)
- ✅ CDN global incluido
- ✅ Fácil integración
- ✅ URLs permanentes
- ✅ Backup automático

**Implementación:**

1. **Crear cuenta en Cloudinary**

   - Ve a https://cloudinary.com/
   - Regístrate gratis
   - Obtén tus credenciales:
     - Cloud Name
     - API Key
     - API Secret

2. **Instalar dependencias**

   ```bash
   cd backend
   npm install cloudinary multer
   ```

3. **Configurar variables de entorno**

   ```env
   # backend/.env
   CLOUDINARY_CLOUD_NAME=tu-cloud-name
   CLOUDINARY_API_KEY=tu-api-key
   CLOUDINARY_API_SECRET=tu-api-secret
   ```

4. **Código del endpoint** (ver archivo adjunto: `cloudinary-upload.ts`)

**Costo:** $0/mes (plan gratuito)

---

### ✅ Opción 2: AWS S3

**Ventajas:**

- ✅ Muy confiable
- ✅ Escalable
- ✅ Integración con CloudFront CDN
- ✅ Control total

**Desventajas:**

- ⚠️ Requiere configuración de AWS
- ⚠️ Más complejo de configurar
- 💰 Costo: ~$0.023/GB/mes

**Implementación:**

1. **Crear bucket en S3**
2. **Configurar IAM user con permisos**
3. **Instalar SDK**

   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer
   ```

4. **Código del endpoint** (ver archivo adjunto: `s3-upload.ts`)

---

### ✅ Opción 3: Railway Volumes (Para archivos estáticos)

**Ventajas:**

- ✅ Integrado con Railway
- ✅ Persistencia garantizada
- ✅ Sin servicios externos

**Desventajas:**

- ⚠️ No incluye CDN
- ⚠️ Sin transformaciones automáticas
- ⚠️ Requiere configuración de volumen
- 💰 Costo: ~$0.25/GB/mes

**Implementación:**

1. **Crear volumen en Railway**

   - Dashboard > Service > Settings > Volumes
   - Mount Path: `/app/uploads`

2. **Código del endpoint** (ver archivo adjunto: `railway-volume-upload.ts`)

---

### ❌ Opción 4: Base64 en Base de Datos (NO RECOMENDADO)

**Por qué NO:**

- ❌ Aumenta tamaño de BD dramáticamente
- ❌ Lento para cargar
- ❌ No escalable
- ❌ Costoso en términos de rendimiento

---

## Recomendación Final

### Para tu caso: **Cloudinary**

**Razones:**

1. ✅ **Gratuito** para tu volumen de imágenes
2. ✅ **Optimización automática** - reduce tamaño sin perder calidad
3. ✅ **CDN global** - carga rápida en todo el mundo
4. ✅ **Fácil de implementar** - 30 minutos de setup
5. ✅ **Transformaciones on-the-fly** - puedes cambiar tamaño en la URL
6. ✅ **Backup automático** - nunca pierdes imágenes

**Ejemplo de URL de Cloudinary:**

```
https://res.cloudinary.com/tu-cloud/image/upload/w_1200,q_85,f_auto/classes/surf-class-1.jpg
```

Parámetros en la URL:

- `w_1200` - ancho máximo 1200px
- `q_85` - calidad 85%
- `f_auto` - formato automático (WebP en navegadores compatibles)

---

## Flujo Completo con Cloudinary

### 1. Usuario sube imagen

```typescript
// Frontend: ClassForm.tsx
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "classes"); // Organizar por carpetas

  const response = await fetch("/api/images/upload", {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });

  const { url } = await response.json();
  // url = "https://res.cloudinary.com/..."
};
```

### 2. Backend procesa y sube a Cloudinary

```typescript
// Backend: routes/images.ts
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  const file = req.file;
  const folder = req.body.folder || "general";

  // Subir a Cloudinary
  const result = await cloudinary.uploader
    .upload_stream(
      {
        folder: `clasedesurf/${folder}`,
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    )
    .end(file.buffer);
});
```

### 3. Guardar URL en base de datos

```typescript
// La URL de Cloudinary se guarda en la columna images[] de la clase
await prisma.class.create({
  data: {
    title: "Clase de Surf",
    images: [
      "https://res.cloudinary.com/tu-cloud/image/upload/v1234/classes/surf-1.jpg",
    ],
  },
});
```

### 4. Mostrar imagen optimizada

```typescript
// Frontend: Componente de imagen
<Image
  src={imageUrl}
  alt="Clase de surf"
  width={1200}
  height={800}
  // Cloudinary automáticamente optimiza según el dispositivo
/>
```

---

## Comparación de Costos (Estimado para 1000 imágenes)

| Opción              | Almacenamiento | CDN          | Transformaciones | Costo/mes |
| ------------------- | -------------- | ------------ | ---------------- | --------- |
| **Cloudinary**      | 25GB gratis    | ✅ Incluido  | ✅ Incluido      | **$0**    |
| AWS S3 + CloudFront | 5GB            | ✅ Adicional | ❌ Manual        | ~$5       |
| Railway Volumes     | 5GB            | ❌ No        | ❌ No            | ~$1.25    |
| Base de Datos       | N/A            | ❌ No        | ❌ No            | 💸 Alto   |

---

## Próximos Pasos

1. ✅ Crear cuenta en Cloudinary (5 minutos)
2. ✅ Obtener credenciales
3. ✅ Agregar variables de entorno en Railway
4. ✅ Implementar endpoint de upload
5. ✅ Probar subida de imágenes
6. ✅ Verificar que las URLs persistan después de deploy

---

## Archivos a Crear

He preparado los siguientes archivos de implementación:

1. `backend/src/routes/images-upload.ts` - Endpoint completo con Cloudinary
2. `backend/src/config/cloudinary.ts` - Configuración de Cloudinary
3. `CLOUDINARY_SETUP.md` - Guía paso a paso de configuración

¿Quieres que proceda con la implementación de Cloudinary?
