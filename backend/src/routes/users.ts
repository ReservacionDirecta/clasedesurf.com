import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /users/profile - get current user's profile
// NOTE: Authentication is not implemented in this minimal scaffold.
router.get('/profile', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) }, include: { classes: true } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safe } = user as any;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /users/profile - update profile
router.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const raw = req.body || {};
    // coerce numeric fields if they come as strings from the frontend
    const data: any = {
      ...(raw.name !== undefined ? { name: raw.name } : {}),
      ...(raw.email !== undefined ? { email: raw.email } : {}),
      age: raw.age !== undefined && raw.age !== null && raw.age !== '' ? Number(raw.age) : null,
      weight: raw.weight !== undefined && raw.weight !== null && raw.weight !== '' ? Number(raw.weight) : null,
      height: raw.height !== undefined && raw.height !== null && raw.height !== '' ? Number(raw.height) : null,
      ...(raw.canSwim !== undefined ? { canSwim: Boolean(raw.canSwim) } : {}),
      ...(raw.injuries !== undefined ? { injuries: raw.injuries } : {}),
      ...(raw.phone !== undefined ? { phone: raw.phone } : {}),
    };

    const updated = await prisma.user.update({ where: { id: Number(userId) }, data });
    const { password, ...safe } = updated as any;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /users - list all users (admin)
router.get('/', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    // TODO: check for ADMIN role
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    const safe = users.map((u: any) => {
      const { password, ...s } = u as any;
      return s;
    });
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /users/:id - get any user's profile (admin or owner)
router.get('/:id', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id }, include: { classes: true } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safe } = user as any;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
