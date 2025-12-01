import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');
    const quality = parseInt(searchParams.get('quality') || '80', 10);
    const widthParam = searchParams.get('width');
    const width = widthParam ? parseInt(widthParam, 10) : undefined;

    if (!imageUrl) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        console.log('[Instagram Proxy] Fetching image:', imageUrl);

        // Fetch la imagen de Instagram con headers apropiados
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.instagram.com/',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
        });

        if (!response.ok) {
            console.error('[Instagram Proxy] Failed to fetch:', response.status, response.statusText);
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        // Obtener el buffer de la imagen
        const imageBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);

        console.log('[Instagram Proxy] Image fetched, size:', buffer.length, 'bytes');

        // Optimizar y convertir a WebP usando Sharp
        let optimizedImage = sharp(buffer);

        // Redimensionar si se especifica un ancho
        if (width) {
            optimizedImage = optimizedImage.resize(width, null, {
                fit: 'inside',
                withoutEnlargement: true,
            });
        }

        // Convertir a WebP con la calidad especificada
        const webpBuffer = await optimizedImage
            .webp({ quality, effort: 4 })
            .toBuffer();

        console.log('[Instagram Proxy] Optimized to WebP, new size:', webpBuffer.length, 'bytes');
        console.log('[Instagram Proxy] Compression ratio:', ((1 - webpBuffer.length / buffer.length) * 100).toFixed(2) + '%');

        return new NextResponse(new Uint8Array(webpBuffer), {
            headers: {
                'Content-Type': 'image/webp',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800', // Cache por 24 horas, revalidar en 7 días
                'X-Original-Size': buffer.length.toString(),
                'X-Optimized-Size': webpBuffer.length.toString(),
                'X-Compression-Ratio': ((1 - webpBuffer.length / buffer.length) * 100).toFixed(2) + '%',
            },
        });
    } catch (error) {
        console.error('[Instagram Proxy] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch and optimize image', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
