import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';

/**
 * API Route para optimizar imágenes a WebP
 * 
 * Parámetros de query:
 * - url: URL de la imagen a optimizar (requerido)
 * - quality: Calidad de la imagen WebP (1-100, default: 80)
 * - width: Ancho máximo en píxeles (opcional)
 * - height: Alto máximo en píxeles (opcional)
 * 
 * Ejemplo: /api/image-optimizer?url=https://example.com/image.jpg&quality=85&width=800
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');
    const quality = Math.min(100, Math.max(1, parseInt(searchParams.get('quality') || '80', 10)));
    const widthParam = searchParams.get('width');
    const heightParam = searchParams.get('height');
    const width = widthParam ? parseInt(widthParam, 10) : undefined;
    const height = heightParam ? parseInt(heightParam, 10) : undefined;

    if (!imageUrl) {
        return NextResponse.json({
            error: 'URL parameter is required',
            usage: '/api/image-optimizer?url=<image-url>&quality=80&width=800'
        }, { status: 400 });
    }

    try {
        console.log('[Image Optimizer] Processing:', imageUrl);
        console.log('[Image Optimizer] Settings:', { quality, width, height });

        // Fetch la imagen
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*',
            },
        });

        if (!response.ok) {
            console.error('[Image Optimizer] Fetch failed:', response.status);
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        // Obtener el buffer de la imagen original
        const imageBuffer = await response.arrayBuffer();
        const originalBuffer = Buffer.from(imageBuffer);
        const originalSize = originalBuffer.length;

        console.log('[Image Optimizer] Original size:', (originalSize / 1024).toFixed(2), 'KB');

        // Procesar con Sharp
        let processor = sharp(originalBuffer);

        // Obtener metadata de la imagen original
        const metadata = await processor.metadata();
        console.log('[Image Optimizer] Original format:', metadata.format);
        console.log('[Image Optimizer] Original dimensions:', metadata.width, 'x', metadata.height);

        // Redimensionar si se especifican dimensiones
        if (width || height) {
            processor = processor.resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true,
            });
        }

        // Convertir a WebP con optimización
        const webpBuffer = await processor
            .webp({
                quality,
                effort: 6, // Máximo esfuerzo de compresión (0-6)
                lossless: false,
            })
            .toBuffer();

        const optimizedSize = webpBuffer.length;
        const compressionRatio = ((1 - optimizedSize / originalSize) * 100);

        console.log('[Image Optimizer] Optimized size:', (optimizedSize / 1024).toFixed(2), 'KB');
        console.log('[Image Optimizer] Saved:', compressionRatio.toFixed(2) + '%');

        return new NextResponse(new Uint8Array(webpBuffer), {
            headers: {
                'Content-Type': 'image/webp',
                'Cache-Control': 'public, max-age=31536000, immutable', // Cache por 1 año
                'X-Original-Format': metadata.format || 'unknown',
                'X-Original-Size': originalSize.toString(),
                'X-Optimized-Size': optimizedSize.toString(),
                'X-Compression-Ratio': compressionRatio.toFixed(2) + '%',
                'X-Original-Dimensions': `${metadata.width}x${metadata.height}`,
            },
        });
    } catch (error) {
        console.error('[Image Optimizer] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to optimize image',
                details: error instanceof Error ? error.message : 'Unknown error',
                url: imageUrl
            },
            { status: 500 }
        );
    }
}

/**
 * POST endpoint para subir y optimizar imágenes
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const quality = parseInt(formData.get('quality') as string || '80', 10);
        const width = formData.get('width') ? parseInt(formData.get('width') as string, 10) : undefined;
        const height = formData.get('height') ? parseInt(formData.get('height') as string, 10) : undefined;

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        console.log('[Image Optimizer] Uploading file:', file.name, file.type, file.size);

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

        console.log('[Image Optimizer] Upload optimized:', (optimizedSize / 1024).toFixed(2), 'KB');
        console.log('[Image Optimizer] Saved:', compressionRatio.toFixed(2) + '%');

        return new NextResponse(new Uint8Array(webpBuffer), {
            headers: {
                'Content-Type': 'image/webp',
                'X-Original-Format': metadata.format || 'unknown',
                'X-Original-Size': originalSize.toString(),
                'X-Optimized-Size': optimizedSize.toString(),
                'X-Compression-Ratio': compressionRatio.toFixed(2) + '%',
                'Content-Disposition': `attachment; filename="${file.name.replace(/\.[^/.]+$/, '')}.webp"`,
            },
        });
    } catch (error) {
        console.error('[Image Optimizer] Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to process uploaded image', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
