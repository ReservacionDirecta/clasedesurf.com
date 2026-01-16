import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { validateBody, validateParams } from '../middleware/validation';
import requireAuth, { AuthRequest, requireRole, optionalAuth } from '../middleware/auth';
import resolveSchool from '../middleware/resolve-school';
import { buildMultiTenantWhere, enforceSchoolAccess } from '../middleware/multi-tenant';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createInstructorSchema = z.object({
  userId: z.number().int().positive(),
  schoolId: z.number().int().positive().optional(),
  bio: z.string().optional(),
  yearsExperience: z.number().int().min(0).default(0),
  specialties: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  profileImage: z.string().url().optional(),
  instructorRole: z.enum(['INSTRUCTOR', 'HEAD_COACH']).default('INSTRUCTOR')
});

// POST /instructors/create-with-user - Create instructor and associated user
router.post('/create-with-user', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, async (req: AuthRequest, res) => {
  try {
    const {
      userData,
      bio,
      yearsExperience,
      specialties,
      certifications,
      profileImage,
      instructorRole,
      schoolId,
      sendWelcomeEmail
    }: {
      userData: {
        name: string;
        email: string;
        phone?: string | null;
        password: string;
        role?: string;
      };
      bio?: string;
      yearsExperience?: number;
      specialties?: string[];
      certifications?: string[];
      profileImage?: string;
      instructorRole?: 'INSTRUCTOR' | 'HEAD_COACH';
      schoolId?: number;
      sendWelcomeEmail?: boolean;
    } = req.body;

    if (!userData || !userData.name || !userData.email || !userData.password) {
      res.status(400).json({ message: 'Missing required user data fields' });
      return;
    }

    // Determine target school
    let targetSchoolId: number | undefined;
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) {
        res.status(404).json({ message: 'No school found for this user' });
        return;
      }
      targetSchoolId = req.schoolId;
    } else if (req.role === 'ADMIN') {
      if (!schoolId) {
        res.status(400).json({ message: 'School ID is required' });
        return;
      }
      targetSchoolId = schoolId;
    }

    if (!targetSchoolId) {
      res.status(400).json({ message: 'School ID could not be determined' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || null,
          password: hashedPassword,
          role: 'INSTRUCTOR'
        }
      });

      const newInstructor = await tx.instructor.create({
        data: {
          userId: newUser.id,
          schoolId: targetSchoolId as number,
          bio: bio || null,
          yearsExperience: yearsExperience ?? 0,
          specialties: specialties || [],
          certifications: certifications || [],
          profileImage: profileImage || null,
          instructorRole: instructorRole || 'INSTRUCTOR',
          isActive: true
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
          school: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        }
      });

      return { user: newUser, instructor: newInstructor };
    });

    if (sendWelcomeEmail) {
      console.log(`Welcome email should be sent to ${userData.email}`);
    }

    res.status(201).json(result.instructor);
  } catch (err) {
    console.error('[POST /instructors/create-with-user] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const updateInstructorSchema = z.object({
  bio: z.string().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  profileImage: z.string().url().optional(),
  instructorRole: z.enum(['INSTRUCTOR', 'HEAD_COACH']).optional(),
  isActive: z.boolean().optional()
});

const instructorIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number')
});

