"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
// Schema for updating user profile
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters')
        .optional(),
    email: zod_1.z.string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters')
        .optional(),
    age: zod_1.z.number()
        .int('Age must be a whole number')
        .min(5, 'Age must be at least 5 years')
        .max(120, 'Age must be less than 120 years')
        .nullable()
        .optional(),
    weight: zod_1.z.number()
        .min(20, 'Weight must be at least 20 kg')
        .max(300, 'Weight must be less than 300 kg')
        .nullable()
        .optional(),
    height: zod_1.z.number()
        .min(50, 'Height must be at least 50 cm')
        .max(250, 'Height must be less than 250 cm')
        .nullable()
        .optional(),
    canSwim: zod_1.z.boolean()
        .optional(),
    injuries: zod_1.z.string()
        .max(1000, 'Injuries description must be less than 1000 characters')
        .nullable()
        .optional(),
    phone: zod_1.z.string()
        .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Invalid phone number format')
        .nullable()
        .optional()
});
