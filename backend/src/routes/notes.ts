import express from 'express';
import prisma from '../prisma';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { createNoteSchema, updateNoteSchema, noteIdSchema } from '../validations/notes';
import resolveSchool from '../middleware/resolve-school';
import { buildMultiTenantWhere } from '../middleware/multi-tenant';

const router = express.Router();

// GET /notes - get all notes for the school (multi-tenant filtered)
router.get('/', requireAuth, requireRole(['SCHOOL_ADMIN', 'ADMIN']), resolveSchool, async (req: AuthRequest, res) => {
  try {
    const { date } = req.query;
    
    // Build where clause with multi-tenant filtering
    const where: any = await buildMultiTenantWhere(req, 'calendarNote');
    
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
  } catch (err) {
    console.error('[GET /notes] Error:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /notes - create a new note
router.post('/', requireAuth, requireRole(['SCHOOL_ADMIN', 'ADMIN']), resolveSchool, validateBody(createNoteSchema), async (req: AuthRequest, res) => {
  try {
    const { title, content, date, time } = req.body;
    const schoolId = (req as any).schoolId;
    
    if (!schoolId) {
      return res.status(400).json({ message: 'No se pudo determinar la escuela' });
    }
    
    // Convert date string to DateTime
    const noteDate = new Date(date);
    if (isNaN(noteDate.getTime())) {
      return res.status(400).json({ message: 'Fecha inválida' });
    }
    
    const note = await prisma.calendarNote.create({
      data: {
        schoolId,
        title,
        content: content || null,
        date: noteDate,
        time: time || null
      }
    });
    
    res.status(201).json(note);
  } catch (err: any) {
    console.error('[POST /notes] Error:', err);
    res.status(500).json({ message: 'Error al crear la nota' });
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

