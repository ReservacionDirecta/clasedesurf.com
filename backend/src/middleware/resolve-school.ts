import { NextFunction, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from './auth';

/**
 * Resolve and attach schoolId for SCHOOL_ADMIN and INSTRUCTOR users.
 * - If role is SCHOOL_ADMIN, find the school owned by the user and set req.schoolId.
 * - If role is INSTRUCTOR, find the instructor profile and set req.schoolId from there.
 * - If no school found, respond 404.
 * - For other roles, do nothing.
 */
export const resolveSchool = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // SCHOOL_ADMIN: find school by ownerId
    if (req.role === 'SCHOOL_ADMIN') {
      if (!req.userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const school = await prisma.school.findFirst({ where: { ownerId: Number(req.userId) } });
      if (!school) {
        // Don't fail for SCHOOL_ADMIN if they don't have a school - let the route handle it
        // Some routes may allow SCHOOL_ADMIN without a school
        (req as any).schoolId = undefined;
        return next();
      }

      (req as any).schoolId = school.id;
      return next();
    }

    // INSTRUCTOR: find school through instructor profile
    if (req.role === 'INSTRUCTOR') {
      if (!req.userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const instructor = await prisma.instructor.findUnique({ 
        where: { userId: Number(req.userId) },
        select: { schoolId: true }
      });
      
      if (!instructor) {
        res.status(404).json({ message: 'No instructor profile found for this user' });
        return;
      }

      req.schoolId = instructor.schoolId;
      return next();
    }

    // Other roles: continue without schoolId
    return next();
  } catch (err) {
    console.error('resolveSchool error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default resolveSchool;
