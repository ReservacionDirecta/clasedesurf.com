import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { Prisma } from '@prisma/client';

const router = express.Router();

// GET /payouts - list all payouts (admin only)
router.get('/', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const payouts = await prisma.payout.findMany({
      include: { school: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /payouts/generate - generate weekly payouts (admin only)
router.post('/generate', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    const periodStart = new Date(startDate);
    const periodEnd = new Date(endDate);

    // Find all paid payments within the date range that have not yet been assigned to a payout
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        payoutId: null,
        paidAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        reservation: {
          include: {
            class: true,
          },
        },
      },
    });

    if (pendingPayments.length === 0) {
      return res.status(200).json({ message: 'No pending payments to process for this period.' });
    }

    // Group payments by school
    const paymentsBySchool = pendingPayments.reduce((acc, payment) => {
      const schoolId = payment.reservation.class.schoolId;
      if (!acc[schoolId]) {
        acc[schoolId] = [];
      }
      acc[schoolId].push(payment);
      return acc;
    }, {} as Record<number, typeof pendingPayments>);

    const generatedPayouts = await prisma.$transaction(async (tx) => {
      const payoutPromises = Object.entries(paymentsBySchool).map(async ([schoolId, payments]) => {
        const totalAmount = payments.reduce((sum, p) => sum + (p.netAmount || 0), 0);

        if (totalAmount <= 0) return null;

        const newPayout = await tx.payout.create({
          data: {
            schoolId: Number(schoolId),
            amount: totalAmount,
            status: 'PENDING',
            periodStartDate: periodStart,
            periodEndDate: periodEnd,
          },
        });

        await tx.payment.updateMany({
          where: {
            id: { in: payments.map(p => p.id) },
          },
          data: {
            payoutId: newPayout.id,
          },
        });

        return newPayout;
      });

      return (await Promise.all(payoutPromises)).filter(Boolean);
    });

    res.status(201).json({ message: 'Payouts generated successfully.', payouts: generatedPayouts });

  } catch (err) {
    console.error('Error generating payouts:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /payouts/:id - update payout status (e.g., mark as paid)
router.put('/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const payoutId = Number(req.params.id);
    const { status, transactionReference } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const updatedPayout = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status,
        transactionReference,
      },
    });

    res.json(updatedPayout);
  } catch (err) {
    console.error(`Error updating payout ${req.params.id}:`, err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /payouts/school - list payouts for the logged-in school admin
router.get('/school', requireAuth, requireRole(['SCHOOL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      return res.status(403).json({ message: 'User is not associated with a school.' });
    }

    const payouts = await prisma.payout.findMany({
      where: { schoolId },
      include: {
        payments: true, // Include the payments that make up this payout
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
