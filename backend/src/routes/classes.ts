import express from 'express';
import prisma from '../prisma';
import { validateBody, validateParams } from '../middleware/validation';
import { createClassSchema, updateClassSchema, classIdSchema } from '../validations/classes';

const router = express.Router();

// GET /classes - list classes with filters
router.get('/', async (req, res) => {
  try {
    const { date, level, type, minPrice, maxPrice } = req.query;
    
    // Build filter object
    const where: any = {};
    
    // Filter by date (exact date match)
    if (date && typeof date === 'string') {
      const filterDate = new Date(date);
      const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    
    // Filter by level
    if (level && typeof level === 'string') {
      where.level = level.toUpperCase();
    }
    
    // Filter by type
    if (type && typeof type === 'string') {
      where.type = type.toUpperCase();
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    
    const classes = await prisma.class.findMany({ 
      where,
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
    
    // Calculate payment info and available spots for each class
    const classesWithInfo = classes.map(cls => {
      const activeReservations = cls.reservations.filter(r => r.status !== 'CANCELED');
      const totalReservations = activeReservations.length;
      const paidReservations = cls.reservations.filter(r => r.payment?.status === 'PAID').length;
      const totalRevenue = cls.reservations
        .filter(r => r.payment?.status === 'PAID')
        .reduce((sum, r) => sum + (r.payment?.amount || 0), 0);
      
      // Calculate available spots
      const availableSpots = cls.capacity - totalReservations;
      
      return {
        ...cls,
        availableSpots: Math.max(0, availableSpots), // Ensure non-negative
        paymentInfo: {
          totalReservations,
          paidReservations,
          totalRevenue,
          occupancyRate: cls.capacity > 0 ? (totalReservations / cls.capacity) * 100 : 0
        }
      };
    });
    
    res.json(classesWithInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /classes - create class
router.post('/', validateBody(createClassSchema), async (req, res) => {
  try {
    const { title, description, date, duration, capacity, price, level, instructor, schoolId } = req.body;
    
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
        instructor,
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
