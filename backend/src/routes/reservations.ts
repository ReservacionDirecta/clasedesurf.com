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
    const { classId, specialRequest, participants, discountCodeId, discountAmount } = req.body;
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

      // Calcular precio original (precio de la clase * número de participantes)
      const originalAmount = (cls.price || 0) * requested;

      // Calcular precio final con descuento
      const finalDiscountAmount = discountAmount && discountAmount > 0 ? Number(discountAmount) : 0;
      const finalAmount = originalAmount - finalDiscountAmount;

      // Crear la reserva
      const reservation = await tx.reservation.create({
        data: {
          user: { connect: { id: Number(userId) } },
          class: { connect: { id: Number(classId) } },
          specialRequest: specialRequest || null,
          participants: participantsData,  // Guardar datos de participantes como JSON
          status: 'PENDING'
        }
      });

      // Crear el pago con información del descuento
      const paymentData: any = {
        reservation: { connect: { id: reservation.id } },
        amount: finalAmount,
        originalAmount: originalAmount,
        status: 'UNPAID'
      };

      // Solo agregar campos de descuento si existen
      if (discountCodeId) {
        paymentData.discountCodeId = Number(discountCodeId);
      }
      if (finalDiscountAmount > 0) {
        paymentData.discountAmount = finalDiscountAmount;
      }

      const payment = await tx.payment.create({
        data: paymentData
      });

      // Retornar la reserva con toda la información
      const reservationWithDetails = await tx.reservation.findUnique({
        where: { id: reservation.id },
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
          payment: {
            include: {
              discountCode: true
            }
          }
        }
      });

      return { ok: true, reservation: reservationWithDetails };
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
        payment: {
          include: {
            discountCode: true
          }
        }
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
        payment: {
          include: {
            discountCode: true
          }
        }
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
        payment: {
          include: {
            discountCode: true
          }
        }
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

    // Normalize status to uppercase to ensure consistency
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
      console.log('[PUT /reservations/:id] Normalized status:', updateData.status);
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
        payment: {
          include: {
            discountCode: true
          }
        }
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

// DELETE /reservations/:id - delete reservation (ADMIN only)
router.delete('/:id', requireAuth, requireRole(['ADMIN']), validateParams(reservationIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const reservationId = Number(id);

    console.log('[DELETE /reservations/:id] Attempting to delete reservation:', reservationId);
    console.log('[DELETE /reservations/:id] User role:', req.role, 'User ID:', req.userId);

    // Find the reservation first
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        payment: true,
        class: {
          select: {
            id: true,
            title: true,
            schoolId: true
          }
        }
      }
    });

    if (!reservation) {
      console.log('[DELETE /reservations/:id] Reservation not found:', reservationId);
      return res.status(404).json({ message: 'Reservation not found' });
    }

    console.log('[DELETE /reservations/:id] Found reservation:', {
      id: reservation.id,
      userId: reservation.userId,
      classId: reservation.classId,
      status: reservation.status,
      hasPayment: !!reservation.payment
    });

    // Delete related payment first (if exists) to satisfy foreign key constraints
    if (reservation.payment) {
      console.log('[DELETE /reservations/:id] Deleting related payment:', reservation.payment.id);
      await prisma.payment.delete({
        where: { id: reservation.payment.id }
      });
    }

    // Delete the reservation
    await prisma.reservation.delete({
      where: { id: reservationId }
    });

    console.log('[DELETE /reservations/:id] Reservation deleted successfully:', reservationId);
    res.json({
      message: 'Reserva eliminada exitosamente',
      deletedReservationId: reservationId
    });
  } catch (err: any) {
    console.error('[DELETE /reservations/:id] Error:', err);
    console.error('[DELETE /reservations/:id] Error name:', err?.name);
    console.error('[DELETE /reservations/:id] Error message:', err?.message);
    console.error('[DELETE /reservations/:id] Error code:', err?.code);

    // Handle Prisma foreign key constraint errors
    if (err?.code === 'P2003' || err?.message?.includes('Foreign key constraint')) {
      return res.status(400).json({
        message: 'No se puede eliminar la reserva porque tiene datos relacionados. Por favor, contacta al administrador.'
      });
    }

    // Handle Prisma record not found errors
    if (err?.code === 'P2025') {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
});

export default router;
