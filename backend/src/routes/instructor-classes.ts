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
    if (req.role !== 'INSTRUCTOR') return res.status(403).json({ message: 'Forbidden' });
    if (!req.schoolId) return res.status(404).json({ message: 'No school' });

    const classes = await prisma.class.findMany({
      where: { schoolId: req.schoolId, deletedAt: null },
      include: {
        sessions: {
          where: { date: { gte: new Date() } },
          orderBy: { date: 'asc' },
          take: 20
        },
        _count: { select: { reservations: true } }
      }
    });

    res.json({ classes });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/profile', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: Number(req.userId) },
      include: { user: true, school: true }
    });
    if (!instructor) return res.status(404).json({ message: 'Not found' });
    res.json(instructor);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/students', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    if (!req.schoolId) return res.status(404).json({ message: 'No school' });

    const reservations = await prisma.reservation.findMany({
      where: { class: { schoolId: req.schoolId }, status: { not: 'CANCELED' } },
      include: {
        user: true,
        class: { select: { id: true, title: true, level: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const studentsMap = new Map();
    reservations.forEach(r => {
      if (!studentsMap.has(r.userId)) {
        studentsMap.set(r.userId, { ...r.user, classes: [], total: 0 });
      }
      const s = studentsMap.get(r.userId);
      s.classes.push({ id: r.class.id, title: r.class.title, date: r.date, status: r.status });
      s.total++;
    });

    res.json(Array.from(studentsMap.values()));
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/earnings', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    if (!req.schoolId) return res.status(404).json({ message: 'No school' });

    const payments = await prisma.payment.findMany({
      where: { status: 'PAID', reservation: { class: { schoolId: req.schoolId } } },
      include: { reservation: { include: { class: true } } }
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ total, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

export default router;