// GET /instructors - List instructors (filtered by role)
router.get('/', optionalAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    const { schoolId, isActive } = req.query;

    // Build where clause with multi-tenant filtering
    const where = await buildMultiTenantWhere(req, 'instructor');

    // Additional filters
    if (schoolId && (req.role === 'ADMIN' || !req.role)) {
      where.schoolId = Number(schoolId);
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
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
          select: {
            id: true,
            rating: true,
            comment: true,
            studentName: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(instructors);
  } catch (err) {
    console.error('[GET /instructors] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /instructors/:id - Get instructor details
router.get('/:id', requireAuth, validateParams(instructorIdSchema), enforceSchoolAccess('instructor'), async (req: AuthRequest, res) => {
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
            phone: true,
            createdAt: true
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            location: true,
            phone: true,
            email: true,
            website: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            studentName: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    res.json(instructor);
  } catch (err) {
    console.error('[GET /instructors/:id] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /instructors - Create instructor (ADMIN or SCHOOL_ADMIN)
router.post('/', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateBody(createInstructorSchema), async (req: AuthRequest, res) => {
  try {
    const { userId, schoolId, bio, yearsExperience, specialties, certifications, profileImage, instructorRole } = req.body;

    // Determine final schoolId
    let finalSchoolId: number;

    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) {
        return res.status(404).json({ message: 'No school found for this user' });
      }
      finalSchoolId = req.schoolId;
    } else if (req.role === 'ADMIN') {
      if (!schoolId) {
        return res.status(400).json({ message: 'School ID is required' });
      }
      finalSchoolId = schoolId;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Verify user exists and doesn't already have an instructor profile
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { instructor: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.instructor) {
      return res.status(400).json({ message: 'User already has an instructor profile' });
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: Number(finalSchoolId) }
    });

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Create instructor profile
    const instructor = await prisma.instructor.create({
      data: {
        userId: Number(userId),
        schoolId: Number(finalSchoolId),
        bio: bio || null,
        yearsExperience: yearsExperience || 0,
        specialties: specialties || [],
        certifications: certifications || [],
        profileImage: profileImage || null,
        instructorRole: instructorRole || 'INSTRUCTOR',
        isActive: true
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
        school: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      }
    });

    // Update user role to INSTRUCTOR if not already
    if (user.role !== 'INSTRUCTOR') {
      await prisma.user.update({
        where: { id: Number(userId) },
        data: { role: 'INSTRUCTOR' }
      });
    }

    res.status(201).json(instructor);
  } catch (err) {
    console.error('[POST /instructors] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /instructors/:id - Update instructor (ADMIN, SCHOOL_ADMIN, or own profile)
router.put('/:id', requireAuth, validateParams(instructorIdSchema), enforceSchoolAccess('instructor'), validateBody(updateInstructorSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Get existing instructor
    const existing = await prisma.instructor.findUnique({
      where: { id: Number(id) }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // INSTRUCTOR can only update their own profile
    if (req.role === 'INSTRUCTOR' && existing.userId !== req.userId) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // Update instructor
    const updated = await prisma.instructor.update({
      where: { id: Number(id) },
      data,
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
        }
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('[PUT /instructors/:id] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /instructors/:id - Delete instructor (ADMIN or SCHOOL_ADMIN)
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), validateParams(instructorIdSchema), enforceSchoolAccess('instructor'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Get existing instructor
    const existing = await prisma.instructor.findUnique({
      where: { id: Number(id) }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Delete instructor profile
    await prisma.instructor.delete({
      where: { id: Number(id) }
    });

    // Optionally update user role back to STUDENT
    await prisma.user.update({
      where: { id: existing.userId },
      data: { role: 'STUDENT' }
    });

    res.json({ message: 'Instructor deleted successfully' });
  } catch (err) {
    console.error('[DELETE /instructors/:id] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /instructors/:id/classes - Get classes for an instructor
router.get('/:id/classes', requireAuth, validateParams(instructorIdSchema), enforceSchoolAccess('instructor'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const instructor = await prisma.instructor.findUnique({
      where: { id: Number(id) },
      select: { schoolId: true, user: { select: { name: true } } }
    });

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Find classes where instructor name matches
    const classes = await prisma.class.findMany({
      where: {
        schoolId: instructor.schoolId,
        instructor: instructor.user.name
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        reservations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            payment: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    res.json(classes);
  } catch (err) {
    console.error('[GET /instructors/:id/classes] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /instructors/:id/reviews - Add review for instructor
router.post('/:id/reviews', requireAuth, validateParams(instructorIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: Number(req.userId) }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create review
    const review = await prisma.instructorReview.create({
      data: {
        instructorId: Number(id),
        studentName: user.name,
        rating: Number(rating),
        comment: comment || null
      }
    });

    // Update instructor rating
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
    console.error('[POST /instructors/:id/reviews] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
