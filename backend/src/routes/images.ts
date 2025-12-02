import express from 'express';
import requireAuth, { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

const router = express.Router();

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
        }

        if (!schoolId) {
            return res.status(403).json({ message: 'No school associated with this user' });
        }

        // Get all classes from this school and extract unique images
        const classes = await prisma.class.findMany({
            where: { schoolId },
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

export default router;
