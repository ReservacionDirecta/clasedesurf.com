import express from 'express';
import prisma from '../prisma';
import { emailService } from '../services/email.service';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { validateBody, validateParams } from '../middleware/validation';
import { createReservationSchema, updateReservationSchema, reservationIdSchema } from '../validations/reservations';
import resolveSchool from '../middleware/resolve-school';
import { buildMultiTenantWhere } from '../middleware/multi-tenant';

const router = express.Router();

// POST /reservations - create reservation (requires auth)
router.post('/', requireAuth, validateBody(createReservationSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { classId, sessionId, specialRequest, participants, discountCodeId, discountAmount, date, time } = req.body;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    let requestedCount: number;
    if (Array.isArray(participants)) {
      requestedCount = participants.length;
    } else if (typeof participants === 'number') {
      requestedCount = participants;
    } else {
      requestedCount = 1;
    }

    const result = await prisma.$transaction(async (tx) => {
      let session;
      const classIdNum = Number(classId);

      // Determine if sessionId is numeric or virtual
      const isNumericSessionId = sessionId && !isNaN(Number(sessionId)) && !String(sessionId).startsWith('v_');
      const numericSessionId = isNumericSessionId ? Number(sessionId) : null;

      // 1. Fetch class product details
      const cls = await tx.class.findUnique({
        where: { id: classIdNum },
        include: {
          sessions: numericSessionId ? { where: { id: numericSessionId } } : undefined,
          school: true
        }
      });
      if (!cls) throw new Error('Class not found');

      // 2. Determine session data (explicit session or fallback to product)
      if (numericSessionId) {
        session = (cls as any).sessions?.[0];
        if (!session) throw new Error('Session not found');
      } else if (date && time) {
        // Fallback or search for session by date/time
        session = await tx.classSession.findFirst({
          where: { classId: classIdNum, date: new Date(date), time: String(time) }
        });
      }

      const capacity = session?.capacity ?? cls.defaultCapacity;
      const unitPrice = session?.price ?? cls.defaultPrice;
      const reservationDate = session?.date ?? (date ? new Date(date) : null);
      const reservationTime = session?.time ?? time;

      if (!reservationDate || !reservationTime) {
        throw new Error('No date or time specified for reservation');
      }

      // 3. Check for availability
      const count = await tx.reservation.count({
        where: {
          classId: classIdNum,
          status: { not: 'CANCELED' },
          date: reservationDate,
          time: reservationTime
        }
      });

      if (count + requestedCount > capacity) {
        return { ok: false, reason: 'Not enough spots available' };
      }

      // 4. Calculate amount
      const originalAmount = unitPrice * requestedCount;
      const finalDiscountAmount = discountAmount ? Number(discountAmount) : 0;
      const finalAmount = Math.max(0, originalAmount - finalDiscountAmount);

      // 5. Create reservation
      const reservation = await tx.reservation.create({
        data: {
          user: { connect: { id: Number(userId) } },
          class: { connect: { id: classIdNum } },
          specialRequest: specialRequest || null,
          participants: participants || null,
          status: 'PENDING',
          date: reservationDate,
          time: reservationTime
        }
      });

      // 6. Create payment
      await tx.payment.create({
        data: {
          reservation: { connect: { id: reservation.id } },
          amount: finalAmount,
          originalAmount,
          status: 'UNPAID',
          discountCode: discountCodeId ? { connect: { id: Number(discountCodeId) } } : undefined,
          discountAmount: finalDiscountAmount > 0 ? finalDiscountAmount : undefined
        }
      });

      // 7. Return full details
      const fullReservation = await tx.reservation.findUnique({
        where: { id: reservation.id },
        include: {
          user: true,
          class: { include: { school: true } },
          payment: { include: { discountCode: true } }
        }
      });

      return { ok: true, reservation: fullReservation };
    });

    if (!result.ok) return res.status(400).json({ message: result.reason });

    // Email notification
    const r = result.reservation as any;
    if (r) {
      try {
        await emailService.sendReservationConfirmed(
          r.user.email,
          r.user.name,
          r.class.title,
          new Date(r.date).toLocaleDateString(),
          r.time,
          r.class.instructor || 'Instructor',
          r.class.school.name,
          r.class.school.location,
          r.class.duration,
          r.payment.amount
        );
      } catch (e) {
        console.error('Email error:', e);
      }
    }

    res.status(201).json(result.reservation);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /reservations
router.get('/', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    const where = await buildMultiTenantWhere(req, 'reservation');
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        class: { include: { school: { select: { id: true, name: true, location: true } } } },
        payment: { include: { discountCode: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/all', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const all = await prisma.reservation.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        class: { include: { school: { select: { id: true, name: true, location: true } } } },
        payment: { include: { discountCode: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /reservations/:id
router.get('/:id', requireAuth, validateParams(reservationIdSchema), async (req: AuthRequest, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        class: { include: { school: true } },
        payment: { include: { discountCode: true } }
      }
    });

    if (!reservation) return res.status(404).json({ message: 'Not found' });

    if (req.role !== 'ADMIN' && req.role !== 'SCHOOL_ADMIN' && reservation.userId !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /reservations/:id
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateParams(reservationIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const { status, ...rest } = req.body;

    const existing = await prisma.reservation.findUnique({
      where: { id: Number(id) },
      include: { class: true }
    });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    if (req.role === 'SCHOOL_ADMIN' && existing.class.schoolId !== req.schoolId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.reservation.update({
      where: { id: Number(id) },
      data: { status: status ? status.toUpperCase() : undefined, ...rest },
      include: { user: true, class: { include: { school: true } } }
    });

    if (updated.status === 'CANCELED') {
      try {
        await emailService.sendReservationCancelled(
          updated.user.email,
          updated.user.name,
          updated.class.title,
          new Date(updated.date || new Date()).toLocaleDateString(),
          updated.time || '',
          updated.class.school.name,
          updated.class.school.location
        );
      } catch (e) {
        console.error('Email error:', e);
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.payment.deleteMany({ where: { reservationId: id } });
    await prisma.reservation.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
