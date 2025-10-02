import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  role?: string;
  schoolId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    req.userId = Number(payload.userId);
    req.role = payload.role;
    if (payload.schoolId) {
      req.schoolId = Number(payload.schoolId);
    }
    return next();
  } catch (err) {
    console.error('JWT error', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(roles: string[] = []) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role) return res.status(403).json({ message: 'Role missing' });
    if (!roles.includes(req.role)) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
}

export default requireAuth;
