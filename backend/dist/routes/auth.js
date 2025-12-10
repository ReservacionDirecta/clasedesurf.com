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
const email_service_1 = require("../services/email.service");
const router = express_1.default.Router();
function signAccessToken(user) {
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    console.log('Signing token with JWT_SECRET:', jwtSecret.substring(0, 10) + '...');
    // Use longer expiration for development, shorter for production
    const expiresIn = '24h';
    return jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn });
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
        const { name, email, password, role } = req.body;
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ message: 'Email already in use' });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name: name || '',
                email,
                password: hashed,
                role: role || 'STUDENT' // Default to STUDENT if no role provided
            }
        });
        const accessToken = signAccessToken(user);
        // create refresh token stored hashed in DB
        const rawRefresh = generateRefreshToken();
        const refreshHash = await bcryptjs_1.default.hash(rawRefresh, 10);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
        await prisma_1.default.refreshToken.create({ data: { tokenHash: refreshHash, user: { connect: { id: user.id } }, expiresAt } });
        setRefreshCookie(res, rawRefresh);
        // Enviar email de bienvenida
        email_service_1.EmailService.sendWelcomeEmail(user.email, user.name || 'Usuario').catch(err => {
            console.error('Error sending welcome email:', err);
            // No bloqueamos el registro si falla el email
        });
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
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: {
                instructor: {
                    include: {
                        school: true
                    }
                }
            }
        });
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
// POST /auth/google - Authenticate or register with Google
router.post('/google', rateLimiter_1.authLimiter, async (req, res) => {
    try {
        const { googleId, email, name, image, role } = req.body;
        if (!googleId || !email) {
            return res.status(400).json({ message: 'Google ID and email are required' });
        }
        // Buscar usuario existente por email o googleId
        let user = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { email },
                    // En el futuro, cuando agreguemos googleId al schema:
                    // { googleId }
                ]
            }
        });
        if (user) {
            // Usuario existe, actualizar información si es necesario
            // y generar token
            const accessToken = signAccessToken(user);
            const refreshToken = generateRefreshToken();
            // Guardar refresh token
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            await prisma_1.default.refreshToken.create({
                data: {
                    tokenHash: refreshToken,
                    userId: user.id,
                    expiresAt
                }
            });
            setRefreshCookie(res, refreshToken);
            return res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token: accessToken
            });
        }
        else {
            // Usuario no existe, crear nuevo usuario
            // Generar password aleatorio (no se usará, pero es requerido por el schema)
            const randomPassword = crypto_1.default.randomBytes(32).toString('hex');
            const hashed = await bcryptjs_1.default.hash(randomPassword, 10);
            // Validar rol
            const validRoles = ['STUDENT', 'INSTRUCTOR', 'SCHOOL_ADMIN', 'ADMIN'];
            const userRole = (role && validRoles.includes(role)) ? role : 'STUDENT';
            user = await prisma_1.default.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    password: hashed, // Password no se usará para login con Google
                    role: userRole
                }
            });
            // Crear perfil de estudiante solo si el rol es STUDENT
            if (userRole === 'STUDENT') {
                await prisma_1.default.student.create({
                    data: {
                        userId: user.id,
                        level: 'BEGINNER'
                    }
                });
            }
            const accessToken = signAccessToken(user);
            const refreshToken = generateRefreshToken();
            // Guardar refresh token
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            await prisma_1.default.refreshToken.create({
                data: {
                    tokenHash: refreshToken,
                    userId: user.id,
                    expiresAt
                }
            });
            setRefreshCookie(res, refreshToken);
            // Enviar email de bienvenida para nuevos usuarios
            email_service_1.EmailService.sendWelcomeEmail(user.email, user.name || 'Usuario').catch(err => {
                console.error('Error sending welcome email:', err);
            });
            return res.status(201).json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token: accessToken
            });
        }
    }
    catch (err) {
        console.error('[auth] POST /google error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ message: errorMessage });
    }
});
// POST /auth/register-school
router.post('/register-school', rateLimiter_1.authLimiter, async (req, res) => {
    try {
        const { schoolName, adminName, email, password, phone, location } = req.body;
        if (!schoolName || !adminName || !email || !password || !location) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ message: 'El email ya está en uso' });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        // Transaction to ensure both user and school are created
        const result = await prisma_1.default.$transaction(async (prisma) => {
            // 1. Create User
            const user = await prisma.user.create({
                data: {
                    name: adminName,
                    email,
                    password: hashed,
                    role: 'SCHOOL_ADMIN',
                    phone
                }
            });
            // 2. Create School
            const school = await prisma.school.create({
                data: {
                    name: schoolName,
                    location,
                    ownerId: user.id,
                    status: 'PENDING', // Explicitly set pending
                    phone
                }
            });
            return { user, school };
        });
        const accessToken = signAccessToken(result.user);
        const rawRefresh = generateRefreshToken();
        const refreshHash = await bcryptjs_1.default.hash(rawRefresh, 10);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await prisma_1.default.refreshToken.create({
            data: {
                tokenHash: refreshHash,
                user: { connect: { id: result.user.id } },
                expiresAt
            }
        });
        setRefreshCookie(res, rawRefresh);
        // Enviar email de bienvenida
        email_service_1.EmailService.sendWelcomeEmail(result.user.email, result.user.name || 'Usuario').catch(err => {
            console.error('Error sending welcome email:', err);
        });
        const { password: _p, ...safeUser } = result.user;
        res.status(201).json({
            user: safeUser,
            school: result.school,
            token: accessToken,
            message: 'Solicitud de registro enviada exitosamente'
        });
    }
    catch (err) {
        console.error('[auth] POST /register-school error', err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
exports.default = router;
