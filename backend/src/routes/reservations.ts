import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { validateBody } from '../middleware/validation';
import { createReservationSchema } from '../validations/reservations';
import resolveSchool from '../middleware/resolve-school';
import { buildMultiTenantWhere } from '../middleware/multi-tenant';

const router = express.Router();

// POST /reservations - create reservation (requires auth)
router.post('/', requireAuth, validateBody(createReservationSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { classId, specialRequest, participants } = req.body;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    // Determinar el número de participantes según el tipo de datos recibidos
    let requested: number;
    let participantsData: any = null;

    if (Array.isArray(participants)) {
      // Si es un array, guardar los datos completos y contar participantes
      requested = participants.length;
      participantsData = participants;
    } else if (typeof participants === 'number') {
      // Si es un número, usar backward compatibility
      requested = participants;
      participantsData = null;
    } else {
      requested = 1;
    }

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
          participants: participantsData,  // Guardar datos de participantes como JSON
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

// GET /reservations - returns reservations based on user role (multi-tenant filtered)
router.get('/', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    // Build where clause with multi-tenant filtering
    const where = await buildMultiTenantWhere(req, 'reservation');
    
    const reservations = await prisma.reservation.findMany({ 
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
        class: { 
          include: { 
            school: {
              select: {
                id: true,
                name: true,
                location: true
              }
            } 
          } 
        },
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(reservations);
  } catch (err) {
    console.error('[GET /reservations] Error:', err);
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
