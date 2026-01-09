import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { updateProfileSchema } from '../validations/users';

const router = express.Router();

// GET /users/profile - get current user's profile
// NOTE: Authentication is not implemented in this minimal scaffold.
router.get('/profile', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        instructor: true,
        student: true
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safe } = user as any;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /users/profile - update profile
router.put('/profile', requireAuth, validateBody(updateProfileSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // The data is already validated and transformed by the middleware
    const data = req.body;

    // Log profilePhoto status for debugging
    if (data.profilePhoto) {
      console.log('[PUT /users/profile] Updating profilePhoto, length:', data.profilePhoto.length, 'starts with:', data.profilePhoto.substring(0, 50));
    } else {
      console.log('[PUT /users/profile] No profilePhoto in update data');
    }

    // Ensure profilePhoto is properly handled (null if empty string)
    if (data.profilePhoto === '') {
      data.profilePhoto = null;
    }

    console.log('[PUT /users/profile] Data to update:', {
      ...data,
      profilePhoto: data.profilePhoto ? `[base64, ${data.profilePhoto.length} chars]` : null
    });

    const updated = await prisma.user.update({ where: { id: Number(userId) }, data });
    const { password, ...safe } = updated as any;

    // Log what was saved
    console.log('[PUT /users/profile] Profile updated successfully, profilePhoto saved:', !!safe.profilePhoto, safe.profilePhoto ? `(${safe.profilePhoto.length} chars)` : '(null)');

    res.json(safe);
  } catch (err) {
    console.error('[PUT /users/profile] Error:', err);
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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safe } = user as any;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
