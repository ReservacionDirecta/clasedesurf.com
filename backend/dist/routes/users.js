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
const users_1 = require("../validations/users");
const router = express_1.default.Router();
// GET /users/profile - get current user's profile
// NOTE: Authentication is not implemented in this minimal scaffold.
router.get('/profile', auth_1.default, async (req, res) => {
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: Number(userId) } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const { password, ...safe } = user;
        res.json(safe);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// PUT /users/profile - update profile
router.put('/profile', auth_1.default, (0, validation_1.validateBody)(users_1.updateProfileSchema), async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        // The data is already validated and transformed by the middleware
        const data = req.body;
        // Log profilePhoto status for debugging
        if (data.profilePhoto) {
            console.log('[PUT /users/profile] Updating profilePhoto, length:', data.profilePhoto.length, 'starts with:', data.profilePhoto.substring(0, 50));
        }
        else {
            console.log('[PUT /users/profile] No profilePhoto in update data');
        }
        // Ensure profilePhoto is properly handled (null if empty string)
        if (data.profilePhoto === '') {
            data.profilePhoto = null;
        }
        console.log('[PUT /users/profile] Data to update:', {
            ...data,
            profilePhoto: data.profilePhoto ? `[base64, ${data.profilePhoto.length} chars]` : null
        });
        const updated = await prisma_1.default.user.update({ where: { id: Number(userId) }, data });
        const { password, ...safe } = updated;
        // Log what was saved
        console.log('[PUT /users/profile] Profile updated successfully, profilePhoto saved:', !!safe.profilePhoto, safe.profilePhoto ? `(${safe.profilePhoto.length} chars)` : '(null)');
        res.json(safe);
    }
    catch (err) {
        console.error('[PUT /users/profile] Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// GET /users - list all users (admin)
router.get('/', auth_1.default, (0, auth_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        // TODO: check for ADMIN role
        const users = await prisma_1.default.user.findMany({ orderBy: { createdAt: 'desc' } });
        const safe = users.map((u) => {
            const { password, ...s } = u;
            return s;
        });
        res.json(safe);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// GET /users/:id - get any user's profile (admin or owner)
router.get('/:id', auth_1.default, (0, auth_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const { password, ...safe } = user;
        res.json(safe);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
