import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { validateBody } from '../middleware/validation';
import { createReservationSchema } from '../validations/reservations';

const router = express.Router();

// POST /reservations - create reservation (requires auth)
router.post('/', requireAuth, validateBody(createReservationSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { classId, specialRequest, participants } = req.body;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const requested = participants;

    // Use transaction: re-check capacity and create reservation atomically
    const result = await prisma.$transaction(async (tx) => {
      const cls = await tx.class.findUnique({ where: { id: Number(classId) } });
      if (!cls) throw new Error('Class not found');

      const count = await tx.reservation.count({ where: { classId: Number(classId), status: { not: 'CANCELED' } } });
      if (count + requested > cls.capacity) {
        return { ok: false, reason: 'Not enough spots available' };
      }

      const reservation = await tx.reservation.create({
        data: {
          user: { connect: { id: Number(userId) } },
          class: { connect: { id: Number(classId) } },
          specialRequest: specialRequest || null,
          status: 'PENDING'
        }
      });
      return { ok: true, reservation };
    });

    if (!result) return res.status(500).json({ message: 'Reservation failed' });
    if (!result.ok) return res.status(400).json({ message: result.reason });

    res.status(201).json(result.reservation);
  } catch (err: any) {
    console.error(err);
    if (err.message === 'Class not found') return res.status(404).json({ message: 'Class not found' });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /reservations - returns reservations based on user role
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const userRole = req.role; // Fixed: use req.role instead of req.userRole
    
    // ADMIN and SCHOOL_ADMIN can see all reservations with full details
    if (userRole === 'ADMIN' || userRole === 'SCHOOL_ADMIN') {
      const reservations = await prisma.reservation.findMany({ 
        include: { 
          user: true, 
          class: { include: { school: true } },
          payment: true
        } 
      });
      return res.json(reservations);
    }
    
    // Regular users only see their own reservations
    if (userId) {
      const reservations = await prisma.reservation.findMany({ 
        where: { userId: Number(userId) }, 
        include: { class: true } 
      });
      return res.json(reservations);
    }
    
    return res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

// Admin-only: GET /reservations/all - list all reservations
// (mounted as same router; client should call /reservations/all)
router.get('/all', requireAuth, requireRole(['ADMIN']), async (_req: AuthRequest, res) => {
  try {
    const all = await prisma.reservation.findMany({ include: { user: true, class: true } });
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
