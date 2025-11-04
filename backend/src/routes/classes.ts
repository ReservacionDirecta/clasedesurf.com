import express from 'express';
import prisma from '../prisma';
import { validateBody, validateParams } from '../middleware/validation';
import { createClassSchema, updateClassSchema, classIdSchema, createBulkClassesSchema } from '../validations/classes';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import resolveSchool from '../middleware/resolve-school';
import { buildMultiTenantWhere } from '../middleware/multi-tenant';

const router = express.Router();

// Middleware to optionally extract auth info without requiring it
const optionalAuth = (req: AuthRequest, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key-for-development-only') as any;
      req.userId = decoded.userId;
      req.role = decoded.role;
    } catch (err) {
      // Invalid token, but we don't fail - just continue without auth
    }
  }
  next();
};

// GET /classes - list classes with filters (supports multi-tenant filtering)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { date, level, type, minPrice, maxPrice, schoolId } = req.query;
    
    // Build filter object
    const where: any = {};
    
    // Apply multi-tenant filtering if authenticated
    if (req.userId && req.role) {
      const multiTenantWhere = await buildMultiTenantWhere(req, 'class');
      Object.assign(where, multiTenantWhere);
    }
    
    // Filter by schoolId if provided (and not already filtered by multi-tenant)
    if (schoolId && !where.schoolId) {
      where.schoolId = Number(schoolId);
    }
    
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

// GET /classes/:id - get single class
router.get('/:id', optionalAuth, validateParams(classIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    
    const classData = await prisma.class.findUnique({
      where: { id: Number(id) },
      include: {
        school: true,
        reservations: {
          include: {
            payment: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Filter active reservations
    const activeReservations = classData.reservations.filter(r => r.status !== 'CANCELED');
    
    res.json({
      ...classData,
      reservations: activeReservations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /classes - create class (ADMIN or SCHOOL_ADMIN)
router.post('/', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateBody(createClassSchema), async (req: AuthRequest, res) => {
  try {
    const { title, description, date, duration, capacity, price, level, instructor, images, schoolId, studentDetails } = req.body;
    
    console.log('📝 Creando clase con datos:', { title, description, date, duration, capacity, price, level, instructor, studentDetails });
    
    const classDate = new Date(date);

    // Determine final schoolId
    let finalSchoolId: number | undefined = schoolId ? Number(schoolId) : undefined;
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) return res.status(404).json({ message: 'No school found for this user' });
      finalSchoolId = req.schoolId;
    }
    if (!finalSchoolId) return res.status(400).json({ message: 'School ID is required' });

    console.log('🏫 School ID final:', finalSchoolId);

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
        images: images || [],
        school: { connect: { id: Number(finalSchoolId) } }
      }
    });

    console.log('✅ Clase creada exitosamente:', newClass.id);
    res.status(201).json(newClass);
  } catch (err) {
    console.error('❌ Error al crear clase:', err);
    res.status(500).json({ message: 'Internal server error', error: String(err) });
  }
});

// POST /classes/bulk - create multiple classes at once
router.post('/bulk', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateBody(createBulkClassesSchema), async (req: AuthRequest, res) => {
  try {
    const { baseData, schoolId, occurrences } = req.body as { baseData: any; schoolId?: number; occurrences: Array<{ date: string; time: string; }> };

    if (!occurrences || occurrences.length === 0) {
      return res.status(400).json({ message: 'No occurrences provided' });
    }

    let finalSchoolId: number | undefined = schoolId ? Number(schoolId) : undefined;
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) {
        return res.status(404).json({ message: 'No school found for this user' });
      }
      finalSchoolId = req.schoolId;
    }
    if (!finalSchoolId) {
      return res.status(400).json({ message: 'School ID is required' });
    }

    const now = new Date();
    const uniqueOccurrences: Array<{ date: Date; isoKey: string; }> = [];
    const seenKeys = new Set<string>();

    for (const occurrence of occurrences) {
      const { date, time } = occurrence;
      const dateTime = new Date(`${date}T${time}`);
      if (Number.isNaN(dateTime.getTime())) {
        return res.status(400).json({ message: `Invalid occurrence date or time: ${date} ${time}` });
      }
      if (dateTime.getTime() < now.getTime()) {
        return res.status(400).json({ message: `Occurrence ${date} ${time} must be in the future` });
      }

      const isoKey = dateTime.toISOString();
      if (seenKeys.has(isoKey)) {
        continue;
      }
      seenKeys.add(isoKey);
      uniqueOccurrences.push({ date: dateTime, isoKey });
    }

    if (uniqueOccurrences.length === 0) {
      return res.status(400).json({ message: 'No valid occurrences were provided' });
    }

    const createdClasses = await prisma.$transaction(async (tx) => {
      const results: any[] = [];
      for (const occurrence of uniqueOccurrences) {
        const created = await tx.class.create({
          data: {
            title: baseData.title,
            description: baseData.description ?? null,
            date: occurrence.date,
            duration: Number(baseData.duration),
            capacity: Number(baseData.capacity),
            price: Number(baseData.price),
            level: baseData.level,
            instructor: baseData.instructor ?? null,
            images: baseData.images || [],
            school: { connect: { id: Number(finalSchoolId) } }
          }
        });
        results.push(created);
      }
      return results;
    });

    res.status(201).json({
      message: 'Classes created successfully',
      createdCount: createdClasses.length,
      classes: createdClasses
    });
  } catch (err) {
    console.error('❌ Error al crear clases en lote:', err);
    res.status(500).json({ message: 'Internal server error', error: String(err) });
  }
});

// PUT /classes/:id - update class (ADMIN or SCHOOL_ADMIN)
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateParams(classIdSchema), validateBody(updateClassSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const data = req.body;

    // If SCHOOL_ADMIN, verify class belongs to their school
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) return res.status(404).json({ message: 'No school found for this user' });
      const existing = await prisma.class.findUnique({ where: { id: Number(id) } });
      if (!existing) return res.status(404).json({ message: 'Class not found' });
      if (existing.schoolId !== req.schoolId) {
        return res.status(403).json({ message: 'You can only update classes from your school' });
      }
    }

    // Handle images separately if provided
    const { images, ...restData } = data;
    const updateData: any = { ...restData };
    if (images !== undefined) {
      updateData.images = images;
    }

    const updated = await prisma.class.update({ where: { id: Number(id) }, data: updateData });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /classes/:id (ADMIN or SCHOOL_ADMIN)
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateParams(classIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    // If SCHOOL_ADMIN, verify ownership
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) return res.status(404).json({ message: 'No school found for this user' });
      const existing = await prisma.class.findUnique({ where: { id: Number(id) } });
      if (!existing) return res.status(404).json({ message: 'Class not found' });
      if (existing.schoolId !== req.schoolId) {
        return res.status(403).json({ message: 'You can only delete classes from your school' });
      }
    }
    await prisma.class.delete({ where: { id: Number(id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
