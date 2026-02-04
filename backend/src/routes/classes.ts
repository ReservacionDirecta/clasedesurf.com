import express from 'express';
import prisma from '../prisma';
import { ClassInstructorStatus } from '@prisma/client';
import { normalizeClassImages, normalizeSchoolImages } from '../utils/image-utils';
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

    // Filter by type (Smart Filter)
    if (type && typeof type === 'string') {
      const typeStr = type.toUpperCase();

      if (typeStr === 'KIDS') {
        // Smart filter for Kids: Type is KIDS OR Title contains "niños"/"kids"
        where.OR = [
          { type: 'KIDS' },
          { title: { contains: 'niños', mode: 'insensitive' } },
          { title: { contains: 'kids', mode: 'insensitive' } }
        ];
      } else if (typeStr === 'SURF_CAMP' || typeStr === 'CAMPS') {
        // Smart filter for Camps: Type is CAMP OR Title contains "camp" OR Duration > 24h
        where.OR = [
          { type: 'SURF_CAMP' },
          { type: 'CAMP' },
          { title: { contains: 'camp', mode: 'insensitive' } }
          // Optionally add duration check if needed, but title is usually safer for now
        ];
      } else {
        // Standard strict filter
        where.type = typeStr;
      }
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

    // Include schedules in fetch to compute next occurrence for virtual classes
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
        schedules: { where: { isActive: true } }, // Fetch active schedules
        sessions: {
          where: { isClosed: false, date: { gte: new Date() } }, // Only future sessions
          orderBy: [{ date: 'asc' }, { time: 'asc' }],
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Helper to find next occurrence based on schedule rules
    const getNextScheduleDate = (schedules: any[]): { date: Date, time: string } | null => {
      if (!schedules || schedules.length === 0) return null;

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      let earliest: { date: Date, time: string } | null = null;

      for (const schedule of schedules) {
        let bestDateForSchedule: Date | null = null;
        let bestTime = schedule.startTime; // Default to first time

        if (schedule.type === 'SINGLE' && schedule.specificDate && new Date(schedule.specificDate) >= now) {
          bestDateForSchedule = new Date(schedule.specificDate);
        } else if (schedule.type === 'RECURRING' && schedule.dayOfWeek !== null) {
          // Find next date matching dayOfWeek
          const d = new Date(now);
          const today = d.getDay();
          const target = schedule.dayOfWeek;
          let daysToAdd = target - today;
          if (daysToAdd < 0) daysToAdd += 7;
          if (daysToAdd === 0) {
            // If today, check time? Assuming future for simplicity or today is OK
          }
          d.setDate(d.getDate() + daysToAdd);
          // Verify time? Let's verify if today and past time
          if (daysToAdd === 0) {
            const [h, m] = schedule.startTime.split(':').map(Number);
            const nowTime = new Date();
            if (nowTime.getHours() > h || (nowTime.getHours() === h && nowTime.getMinutes() > m)) {
              d.setDate(d.getDate() + 7);
            }
          }
          bestDateForSchedule = d;
        } else if (schedule.type === 'SPECIFIC_DATES' && Array.isArray(schedule.dates)) {
          // Find first future date
          const futureDates = (schedule.dates as string[])
            .map(ds => new Date(ds))
            .filter(d => d >= now)
            .sort((a, b) => a.getTime() - b.getTime());
          if (futureDates.length > 0) bestDateForSchedule = futureDates[0];
        } else if (schedule.type === 'DATE_RANGE' && schedule.rangeStart && schedule.rangeEnd) {
          const start = new Date(schedule.rangeStart);
          const end = new Date(schedule.rangeEnd);
          if (end >= now) {
            bestDateForSchedule = start >= now ? start : now;
          }
        }

        if (bestDateForSchedule) {
          if (!earliest || bestDateForSchedule < earliest.date) {
            earliest = { date: bestDateForSchedule, time: bestTime };
          }
        }
      }
      return earliest;
    };


    // Map to include summary info for the UI
    const productsWithInfo = classes.map(cls => {
      // Normalize images
      cls = normalizeClassImages(cls);

      // Normalize school logo and cover image
      if (cls.school) {
        cls.school = normalizeSchoolImages(cls.school);
      }

      // Determine effective next session (Physical or Virtual)
      let nextSession = cls.sessions[0] || null;
      if (!nextSession) {
        const calculatedState = getNextScheduleDate(cls.schedules);
        if (calculatedState) {
          nextSession = {
            date: calculatedState.date, // Date object
            time: calculatedState.time,
            capacity: cls.defaultCapacity,
            isClosed: false
          } as any;
        }
      }

      return {
        ...cls,
        price: cls.defaultPrice, // Compatibility with existing frontend
        capacity: cls.defaultCapacity, // Compatibility with existing frontend
        nextSession: nextSession,
        availableSlotsCount: cls.sessions.length > 0 ? cls.sessions.length : (cls.schedules.length > 0 ? 1 : 0), // Approximation
        // Explicitly set status to drive frontend UI
        status: nextSession ? 'upcoming' : 'completed'
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
    const normalizedClass = normalizeClassImages(classItem);

    // Normalize school logo and cover image
    if (normalizedClass.school) {
      normalizedClass.school = normalizeSchoolImages(normalizedClass.school);
    }

    res.json({
      ...normalizedClass,
      price: normalizedClass.defaultPrice, // Frontend compat
      capacity: normalizedClass.defaultCapacity, // Frontend compat
    });
  } catch (err: any) {
    console.error('[GET /classes/:id] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET /classes/calendar/all - Get calendar for ALL classes of the school
router.get('/calendar/all', optionalAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    const { start, end } = req.query;

    // Determine School ID
    let schoolId: number | undefined;
    if (req.schoolId) {
      schoolId = req.schoolId;
    } else if (req.query.schoolId) {
      schoolId = Number(req.query.schoolId);
    } else {
      // Try to find school by user if not set in middleware
      // But wait, resolveSchool deals with req.schoolId if params exist or if user is admin.
      // If public, we need schoolId query param.
      if (!schoolId) return res.status(400).json({ message: 'School ID required' });
    }

    const startDate = start ? new Date(start as string) : new Date();
    // Default to 45 days ahead if no end date provided
    const endDate = end ? new Date(end as string) : new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000);

    // Fetch all active classes for the school
    const classes = await prisma.class.findMany({
      where: {
        schoolId: Number(schoolId),
        deletedAt: null
      },
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

    const allSlots: any[] = [];

    // Process each class
    for (const classItem of classes) {
      // 1. Map explicit sessions for quick lookup
      const sessionMap = new Map();
      classItem.sessions.forEach(session => {
        const key = `${session.date.toISOString().split('T')[0]}_${session.time}`;
        sessionMap.set(key, session);
      });

      // 2. Generate all potential dates in range
      const currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);
      const rangeEndDate = new Date(endDate);
      rangeEndDate.setHours(23, 59, 59, 999);

      // We clone to iterate
      const iteratorDate = new Date(currentDate);

      while (iteratorDate <= rangeEndDate) {
        const dateStr = iteratorDate.toISOString().split('T')[0];
        const dayOfWeek = iteratorDate.getDay(); // 0-6

        // Find schedules for this day based on type
        const dailySchedules = classItem.schedules.filter(schedule => {
          switch (schedule.type) {
            case 'RECURRING':
              return schedule.dayOfWeek === dayOfWeek;
            case 'SINGLE':
              return schedule.specificDate?.toISOString().split('T')[0] === dateStr;
            case 'DATE_RANGE':
              return schedule.rangeStart && schedule.rangeEnd &&
                iteratorDate >= schedule.rangeStart && iteratorDate <= schedule.rangeEnd;
            case 'SPECIFIC_DATES':
              return Array.isArray(schedule.dates) && (schedule.dates as any).includes(dateStr);
            default:
              return false;
          }
        });

        // Helper function to generate slots for times
        const generateSlotsForTimes = (times: string[], schedule: any) => {
          times.forEach(time => {
            const key = `${dateStr}_${time}`;
            const sessionOverride = sessionMap.get(key);

            // If session exists and is closed, skip
            if (sessionOverride && sessionOverride.isClosed) return;

            const capacity = sessionOverride?.capacity ?? classItem.defaultCapacity;
            const price = sessionOverride?.price ?? classItem.defaultPrice;

            // Calculate reserved spots
            const reserved = classItem.reservations
              .filter(r => r.date?.toISOString().split('T')[0] === dateStr && r.time === time)
              .reduce((sum, r) => sum + (typeof r.participants === 'number' ? r.participants : 1), 0);

            allSlots.push({
              id: sessionOverride?.id || `v_${classItem.id}_${key}`,
              sessionId: sessionOverride?.id || null,
              classId: classItem.id,
              className: classItem.title,
              instructor: classItem.instructor,
              date: dateStr,
              time: time,
              startTime: time,
              price: price,
              capacity: capacity,
              reserved,
              available: Math.max(0, capacity - reserved),
              status: reserved >= capacity ? 'full' : 'available',
              isVirtual: !sessionOverride
            });
          });
        };

        dailySchedules.forEach(schedule => {
          const times = Array.isArray(schedule.times) && (schedule.times as any).length > 0
            ? (schedule.times as string[])
            : [schedule.startTime];
          generateSlotsForTimes(times, schedule);
        });

        // Add explicit sessions that don't match schedule
        classItem.sessions
          .filter(s => s.date.toISOString().split('T')[0] === dateStr)
          .forEach(session => {
            const key = `${dateStr}_${session.time}`;
            // Check if we already added this time via schedule loop
            // The schedule loop uses schedule.startTime. 
            // If session.time matches schedule.startTime, it was handled (as override or virtual).
            // But valid check: sessionMap keys match.
            // We need to check if we already pushed a slot for this time.
            const alreadyAdded = allSlots.some(s => s.classId === classItem.id && s.date === dateStr && s.time === session.time);

            if (!alreadyAdded && !session.isClosed) {
              const reserved = classItem.reservations
                .filter(r => r.date?.toISOString().split('T')[0] === dateStr && r.time === session.time)
                .reduce((sum, r) => sum + (typeof r.participants === 'number' ? r.participants : 1), 0);

              allSlots.push({
                id: session.id,
                sessionId: session.id,
                classId: classItem.id,
                className: classItem.title,
                instructor: classItem.instructor,
                date: dateStr,
                time: session.time,
                startTime: session.time,
                price: session.price || classItem.defaultPrice,
                capacity: session.capacity,
                reserved,
                available: Math.max(0, session.capacity - reserved),
                status: reserved >= session.capacity ? 'full' : 'available',
                isVirtual: false
              });
            }
          });

        iteratorDate.setDate(iteratorDate.getDate() + 1);
      }
    }

    // Sort all slots by date then time
    allSlots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    res.json(allSlots);
  } catch (err: any) {
    console.error('[GET /classes/calendar/all] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /classes - Create a new Class Product
router.post('/', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateBody(createClassSchema), async (req: AuthRequest, res) => {
  try {
    const {
      title, description, duration, capacity, price, level,
      instructor, instructorId, images, schoolId, beachId, schedules
    } = req.body;

    let finalSchoolId: number | undefined = schoolId ? Number(schoolId) : undefined;
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) return res.status(404).json({ message: 'No school found for this user' });
      finalSchoolId = req.schoolId;
    }

    let instructorStatus: ClassInstructorStatus = ClassInstructorStatus.CONFIRMED;
    if (instructorId) {
      const instr = await prisma.instructor.findUnique({ where: { id: Number(instructorId) } });
      if (instr?.type === 'INDEPENDENT') {
        instructorStatus = ClassInstructorStatus.PENDING;
      }
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
        instructorId: instructorId ? Number(instructorId) : undefined,
        instructorStatus,
        images: images || [],
        school: { connect: { id: Number(finalSchoolId) } },
        ...(beachId && { beach: { connect: { id: Number(beachId) } } }),
        ...(schedules && Array.isArray(schedules) && {
          schedules: {
            create: schedules.map((s: any) => ({
              type: s.type,
              dayOfWeek: s.dayOfWeek !== undefined ? Number(s.dayOfWeek) : undefined,
              startTime: s.startTime,
              endTime: s.endTime,
              times: s.times,
              specificDate: s.specificDate ? new Date(s.specificDate) : undefined,
              rangeStart: s.rangeStart ? new Date(s.rangeStart) : undefined,
              rangeEnd: s.rangeEnd ? new Date(s.rangeEnd) : undefined,
              dates: s.dates,
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

// POST /classes/bulk - Create a Class Product AND its sessions atomically
router.post('/bulk', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateBody(createBulkClassesSchema), async (req: AuthRequest, res) => {
  try {
    console.log('[POST /bulk] START - Body:', JSON.stringify(req.body, null, 2));
    const { baseData, occurrences, beachId } = req.body;

    // Resolve School ID
    let finalSchoolId: number | undefined = req.body.schoolId ? Number(req.body.schoolId) : undefined;
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) {
        console.error('[POST /bulk] No school found for SCHOOL_ADMIN user');
        return res.status(404).json({ message: 'No school found for this user' });
      }
      finalSchoolId = req.schoolId;
    }

    if (!finalSchoolId || isNaN(finalSchoolId)) {
      console.error('[POST /bulk] Invalid or missing School ID:', finalSchoolId);
      return res.status(400).json({ message: 'Se requiere un ID de escuela válido' });
    }

    console.log('[POST /bulk] Resolved School ID:', finalSchoolId);

    // Use transaction to ensure both Product and Sessions are created or neither
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Class (Product)
      // 1. Create the Class (Product)
      console.log('[POST /bulk] Creating Class Product...');

      let instructorStatus: ClassInstructorStatus = ClassInstructorStatus.CONFIRMED;
      if (baseData.instructorId) {
        const instr = await prisma.instructor.findUnique({ where: { id: Number(baseData.instructorId) } });
        if (instr?.type === 'INDEPENDENT') {
          instructorStatus = ClassInstructorStatus.PENDING;
        }
      }

      const classData: any = {
        title: baseData.title,
        description: baseData.description,
        duration: baseData.duration ? Number(baseData.duration) : 120,
        defaultCapacity: baseData.capacity ? Number(baseData.capacity) : 8,
        defaultPrice: baseData.price ? Number(baseData.price) : 0,
        level: baseData.level,
        instructor: baseData.instructor,
        instructorId: baseData.instructorId ? Number(baseData.instructorId) : undefined,
        instructorStatus,
        studentDetails: baseData.studentDetails,
        images: baseData.images || [],
        school: { connect: { id: finalSchoolId } }
      };

      if (beachId && !isNaN(Number(beachId))) {
        console.log('[POST /bulk] Connecting beach ID:', beachId);
        classData.beach = { connect: { id: Number(beachId) } };
      }

      const newClass = await tx.class.create({
        data: classData
      });
      console.log('[POST /bulk] Class Created. ID:', newClass.id);

      // 2. Create the Sessions
      if (occurrences && occurrences.length > 0) {
        console.log(`[POST /bulk] Creating ${occurrences.length} sessions...`);
        const sessionData = occurrences.map((occ: any) => ({
          classId: newClass.id,
          date: new Date(occ.date),
          time: occ.time,
          capacity: newClass.defaultCapacity,
          price: newClass.defaultPrice,
          isClosed: false
        }));

        await tx.classSession.createMany({
          data: sessionData
        });
        console.log('[POST /bulk] Sessions created successfully.');
      }

      return newClass;
    });

    console.log('[POST /bulk] Transaction completed successfully.');
    res.status(201).json(result);
  } catch (err: any) {
    console.error('❌ Error creating bulk class [POST /bulk]:', err);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
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
    const { images, capacity, price, schedules, instructorId, ...restData } = req.body;

    const existing = await prisma.class.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ message: 'Class not found' });

    if (req.role === 'SCHOOL_ADMIN' && existing.schoolId !== req.schoolId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updateData: any = { ...restData };
    if (capacity !== undefined) updateData.defaultCapacity = Number(capacity);
    if (price !== undefined) updateData.defaultPrice = Number(price);

    if (instructorId !== undefined) {
      updateData.instructorId = Number(instructorId);
      const instr = await prisma.instructor.findUnique({ where: { id: Number(instructorId) } });
      if (instr) {
        updateData.instructorStatus = instr.type === 'INDEPENDENT'
          ? ClassInstructorStatus.PENDING
          : ClassInstructorStatus.CONFIRMED;
      }
    }

    if (images !== undefined) {
      updateData.images = Array.isArray(images) ? images.map((img: string) => {
        if (img.startsWith('http') || img.startsWith('/')) return img;
        return `/uploads/${img}`;
      }) : images;
    }

    if (schedules && Array.isArray(schedules)) {
      await prisma.classSchedule.deleteMany({ where: { classId: Number(id) } });
      updateData.schedules = {
        create: schedules.map((s: any) => ({
          type: s.type,
          dayOfWeek: s.dayOfWeek !== undefined ? Number(s.dayOfWeek) : undefined,
          startTime: s.startTime,
          endTime: s.endTime,
          times: s.times,
          specificDate: s.specificDate ? new Date(s.specificDate) : undefined,
          rangeStart: s.rangeStart ? new Date(s.rangeStart) : undefined,
          rangeEnd: s.rangeEnd ? new Date(s.rangeEnd) : undefined,
          dates: s.dates,
          isActive: s.isActive !== undefined ? s.isActive : true
        }))
      };
    }

    const updated = await prisma.class.update({
      where: { id: Number(id) },
      data: {
        ...updateData,
        deletedAt: null // Automatically reactivate class on edit
      },
      include: { school: true, schedules: true }
    });
    res.json(updated);
  } catch (err) {
    console.error('[PUT /classes/:id] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /classes/:id/restore - Restore soft-deleted class
router.post('/:id/restore', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateParams(classIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const classId = Number(id);

    const existing = await prisma.class.findUnique({ where: { id: classId } });
    if (!existing) return res.status(404).json({ message: 'Class not found' });

    if (req.role === 'SCHOOL_ADMIN' && existing.schoolId !== req.schoolId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const restored = await prisma.class.update({
      where: { id: classId },
      data: { deletedAt: null }
    });

    res.json(restored);
  } catch (err) {
    console.error('[POST /classes/:id/restore] Error:', err);
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

      // Find schedules for this day based on type
      const dailySchedules = classItem.schedules.filter(schedule => {
        switch (schedule.type) {
          case 'RECURRING':
            return schedule.dayOfWeek === dayOfWeek;
          case 'SINGLE':
            return schedule.specificDate?.toISOString().split('T')[0] === dateStr;
          case 'DATE_RANGE':
            return schedule.rangeStart && schedule.rangeEnd &&
              currentDate >= schedule.rangeStart && currentDate <= schedule.rangeEnd;
          case 'SPECIFIC_DATES':
            return Array.isArray(schedule.dates) && (schedule.dates as any).includes(dateStr);
          default:
            return false;
        }
      });

      // Helper function to generate slots for times
      const generateSlotsForTimes = (times: string[], schedule: any) => {
        times.forEach(time => {
          const key = `${dateStr}_${time}`;
          const sessionOverride = sessionMap.get(key);

          // If session exists and is closed, we skip it (or mark as closed)
          if (sessionOverride && sessionOverride.isClosed) return;

          const capacity = sessionOverride?.capacity ?? classItem.defaultCapacity;
          const price = sessionOverride?.price ?? classItem.defaultPrice;

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
      };

      // Process each schedule slot
      dailySchedules.forEach(schedule => {
        const times = Array.isArray(schedule.times) && (schedule.times as any).length > 0
          ? (schedule.times as string[])
          : [schedule.startTime];
        generateSlotsForTimes(times, schedule);
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

// PUT /classes/:id/instructor-status - Update class confirmation status (INSTRUCTOR only)
router.put('/:id/instructor-status', requireAuth, requireRole(['INSTRUCTOR']), validateParams(classIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const { status } = req.body;

    if (!['CONFIRMED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const existingClass = await prisma.class.findUnique({ where: { id: Number(id) } });
    if (!existingClass) return res.status(404).json({ message: 'Class not found' });

    // Verify requesting user is the assigned instructor
    const instructorProfile = await prisma.instructor.findFirst({
      where: { userId: Number(req.userId) }
    });

    if (!instructorProfile || existingClass.instructorId !== instructorProfile.id) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }

    const updated = await prisma.class.update({
      where: { id: Number(id) },
      data: { instructorStatus: status as ClassInstructorStatus }
    });

    res.json(updated);
  } catch (err) {
    console.error('[PUT /classes/:id/instructor-status] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
