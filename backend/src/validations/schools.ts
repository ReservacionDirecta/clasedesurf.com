import { z } from 'zod';

// Schema for creating a new school
export const createSchoolSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  location: z.string()
    .min(1, 'Location is required')
    .max(300, 'Location must be less than 300 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .nullable()
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Invalid phone number format')
    .nullable()
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .nullable()
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .max(500, 'Website URL must be less than 500 characters')
    .nullable()
    .optional(),
  instagram: z.string()
    .max(100, 'Instagram handle must be less than 100 characters')
    .nullable()
    .optional(),
  facebook: z.string()
    .max(100, 'Facebook page must be less than 100 characters')
    .nullable()
    .optional(),
  whatsapp: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Invalid WhatsApp number format')
    .nullable()
    .optional(),
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .nullable()
    .optional(),
  logo: z.string()
    .url('Invalid logo URL')
    .max(500, 'Logo URL must be less than 500 characters')
    .nullable()
    .optional(),
  coverImage: z.string()
    .url('Invalid cover image URL')
    .max(500, 'Cover image URL must be less than 500 characters')
    .nullable()
    .optional()
});

// Schema for updating a school
export const updateSchoolSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters')
    .optional(),
  location: z.string()
    .min(1, 'Location is required')
    .max(300, 'Location must be less than 300 characters')
    .optional(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .nullable()
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Invalid phone number format')
    .nullable()
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .nullable()
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .max(500, 'Website URL must be less than 500 characters')
    .nullable()
    .optional(),
  instagram: z.string()
    .max(100, 'Instagram handle must be less than 100 characters')
    .nullable()
    .optional(),
  facebook: z.string()
    .max(100, 'Facebook page must be less than 100 characters')
    .nullable()
    .optional(),
  whatsapp: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Invalid WhatsApp number format')
    .nullable()
    .optional(),
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .nullable()
    .optional(),
  logo: z.string()
    .url('Invalid logo URL')
    .max(500, 'Logo URL must be less than 500 characters')
    .nullable()
    .optional(),
  coverImage: z.string()
    .url('Invalid cover image URL')
    .max(500, 'Cover image URL must be less than 500 characters')
    .nullable()
    .optional()
});

// Schema for school ID parameter
export const schoolIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number)
    .refine(val => val > 0, 'ID must be positive')
});

// Types derived from schemas
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type SchoolIdParam = z.infer<typeof schoolIdSchema>;