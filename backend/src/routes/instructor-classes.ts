import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest } from '../middleware/auth';
import resolveSchool from '../middleware/resolve-school';

const router = express.Router();

/**
 * GET /instructor/classes - Get classes for the authenticated instructor
 * Returns only classes from the instructor's school
 */
router.get('/classes', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const role = req.role;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Only INSTRUCTOR role can access this endpoint
    if (role !== 'INSTRUCTOR') {
      return res.status(403).json({ message: 'Only instructors can access this endpoint' });
    }

    if (!req.schoolId) {
      return res.status(404).json({ message: 'No school found for this instructor' });
    }

    // Get instructor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: Number(userId) },
      include: { 
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor profile not found' });
    }

    // Get classes from the instructor's school
    const classes = await prisma.class.findMany({
      where: {
        schoolId: req.schoolId,
        // Optionally filter by instructor name if stored in class
        // instructor: instructor.user.name
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
                email: true,
                phone: true
              }
            },
            payment: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      instructor: {
        id: instructor.id,
        name: instructor.user.name,
        email: instructor.user.email,
        schoolId: instructor.schoolId
      },
      classes
    });
  } catch (err) {
    console.error('Error fetching instructor classes:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /instructor/profile - Get instructor profile
 */
router.get('/profile', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.role !== 'INSTRUCTOR') {
      return res.status(403).json({ message: 'Only instructors can access this endpoint' });
    }

    const instructor = await prisma.instructor.findUnique({
      where: { userId: Number(userId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            location: true,
            description: true,
            phone: true,
            email: true
          }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor profile not found' });
    }

    res.json(instructor);
  } catch (err) {
    console.error('Error fetching instructor profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /instructor/students - Get students from instructor's classes
 * Returns only students who have reservations in the instructor's school
 */
router.get('/students', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.role !== 'INSTRUCTOR') {
      return res.status(403).json({ message: 'Only instructors can access this endpoint' });
    }

    if (!req.schoolId) {
      return res.status(404).json({ message: 'No school found for this instructor' });
    }

    // Get all reservations from classes in the instructor's school
    const reservations = await prisma.reservation.findMany({
      where: {
        class: {
          schoolId: req.schoolId
        },
        status: {
          not: 'CANCELED'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            age: true,
            weight: true,
            height: true,
            canSwim: true,
            injuries: true
          }
        },
        class: {
          select: {
            id: true,
            title: true,
            date: true,
            level: true
          }
        },
        payment: {
          select: {
            status: true,
            amount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group by student
    const studentsMap = new Map();
    reservations.forEach(reservation => {
      const studentId = reservation.user.id;
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          ...reservation.user,
          classes: [],
          totalReservations: 0
        });
      }
      const student = studentsMap.get(studentId);
      student.classes.push({
        id: reservation.class.id,
        title: reservation.class.title,
        date: reservation.class.date,
        level: reservation.class.level,
        reservationStatus: reservation.status,
        paymentStatus: reservation.payment?.status
      });
      student.totalReservations++;
    });

    const students = Array.from(studentsMap.values());

    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /instructor/earnings - Get earnings summary for instructor
 * Only shows earnings from their school
 */
router.get('/earnings', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.role !== 'INSTRUCTOR') {
      return res.status(403).json({ message: 'Only instructors can access this endpoint' });
    }

    if (!req.schoolId) {
      return res.status(404).json({ message: 'No school found for this instructor' });
    }

    // Get all paid reservations from classes in the instructor's school
    const payments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        reservation: {
          class: {
            schoolId: req.schoolId
          }
        }
      },
      include: {
        reservation: {
          include: {
            class: {
              select: {
                id: true,
                title: true,
                date: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        paidAt: 'desc'
      }
    });

    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalClasses = new Set(payments.map(p => p.reservation.class.id)).size;

    // Group by month
    const earningsByMonth = payments.reduce((acc: any, payment) => {
      const month = new Date(payment.paidAt || payment.createdAt).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, total: 0, count: 0 };
      }
      acc[month].total += payment.amount;
      acc[month].count++;
      return acc;
    }, {});

    res.json({
      totalEarnings,
      totalClasses,
      totalPayments: payments.length,
      earningsByMonth: Object.values(earningsByMonth),
      recentPayments: payments.slice(0, 10).map(p => ({
        id: p.id,
        amount: p.amount,
        date: p.paidAt || p.createdAt,
        className: p.reservation.class.title,
        classDate: p.reservation.class.date
      }))
    });
  } catch (err) {
    console.error('Error fetching earnings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
