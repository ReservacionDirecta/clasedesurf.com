import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
    src: string;
    quality?: number;
    useProxy?: boolean;
    fallbackSrc?: string;
}

/**
 * Componente de imagen optimizada que automáticamente usa el proxy de optimización
 * para imágenes externas y convierte a WebP
 * 
 * @param src - URL de la imagen (puede ser externa o local)
 * @param quality - Calidad de la imagen WebP (1-100, default: 80)
 * @param useProxy - Forzar uso del proxy incluso para imágenes locales
 * @param fallbackSrc - Imagen de respaldo si falla la carga
 * @param ...props - Resto de props de Next.js Image
 */
export default function OptimizedImage({
    src,
    quality = 80,
    useProxy = false,
    fallbackSrc,
    alt,
    ...props
}: OptimizedImageProps) {
    // Determinar si la imagen es externa
    const isExternal = src.startsWith('http://') || src.startsWith('https://');
    const isInstagram = src.includes('instagram.com') || src.includes('cdninstagram.com');

    // Construir la URL optimizada
    let optimizedSrc = src;

    if (isInstagram) {
        // Usar el proxy de Instagram
        optimizedSrc = `/api/instagram-proxy?url=${encodeURIComponent(src)}&quality=${quality}`;
        if (props.width) {
            optimizedSrc += `&width=${props.width}`;
        }
    } else if (isExternal || useProxy) {
        // Usar el optimizador general para otras imágenes externas
        optimizedSrc = `/api/image-optimizer?url=${encodeURIComponent(src)}&quality=${quality}`;
        if (props.width) {
            optimizedSrc += `&width=${props.width}`;
        }
        if (props.height) {
            optimizedSrc += `&height=${props.height}`;
        }
    }

    return (
        <Image
            src={optimizedSrc}
            alt={alt}
            {...props}
            onError={(e) => {
                // Si falla la carga y hay fallback, usarlo
                if (fallbackSrc) {
                    const target = e.target as HTMLImageElement;
                    target.src = fallbackSrc;
                }
                // Llamar al onError original si existe
                if (props.onError) {
                    props.onError(e);
                }
            }}
        />
    );
}
