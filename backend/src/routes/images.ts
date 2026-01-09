import express from 'express';
import requireAuth, { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define storage path
const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, '../../uploads');

// Ensure directory exists
if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

const router = express.Router();


// Configure multer for disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, STORAGE_PATH);
    },
    filename: (req, file, cb) => {
        // Log basic file info
        console.log('Processing upload:', file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        // Validate file type
        if (file.mimetype.match(/^image\/(jpeg|jpg|png|webp|gif)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos JPG, PNG, GIF o WebP'));
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

// POST /images/upload - Upload image to Local Storage
router.post('/upload', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                error: 'No se proporcionó ningún archivo'
            });
        }

        const folder = req.body.folder || 'misc';

        console.log('[POST /images/upload] Upload successful:', {
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            folder,
            userId: req.userId,
            path: file.path
        });

        // Construct public URL
        // Assuming server serves STORAGE_PATH at /uploads
        const protocol = req.protocol; // http or https
        const host = req.get('host'); // domain:port

        // Use environment variable for public URL if set (useful for Railway)
        const baseUrl = process.env.PUBLIC_URL || `${protocol}://${host}`;
        const url = `${baseUrl}/uploads/${file.filename}`;

        res.json({
            success: true,
            url: url,
            publicId: file.filename, // Using filename as ID
            width: 0, // Metadata not extracted in basic disk storage without extra libs
            height: 0,
            format: path.extname(file.originalname).replace('.', ''),
            bytes: file.size
        });
    } catch (error: any) {
        console.error('[POST /images/upload] Error:', error);

        if (error.message === 'Solo se permiten archivos JPG, PNG, GIF o WebP') {
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
