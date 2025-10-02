import express from 'express';
import prisma from '../prisma';
import { validateBody, validateParams } from '../middleware/validation';
import { createClassSchema, updateClassSchema, classIdSchema } from '../validations/classes';

const router = express.Router();

// GET /classes - list classes
router.get('/', async (req, res) => {
  try {
    const classes = await prisma.class.findMany({ 
      include: { 
        school: true,
        reservations: {
          include: {
            payment: true,
            user: true
          }
        }
      }, 
      orderBy: { date: 'asc' } 
    });
    
    // Calculate payment info for each class
    const classesWithPaymentInfo = classes.map(cls => {
      const totalReservations = cls.reservations.length;
      const paidReservations = cls.reservations.filter(r => r.payment?.status === 'PAID').length;
      const totalRevenue = cls.reservations
        .filter(r => r.payment?.status === 'PAID')
        .reduce((sum, r) => sum + (r.payment?.amount || 0), 0);
      
      return {
        ...cls,
        paymentInfo: {
          totalReservations,
          paidReservations,
          totalRevenue,
          occupancyRate: cls.capacity > 0 ? (totalReservations / cls.capacity) * 100 : 0
        }
      };
    });
    
    res.json(classesWithPaymentInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /classes - create class
router.post('/', validateBody(createClassSchema), async (req, res) => {
  try {
    const { title, description, date, duration, capacity, price, level, schoolId } = req.body;
    
    const classDate = new Date(date);

    const newClass = await prisma.class.create({
      data: {
        title,
        description,
        date: classDate,
        duration: Number(duration),
        capacity: Number(capacity),
        price: Number(price),
        level,
        school: { connect: { id: Number(schoolId) } }
      }
    });

    res.status(201).json(newClass);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /classes/:id - update class
router.put('/:id', validateParams(classIdSchema), validateBody(updateClassSchema), async (req, res) => {
  try {
    const { id } = req.params as any;
    const data = req.body;

    const updated = await prisma.class.update({ where: { id: Number(id) }, data });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /classes/:id
router.delete('/:id', validateParams(classIdSchema), async (req, res) => {
  try {
    const { id } = req.params as any;
    await prisma.class.delete({ where: { id: Number(id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
