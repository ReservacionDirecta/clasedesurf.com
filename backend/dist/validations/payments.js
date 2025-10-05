"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentIdSchema = exports.updatePaymentSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a new payment
exports.createPaymentSchema = zod_1.z.object({
    reservationId: zod_1.z.number()
        .int('Reservation ID must be a whole number')
        .min(1, 'Invalid reservation ID'),
    amount: zod_1.z.number()
        .min(0, 'Amount must be non-negative')
        .max(10000, 'Amount must be less than 10000'),
    paymentMethod: zod_1.z.string()
        .min(1, 'Payment method is required')
        .max(50, 'Payment method must be less than 50 characters')
        .optional(),
    transactionId: zod_1.z.string()
        .max(100, 'Transaction ID must be less than 100 characters')
        .nullable()
        .optional()
});
// Schema for updating a payment
exports.updatePaymentSchema = zod_1.z.object({
    amount: zod_1.z.number()
        .min(0, 'Amount must be non-negative')
        .max(10000, 'Amount must be less than 10000')
        .optional(),
    status: zod_1.z.enum(['UNPAID', 'PAID', 'REFUNDED'])
        .optional(),
    paymentMethod: zod_1.z.string()
        .min(1, 'Payment method is required')
        .max(50, 'Payment method must be less than 50 characters')
        .optional(),
    transactionId: zod_1.z.string()
        .max(100, 'Transaction ID must be less than 100 characters')
        .nullable()
        .optional(),
    voucherImage: zod_1.z.string()
        .url('Voucher image must be a valid URL')
        .max(500, 'Voucher image URL must be less than 500 characters')
        .nullable()
        .optional(),
    voucherNotes: zod_1.z.string()
        .max(500, 'Voucher notes must be less than 500 characters')
        .nullable()
        .optional(),
    paidAt: zod_1.z.string()
        .datetime('Invalid date format')
        .nullable()
        .optional()
});
// Schema for payment ID parameter
exports.paymentIdSchema = zod_1.z.object({
    id: zod_1.z.string()
        .regex(/^\d+$/, 'ID must be a number')
        .transform(Number)
        .refine(val => val > 0, 'ID must be positive')
});
