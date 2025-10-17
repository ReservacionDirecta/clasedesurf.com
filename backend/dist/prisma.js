"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_1 = require("@prisma/client");
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'NOT FOUND');
console.log('DATABASE_URL value:', process.env.DATABASE_URL);
// Force direct database connection, not Prisma Accelerate
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    log: ['query', 'info', 'warn', 'error'],
});
exports.default = prisma;
