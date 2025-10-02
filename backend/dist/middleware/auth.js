"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer '))
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    const token = auth.split(' ')[1];
    try {
        const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
        console.log('Using JWT_SECRET:', jwtSecret.substring(0, 10) + '...');
        const payload = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.userId = Number(payload.userId);
        req.role = payload.role;
        return next();
    }
    catch (err) {
        console.error('JWT error', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
}
function requireRole(roles = []) {
    return (req, res, next) => {
        if (!req.role)
            return res.status(403).json({ message: 'Role missing' });
        if (!roles.includes(req.role))
            return res.status(403).json({ message: 'Forbidden' });
        return next();
    };
}
exports.default = requireAuth;
