import express from 'express';
import requireAuth, { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import multer from 'multer';
import { uploadToCloudinary } from '../config/cloudinary';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: (req, file, cb) => {
        // Validate file type
        if (file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos JPG, PNG o WebP'));
        }
    }
});

// GET /images/library - Get all images uploaded by the user's school
router.get('/library', requireAuth, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Get user with their school/instructor info
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            include: {
                instructor: {
                    include: {
                        school: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let schoolId: number | null = null;

        // Determine school ID based on user role
        if (user.role === 'SCHOOL_ADMIN' || user.role === 'INSTRUCTOR') {
            schoolId = user.instructor?.schoolId || null;

            if (!schoolId) {
                return res.status(403).json({ message: 'No school associated with this user' });
            }
        }
        // ADMIN (super admin) can see all images from all schools

        // Get all classes (filtered by school if not super admin) and extract unique images
        const classes = await prisma.class.findMany({
            where: schoolId ? { schoolId } : {}, // Super admin sees all
            select: {
                id: true,
                title: true,
                images: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Extract all unique images with metadata
        const imageMap = new Map<string, { url: string; classTitle: string; uploadedAt: Date }>();

        classes.forEach(classItem => {
            if (classItem.images && Array.isArray(classItem.images)) {
                classItem.images.forEach((imageUrl: string) => {
                    if (!imageMap.has(imageUrl)) {
                        imageMap.set(imageUrl, {
                            url: imageUrl,
                            classTitle: classItem.title,
                            uploadedAt: classItem.createdAt
                        });
                    }
                });
            }
        });

        const images = Array.from(imageMap.values());

        res.json({
            success: true,
            images,
            total: images.length
        });
    } catch (error) {
        console.error('Error fetching image library:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /images/upload - Upload image to Cloudinary
router.post('/upload', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                error: 'No se proporcionó ningún archivo'
            });
        }

        const folder = req.body.folder || 'classes';
        const quality = req.body.quality || '85';
        const width = req.body.width ? parseInt(req.body.width) : 1200;

        console.log('[POST /images/upload] Uploading image:', {
            filename: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            folder,
            userId: req.userId
        });

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, folder, {
            transformation: [
                { width, crop: 'limit' },
                { quality: `auto:${quality}` },
                { fetch_format: 'auto' }
            ]
        });

        console.log('[POST /images/upload] Upload successful:', {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
        });

        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
        });
    } catch (error: any) {
        console.error('[POST /images/upload] Error:', error);

        if (error.message === 'Solo se permiten archivos JPG, PNG o WebP') {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al subir la imagen. Intenta de nuevo.'
        });
    }
});

export default router;
