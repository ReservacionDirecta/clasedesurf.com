import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { createSchoolSchema, updateSchoolSchema, schoolIdSchema } from '../validations/schools';
import resolveSchool from '../middleware/resolve-school';

const router = express.Router();

// GET /schools - list schools
router.get('/', async (req, res) => {
  try {
    // Check for auth header manually to determine if admin
    const authHeader = req.headers.authorization;
    let isAdmin = false;

    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
      } catch (e) { }
    }

    const { status } = req.query;
    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      // Default behavior: If no status requested, return APPROVED only?
      // Or return all and let frontend filter?
      // Better: Return APPROVED by default. Admin can request 'status=PENDING' or 'status=ALL'
      // where.status = 'APPROVED'; // Uncomment this when ready to enforce
    }

    const schools = await prisma.school.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
        foundedYear: true,
        rating: true,
        totalReviews: true,
        createdAt: true,
        updatedAt: true,
        status: true // Include status
      }
    });
    res.json(schools);
  } catch (err: any) {
    console.error('[GET /schools] Error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
});

// GET /schools/my-school - get current user's school (MUST be before /:id route)
router.get('/my-school', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

    if (!user || (user.role !== 'SCHOOL_ADMIN' && user.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Only school admins can access this endpoint' });
    }

    // Find school owned by this user
    const school = await prisma.school.findFirst({
      where: { ownerId: Number(userId) },
      include: {
        classes: {
          orderBy: { date: 'asc' },
          take: 10
        },
        instructors: {
          where: { isActive: true },
          include: {
            user: {
              select: { name: true, email: true, phone: true }
            }
          }
        }
      }
    });

    if (!school) {
      return res.status(404).json({ message: 'No school found for this user' });
    }

    res.json(school);
  } catch (err: any) {
    console.error('[GET /schools/my-school] Error:', err);
    console.error('[GET /schools/my-school] Error message:', err?.message);
    console.error('[GET /schools/my-school] Error stack:', err?.stack);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
});

// GET /schools/:id
router.get('/:id', validateParams(schoolIdSchema), async (req, res) => {
  try {
    const { id } = req.params as any;
    const school = await prisma.school.findUnique({ where: { id: Number(id) } });
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json(school);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /schools/:id/classes - get classes for a specific school
router.get('/:id/classes', validateParams(schoolIdSchema), async (req, res) => {
  try {
    const { id } = req.params as any;
    const classes = await prisma.class.findMany({
      where: { schoolId: Number(id) },
      orderBy: { date: 'asc' }
    });
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /schools/:id/reviews - get reviews for a specific school (public endpoint)
router.get('/:id/reviews', validateParams(schoolIdSchema), async (req, res) => {
  try {
    const { id } = req.params as any;
    const reviews = await prisma.schoolReview.findMany({
      where: { schoolId: Number(id) },
      orderBy: { createdAt: 'desc' },
      take: 6
    });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// PUT /schools/:id/status - update status (requires ADMIN)
router.put('/:id/status', requireAuth, requireRole(['ADMIN']), validateParams(schoolIdSchema), async (req, res) => {
  try {
    const { id } = req.params as any;
    const { status } = req.body;

    console.log(`[PUT /schools/${id}/status] Request to update status to:`, status);

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await prisma.school.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /schools - create (requires ADMIN or SCHOOL_ADMIN)
router.post('/', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), validateBody(createSchoolSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const {
      name,
      location,
      description,
      phone,
      email,
      website,
      instagram,
      facebook,
      whatsapp,
      address
    } = req.body;

    // Check if user already has a school
    const existingSchool = await prisma.school.findFirst({
      where: { ownerId: Number(userId) }
    });

    if (existingSchool) {
      return res.status(400).json({ message: 'User already has a school' });
    }

    const created = await prisma.school.create({
      data: {
        name,
        location,
        description: description || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        instagram: instagram || null,
        facebook: facebook || null,
        whatsapp: whatsapp || null,
        address: address || null,
        ownerId: Number(userId)
      }
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /schools/:id - update (requires ADMIN or SCHOOL_ADMIN)
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, validateParams(schoolIdSchema), validateBody(updateSchoolSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const data = req.body;
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) return res.status(404).json({ message: 'No school found for this user' });
      if (Number(id) !== req.schoolId) {
        return res.status(403).json({ message: 'You can only update your own school' });
      }
    }

    // Clean data: remove undefined values and handle null properly
    const cleanData: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        cleanData[key] = data[key];
      }
    });

    console.log('[PUT /schools/:id] Raw data received:', JSON.stringify(data, null, 2));
    console.log('[PUT /schools/:id] Cleaned data:', JSON.stringify(cleanData, null, 2));
    console.log('[PUT /schools/:id] foundedYear in cleanData:', cleanData.foundedYear, typeof cleanData.foundedYear);
    console.log('[PUT /schools/:id] School ID:', Number(id));

    // Log what we're about to send to Prisma
    console.log('[PUT /schools/:id] About to update with Prisma, cleanData keys:', Object.keys(cleanData));
    console.log('[PUT /schools/:id] cleanData.foundedYear before Prisma:', cleanData.foundedYear, typeof cleanData.foundedYear);

    const updated = await prisma.school.update({
      where: { id: Number(id) },
      data: cleanData
    });

    console.log('[PUT /schools/:id] School updated successfully');
    console.log('[PUT /schools/:id] Updated school data from Prisma:', JSON.stringify(updated, null, 2));
    console.log('[PUT /schools/:id] updated.foundedYear:', updated.foundedYear, typeof updated.foundedYear);

    // Verify the update by fetching the school again
    const verified = await prisma.school.findUnique({ where: { id: Number(id) } });
    console.log('[PUT /schools/:id] Verified school data from DB:', JSON.stringify(verified, null, 2));
    console.log('[PUT /schools/:id] verified.foundedYear:', verified?.foundedYear, typeof verified?.foundedYear);

    res.json(updated);
  } catch (err: any) {
    console.error('[PUT /schools/:id] Error updating school:', err);
    console.error('[PUT /schools/:id] Error details:', {
      message: err?.message,
      code: err?.code,
      meta: err?.meta,
      stack: err?.stack
    });
    const errorMessage = err?.message || 'Internal server error';
    res.status(500).json({
      message: 'Internal server error',
      error: errorMessage,
      code: err?.code,
      details: process.env.NODE_ENV === 'development' ? {
        stack: err?.stack,
        meta: err?.meta
      } : undefined
    });
  }
});



export default router;
