import express from 'express';
import prisma from '../prisma';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import requireAuth, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Schema de validación para crear playa
const createBeachSchema = z.object({
  name: z.string().min(1, 'El nombre de la playa es requerido'),
  location: z.string().optional(),
  description: z.string().optional(),
});

// GET /beaches - obtener todas las playas
router.get('/', async (req, res) => {
  try {
    const beaches = await prisma.beach.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.json(beaches);
  } catch (err: any) {
    console.error('Error fetching beaches:', err);
    console.error('Error details:', err.message, err.code);
    
    // Si la tabla no existe (P2021), devolver array vacío
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

// POST /beaches - crear nueva playa (requiere autenticación)
router.post('/', requireAuth, validateBody(createBeachSchema), async (req: AuthRequest, res) => {
  try {
    const { name, location, description } = req.body;
    
    // Verificar si ya existe una playa con el mismo nombre
    const existingBeach = await prisma.beach.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
    
    if (existingBeach) {
      return res.status(400).json({ message: 'Ya existe una playa con ese nombre' });
    }
    
    const newBeach = await prisma.beach.create({
      data: {
        name,
        location,
        description
      }
    });
    
    res.status(201).json(newBeach);
  } catch (err: any) {
    console.error('Error creating beach:', err);
    console.error('Error details:', err.message, err.code);
    res.status(500).json({ 
      message: 'Internal server error',
      error: err.message,
      code: err.code
    });
  }
});

export default router;

