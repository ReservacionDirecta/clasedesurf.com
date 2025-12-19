import { z } from 'zod';

// Enum validation for class levels
const ClassLevelEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Schema for creating a new class
export const createClassSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .nullable()
    .optional(),
  date: z.string()
    .datetime('Invalid date format')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      return date.getTime() >= now.getTime() - (24 * 60 * 60 * 1000);
    }, 'Class date must be today or in the future')
    .optional(), // Made optional for recurring classes
  isRecurring: z.boolean().default(false).optional(),
  recurrencePattern: z.object({
    days: z.array(z.number().min(0).max(6)),
    times: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/))
  }).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  duration: z.number()
    .int('Duration must be a whole number')
    .min(30, 'Duration must be at least 30 minutes')
    .max(480, 'Duration must be less than 8 hours'),
  capacity: z.number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(50, 'Capacity must be less than 50'),
  price: z.number()
    .min(0, 'Price must be non-negative')
    .max(10000, 'Price must be less than 10000'),
  level: ClassLevelEnum,
  type: z.string().optional().default('SURF_LESSON'),
  instructor: z.string()
    .max(100, 'Instructor name must be less than 100 characters')
    .nullable()
    .optional(),
  images: z.array(z.string())
    .max(5, 'Maximum 5 images allowed')
    .optional(),
  schoolId: z.number()
    .int('School ID must be a whole number')
    .min(1, 'Invalid school ID')
    .optional(),
  beachId: z.number()
    .int('Beach ID must be a whole number')
    .min(1, 'Invalid beach ID')
    .optional(),
  studentDetails: z.string()
    .max(2000, 'Student details must be less than 2000 characters')
    .nullable()
    .optional()
});

const bulkClassBaseDataSchema = createClassSchema.pick({
  title: true,
  description: true,
  duration: true,
  capacity: true,
  price: true,
  level: true,
  instructor: true,
  images: true,
  studentDetails: true
});

const bulkClassOccurrenceSchema = z.object({
  date: z.string()
    .regex(dateOnlyRegex, 'Date must be in YYYY-MM-DD format'),
  time: z.string()
    .regex(timeRegex, 'Time must be in HH:MM format')
});

export const createBulkClassesSchema = z.object({
  baseData: bulkClassBaseDataSchema,
  schoolId: z.number()
    .int('School ID must be a whole number')
    .min(1, 'Invalid school ID')
    .optional(),
  beachId: z.number()
    .int('Beach ID must be a whole number')
    .min(1, 'Invalid beach ID')
    .optional(),
  occurrences: z.array(bulkClassOccurrenceSchema)
    .min(1, 'At least one occurrence is required')
});

// Schema for updating a class
export const updateClassSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .nullable()
    .optional(),
  date: z.string()
    .datetime('Invalid date format')
    .optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.object({
    days: z.array(z.number().min(0).max(6)),
    times: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/))
  }).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  duration: z.number()
    .int('Duration must be a whole number')
    .min(30, 'Duration must be at least 30 minutes')
    .max(480, 'Duration must be less than 8 hours')
    .optional(),
  capacity: z.number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(50, 'Capacity must be less than 50')
    .optional(),
  price: z.number()
    .min(0, 'Price must be non-negative')
    .max(10000, 'Price must be less than 10000')
    .optional(),
  level: ClassLevelEnum.optional(),
  type: z.string().optional(),
  instructor: z.string()
    .max(100, 'Instructor name must be less than 100 characters')
    .nullable()
    .optional(),
  images: z.array(z.string())
    .max(5, 'Maximum 5 images allowed')
    .optional(),
  schoolId: z.number()
    .int('School ID must be a whole number')
    .min(1, 'Invalid school ID')
    .optional(),
  beachId: z.number()
    .int('Beach ID must be a whole number')
    .min(1, 'Invalid beach ID')
    .optional(),
  studentDetails: z.string()
    .max(2000, 'Student details must be less than 2000 characters')
    .nullable()
    .optional()
});

// Schema for class ID parameter
export const classIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number)
    .refine(val => val > 0, 'ID must be positive')
});

// Types derived from schemas
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type ClassIdParam = z.infer<typeof classIdSchema>;
export type CreateBulkClassesInput = z.infer<typeof createBulkClassesSchema>;