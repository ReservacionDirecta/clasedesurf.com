import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// POST /payments - create a payment record (requires auth)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { reservationId, amount, paymentMethod, transactionId } = req.body;
    if (!reservationId || !amount) return res.status(400).json({ message: 'reservationId and amount required' });

    // Optional: Verify the reservation belongs to userId (simple check)
    const reservation = await prisma.reservation.findUnique({ where: { id: Number(reservationId) } });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (reservation.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

    const payment = await prisma.payment.create({
      data: {
        reservation: { connect: { id: Number(reservationId) } },
        amount: Number(amount),
        status: 'PAID',
        paymentMethod: paymentMethod || 'manual',
        transactionId: transactionId || null
      }
    });

    // Update reservation status to PAID
    await prisma.reservation.update({ where: { id: Number(reservationId) }, data: { status: 'PAID' } });

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /payments?reservationId=1
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { reservationId } = req.query;
    if (reservationId) {
      const payments = await prisma.payment.findMany({ where: { reservationId: Number(reservationId) } });
      return res.json(payments);
    }
    // For now return all payments for the user's reservations
    const payments = await prisma.payment.findMany({ where: { reservation: { userId: userId ? Number(userId) : undefined } } as any });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
