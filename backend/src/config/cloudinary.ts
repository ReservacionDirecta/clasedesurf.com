import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary con variables de entorno
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export default cloudinary;

// Utilidades para trabajar con Cloudinary
export const uploadToCloudinary = (
    fileBuffer: Buffer,
    folder: string = 'general',
    options: any = {}
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `clasedesurf/${folder}`,
                transformation: [
                    { width: 1200, crop: 'limit' }, // Máximo 1200px de ancho
                    { quality: 'auto:good' }, // Calidad automática optimizada
                    { fetch_format: 'auto' } // Formato automático (WebP si es compatible)
                ],
                ...options
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

// Generar URL optimizada
export const getOptimizedUrl = (
    publicId: string,
    width?: number,
    height?: number,
    quality: string = 'auto:good'
): string => {
    return cloudinary.url(publicId, {
        width,
        height,
        crop: 'limit',
        quality,
        fetch_format: 'auto',
        secure: true
    });
};
