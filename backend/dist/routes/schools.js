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
const router = express_1.default.Router();
// GET /schools - list schools
router.get('/', async (req, res) => {
    try {
        const schools = await prisma_1.default.school.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(schools);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
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
// POST /schools - create (requires ADMIN or SCHOOL_ADMIN)
router.post('/', auth_1.default, (0, auth_1.requireRole)(['ADMIN', 'SCHOOL_ADMIN']), (0, validation_1.validateBody)(schools_1.createSchoolSchema), async (req, res) => {
    try {
        // TODO: role check (ADMIN or SCHOOL_ADMIN)
        const { name, location, description, phone, email } = req.body;
        const created = await prisma_1.default.school.create({ data: { name, location, description: description || null, phone: phone || null, email: email || null } });
        res.status(201).json(created);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// PUT /schools/:id - update (requires ADMIN or SCHOOL_ADMIN)
router.put('/:id', auth_1.default, (0, auth_1.requireRole)(['ADMIN', 'SCHOOL_ADMIN']), (0, validation_1.validateParams)(schools_1.schoolIdSchema), (0, validation_1.validateBody)(schools_1.updateSchoolSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma_1.default.school.update({ where: { id: Number(id) }, data });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
