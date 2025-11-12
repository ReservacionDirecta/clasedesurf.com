"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationIdSchema = exports.updateReservationSchema = exports.createReservationSchema = void 0;
const zod_1 = require("zod");
// Schema for participant details
const participantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Participant name is required'),
    age: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => {
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        if (isNaN(num) || num < 8)
            throw new Error('Age must be at least 8');
        return num;
    }),
    height: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => {
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        if (isNaN(num) || num < 100)
            throw new Error('Height must be at least 100cm');
        return num;
    }),
    weight: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => {
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        if (isNaN(num) || num < 20)
            throw new Error('Weight must be at least 20kg');
        return num;
    }),
    canSwim: zod_1.z.boolean(),
    swimmingLevel: zod_1.z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    hasSurfedBefore: zod_1.z.boolean(),
    injuries: zod_1.z.string().optional(),
    comments: zod_1.z.string().optional()
});
// Schema for creating a new reservation
exports.createReservationSchema = zod_1.z.object({
    classId: zod_1.z.number()
        .int('Class ID must be a whole number')
        .min(1, 'Invalid class ID'),
    specialRequest: zod_1.z.string()
        .max(500, 'Special request must be less than 500 characters')
        .nullable()
        .optional(),
    participants: zod_1.z.union([
        // Acepta un número (backward compatibility)
        zod_1.z.number()
            .int('Participants must be a whole number')
            .min(1, 'At least 1 participant required')
            .max(10, 'Maximum 10 participants allowed'),
        // O acepta un array de objetos con datos detallados
        zod_1.z.array(participantSchema)
            .min(1, 'At least 1 participant required')
            .max(10, 'Maximum 10 participants allowed')
    ])
        .optional()
        .default(1)
});
// Schema for updating reservation status (admin only)
exports.updateReservationSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'PAID', 'CANCELED', 'COMPLETED'])
        .optional(),
    specialRequest: zod_1.z.string()
        .max(500, 'Special request must be less than 500 characters')
        .nullable()
        .optional()
});
// Schema for reservation ID parameter
exports.reservationIdSchema = zod_1.z.object({
    id: zod_1.z.string()
        .regex(/^\d+$/, 'ID must be a number')
        .transform(Number)
        .refine(val => val > 0, 'ID must be positive')
});
