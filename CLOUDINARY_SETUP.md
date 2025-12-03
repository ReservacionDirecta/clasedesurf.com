# Configuración de Cloudinary para Imágenes

Para que la subida de imágenes funcione correctamente y persista entre deploys, necesitamos configurar Cloudinary.

## 1. Instalar Dependencias

Ejecuta estos comandos en la carpeta `backend`:

```bash
cd backend
npm install cloudinary multer
npm install --save-dev @types/multer
```

## 2. Obtener Credenciales de Cloudinary

1. Ve a [Cloudinary](https://cloudinary.com/) y regístrate (es gratis).
2. En el Dashboard, verás tus "Product Environment Credentials":
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## 3. Configurar Variables de Entorno

### En Desarrollo (.env)

Edita el archivo `backend/.env` y agrega:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### En Producción (Railway)

1. Ve a tu proyecto en Railway.
2. Selecciona el servicio `backend`.
3. Ve a la pestaña "Variables".
4. Agrega las mismas 3 variables con tus credenciales.

## 4. Verificar Funcionamiento

Una vez configurado:

1. Reinicia el backend (`npm run dev` o redeploy en Railway).
2. Intenta subir una imagen desde el formulario de clases.
3. La imagen debería aparecer en tu Media Library de Cloudinary en la carpeta `clasedesurf/classes`.

## Notas Adicionales

- Las imágenes se optimizan automáticamente (formato, tamaño, calidad).
- El límite de tamaño por archivo es 5MB.
- Se permiten formatos JPG, PNG y WebP.
