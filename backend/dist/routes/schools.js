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
const schools_1 = require("../validations/schools");
const resolve_school_1 = __importDefault(require("../middleware/resolve-school"));
const router = express_1.default.Router();
// GET /schools - list schools
router.get('/', async (req, res) => {
    try {
        const schools = await prisma_1.default.school.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                location: true,
                description: true,
                phone: true,
                email: true,
                website: true,
                instagram: true,
                facebook: true,
                whatsapp: true,
                address: true,
                logo: true,
                coverImage: true,
                foundedYear: true,
                rating: true,
                totalReviews: true,
                createdAt: true,
                updatedAt: true
                // Excluir reviews explícitamente para evitar errores si la migración falló
            }
        });
        res.json(schools);
    }
    catch (err) {
        console.error('[GET /schools] Error:', err);
        console.error('[GET /schools] Error message:', err?.message);
        console.error('[GET /schools] Error stack:', err?.stack);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err?.message : undefined
        });
    }
});
// GET /schools/my-school - get current user's school (MUST be before /:id route)
router.get('/my-school', auth_1.default, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await prisma_1.default.user.findUnique({ where: { id: Number(userId) } });
        if (!user || user.role !== 'SCHOOL_ADMIN') {
            return res.status(403).json({ message: 'Only school admins can access this endpoint' });
        }
        // Find school owned by this user
        const school = await prisma_1.default.school.findFirst({
            where: { ownerId: Number(userId) },
            include: {
                classes: {
                    orderBy: { date: 'asc' },
                    take: 10
                },
                instructors: {
                    where: { isActive: true },
                    include: {
                        user: {
                            select: { name: true, email: true, phone: true }
                        }
                    }
                }
                // Excluir reviews temporalmente para evitar errores si la migración falló
                // reviews: {
                //   orderBy: { createdAt: 'desc' },
                //   take: 10
                // }
            }
        });
        if (!school) {
            return res.status(404).json({ message: 'No school found for this user' });
        }
        res.json(school);
    }
    catch (err) {
        console.error('[GET /schools/my-school] Error:', err);
        console.error('[GET /schools/my-school] Error message:', err?.message);
        console.error('[GET /schools/my-school] Error stack:', err?.stack);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err?.message : undefined
        });
    }
});
// GET /schools/:id
router.get('/:id', (0, validation_1.validateParams)(schools_1.schoolIdSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const school = await prisma_1.default.school.findUnique({ where: { id: Number(id) } });
        if (!school)
            return res.status(404).json({ message: 'School not found' });
        res.json(school);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// GET /schools/:id/classes - get classes for a specific school
router.get('/:id/classes', (0, validation_1.validateParams)(schools_1.schoolIdSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const classes = await prisma_1.default.class.findMany({
            where: { schoolId: Number(id) },
            orderBy: { date: 'asc' }
        });
        res.json(classes);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// POST /schools - create (requires ADMIN or SCHOOL_ADMIN)
router.post('/', auth_1.default, (0, auth_1.requireRole)(['ADMIN', 'SCHOOL_ADMIN']), (0, validation_1.validateBody)(schools_1.createSchoolSchema), async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { name, location, description, phone, email, website, instagram, facebook, whatsapp, address } = req.body;
        // Check if user already has a school
        const existingSchool = await prisma_1.default.school.findFirst({
            where: { ownerId: Number(userId) }
        });
        if (existingSchool) {
            return res.status(400).json({ message: 'User already has a school' });
        }
        const created = await prisma_1.default.school.create({
            data: {
                name,
                location,
                description: description || null,
                phone: phone || null,
                email: email || null,
                website: website || null,
                instagram: instagram || null,
                facebook: facebook || null,
                whatsapp: whatsapp || null,
                address: address || null,
                ownerId: Number(userId)
            }
        });
        res.status(201).json(created);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// PUT /schools/:id - update (requires ADMIN or SCHOOL_ADMIN)
router.put('/:id', auth_1.default, (0, auth_1.requireRole)(['ADMIN', 'SCHOOL_ADMIN']), resolve_school_1.default, (0, validation_1.validateParams)(schools_1.schoolIdSchema), (0, validation_1.validateBody)(schools_1.updateSchoolSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (req.role === 'SCHOOL_ADMIN') {
            if (!req.schoolId)
                return res.status(404).json({ message: 'No school found for this user' });
            if (Number(id) !== req.schoolId) {
                return res.status(403).json({ message: 'You can only update your own school' });
            }
        }
        // Clean data: remove undefined values and handle null properly
        const cleanData = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                cleanData[key] = data[key];
            }
        });
        console.log('[PUT /schools/:id] Raw data received:', JSON.stringify(data, null, 2));
        console.log('[PUT /schools/:id] Cleaned data:', JSON.stringify(cleanData, null, 2));
        console.log('[PUT /schools/:id] foundedYear in cleanData:', cleanData.foundedYear, typeof cleanData.foundedYear);
        console.log('[PUT /schools/:id] School ID:', Number(id));
        // Log what we're about to send to Prisma
        console.log('[PUT /schools/:id] About to update with Prisma, cleanData keys:', Object.keys(cleanData));
        console.log('[PUT /schools/:id] cleanData.foundedYear before Prisma:', cleanData.foundedYear, typeof cleanData.foundedYear);
        const updated = await prisma_1.default.school.update({
            where: { id: Number(id) },
            data: cleanData
        });
        console.log('[PUT /schools/:id] School updated successfully');
        console.log('[PUT /schools/:id] Updated school data from Prisma:', JSON.stringify(updated, null, 2));
        console.log('[PUT /schools/:id] updated.foundedYear:', updated.foundedYear, typeof updated.foundedYear);
        // Verify the update by fetching the school again
        const verified = await prisma_1.default.school.findUnique({ where: { id: Number(id) } });
        console.log('[PUT /schools/:id] Verified school data from DB:', JSON.stringify(verified, null, 2));
        console.log('[PUT /schools/:id] verified.foundedYear:', verified?.foundedYear, typeof verified?.foundedYear);
        res.json(updated);
    }
    catch (err) {
        console.error('[PUT /schools/:id] Error updating school:', err);
        console.error('[PUT /schools/:id] Error details:', {
            message: err?.message,
            code: err?.code,
            meta: err?.meta,
            stack: err?.stack
        });
        const errorMessage = err?.message || 'Internal server error';
        res.status(500).json({
            message: 'Internal server error',
            error: errorMessage,
            code: err?.code,
            details: process.env.NODE_ENV === 'development' ? {
                stack: err?.stack,
                meta: err?.meta
            } : undefined
        });
    }
});
exports.default = router;
