import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Directorio donde se guardarán las imágenes (relativo al proyecto)
// ⚠️ IMPORTANTE: En Railway, el sistema de archivos es efímero. Las imágenes se perderán en cada redeploy.
// Para producción, se recomienda usar un servicio de almacenamiento persistente como:
// - AWS S3 + CloudFront
// - Cloudinary
// - Google Cloud Storage
// - Railway Volumes (si está disponible)
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads', 'classes');
const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null) ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null) ||
  (process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL : null) ||
  'http://localhost:3000';

/**
 * POST /api/images/upload
 * Sube y optimiza una imagen, guardándola de forma persistente
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const quality = parseInt(formData.get('quality') as string || '85', 10);
    const width = formData.get('width') ? parseInt(formData.get('width') as string, 10) : undefined;
    const height = formData.get('height') ? parseInt(formData.get('height') as string, 10) : undefined;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    console.log('[Image Upload] Processing file:', file.name, file.type, file.size);

    // Convertir el archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);
    const originalSize = originalBuffer.length;

    // Procesar con Sharp
    let processor = sharp(originalBuffer);
    const metadata = await processor.metadata();

    // Redimensionar si se especifica
    if (width || height) {
      processor = processor.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convertir a WebP
    const webpBuffer = await processor
      .webp({ quality, effort: 6 })
      .toBuffer();

    const optimizedSize = webpBuffer.length;
    const compressionRatio = ((1 - optimizedSize / originalSize) * 100);

    console.log('[Image Upload] Optimized:', (optimizedSize / 1024).toFixed(2), 'KB');
    console.log('[Image Upload] Saved:', compressionRatio.toFixed(2) + '%');

    // Crear directorio si no existe
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
      console.log('[Image Upload] Created directory:', UPLOAD_DIR);
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.webp`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Guardar archivo
    await writeFile(filePath, webpBuffer);
    console.log('[Image Upload] File saved to:', filePath);

    // Generar URL pública
    // Usar la ruta API para servir las imágenes de forma confiable
    // En producción, esto debería apuntar a un CDN o servicio de almacenamiento
    const publicUrl = `${PUBLIC_URL}/api/images/uploads/classes/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      originalSize,
      optimizedSize,
      compressionRatio: compressionRatio.toFixed(2) + '%',
      format: 'webp',
      dimensions: {
        width: metadata.width,
        height: metadata.height
      }
    });
  } catch (error) {
    console.error('[Image Upload] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

