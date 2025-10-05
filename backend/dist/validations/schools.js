"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolIdSchema = exports.updateSchoolSchema = exports.createSchoolSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a new school
exports.createSchoolSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Name is required')
        .max(200, 'Name must be less than 200 characters'),
    location: zod_1.z.string()
        .min(1, 'Location is required')
        .max(300, 'Location must be less than 300 characters'),
    description: zod_1.z.string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional(),
    phone: zod_1.z.string()
        .max(20, 'Phone number too long')
        .optional(),
    email: zod_1.z.string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters'),
    website: zod_1.z.string()
        .max(500, 'Website URL must be less than 500 characters')
        .optional(),
    instagram: zod_1.z.string()
        .max(100, 'Instagram handle must be less than 100 characters')
        .optional(),
    facebook: zod_1.z.string()
        .max(100, 'Facebook page must be less than 100 characters')
        .optional(),
    whatsapp: zod_1.z.string()
        .max(20, 'WhatsApp number too long')
        .optional(),
    address: zod_1.z.string()
        .max(500, 'Address must be less than 500 characters')
        .optional(),
    logo: zod_1.z.string()
        .max(500, 'Logo URL must be less than 500 characters')
        .optional(),
    coverImage: zod_1.z.string()
        .max(500, 'Cover image URL must be less than 500 characters')
        .optional()
});
// Schema for updating a school
exports.updateSchoolSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Name is required')
        .max(200, 'Name must be less than 200 characters')
        .optional(),
    location: zod_1.z.string()
        .min(1, 'Location is required')
        .max(300, 'Location must be less than 300 characters')
        .optional(),
    description: zod_1.z.string()
        .max(1000, 'Description must be less than 1000 characters')
        .nullable()
        .optional(),
    phone: zod_1.z.string()
        .max(20, 'Phone number too long')
        .nullable()
        .optional(),
    email: zod_1.z.string()
        .max(255, 'Email must be less than 255 characters')
        .nullable()
        .optional(),
    website: zod_1.z.string()
        .max(500, 'Website URL must be less than 500 characters')
        .nullable()
        .optional(),
    instagram: zod_1.z.string()
        .max(100, 'Instagram handle must be less than 100 characters')
        .nullable()
        .optional(),
    facebook: zod_1.z.string()
        .max(100, 'Facebook page must be less than 100 characters')
        .nullable()
        .optional(),
    whatsapp: zod_1.z.string()
        .max(20, 'WhatsApp number too long')
        .nullable()
        .optional(),
    address: zod_1.z.string()
        .max(500, 'Address must be less than 500 characters')
        .nullable()
        .optional(),
    logo: zod_1.z.string()
        .max(500, 'Logo URL must be less than 500 characters')
        .nullable()
        .optional(),
    coverImage: zod_1.z.string()
        .max(500, 'Cover image URL must be less than 500 characters')
        .nullable()
        .optional()
});
// Schema for school ID parameter
exports.schoolIdSchema = zod_1.z.object({
    id: zod_1.z.string()
        .regex(/^\d+$/, 'ID must be a number')
        .transform(Number)
        .refine(val => val > 0, 'ID must be positive')
});
