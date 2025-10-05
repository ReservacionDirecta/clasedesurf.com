import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /instructors - Get all instructors (optionally filter by school)
router.get('/', async (req, res) => {
  try {
    const { schoolId } = req.query;
    
    const where: any = { isActive: true };
    if (schoolId) {
      where.schoolId = Number(schoolId);
    }

    const instructors = await prisma.instructor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { rating: 'desc' }
    });

    res.json(instructors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /instructors/:id - Get specific instructor
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const instructor = await prisma.instructor.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    res.json(instructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /instructors - Create instructor (SCHOOL_ADMIN or ADMIN only)
router.post('/', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const {
      userId,
      schoolId,
      bio,
      yearsExperience,
      specialties,
      certifications,
      profileImage
    } = req.body;

    // Check if user exists and is an instructor
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if instructor profile already exists
    const existing = await prisma.instructor.findUnique({ where: { userId: Number(userId) } });
    if (existing) {
      return res.status(400).json({ message: 'Instructor profile already exists' });
    }

    const instructor = await prisma.instructor.create({
      data: {
        userId: Number(userId),
        schoolId: Number(schoolId),
        bio,
        yearsExperience: Number(yearsExperience) || 0,
        specialties: specialties || [],
        certifications: certifications || [],
        profileImage
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        school: true
      }
    });

    res.status(201).json(instructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /instructors/:id - Update instructor (SCHOOL_ADMIN or ADMIN only)
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const instructor = await prisma.instructor.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        school: true,
        reviews: true
      }
    });

    res.json(instructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /instructors/:id/reviews - Add review to instructor
router.post('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await prisma.instructorReview.create({
      data: {
        instructorId: Number(id),
        studentName,
        rating: Number(rating),
        comment
      }
    });

    // Update instructor's average rating
    const allReviews = await prisma.instructorReview.findMany({
      where: { instructorId: Number(id) }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.instructor.update({
      where: { id: Number(id) },
      data: {
        rating: avgRating,
        totalReviews: allReviews.length
      }
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /instructors/:id - Deactivate instructor (ADMIN only)
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.instructor.update({
      where: { id: Number(id) },
      data: { isActive: false }
    });

    res.json({ message: 'Instructor deactivated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
