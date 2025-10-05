import express from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validateBody } from '../middleware/validation';
import { registerSchema, loginSchema } from '../validations/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

function signAccessToken(user: any) {
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
  console.log('Signing token with JWT_SECRET:', jwtSecret.substring(0, 10) + '...');
  return jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: '15m' });
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

// helper to set refresh token cookie
function setRefreshCookie(res: express.Response, token: string, maxAgeSeconds = 60 * 60 * 24 * 30) {
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
router.post('/register', authLimiter, validateBody(registerSchema), async (req, res) => {
  try {
  // registration request
  // console.log('[auth] POST /register body ->', req.body);
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ 
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
    const refreshHash = await bcrypt.hash(rawRefresh, 10);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    await prisma.refreshToken.create({ data: { tokenHash: refreshHash, user: { connect: { id: user.id } }, expiresAt } });
    setRefreshCookie(res, rawRefresh);

    const { password: _p, ...safe } = user as any;
    res.status(201).json({ user: safe, token: accessToken });
  } catch (err) {
  console.error('[auth] POST /register error', (err as any)?.stack || err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', authLimiter, validateBody(loginSchema), async (req, res) => {
  try {
  // login request
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken(user);

    // create refresh token and store hashed
    const rawRefresh = generateRefreshToken();
    const refreshHash = await bcrypt.hash(rawRefresh, 10);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    await prisma.refreshToken.create({ data: { tokenHash: refreshHash, user: { connect: { id: user.id } }, expiresAt } });
    setRefreshCookie(res, rawRefresh);

    const { password: _p, ...safe } = user as any;
    res.json({ user: safe, token: accessToken });
  } catch (err) {
  console.error('[auth] POST /login error', (err as any)?.stack || err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /auth/refresh - exchange refresh cookie for new access token
router.post('/refresh', async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) return res.status(401).json({ message: 'No refresh token' });

    // find candidate refresh tokens for user(s) and verify
    const tokens = await prisma.refreshToken.findMany({ where: { expiresAt: { gt: new Date() } } });
    // naive search: compare hash -- in production scope to user
    let matched: any = null;
    for (const t of tokens) {
      const ok = await bcrypt.compare(raw, t.tokenHash);
      if (ok) {
        matched = t;
        break;
      }
    }
    if (!matched) return res.status(401).json({ message: 'Invalid refresh token' });

    const user = await prisma.user.findUnique({ where: { id: matched.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // issue new access token
    const accessToken = signAccessToken(user);
  // rotate refresh token: delete old, create new
  await prisma.refreshToken.delete({ where: { id: matched.id } });
  const newRaw = generateRefreshToken();
  const newHash = await bcrypt.hash(newRaw, 10);
  const expiresAt2 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await prisma.refreshToken.create({ data: { tokenHash: newHash, user: { connect: { id: user.id } }, expiresAt: expiresAt2 } });
  setRefreshCookie(res, newRaw);

    res.json({ token: accessToken });
  } catch (err) {
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
      const tokens = await prisma.refreshToken.findMany({ where: {} });
      for (const t of tokens) {
        const ok = await bcrypt.compare(raw, t.tokenHash);
        if (ok) {
          await prisma.refreshToken.delete({ where: { id: t.id } });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
