"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../prisma"));
const validation_1 = require("../middleware/validation");
const classes_1 = require("../validations/classes");
const auth_1 = __importStar(require("../middleware/auth"));
const resolve_school_1 = __importDefault(require("../middleware/resolve-school"));
const multi_tenant_1 = require("../middleware/multi-tenant");
const router = express_1.default.Router();
// Middleware to optionally extract auth info without requiring it
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key-for-development-only');
            req.userId = decoded.userId;
            req.role = decoded.role;
        }
        catch (err) {
            // Invalid token, but we don't fail - just continue without auth
        }
    }
    next();
};
// GET /classes - list classes with filters (supports multi-tenant filtering)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { date, level, type, minPrice, maxPrice, schoolId } = req.query;
        // Build filter object
        const where = {};
        // Apply multi-tenant filtering if authenticated
        if (req.userId && req.role) {
            const multiTenantWhere = await (0, multi_tenant_1.buildMultiTenantWhere)(req, 'class');
            Object.assign(where, multiTenantWhere);
        }
        // Filter by schoolId if provided (and not already filtered by multi-tenant)
        if (schoolId && !where.schoolId) {
            where.schoolId = Number(schoolId);
        }
        // Filter by date (exact date match)
        if (date && typeof date === 'string') {
            const filterDate = new Date(date);
            const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
            where.date = {
                gte: startOfDay,
                lte: endOfDay
            };
        }
        // Filter by level
        if (level && typeof level === 'string') {
            where.level = level.toUpperCase();
        }
        // Filter by type
        if (type && typeof type === 'string') {
            where.type = type.toUpperCase();
        }
        // Filter by price range
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = Number(minPrice);
            if (maxPrice)
                where.price.lte = Number(maxPrice);
        }
        const classes = await prisma_1.default.class.findMany({
            where,
            include: {
                school: true,
                reservations: {
                    include: {
                        payment: true,
                        user: true
                    }
                }
            },
            orderBy: { date: 'asc' }
        });
        // Calculate payment info and available spots for each class
        const classesWithInfo = classes.map(cls => {
            const activeReservations = cls.reservations.filter(r => r.status !== 'CANCELED');
            const totalReservations = activeReservations.length;
            const paidReservations = cls.reservations.filter(r => r.payment?.status === 'PAID').length;
            const totalRevenue = cls.reservations
                .filter(r => r.payment?.status === 'PAID')
                .reduce((sum, r) => sum + (r.payment?.amount || 0), 0);
            // Calculate available spots
            const availableSpots = cls.capacity - totalReservations;
            return {
                ...cls,
                availableSpots: Math.max(0, availableSpots), // Ensure non-negative
                paymentInfo: {
                    totalReservations,
                    paidReservations,
                    totalRevenue,
                    occupancyRate: cls.capacity > 0 ? (totalReservations / cls.capacity) * 100 : 0
                }
            };
        });
        res.json(classesWithInfo);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// POST /classes - create class (ADMIN or SCHOOL_ADMIN)
router.post('/', auth_1.default, (0, auth_1.requireRole)(['ADMIN', 'SCHOOL_ADMIN']), resolve_school_1.default, (0, validation_1.validateBody)(classes_1.createClassSchema), async (req, res) => {
    try {
        const { title, description, date, duration, capacity, price, level, instructor, schoolId, studentDetails } = req.body;
        console.log('📝 Creando clase con datos:', { title, description, date, duration, capacity, price, level, instructor, studentDetails });
        const classDate = new Date(date);
        // Determine final schoolId
        let finalSchoolId = schoolId ? Number(schoolId) : undefined;
        if (req.role === 'SCHOOL_ADMIN') {
            if (!req.schoolId)
                return res.status(404).json({ message: 'No school found for this user' });
            finalSchoolId = req.schoolId;
        }
        if (!finalSchoolId)
            return res.status(400).json({ message: 'School ID is required' });
        console.log('🏫 School ID final:', finalSchoolId);
        const newClass = await prisma_1.default.class.create({
            data: {
                title,
                description,
                date: classDate,
                duration: Number(duration),
                capacity: Number(capacity),
                price: Number(price),
                level,
                instructor,
                school: { connect: { id: Number(finalSchoolId) } }
            }
        });
        console.log('✅ Clase creada exitosamente:', newClass.id);
        res.status(201).json(newClass);
    }
    catch (err) {
        console.error('❌ Error al crear clase:', err);
        res.status(500).json({ message: 'Internal server error', error: String(err) });
    }
});
// PUT /classes/:id - update class (ADMIN or SCHOOL_ADMIN)
router.put('/:id', auth_1.default, (0, auth_1.requireRole)(['ADMIN', 'SCHOOL_ADMIN']), resolve_school_1.default, (0, validation_1.validateParams)(classes_1.classIdSchema), (0, validation_1.validateBody)(classes_1.updateClassSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        // If SCHOOL_ADMIN, verify class belongs to their school
        if (req.role === 'SCHOOL_ADMIN') {
            if (!req.schoolId)
                return res.status(404).json({ message: 'No school found for this user' });
            const existing = await prisma_1.default.class.findUnique({ where: { id: Number(id) } });
            if (!existing)
                return res.status(404).json({ message: 'Class not found' });
            if (existing.schoolId !== req.schoolId) {
                return res.status(403).json({ message: 'You can only update classes from your school' });
            }
        }
        const updated = await prisma_1.default.class.update({ where: { id: Number(id) }, data });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// DELETE /classes/:id (ADMIN or SCHOOL_ADMIN)
router.delete('/:id', auth_1.default, (0, auth_1.requireRole)(['ADMIN', 'SCHOOL_ADMIN']), resolve_school_1.default, (0, validation_1.validateParams)(classes_1.classIdSchema), async (req, res) => {
    try {
        const { id } = req.params;
        // If SCHOOL_ADMIN, verify ownership
        if (req.role === 'SCHOOL_ADMIN') {
            if (!req.schoolId)
                return res.status(404).json({ message: 'No school found for this user' });
            const existing = await prisma_1.default.class.findUnique({ where: { id: Number(id) } });
            if (!existing)
                return res.status(404).json({ message: 'Class not found' });
            if (existing.schoolId !== req.schoolId) {
                return res.status(403).json({ message: 'You can only delete classes from your school' });
            }
        }
        await prisma_1.default.class.delete({ where: { id: Number(id) } });
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
