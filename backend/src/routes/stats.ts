import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest } from '../middleware/auth';
import { buildMultiTenantWhere } from '../middleware/multi-tenant';

const router = express.Router();

// GET /stats/dashboard - Get dashboard statistics for the authenticated user
router.get('/dashboard', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { role, userId } = req;

    // Build multi-tenant filters
    const classWhere = await buildMultiTenantWhere(req, 'class');
    const instructorWhere = await buildMultiTenantWhere(req, 'instructor');
    const studentWhere = await buildMultiTenantWhere(req, 'student');
    const reservationWhere = await buildMultiTenantWhere(req, 'reservation');
    const paymentWhere = await buildMultiTenantWhere(req, 'payment');

    // Get counts
    const [
      totalClasses,
      totalInstructors,
      totalStudents,
      totalReservations,
      payments
    ] = await Promise.all([
      prisma.class.count({ where: classWhere }),
      prisma.instructor.count({ where: instructorWhere }),
      prisma.student.count({ where: studentWhere }),
      prisma.reservation.count({ where: reservationWhere }),
      prisma.payment.findMany({
        where: {
          ...paymentWhere,
          status: 'PAID'
        },
        select: {
          amount: true,
          createdAt: true
        }
      })
    ]);

    // Calculate revenue
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyRevenue = payments
      .filter(p => new Date(p.createdAt) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Get classes with reservations to calculate occupancy
    const classesWithReservations = await prisma.class.findMany({
      where: classWhere,
      select: {
        defaultCapacity: true,
        reservations: {
          where: {
            status: { not: 'CANCELED' }
          }
        }
      }
    });

    // Calculate average occupancy
    let totalCapacity = 0;
    let totalReserved = 0;
    classesWithReservations.forEach(cls => {
      totalCapacity += cls.defaultCapacity;
      totalReserved += cls.reservations.length;
    });
    const averageOccupancy = totalCapacity > 0
      ? Math.round((totalReserved / totalCapacity) * 100)
      : 0;

    // Get pending reservations
    const pendingReservations = await prisma.reservation.count({
      where: {
        ...reservationWhere,
        status: 'PENDING'
      }
    });

    // Get new students this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const newStudentsThisMonth = await prisma.student.count({
      where: {
        ...studentWhere,
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });

    res.json({
      totalClasses,
      totalInstructors,
      totalStudents,
      totalReservations,
      monthlyRevenue,
      totalRevenue,
      averageOccupancy,
      pendingReservations,
      newStudentsThisMonth,
      averageRating: 4.8, // TODO: Calculate from reviews when implemented
      weeklyClasses: totalClasses, // TODO: Filter by week
      completedClasses: 0, // TODO: Implement class completion tracking
      cancelledClasses: 0, // TODO: Count cancelled classes
    });

  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
