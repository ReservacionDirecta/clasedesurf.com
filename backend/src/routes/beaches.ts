import express from 'express';
import prisma from '../prisma';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import requireAuth, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Schema de validación para crear/actualizar playa
const beachSchema = z.object({
  name: z.string().min(1, 'El nombre de la playa es requerido'),
  slug: z.string().min(1).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  waveType: z.string().optional(),
  level: z.string().optional(),
  bestTime: z.string().optional(),
  entryTips: z.array(z.string()).optional(),
  hazards: z.array(z.string()).optional(),
  conditions: z.object({
    waveHeight: z.string().optional(),
    wavePeriod: z.string().optional(),
    windSpeed: z.string().optional(),
    windDirection: z.string().optional(),
    tide: z.enum(['low', 'mid', 'high']).optional(),
    tideTime: z.string().optional(),
    waterTemp: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    lastUpdated: z.string().optional(),
  }).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
  count: z.string().optional(),
});

// Helper to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET /beaches - obtener todas las playas (público)
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;

    const where: any = {};
    if (active === 'true') {
      where.isActive = true;
    }

    const beaches = await prisma.beach.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json(beaches);
  } catch (err: any) {
    console.error('Error fetching beaches:', err);

    if (err.code === 'P2021' || err.message?.includes('does not exist')) {
      console.warn('Beaches table does not exist yet, returning empty array');
      return res.json([]);
    }

    res.status(500).json({
      message: 'Internal server error',
      error: err.message,
      code: err.code
    });
  }
});

// GET /beaches/:id - obtener playa por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const beach = await prisma.beach.findUnique({
      where: { id: parseInt(id) }
    });

    if (!beach) {
      return res.status(404).json({ message: 'Playa no encontrada' });
    }

    res.json(beach);
  } catch (err: any) {
    console.error('Error fetching beach:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /beaches - crear nueva playa (requiere admin)
router.post('/', requireAuth, validateBody(beachSchema), async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Solo administradores pueden crear playas' });
    }

    const data = req.body;

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.name);

    // Check for existing beach with same name or slug
    const existingBeach = await prisma.beach.findFirst({
      where: {
        OR: [
          { name: { equals: data.name, mode: 'insensitive' } },
          { slug: slug }
        ]
      }
    });

    if (existingBeach) {
      return res.status(400).json({ message: 'Ya existe una playa con ese nombre o slug' });
    }

    const newBeach = await prisma.beach.create({
      data: {
        name: data.name,
        slug,
        location: data.location,
        description: data.description,
        image: data.image,
        waveType: data.waveType,
        level: data.level,
        bestTime: data.bestTime,
        entryTips: data.entryTips || [],
        hazards: data.hazards || [],
        conditions: data.conditions || {},
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder ?? 0,
        count: data.count,
      }
    });

    res.status(201).json(newBeach);
  } catch (err: any) {
    console.error('Error creating beach:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
});

// PUT /beaches/:id - actualizar playa (requiere admin)
router.put('/:id', requireAuth, validateBody(beachSchema.partial()), async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Solo administradores pueden editar playas' });
    }

    const { id } = req.params;
    const data = req.body;

    // Check if beach exists
    const existingBeach = await prisma.beach.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingBeach) {
      return res.status(404).json({ message: 'Playa no encontrada' });
    }

    // If name changed, regenerate slug
    let slug = existingBeach.slug;
    if (data.name && data.name !== existingBeach.name) {
      slug = data.slug || generateSlug(data.name);

      // Check for conflicts
      const conflict = await prisma.beach.findFirst({
        where: {
          slug,
          id: { not: parseInt(id) }
        }
      });

      if (conflict) {
        return res.status(400).json({ message: 'Ya existe una playa con ese nombre' });
      }
    }

    const updatedBeach = await prisma.beach.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        slug,
      }
    });

    res.json(updatedBeach);
  } catch (err: any) {
    console.error('Error updating beach:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
});

// DELETE /beaches/:id - eliminar playa (requiere admin)
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Solo administradores pueden eliminar playas' });
    }

    const { id } = req.params;

    // Check if beach has classes
    const beachWithClasses = await prisma.beach.findUnique({
      where: { id: parseInt(id) },
      include: { classes: { take: 1 } }
    });

    if (!beachWithClasses) {
      return res.status(404).json({ message: 'Playa no encontrada' });
    }

    if (beachWithClasses.classes.length > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar la playa porque tiene clases asociadas'
      });
    }

    await prisma.beach.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Playa eliminada correctamente' });
  } catch (err: any) {
    console.error('Error deleting beach:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
});

// PUT /beaches/:id/conditions - actualizar solo condiciones (para integración con APIs externas)
router.put('/:id/conditions', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Solo administradores pueden actualizar condiciones' });
    }

    const { id } = req.params;
    const conditions = req.body;

    const updatedBeach = await prisma.beach.update({
      where: { id: parseInt(id) },
      data: {
        conditions: {
          ...conditions,
          lastUpdated: new Date().toISOString()
        }
      }
    });

    res.json(updatedBeach);
  } catch (err: any) {
    console.error('Error updating beach conditions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;


