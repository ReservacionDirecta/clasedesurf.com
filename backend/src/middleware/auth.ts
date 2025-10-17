import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  role?: string;
  schoolId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
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
    const payload = jwt.verify(token, jwtSecret) as any;
    req.userId = Number(payload.userId);
    req.role = payload.role;
    return next();
  } catch (err: any) {
    console.error('JWT error', err.name, err.message);
    
    // Handle different JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        expiredAt: err.expiredAt
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    } else {
      return res.status(401).json({ 
        message: 'Token verification failed',
        code: 'TOKEN_ERROR'
      });
    }
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
