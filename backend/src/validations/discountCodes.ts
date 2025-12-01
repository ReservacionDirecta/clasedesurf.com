import { z } from 'zod';

// Schema for creating a new discount code
export const createDiscountCodeSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code must be less than 50 characters')
    .regex(/^[A-Z0-9_-]+$/i, 'Code can only contain letters, numbers, hyphens and underscores')
    .transform(val => val.toUpperCase()),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .nullable()
    .optional(),
  discountPercentage: z.number()
    .min(0, 'Discount percentage must be at least 0')
    .max(100, 'Discount percentage cannot exceed 100'),
  validFrom: z.string()
    .datetime('Invalid date format for validFrom'),
  validTo: z.string()
    .datetime('Invalid date format for validTo'),
  isActive: z.boolean().optional().default(true),
  maxUses: z.number()
    .int('Max uses must be a whole number')
    .min(1, 'Max uses must be at least 1')
    .nullable()
    .optional(),
  schoolId: z.number()
    .int('School ID must be a whole number')
    .min(1, 'Invalid school ID')
    .nullable()
    .optional(),
});

// Schema for updating a discount code
export const updateDiscountCodeSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code must be less than 50 characters')
    .regex(/^[A-Z0-9_-]+$/i, 'Code can only contain letters, numbers, hyphens and underscores')
    .transform(val => val.toUpperCase())
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .nullable()
    .optional(),
  discountPercentage: z.number()
    .min(0, 'Discount percentage must be at least 0')
    .max(100, 'Discount percentage cannot exceed 100')
    .optional(),
  validFrom: z.string()
    .datetime('Invalid date format for validFrom')
    .optional(),
  validTo: z.string()
    .datetime('Invalid date format for validTo')
    .optional(),
  isActive: z.boolean().optional(),
  maxUses: z.number()
    .int('Max uses must be a whole number')
    .min(1, 'Max uses must be at least 1')
    .nullable()
    .optional(),
  schoolId: z.number()
    .int('School ID must be a whole number')
    .min(1, 'Invalid school ID')
    .nullable()
    .optional(),
});

// Schema for validating/applying a discount code
export const validateDiscountCodeSchema = z.object({
  code: z.string()
    .min(1, 'Code is required')
    .transform(val => val.toUpperCase()),
  amount: z.number()
    .min(0, 'Amount must be non-negative'),
  classId: z.number()
    .int('Class ID must be a whole number')
    .min(1, 'Invalid class ID')
    .optional(),
});

// Schema for discount code ID parameter
export const discountCodeIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number)
    .refine(val => val > 0, 'ID must be positive')
});

// Types derived from schemas
export type CreateDiscountCodeInput = z.infer<typeof createDiscountCodeSchema>;
export type UpdateDiscountCodeInput = z.infer<typeof updateDiscountCodeSchema>;
export type ValidateDiscountCodeInput = z.infer<typeof validateDiscountCodeSchema>;
export type DiscountCodeIdParam = z.infer<typeof discountCodeIdSchema>;

