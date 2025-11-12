import { z } from 'zod';

// Schema for updating user profile
export const updateProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional(),
  age: z.number()
    .int('Age must be a whole number')
    .min(5, 'Age must be at least 5 years')
    .max(120, 'Age must be less than 120 years')
    .nullable()
    .optional(),
  weight: z.number()
    .min(20, 'Weight must be at least 20 kg')
    .max(300, 'Weight must be less than 300 kg')
    .nullable()
    .optional(),
  height: z.number()
    .min(50, 'Height must be at least 50 cm')
    .max(250, 'Height must be less than 250 cm')
    .nullable()
    .optional(),
  canSwim: z.boolean()
    .optional(),
  injuries: z.string()
    .max(1000, 'Injuries description must be less than 1000 characters')
    .nullable()
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Invalid phone number format')
    .nullable()
    .optional(),
  profilePhoto: z.union([
    z.string().max(10000000, 'Profile photo must be less than 10MB when base64 encoded'),
    z.literal('').transform(() => null),
    z.null()
  ]).optional()
});

// Types derived from schemas
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;