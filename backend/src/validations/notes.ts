import { z } from 'zod';

// Schema for creating a new calendar note
export const createNoteSchema = z.object({
  title: z.string()
    .min(1, 'El título es requerido')
    .max(200, 'El título debe tener menos de 200 caracteres'),
  content: z.string()
    .max(1000, 'El contenido debe tener menos de 1000 caracteres')
    .nullable()
    .optional(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD'),
  time: z.union([
    z.string().regex(/^\d{2}:\d{2}$/, 'La hora debe estar en formato HH:mm'),
    z.null(),
    z.undefined()
  ]).optional().transform(val => val === undefined || val === '' || val === '00:00' ? null : val)
});

// Schema for updating a calendar note
export const updateNoteSchema = z.object({
  title: z.string()
    .min(1, 'El título es requerido')
    .max(200, 'El título debe tener menos de 200 caracteres')
    .optional(),
  content: z.string()
    .max(1000, 'El contenido debe tener menos de 1000 caracteres')
    .nullable()
    .optional(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD')
    .optional(),
  time: z.union([
    z.string().regex(/^\d{2}:\d{2}$/, 'La hora debe estar en formato HH:mm'),
    z.null(),
    z.undefined()
  ]).optional().transform(val => val === undefined || val === '' || val === '00:00' ? null : val)
});

// Schema for note ID parameter
export const noteIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID debe ser un número')
    .transform(Number)
    .refine(val => val > 0, 'ID debe ser positivo')
});

// Types derived from schemas
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NoteIdParam = z.infer<typeof noteIdSchema>;

