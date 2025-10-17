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
const auth_1 = __importStar(require("../middleware/auth"));
const validation_1 = require("../middleware/validation");
const reservations_1 = require("../validations/reservations");
const resolve_school_1 = __importDefault(require("../middleware/resolve-school"));
const multi_tenant_1 = require("../middleware/multi-tenant");
const router = express_1.default.Router();
// POST /reservations - create reservation (requires auth)
router.post('/', auth_1.default, (0, validation_1.validateBody)(reservations_1.createReservationSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { classId, specialRequest, participants } = req.body;
        if (!userId)
            return res.status(401).json({ message: 'User not authenticated' });
        const requested = participants;
        // Use transaction: re-check capacity and create reservation atomically
        const result = await prisma_1.default.$transaction(async (tx) => {
            const cls = await tx.class.findUnique({ where: { id: Number(classId) } });
            if (!cls)
                throw new Error('Class not found');
            const count = await tx.reservation.count({ where: { classId: Number(classId), status: { not: 'CANCELED' } } });
            if (count + requested > cls.capacity) {
                return { ok: false, reason: 'Not enough spots available' };
            }
            const reservation = await tx.reservation.create({
                data: {
                    user: { connect: { id: Number(userId) } },
                    class: { connect: { id: Number(classId) } },
                    specialRequest: specialRequest || null,
                    status: 'PENDING'
                }
            });
            return { ok: true, reservation };
        });
        if (!result)
            return res.status(500).json({ message: 'Reservation failed' });
        if (!result.ok)
            return res.status(400).json({ message: result.reason });
        res.status(201).json(result.reservation);
    }
    catch (err) {
        console.error(err);
        if (err.message === 'Class not found')
            return res.status(404).json({ message: 'Class not found' });
        res.status(500).json({ message: 'Internal server error' });
    }
});
// GET /reservations - returns reservations based on user role (multi-tenant filtered)
router.get('/', auth_1.default, resolve_school_1.default, async (req, res) => {
    try {
        // Build where clause with multi-tenant filtering
        const where = await (0, multi_tenant_1.buildMultiTenantWhere)(req, 'reservation');
        const reservations = await prisma_1.default.reservation.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                class: {
                    include: {
                        school: {
                            select: {
                                id: true,
                                name: true,
                                location: true
                            }
                        }
                    }
                },
                payment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(reservations);
    }
    catch (err) {
        console.error('[GET /reservations] Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
// Admin-only: GET /reservations/all - list all reservations
// (mounted as same router; client should call /reservations/all)
router.get('/all', auth_1.default, (0, auth_1.requireRole)(['ADMIN']), async (_req, res) => {
    try {
        const all = await prisma_1.default.reservation.findMany({ include: { user: true, class: true } });
        res.json(all);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
