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
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Missing or invalid Authorization header',
            code: 'NO_TOKEN'
        });
    }
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
        console.error('JWT error', err.name, err.message);
        // Handle different JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expired',
                code: 'TOKEN_EXPIRED',
                expiredAt: err.expiredAt
            });
        }
        else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
        else {
            return res.status(401).json({
                message: 'Token verification failed',
                code: 'TOKEN_ERROR'
            });
        }
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
