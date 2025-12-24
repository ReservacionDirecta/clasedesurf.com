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
    const { date, level, type, minPrice, maxPrice, schoolId, locality, participants, q } = req.query;

    // Build filter object - exclude soft-deleted classes by default
    const where: any = {
      deletedAt: null
    };

    // Apply multi-tenant filtering if authenticated
    if (req.userId && req.role) {
      const multiTenantWhere = await buildMultiTenantWhere(req, 'class');
      Object.assign(where, multiTenantWhere);
    }

    // Filter by schoolId if provided (and not already filtered by multi-tenant)
    if (schoolId && !where.schoolId) {
      where.schoolId = Number(schoolId);
    }

    // Filter by locality (school location)
    if (locality && typeof locality === 'string') {
      if (where.school) {
        where.school.location = { contains: locality, mode: 'insensitive' };
      } else {
        where.school = { location: { contains: locality, mode: 'insensitive' } };
      }
    }

    // Filter by date (if date provided, only return products that have a session on that date)
    if (date && typeof date === 'string') {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.sessions = {
        some: {
          date: { gte: startOfDay, lte: endOfDay },
          isClosed: false
        }
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

    // Filter by price range (using defaultPrice)
    if (minPrice || maxPrice) {
      where.defaultPrice = {};
      if (minPrice) where.defaultPrice.gte = Number(minPrice);
      if (maxPrice) where.defaultPrice.lte = Number(maxPrice);
    }

    // Filter by participants (using defaultCapacity as proxy)
    if (participants) {
      where.defaultCapacity = { gte: Number(participants) };
    }

    // Generic Search (q)
    if (q) {
      const search = String(q).toLowerCase();
      const searchWhere = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { school: { name: { contains: search, mode: 'insensitive' } } }
        ]
      };

      if (where.AND) {
        where.AND.push(searchWhere);
      } else {
        where.AND = [searchWhere];
      }
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        school: {
          select: {
            id: true,
            name: true,
            location: true,
            description: true,
            logo: true,
            coverImage: true,
            rating: true,
            totalReviews: true
          }
        },
        sessions: {
          where: { isClosed: false },
          orderBy: [{ date: 'asc' }, { time: 'asc' }],
          take: 10 // Show some upcoming sessions info
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to include summary info for the UI
    const productsWithInfo = classes.map(cls => {
      // Normalize images
      let normalizedImages: string[] = [];
      if (cls.images && Array.isArray(cls.images)) {
        normalizedImages = cls.images
          .filter((img: string) => img && typeof img === 'string' && img.trim() !== '')
          .map((img: string) => {
            const trimmedImg = img.trim();
            if (trimmedImg.startsWith('http://') || trimmedImg.startsWith('https://') || trimmedImg.startsWith('/')) {
              return trimmedImg;
            }
            return `/uploads/classes/${trimmedImg}`;
          });
      }

      return {
        ...cls,
        price: cls.defaultPrice, // Compatibility with existing frontend
        capacity: cls.defaultCapacity, // Compatibility with existing frontend
        images: normalizedImages,
        nextSession: cls.sessions[0] || null,
        availableSlotsCount: cls.sessions.length
      };
    });

    res.json(productsWithInfo);
  } catch (err: any) {
    console.error('[GET /classes] Error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
});

// GET /classes/:id - get class details (Product info)
router.get('/:id', optionalAuth, validateParams(classIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const classId = Number(id);

    const classItem = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        school: true,
        beach: true,
        schedules: true,
        sessions: {
          where: { isClosed: false, date: { gte: new Date() } },
          orderBy: [{ date: 'asc' }, { time: 'asc' }],
          take: 10
        }
      }
    });

    if (!classItem) return res.status(404).json({ message: 'Class not found' });

    // Normalize images
    let normalizedImages: string[] = [];
    if (classItem.images && Array.isArray(classItem.images)) {
      normalizedImages = classItem.images
        .filter((img: string) => img && typeof img === 'string')
        .map((img: string) => {
          if (img.startsWith('http') || img.startsWith('/')) return img;
          return `/uploads/classes/${img}`;
        });
    }

    res.json({
      ...classItem,
      images: normalizedImages,
      price: classItem.defaultPrice, // Frontend compat
      capacity: classItem.defaultCapacity, // Frontend compat
    });
  } catch (err: any) {
    console.error('[GET /classes/:id] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /classes - Create a new Class Product
router.post('/', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateBody(createClassSchema), async (req: AuthRequest, res) => {
  try {
    const {
      title, description, duration, capacity, price, level,
      instructor, images, schoolId, beachId, schedules
    } = req.body;

    let finalSchoolId: number | undefined = schoolId ? Number(schoolId) : undefined;
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) return res.status(404).json({ message: 'No school found for this user' });
      finalSchoolId = req.schoolId;
    }

    const newClass = await prisma.class.create({
      data: {
        title,
        description,
        duration: duration ? Number(duration) : 120,
        defaultCapacity: capacity ? Number(capacity) : 8,
        defaultPrice: price ? Number(price) : 0,
        level,
        instructor,
        images: images || [],
        school: { connect: { id: Number(finalSchoolId) } },
        ...(beachId && { beach: { connect: { id: Number(beachId) } } }),
        ...(schedules && Array.isArray(schedules) && {
          schedules: {
            create: schedules.map((s: any) => ({
              dayOfWeek: Number(s.dayOfWeek),
              startTime: s.startTime,
              endTime: s.endTime,
              isActive: s.isActive !== undefined ? s.isActive : true
            }))
          }
        })
      }
    });

    res.status(201).json(newClass);
  } catch (err) {
    console.error('❌ Error creating class:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /classes/bulk-sessions - create multiple SESSIONS for a product
router.post('/bulk-sessions', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, async (req: AuthRequest, res) => {
  try {
    const { classId, occurrences } = req.body as { classId: number; occurrences: Array<{ date: string; time: string; capacity?: number; price?: number; }>; };

    if (!occurrences || occurrences.length === 0) return res.status(400).json({ message: 'No occurrences provided' });

    const product = await prisma.class.findUnique({ where: { id: Number(classId) } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const createdSessions = await prisma.$transaction(
      occurrences.map(occ =>
        prisma.classSession.upsert({
          where: {
            classId_date_time: { classId: product.id, date: new Date(occ.date), time: occ.time }
          },
          update: {
            capacity: occ.capacity ?? product.defaultCapacity,
            price: occ.price ?? product.defaultPrice
          },
          create: {
            classId: product.id,
            date: new Date(occ.date),
            time: occ.time,
            capacity: occ.capacity ?? product.defaultCapacity,
            price: occ.price ?? product.defaultPrice
          }
        })
      )
    );

    res.status(201).json({ count: createdSessions.length, sessions: createdSessions });
  } catch (err) {
    console.error('❌ Error in bulk-sessions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /classes/:id - update class product
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateParams(classIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const { images, capacity, price, schedules, ...restData } = req.body;

    const existing = await prisma.class.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ message: 'Class not found' });

    if (req.role === 'SCHOOL_ADMIN' && existing.schoolId !== req.schoolId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updateData: any = { ...restData };
    if (capacity !== undefined) updateData.defaultCapacity = Number(capacity);
    if (price !== undefined) updateData.defaultPrice = Number(price);

    if (images !== undefined) {
      updateData.images = Array.isArray(images) ? images.map((img: string) => {
        if (img.startsWith('http') || img.startsWith('/')) return img;
        return `/uploads/classes/${img}`;
      }) : images;
    }

    if (schedules && Array.isArray(schedules)) {
      await prisma.classSchedule.deleteMany({ where: { classId: Number(id) } });
      updateData.schedules = {
        create: schedules.map((s: any) => ({
          dayOfWeek: Number(s.dayOfWeek),
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive !== undefined ? s.isActive : true
        }))
      };
    }

    const updated = await prisma.class.update({
      where: { id: Number(id) },
      data: updateData,
      include: { school: true, schedules: true }
    });
    res.json(updated);
  } catch (err) {
    console.error('[PUT /classes/:id] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /classes/:id - Soft delete
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateParams(classIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const classId = Number(id);

    const existing = await prisma.class.findUnique({ where: { id: classId } });
    if (!existing) return res.status(404).json({ message: 'Class not found' });

    if (req.role === 'SCHOOL_ADMIN' && existing.schoolId !== req.schoolId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.class.update({ where: { id: classId }, data: { deletedAt: new Date() } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('[DELETE /classes/:id] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /classes/:id/calendar
router.get('/:id/calendar', optionalAuth, validateParams(classIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const { start, end } = req.query;
    const classId = Number(id);

    const startDate = start ? new Date(start as string) : new Date();
    // Default to 60 days ahead if no end date provided
    const endDate = end ? new Date(end as string) : new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000);

    const classItem = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        schedules: { where: { isActive: true } },
        sessions: {
          where: { date: { gte: startDate, lte: endDate } }
        },
        reservations: {
          where: { date: { gte: startDate, lte: endDate }, status: { not: 'CANCELED' } }
        }
      }
    });

    if (!classItem) return res.status(404).json({ message: 'Class not found' });

    // 1. Map explicit sessions for quick lookup
    const sessionMap = new Map();
    classItem.sessions.forEach(session => {
      const key = `${session.date.toISOString().split('T')[0]}_${session.time}`;
      sessionMap.set(key, session);
    });

    // 2. Generate all potential dates in range
    const slots: any[] = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    const rangeEndDate = new Date(endDate);
    rangeEndDate.setHours(23, 59, 59, 999);

    while (currentDate <= rangeEndDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay(); // 0 (Sun) - 6 (Sat)

      // Find schedules for this day
      const dailySchedules = classItem.schedules.filter(s => s.dayOfWeek === dayOfWeek);

      // Process each schedule slot
      dailySchedules.forEach(schedule => {
        const key = `${dateStr}_${schedule.startTime}`;
        const sessionOverride = sessionMap.get(key);

        // If session exists and is closed, we skip it (or mark as closed)
        if (sessionOverride && sessionOverride.isClosed) return;

        const capacity = sessionOverride?.capacity ?? classItem.defaultCapacity;
        const price = sessionOverride?.price ?? classItem.defaultPrice;
        const time = sessionOverride?.time ?? schedule.startTime;

        // Calculate reserved spots for this specific date and time
        const reserved = classItem.reservations
          .filter(r => r.date?.toISOString().split('T')[0] === dateStr && r.time === time)
          .reduce((sum, r) => sum + (typeof r.participants === 'number' ? r.participants : 1), 0);

        slots.push({
          id: sessionOverride?.id || `v_${key}`, // Virtual ID if no override
          sessionId: sessionOverride?.id || null,
          date: dateStr,
          time: time,
          startTime: time,
          price: price,
          capacity: capacity,
          reserved,
          available: Math.max(0, capacity - reserved),
          availableSpots: Math.max(0, capacity - reserved),
          isClosed: false,
          classId: classItem.id,
          isVirtual: !sessionOverride
        });
      });

      // Also add explicit sessions that DON'T match a schedule (one-off sessions)
      // We already handled sessions that match a schedule in the loop above.
      // So we need to find sessions for THIS DATE that were NOT used.
      classItem.sessions
        .filter(s => s.date.toISOString().split('T')[0] === dateStr)
        .forEach(session => {
          const key = `${dateStr}_${session.time}`;
          const alreadyAdded = slots.some(slot => slot.date === dateStr && slot.time === session.time);

          if (!alreadyAdded && !session.isClosed) {
            const reserved = classItem.reservations
              .filter(r => r.date?.toISOString().split('T')[0] === dateStr && r.time === session.time)
              .reduce((sum, r) => sum + (typeof r.participants === 'number' ? r.participants : 1), 0);

            slots.push({
              id: session.id,
              sessionId: session.id,
              date: dateStr,
              time: session.time,
              startTime: session.time,
              price: session.price || classItem.defaultPrice,
              capacity: session.capacity,
              reserved,
              available: Math.max(0, session.capacity - reserved),
              availableSpots: Math.max(0, session.capacity - reserved),
              isClosed: false,
              classId: classItem.id,
              isVirtual: false
            });
          }
        });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sort slots by date and time
    slots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    res.json({
      classId: classItem.id,
      availableDates: slots
    });
  } catch (err) {
    console.error('[GET /calendar] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /classes/:id/sessions
router.post('/:id/sessions', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateParams(classIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const { date, time, capacity, price, isClosed } = req.body;

    const session = await prisma.classSession.upsert({
      where: { classId_date_time: { classId: Number(id), date: new Date(date), time } },
      update: {
        capacity: capacity !== undefined ? Number(capacity) : undefined,
        price: price !== undefined ? Number(price) : undefined,
        isClosed: isClosed !== undefined ? Boolean(isClosed) : undefined
      },
      create: {
        classId: Number(id),
        date: new Date(date),
        time,
        capacity: capacity !== undefined ? Number(capacity) : 8,
        price: price !== undefined ? Number(price) : undefined,
        isClosed: isClosed || false
      }
    });

    res.json(session);
  } catch (err) {
    console.error('[POST /sessions] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
