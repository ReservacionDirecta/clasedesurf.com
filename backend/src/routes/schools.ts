import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';

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

// GET /schools/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json(school);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /schools - create (requires ADMIN or SCHOOL_ADMIN)
router.post('/', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    // TODO: role check (ADMIN or SCHOOL_ADMIN)
    const { name, location, description, phone, email } = req.body;
    if (!name || !location) return res.status(400).json({ message: 'name and location required' });
    const created = await prisma.school.create({ data: { name, location, description: description || null, phone: phone || null, email: email || null } });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /schools/:id - update (requires ADMIN or SCHOOL_ADMIN)
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await prisma.school.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
