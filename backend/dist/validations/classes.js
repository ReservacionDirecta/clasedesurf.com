"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classIdSchema = exports.updateClassSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
// Enum validation for class levels
const ClassLevelEnum = zod_1.z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
// Schema for creating a new class
exports.createClassSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    description: zod_1.z.string()
        .max(1000, 'Description must be less than 1000 characters')
        .nullable()
        .optional(),
    date: zod_1.z.string()
        .datetime('Invalid date format')
        .refine((dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        // Permitir fechas de hoy en adelante (no solo futuro estricto)
        return date.getTime() >= now.getTime() - (24 * 60 * 60 * 1000); // Permite hasta 24h atrás
    }, 'Class date must be today or in the future'),
    duration: zod_1.z.number()
        .int('Duration must be a whole number')
        .min(30, 'Duration must be at least 30 minutes')
        .max(480, 'Duration must be less than 8 hours'),
    capacity: zod_1.z.number()
        .int('Capacity must be a whole number')
        .min(1, 'Capacity must be at least 1')
        .max(50, 'Capacity must be less than 50'),
    price: zod_1.z.number()
        .min(0, 'Price must be non-negative')
        .max(10000, 'Price must be less than 10000'),
    level: ClassLevelEnum,
    instructor: zod_1.z.string()
        .max(100, 'Instructor name must be less than 100 characters')
        .nullable()
        .optional(),
    schoolId: zod_1.z.number()
        .int('School ID must be a whole number')
        .min(1, 'Invalid school ID')
        .optional(),
    studentDetails: zod_1.z.string()
        .max(2000, 'Student details must be less than 2000 characters')
        .nullable()
        .optional()
});
// Schema for updating a class
exports.updateClassSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters')
        .optional(),
    description: zod_1.z.string()
        .max(1000, 'Description must be less than 1000 characters')
        .nullable()
        .optional(),
    date: zod_1.z.string()
        .datetime('Invalid date format')
        .refine((dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        return date.getTime() >= now.getTime() - (24 * 60 * 60 * 1000);
    }, 'Class date must be today or in the future')
        .optional(),
    duration: zod_1.z.number()
        .int('Duration must be a whole number')
        .min(30, 'Duration must be at least 30 minutes')
        .max(480, 'Duration must be less than 8 hours')
        .optional(),
    capacity: zod_1.z.number()
        .int('Capacity must be a whole number')
        .min(1, 'Capacity must be at least 1')
        .max(50, 'Capacity must be less than 50')
        .optional(),
    price: zod_1.z.number()
        .min(0, 'Price must be non-negative')
        .max(10000, 'Price must be less than 10000')
        .optional(),
    level: ClassLevelEnum.optional(),
    instructor: zod_1.z.string()
        .max(100, 'Instructor name must be less than 100 characters')
        .nullable()
        .optional(),
    schoolId: zod_1.z.number()
        .int('School ID must be a whole number')
        .min(1, 'Invalid school ID')
        .optional(),
    studentDetails: zod_1.z.string()
        .max(2000, 'Student details must be less than 2000 characters')
        .nullable()
        .optional()
});
// Schema for class ID parameter
exports.classIdSchema = zod_1.z.object({
    id: zod_1.z.string()
        .regex(/^\d+$/, 'ID must be a number')
        .transform(Number)
        .refine(val => val > 0, 'ID must be positive')
});
