import express from 'express';
import prisma from '../prisma';
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

// Admin-only: GET /reservations/all - list all reservations
// IMPORTANT: This route must be defined BEFORE /:id to avoid "all" being interpreted as an ID
router.get('/all', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    console.log('[GET /reservations/all] User ID:', req.userId, 'Role:', req.role);
    const all = await prisma.reservation.findMany({ 
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
    console.log('[GET /reservations/all] Returning', all.length, 'reservations');
    res.json(all);
  } catch (err) {
    console.error('[GET /reservations/all] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /reservations/:id - get single reservation details
router.get('/:id', requireAuth, validateParams(reservationIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const userId = req.userId;
    
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const reservation = await prisma.reservation.findUnique({
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
        class: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                location: true,
                description: true,
                phone: true,
                email: true,
                website: true,
                instagram: true,
                facebook: true,
                whatsapp: true,
                address: true,
                logo: true,
                coverImage: true,
                rating: true,
                totalReviews: true,
                foundedYear: true
              }
            },
            // instructor is a String field, not a relation
          }
        },
        payment: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Multi-tenant check: users can only see their own reservations unless they're admin/school_admin
    if (req.role !== 'ADMIN' && req.role !== 'SCHOOL_ADMIN') {
      if (reservation.userId !== Number(userId)) {
        return res.status(403).json({ message: 'You can only view your own reservations' });
      }
    }

    // SCHOOL_ADMIN can only see reservations from their school
    if (req.role === 'SCHOOL_ADMIN' && req.schoolId) {
      if (reservation.class.schoolId !== req.schoolId) {
        return res.status(403).json({ message: 'You can only view reservations from your school' });
      }
    }

    res.json(reservation);
  } catch (err) {
    console.error('[GET /reservations/:id] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /reservations/:id - update reservation (admin and school_admin only)
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateParams(reservationIdSchema), validateBody(updateReservationSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const updateData = req.body;
    
    // Find reservation
    const reservation = await prisma.reservation.findUnique({ 
      where: { id: Number(id) },
      include: { 
        class: { 
          include: { 
            school: {
              select: {
                id: true,
                name: true
              }
            } 
          } 
        } 
      }
    });
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Multi-tenant check: SCHOOL_ADMIN can only update reservations from their school
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) {
        return res.status(404).json({ message: 'No school found for this user' });
      }
      if (reservation.class.schoolId !== req.schoolId) {
        return res.status(403).json({ message: 'You can only update reservations from your school' });
      }
    }
    
    // STUDENT can only update their own reservations
    if (req.role === 'STUDENT') {
      if (reservation.userId !== Number(req.userId)) {
        return res.status(403).json({ message: 'You can only update your own reservations' });
      }
      // Students can only cancel reservations (set status to CANCELED)
      if (updateData.status && updateData.status !== 'CANCELED') {
        return res.status(403).json({ message: 'Students can only cancel reservations' });
      }
    }
    
    // Update reservation
    const updatedReservation = await prisma.reservation.update({
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
      }
    });
    
    console.log('[PUT /reservations/:id] Reservation updated:', {
      id: updatedReservation.id,
      status: updatedReservation.status,
      userId: updatedReservation.userId,
      classId: updatedReservation.classId
    });
    
    res.json(updatedReservation);
  } catch (err) {
    console.error('[PUT /reservations/:id] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
