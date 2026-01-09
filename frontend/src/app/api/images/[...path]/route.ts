import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/images/[...path]
 * Sirve imágenes desde el directorio de uploads
 * Ejemplo: /api/images/uploads/classes/1234567890-abc123.webp
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  try {
    const imagePath = params.path.join('/');

    // La ruta viene como "uploads/classes/filename.webp"
    // Necesitamos construir la ruta correcta en public/
    // Si la ruta ya incluye "uploads", usarla directamente, sino agregarla
    let relativePath = imagePath;
    if (!imagePath.startsWith('uploads/')) {
      // Si no empieza con uploads, asumir que es una ruta relativa a uploads
      relativePath = `uploads/${imagePath}`;
    }

    // Construir la ruta completa del archivo
    const filePath = join(process.cwd(), 'public', relativePath);

    // Verificar que el archivo existe
    if (!existsSync(filePath)) {
      console.warn(`[Image Serve] File not found: ${filePath} (from path: ${imagePath})`);
      return new NextResponse('Image not found', { status: 404 });
    }

    // Leer el archivo
    const fileBuffer = await readFile(filePath);

    // Determinar el tipo MIME basado en la extensión
    const extension = imagePath.split('.').pop()?.toLowerCase();
    let contentType = 'image/webp'; // Por defecto WebP

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
    }

    // Retornar la imagen con los headers apropiados
    // NextResponse acepta Uint8Array directamente
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache por 1 año
      },
    });
  } catch (error) {
    console.error('[Image Serve] Error:', error);
    return new NextResponse('Error serving image', { status: 500 });
  }
}

