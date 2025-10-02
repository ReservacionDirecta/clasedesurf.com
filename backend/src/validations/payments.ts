import { z } from 'zod';

// Schema for creating a new payment
export const createPaymentSchema = z.object({
  reservationId: z.number()
    .int('Reservation ID must be a whole number')
    .min(1, 'Invalid reservation ID'),
  amount: z.number()
    .min(0, 'Amount must be non-negative')
    .max(10000, 'Amount must be less than 10000'),
  paymentMethod: z.string()
    .min(1, 'Payment method is required')
    .max(50, 'Payment method must be less than 50 characters')
    .optional(),
  transactionId: z.string()
    .max(100, 'Transaction ID must be less than 100 characters')
    .nullable()
    .optional()
});

// Schema for updating a payment
export const updatePaymentSchema = z.object({
  amount: z.number()
    .min(0, 'Amount must be non-negative')
    .max(10000, 'Amount must be less than 10000')
    .optional(),
  status: z.enum(['UNPAID', 'PAID', 'REFUNDED'])
    .optional(),
  paymentMethod: z.string()
    .min(1, 'Payment method is required')
    .max(50, 'Payment method must be less than 50 characters')
    .optional(),
  transactionId: z.string()
    .max(100, 'Transaction ID must be less than 100 characters')
    .nullable()
    .optional(),
  paidAt: z.string()
    .datetime('Invalid date format')
    .nullable()
    .optional()
});

// Schema for payment ID parameter
export const paymentIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number)
    .refine(val => val > 0, 'ID must be positive')
});

// Types derived from schemas
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type PaymentIdParam = z.infer<typeof paymentIdSchema>;