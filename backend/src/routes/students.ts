import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /students - Get all students (filtered by school for SCHOOL_ADMIN)
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { schoolId } = req.query;
    
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    let where: any = {};

    // If SCHOOL_ADMIN, only show students from their school
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

    const students = await prisma.student.findMany({
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get detailed reservation data for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        // Get reservations for this student
        const reservations = await prisma.reservation.findMany({
          where: {
            userId: student.userId
          },
          include: {
            class: true,
            payment: true
          }
        });
        
        // Calculate stats
        const totalClasses = reservations.length;
        const completedClasses = reservations.filter(r => r.status === 'CONFIRMED').length;
        const totalPaid = reservations
          .filter(r => r.payment && r.payment.status === 'PAID')
          .reduce((sum, r) => sum + Number(r.payment!.amount), 0);
        
        // Get last class date
        const lastReservation = reservations
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        return {
          ...student,
          totalClasses,
          completedClasses,
          totalPaid,
          lastClass: lastReservation?.createdAt || student.createdAt,
          status: totalClasses > 0 ? 'active' : 'inactive',
          averageRating: 4.5 // TODO: Calculate from reviews when implemented
        };
      })
    );

    res.json(studentsWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /students/:id - Get specific student
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
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
        }
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /students/create-with-user - Create student with user account (SCHOOL_ADMIN or ADMIN only)
router.post('/create-with-user', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const {
      userData,
      birthdate,
      notes,
      level,
      canSwim,
      sendWelcomeEmail
    }: {
      userData: {
        name: string;
        email: string;
        phone?: string;
        password: string;
        role: string;
      };
      birthdate?: string;
      notes?: string;
      level?: string;
      canSwim?: boolean;
      sendWelcomeEmail?: boolean;
    } = req.body;

    const currentUserId = req.userId;
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const currentUser = await prisma.user.findUnique({ where: { id: Number(currentUserId) } });
    if (!currentUser) return res.status(401).json({ message: 'User not found' });

    // Determine schoolId
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

    // Validate required userData fields
    if (!userData || !userData.name || !userData.email || !userData.password) {
      return res.status(400).json({ message: 'Missing required user data fields' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || null,
          password: hashedPassword,
          role: 'STUDENT'
        }
      });

      // Create student profile
      const newStudent = await tx.student.create({
        data: {
          userId: newUser.id,
          schoolId: schoolId,
          birthdate: birthdate ? new Date(birthdate) : null,
          notes: notes || null,
          level: (level as any) || 'BEGINNER',
          canSwim: canSwim || false
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

      return { user: newUser, student: newStudent };
    });

    // Send welcome email if requested
    if (sendWelcomeEmail) {
      console.log(`Welcome email should be sent to ${userData.email}`);
      // Implement email sending logic here
    }

    res.status(201).json(result.student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /students - Create student profile for existing user (SCHOOL_ADMIN or ADMIN only)
router.post('/', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const {
      userId,
      schoolId,
      birthdate,
      notes,
      level,
      canSwim
    }: {
      userId: number;
      schoolId?: number;
      birthdate?: string;
      notes?: string;
      level?: string;
      canSwim?: boolean;
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

    // Check if student profile already exists
    const existing = await prisma.student.findUnique({ where: { userId: Number(userId) } });
    if (existing) {
      return res.status(400).json({ message: 'Student profile already exists' });
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

    // Verify school exists if provided
    if (finalSchoolId) {
      const school = await prisma.school.findUnique({ where: { id: Number(finalSchoolId) } });
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }
    }

    const student = await prisma.student.create({
      data: {
        userId: Number(userId),
        schoolId: finalSchoolId ? Number(finalSchoolId) : null,
        birthdate: birthdate ? new Date(birthdate) : null,
        notes: notes || null,
        level: (level as any) || 'BEGINNER',
        canSwim: canSwim || false
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

    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /students/:id - Update student (SCHOOL_ADMIN, ADMIN, or own profile)
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      birthdate,
      notes,
      level,
      canSwim
    } = req.body;

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const student = await prisma.student.findUnique({
      where: { id: Number(id) }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check authorization
    const isOwnProfile = student.userId === Number(userId);
    const isAdmin = user.role === 'ADMIN';
    const isSchoolAdmin = user.role === 'SCHOOL_ADMIN';

    if (!isOwnProfile && !isAdmin && !isSchoolAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // If SCHOOL_ADMIN, verify student belongs to their school
    if (isSchoolAdmin && !isAdmin) {
      const userSchool = await prisma.school.findFirst({
        where: { ownerId: Number(userId) }
      });
      
      if (!userSchool || student.schoolId !== userSchool.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id: Number(id) },
      data: {
        birthdate: birthdate ? new Date(birthdate) : undefined,
        notes: notes !== undefined ? notes : undefined,
        level: level || undefined,
        canSwim: canSwim !== undefined ? canSwim : undefined
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

    res.json(updatedStudent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /students/:id - Delete student (ADMIN only)
router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: Number(id) }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await prisma.student.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
