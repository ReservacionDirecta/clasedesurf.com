"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Schema for user registration
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    email: zod_1.z.string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters'),
    password: zod_1.z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be less than 100 characters')
});
// Schema for user login
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters'),
    password: zod_1.z.string()
        .min(1, 'Password is required')
        .max(100, 'Password must be less than 100 characters')
});
