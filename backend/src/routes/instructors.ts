import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /instructors - Get all instructors (filtered by school for SCHOOL_ADMIN)
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { schoolId } = req.query;
    
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    let where: any = { isActive: true };

    // If SCHOOL_ADMIN, only show instructors from their school
    if (user.role === 'SCHOOL_ADMIN') {
      const userSchool = await prisma.school.findFirst({
        where: { ownerId: Number(userId) }
      });
      
      if (!userSchool) {
        return res.status(404).json({ message: 'No school found for this user' });
      }
      
      where.schoolId = userSchool.id;
    } else if (schoolId) {
      // ADMIN can filter by specific school
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

// POST /instructors/create-with-user - Create user and instructor in one operation
router.post('/create-with-user', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { userData, bio, yearsExperience, specialties, certifications, sendWelcomeEmail } = req.body;
    const currentUserId = req.userId;

    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const currentUser = await prisma.user.findUnique({ where: { id: Number(currentUserId) } });
    if (!currentUser) return res.status(401).json({ message: 'User not found' });

    // Get school for SCHOOL_ADMIN
    let schoolId: number | undefined;
    if (currentUser.role === 'SCHOOL_ADMIN') {
      const userSchool = await prisma.school.findFirst({
        where: { ownerId: Number(currentUserId) }
      });
      
      if (!userSchool) {
        return res.status(404).json({ message: 'No school found for this user' });
      }
      
      schoolId = userSchool.id;
    }

    // Validate that we have a schoolId
    if (!schoolId) {
      return res.status(400).json({ message: 'School ID is required' });
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: userData.email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user and instructor in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: hashedPassword,
          role: 'INSTRUCTOR'
        }
      });

      // Create instructor profile
      const instructor = await tx.instructor.create({
        data: {
          userId: newUser.id,
          schoolId: schoolId,
          bio: bio || `Instructor de surf. Perfil creado por la escuela.`,
          yearsExperience: Number(yearsExperience) || 1,
          specialties: specialties || ['Surf para principiantes'],
          certifications: certifications || [],
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

      return { user: newUser, instructor };
    });

    // TODO: Send welcome email if requested
    if (sendWelcomeEmail) {
      console.log(`Welcome email should be sent to ${userData.email}`);
      // Implement email sending logic here
    }

    res.status(201).json(result.instructor);
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
    }: {
      userId: number;
      schoolId?: number;
      bio?: string;
      yearsExperience?: number;
      specialties?: string[];
      certifications?: string[];
      profileImage?: string;
    } = req.body;

    const currentUserId = req.userId;
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const currentUser = await prisma.user.findUnique({ where: { id: Number(currentUserId) } });
    if (!currentUser) return res.status(401).json({ message: 'User not found' });

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Check if instructor profile already exists
    const existing = await prisma.instructor.findUnique({ where: { userId: Number(userId) } });
    if (existing) {
      return res.status(400).json({ message: 'Instructor profile already exists' });
    }

    let finalSchoolId = schoolId;

    // If SCHOOL_ADMIN, force schoolId to be their school
    if (currentUser.role === 'SCHOOL_ADMIN') {
      const userSchool = await prisma.school.findFirst({
        where: { ownerId: Number(currentUserId) }
      });
      
      if (!userSchool) {
        return res.status(404).json({ message: 'No school found for this user' });
      }
      
      finalSchoolId = userSchool.id;
    }

    // Verify school exists
    const school = await prisma.school.findUnique({ where: { id: Number(finalSchoolId) } });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const instructor = await prisma.instructor.create({
      data: {
        userId: Number(userId),
        schoolId: Number(finalSchoolId),
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
    const userId = req.userId;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Check if instructor exists
    const existingInstructor = await prisma.instructor.findUnique({
      where: { id: Number(id) },
      include: { school: true }
    });

    if (!existingInstructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // If SCHOOL_ADMIN, verify they own the school
    if (user.role === 'SCHOOL_ADMIN') {
      const userSchool = await prisma.school.findFirst({
        where: { ownerId: Number(userId) }
      });
      
      if (!userSchool || userSchool.id !== existingInstructor.schoolId) {
        return res.status(403).json({ message: 'You can only update instructors from your school' });
      }
    }

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

// DELETE /instructors/:id - Deactivate instructor (ADMIN or SCHOOL_ADMIN only)
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Check if instructor exists
    const existingInstructor = await prisma.instructor.findUnique({
      where: { id: Number(id) },
      include: { school: true }
    });

    if (!existingInstructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // If SCHOOL_ADMIN, verify they own the school
    if (user.role === 'SCHOOL_ADMIN') {
      const userSchool = await prisma.school.findFirst({
        where: { ownerId: Number(userId) }
      });
      
      if (!userSchool || userSchool.id !== existingInstructor.schoolId) {
        return res.status(403).json({ message: 'You can only delete instructors from your school' });
      }
    }

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
