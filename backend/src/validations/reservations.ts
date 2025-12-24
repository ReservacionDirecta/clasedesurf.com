import { z } from 'zod';

// Schema for participant details
const participantSchema = z.object({
  name: z.string().min(1, 'Participant name is required'),
  age: z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val;
    if (isNaN(num) || num < 8) throw new Error('Age must be at least 8');
    return num;
  }),
  height: z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val;
    if (isNaN(num) || num < 100) throw new Error('Height must be at least 100cm');
    return num;
  }),
  weight: z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val;
    if (isNaN(num) || num < 20) throw new Error('Weight must be at least 20kg');
    return num;
  }),
  canSwim: z.boolean(),
  swimmingLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  hasSurfedBefore: z.boolean(),
  injuries: z.string().optional(),
  comments: z.string().optional()
});

// Schema for creating a new reservation
export const createReservationSchema = z.object({
  classId: z.number()
    .int('Class ID must be a whole number')
    .min(1, 'Invalid class ID'),
  specialRequest: z.string()
    .max(500, 'Special request must be less than 500 characters')
    .nullable()
    .optional(),
  participants: z.union([
    // Acepta un número (backward compatibility)
    z.number()
      .int('Participants must be a whole number')
      .min(1, 'At least 1 participant required')
      .max(10, 'Maximum 10 participants allowed'),
    // O acepta un array de objetos con datos detallados
    z.array(participantSchema)
      .min(1, 'At least 1 participant required')
      .max(10, 'Maximum 10 participants allowed')
  ])
    .optional()
    .default(1),
  discountCodeId: z.number()
    .int('Discount code ID must be a whole number')
    .optional()
    .nullable(),
  discountAmount: z.number()
    .min(0, 'Discount amount must be positive')
    .optional()
    .nullable(),
  date: z.string().optional(),
  time: z.string().optional(),
  sessionId: z.union([z.number(), z.string()]).optional().transform(val => val ? Number(val) : undefined)
});

// Schema for updating reservation status (admin only)
export const updateReservationSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PAID', 'CANCELED', 'COMPLETED'])
    .optional(),
  specialRequest: z.string()
    .max(500, 'Special request must be less than 500 characters')
    .nullable()
    .optional()
});

// Schema for reservation ID parameter
export const reservationIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number)
    .refine(val => val > 0, 'ID must be positive')
});

// Types derived from schemas
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type ReservationIdParam = z.infer<typeof reservationIdSchema>;