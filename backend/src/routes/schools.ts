import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { createSchoolSchema, updateSchoolSchema, schoolIdSchema } from '../validations/schools';

const router = express.Router();

// GET /schools - list schools
router.get('/', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(schools);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /schools/my-school - get current user's school (MUST be before /:id route)
router.get('/my-school', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    
    if (!user || user.role !== 'SCHOOL_ADMIN') {
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
  } catch (err) {
    console.error('Error in /my-school:', err);
    res.status(500).json({ message: 'Internal server error' });
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
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), validateParams(schoolIdSchema), validateBody(updateSchoolSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const data = req.body;
    const updated = await prisma.school.update({ where: { id: Number(id) }, data });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
