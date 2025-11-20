import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { createNoteSchema, updateNoteSchema, noteIdSchema } from '../validations/notes';
import resolveSchool from '../middleware/resolve-school';
import { buildMultiTenantWhere } from '../middleware/multi-tenant';

const router = express.Router();

// Test endpoint to verify Prisma model exists (must be before auth middleware)
router.get('/test', async (req, res) => {
  try {
    // Test if calendarNote model exists
    console.log('[GET /notes/test] Testing CalendarNote model...');
    console.log('[GET /notes/test] Prisma client keys:', Object.keys(prisma).filter(k => !k.startsWith('$')));
    
    // Try to access the model
    const hasModel = 'calendarNote' in prisma;
    console.log('[GET /notes/test] Has calendarNote:', hasModel);
    
    if (!hasModel) {
      return res.status(500).json({ 
        message: 'CalendarNote model not found in Prisma client',
        availableModels: Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'))
      });
    }
    
    const count = await (prisma as any).calendarNote.count();
    res.json({ 
      message: 'CalendarNote model is available',
      count,
      modelExists: true
    });
  } catch (err: any) {
    console.error('[GET /notes/test] Error:', err);
    res.status(500).json({ 
      message: 'CalendarNote model error',
      error: err?.message,
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
      availableModels: Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'))
    });
  }
});

// GET /notes - get all notes for the school (multi-tenant filtered)
router.get('/', requireAuth, requireRole(['SCHOOL_ADMIN', 'ADMIN']), resolveSchool, async (req: AuthRequest, res) => {
  try {
    const { date } = req.query;
    
    // Build where clause with multi-tenant filtering
    let where: any = {};
    
    try {
      where = await buildMultiTenantWhere(req, 'calendarNote');
    } catch (err: any) {
      // Si no se puede construir el where (ej: no hay escuela), usar schoolId directo
      const schoolId = (req as any).schoolId;
      if (!schoolId && req.role === 'SCHOOL_ADMIN' && req.userId) {
        const school = await prisma.school.findFirst({
          where: { ownerId: Number(req.userId) }
        });
        if (school) {
          where.schoolId = school.id;
        } else {
          // Si no hay escuela, retornar array vacío
          return res.json([]);
        }
      } else if (schoolId) {
        where.schoolId = schoolId;
      } else if (req.role !== 'ADMIN') {
        // Si no es admin y no hay schoolId, retornar vacío
        return res.json([]);
      }
    }
    
    // Filter by date if provided
    if (date && typeof date === 'string') {
      const filterDate = new Date(date);
      const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    
    const notes = await prisma.calendarNote.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
    
    res.json(notes);
  } catch (err: any) {
    console.error('[GET /notes] Error:', err);
    console.error('[GET /notes] Error message:', err?.message);
    console.error('[GET /notes] Error stack:', err?.stack);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
});

// POST /notes - create a new note
router.post('/', requireAuth, requireRole(['SCHOOL_ADMIN', 'ADMIN']), resolveSchool, validateBody(createNoteSchema), async (req: AuthRequest, res) => {
  try {
    const { title, content, date, time } = req.body;
    const schoolId = (req as any).schoolId;
    
    console.log('[POST /notes] Request body:', { title, content, date, time });
    console.log('[POST /notes] SchoolId from req:', schoolId);
    console.log('[POST /notes] UserId:', req.userId);
    console.log('[POST /notes] Role:', req.role);
    
    let finalSchoolId = schoolId;
    
    if (!finalSchoolId) {
      // Intentar obtener la escuela del usuario
      const userId = req.userId;
      if (userId) {
        const school = await prisma.school.findFirst({
          where: { ownerId: Number(userId) }
        });
        if (school) {
          finalSchoolId = school.id;
          console.log('[POST /notes] Found school:', finalSchoolId);
        } else {
          console.error('[POST /notes] No school found for user:', userId);
          return res.status(400).json({ message: 'No se pudo determinar la escuela. Asegúrate de tener una escuela asociada.' });
        }
      } else {
        return res.status(400).json({ message: 'Usuario no autenticado' });
      }
    }
    
    // Convert date string to DateTime
    const noteDate = new Date(date);
    if (isNaN(noteDate.getTime())) {
      return res.status(400).json({ message: 'Fecha inválida' });
    }
    
    // Normalize time: if empty string, '00:00', or undefined, set to null
    const normalizedTime = (!time || time === '' || time === '00:00') ? null : time;
    
    console.log('[POST /notes] Creating note with:', {
      schoolId: finalSchoolId,
      title,
      content: content || null,
      date: noteDate,
      time: normalizedTime
    });
    
    const note = await prisma.calendarNote.create({
      data: {
        schoolId: finalSchoolId,
        title,
        content: content || null,
        date: noteDate,
        time: normalizedTime
      }
    });
    
    console.log('[POST /notes] Note created successfully:', note.id);
    
    res.status(201).json(note);
  } catch (err: any) {
    console.error('[POST /notes] Error completo:', err);
    console.error('[POST /notes] Error message:', err?.message);
    console.error('[POST /notes] Error stack:', err?.stack);
    res.status(500).json({ 
      message: 'Error al crear la nota',
      error: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
});

// PUT /notes/:id - update a note
router.put('/:id', requireAuth, requireRole(['SCHOOL_ADMIN', 'ADMIN']), resolveSchool, validateParams(noteIdSchema), validateBody(updateNoteSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, content, date, time } = req.body;
    const schoolId = (req as any).schoolId;
    
    // Verify note exists and belongs to school
    const existingNote = await prisma.calendarNote.findFirst({
      where: {
        id: Number(id),
        schoolId
      }
    });
    
    if (!existingNote) {
      return res.status(404).json({ message: 'Nota no encontrada' });
    }
    
    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (date !== undefined) {
      const noteDate = new Date(date);
      if (isNaN(noteDate.getTime())) {
        return res.status(400).json({ message: 'Fecha inválida' });
      }
      updateData.date = noteDate;
    }
    if (time !== undefined) updateData.time = time;
    
    const note = await prisma.calendarNote.update({
      where: { id: Number(id) },
      data: updateData
    });
    
    res.json(note);
  } catch (err: any) {
    console.error('[PUT /notes/:id] Error:', err);
    res.status(500).json({ message: 'Error al actualizar la nota' });
  }
});

// DELETE /notes/:id - delete a note
router.delete('/:id', requireAuth, requireRole(['SCHOOL_ADMIN', 'ADMIN']), resolveSchool, validateParams(noteIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const schoolId = (req as any).schoolId;
    
    // Verify note exists and belongs to school
    const existingNote = await prisma.calendarNote.findFirst({
      where: {
        id: Number(id),
        schoolId
      }
    });
    
    if (!existingNote) {
      return res.status(404).json({ message: 'Nota no encontrada' });
    }
    
    await prisma.calendarNote.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Nota eliminada exitosamente' });
  } catch (err: any) {
    console.error('[DELETE /notes/:id] Error:', err);
    res.status(500).json({ message: 'Error al eliminar la nota' });
  }
});

export default router;

