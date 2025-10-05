import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { createPaymentSchema, updatePaymentSchema, paymentIdSchema } from '../validations/payments';

const router = express.Router();

// POST /payments - create a payment record (requires auth)
router.post('/', requireAuth, validateBody(createPaymentSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { reservationId, amount, paymentMethod, transactionId } = req.body;

    // Verify the reservation exists and belongs to user (or user is admin)
    const reservation = await prisma.reservation.findUnique({ 
      where: { id: reservationId },
      include: { user: true, class: true }
    });
    
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    
    // Check if user owns the reservation or is admin
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    if (reservation.userId !== Number(userId) && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Check if payment already exists for this reservation
    const existingPayment = await prisma.payment.findUnique({ where: { reservationId } });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this reservation' });
    }

    const payment = await prisma.payment.create({
      data: {
        reservation: { connect: { id: reservationId } },
        amount,
        status: 'PAID',
        paymentMethod: paymentMethod || 'manual',
        transactionId,
        paidAt: new Date()
      },
      include: {
        reservation: {
          include: {
            user: true,
            class: true
          }
        }
      }
    });

    // Update reservation status to PAID
    await prisma.reservation.update({ 
      where: { id: reservationId }, 
      data: { status: 'PAID' } 
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /payments - get payments (user gets their own, admin gets all)
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { reservationId } = req.query;
    
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    let whereClause: any = {};
    
    if (reservationId) {
      whereClause.reservationId = Number(reservationId);
      // If not admin, ensure they can only see their own reservation's payments
      if (user.role !== 'ADMIN') {
        whereClause.reservation = { userId: Number(userId) };
      }
    } else {
      // If not admin, only show payments for user's reservations
      if (user.role !== 'ADMIN') {
        whereClause.reservation = { userId: Number(userId) };
      }
    }

    const payments = await prisma.payment.findMany({ 
      where: whereClause,
      include: {
        reservation: {
          include: {
            user: true,
            class: {
              include: {
                school: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /payments/:id - get specific payment
router.get('/:id', requireAuth, validateParams(paymentIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const userId = req.userId;
    
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const payment = await prisma.payment.findUnique({ 
      where: { id: Number(id) },
      include: {
        reservation: {
          include: {
            user: true,
            class: {
              include: {
                school: true
              }
            }
          }
        }
      }
    });
    
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    // Check if user owns the payment or is admin
    if (payment.reservation.userId !== Number(userId) && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /payments/:id - update payment (admin and school_admin)
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), validateParams(paymentIdSchema), validateBody(updatePaymentSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const updateData = req.body;
    
    const payment = await prisma.payment.findUnique({ 
      where: { id: Number(id) },
      include: { reservation: true }
    });
    
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    // If status is being changed to PAID, set paidAt
    if (updateData.status === 'PAID' && payment.status !== 'PAID') {
      updateData.paidAt = new Date().toISOString();
    }
    
    // If status is being changed from PAID, clear paidAt
    if (updateData.status && updateData.status !== 'PAID' && payment.status === 'PAID') {
      updateData.paidAt = null;
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        reservation: {
          include: {
            user: true,
            class: {
              include: {
                school: true
              }
            }
          }
        }
      }
    });

    // Update reservation status based on payment status
    let reservationStatus = payment.reservation.status;
    if (updateData.status === 'PAID') {
      reservationStatus = 'PAID';
    } else if (updateData.status === 'REFUNDED') {
      reservationStatus = 'CANCELED';
    } else if (updateData.status === 'UNPAID' && payment.reservation.status === 'PAID') {
      reservationStatus = 'CONFIRMED';
    }
    
    await prisma.reservation.update({
      where: { id: payment.reservationId },
      data: { status: reservationStatus }
    });

    res.json(updatedPayment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /payments/:id - cancel/refund payment (admin only)
router.delete('/:id', requireAuth, requireRole(['ADMIN']), validateParams(paymentIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    
    const payment = await prisma.payment.findUnique({ 
      where: { id: Number(id) },
      include: { reservation: true }
    });
    
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    // Update payment status to REFUNDED instead of deleting
    const updatedPayment = await prisma.payment.update({
      where: { id: Number(id) },
      data: { 
        status: 'REFUNDED',
        updatedAt: new Date()
      }
    });

    // Update reservation status to CANCELED
    await prisma.reservation.update({
      where: { id: payment.reservationId },
      data: { status: 'CANCELED' }
    });

    res.json({ message: 'Payment refunded successfully', payment: updatedPayment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
