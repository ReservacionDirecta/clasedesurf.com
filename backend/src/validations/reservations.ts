import { z } from 'zod';

// Schema for creating a new reservation
export const createReservationSchema = z.object({
  classId: z.number()
    .int('Class ID must be a whole number')
    .min(1, 'Invalid class ID'),
  specialRequest: z.string()
    .max(500, 'Special request must be less than 500 characters')
    .nullable()
    .optional(),
  participants: z.number()
    .int('Participants must be a whole number')
    .min(1, 'At least 1 participant required')
    .max(10, 'Maximum 10 participants allowed')
    .optional()
    .default(1)
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