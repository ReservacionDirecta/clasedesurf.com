"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const validation_1 = require("../middleware/validation");
const auth_1 = require("../validations/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
function signAccessToken(user) {
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    console.log('Signing token with JWT_SECRET:', jwtSecret.substring(0, 10) + '...');
    return jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: '15m' });
}
function generateRefreshToken() {
    return crypto_1.default.randomBytes(48).toString('hex');
}
// helper to set refresh token cookie
function setRefreshCookie(res, token, maxAgeSeconds = 60 * 60 * 24 * 30) {
    // httpOnly, secure in production, strict sameSite
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: isProduction,
        maxAge: maxAgeSeconds * 1000,
        sameSite: 'strict'
    });
}
// POST /auth/register
router.post('/register', rateLimiter_1.authLimiter, (0, validation_1.validateBody)(auth_1.registerSchema), async (req, res) => {
    try {
        // registration request
        // console.log('[auth] POST /register body ->', req.body);
        const { name, email, password } = req.body;
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ message: 'Email already in use' });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({ data: { name: name || '', email, password: hashed } });
        const accessToken = signAccessToken(user);
        // create refresh token stored hashed in DB
        const rawRefresh = generateRefreshToken();
        const refreshHash = await bcryptjs_1.default.hash(rawRefresh, 10);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
        await prisma_1.default.refreshToken.create({ data: { tokenHash: refreshHash, user: { connect: { id: user.id } }, expiresAt } });
        setRefreshCookie(res, rawRefresh);
        const { password: _p, ...safe } = user;
        res.status(201).json({ user: safe, token: accessToken });
    }
    catch (err) {
        console.error('[auth] POST /register error', err?.stack || err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// POST /auth/login
router.post('/login', rateLimiter_1.authLimiter, (0, validation_1.validateBody)(auth_1.loginSchema), async (req, res) => {
    try {
        // login request
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        const ok = await bcryptjs_1.default.compare(password, user.password || '');
        if (!ok)
            return res.status(401).json({ message: 'Invalid credentials' });
        const accessToken = signAccessToken(user);
        // create refresh token and store hashed
        const rawRefresh = generateRefreshToken();
        const refreshHash = await bcryptjs_1.default.hash(rawRefresh, 10);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
        await prisma_1.default.refreshToken.create({ data: { tokenHash: refreshHash, user: { connect: { id: user.id } }, expiresAt } });
        setRefreshCookie(res, rawRefresh);
        const { password: _p, ...safe } = user;
        res.json({ user: safe, token: accessToken });
    }
    catch (err) {
        console.error('[auth] POST /login error', err?.stack || err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// POST /auth/refresh - exchange refresh cookie for new access token
router.post('/refresh', async (req, res) => {
    try {
        const raw = req.cookies?.refreshToken;
        if (!raw)
            return res.status(401).json({ message: 'No refresh token' });
        // find candidate refresh tokens for user(s) and verify
        const tokens = await prisma_1.default.refreshToken.findMany({ where: { expiresAt: { gt: new Date() } } });
        // naive search: compare hash -- in production scope to user
        let matched = null;
        for (const t of tokens) {
            const ok = await bcryptjs_1.default.compare(raw, t.tokenHash);
            if (ok) {
                matched = t;
                break;
            }
        }
        if (!matched)
            return res.status(401).json({ message: 'Invalid refresh token' });
        const user = await prisma_1.default.user.findUnique({ where: { id: matched.userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // issue new access token
        const accessToken = signAccessToken(user);
        // rotate refresh token: delete old, create new
        await prisma_1.default.refreshToken.delete({ where: { id: matched.id } });
        const newRaw = generateRefreshToken();
        const newHash = await bcryptjs_1.default.hash(newRaw, 10);
        const expiresAt2 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await prisma_1.default.refreshToken.create({ data: { tokenHash: newHash, user: { connect: { id: user.id } }, expiresAt: expiresAt2 } });
        setRefreshCookie(res, newRaw);
        res.json({ token: accessToken });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// POST /auth/logout - revoke refresh token (cookie)
router.post('/logout', async (req, res) => {
    try {
        const raw = req.cookies?.refreshToken;
        if (raw) {
            // delete matching refresh token(s)
            const tokens = await prisma_1.default.refreshToken.findMany({ where: {} });
            for (const t of tokens) {
                const ok = await bcryptjs_1.default.compare(raw, t.tokenHash);
                if (ok) {
                    await prisma_1.default.refreshToken.delete({ where: { id: t.id } });
                }
            }
        }
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict'
        });
        res.json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
