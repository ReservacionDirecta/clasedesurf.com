import { Response, NextFunction } from 'express';
import prisma from '../prisma';
import { AuthRequest } from './auth';

/**
 * Middleware to enforce multi-tenant access control
 * Ensures users can only access resources within their school context
 */

/**
 * Enforce school-level access control
 * - ADMIN: Can access all schools
 * - SCHOOL_ADMIN: Can only access their own school
 * - INSTRUCTOR: Can only access their school
 * - STUDENT: Can access any school (for browsing classes)
 */
export const enforceSchoolAccess = (resourceType: 'school' | 'class' | 'instructor' | 'student') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, userId } = req;
      
      // ADMIN can access everything
      if (role === 'ADMIN') {
        return next();
      }

      // Get resource ID from params or body
      const resourceId = req.params.id || req.body.schoolId || req.body.id;
      
      if (!resourceId) {
        // If no specific resource, will be filtered in the route handler
        return next();
      }

      // SCHOOL_ADMIN: Verify resource belongs to their school
      if (role === 'SCHOOL_ADMIN') {
        const school = await prisma.school.findFirst({ 
          where: { ownerId: Number(userId) } 
        });
        
        if (!school) {
          res.status(404).json({ message: 'No school found for this user' });
          return;
        }

        // Check if resource belongs to their school
        let belongsToSchool = false;
        
        switch (resourceType) {
          case 'school':
            belongsToSchool = Number(resourceId) === school.id;
            break;
          case 'class':
            const classItem = await prisma.class.findUnique({ 
              where: { id: Number(resourceId) } 
            });
            belongsToSchool = classItem?.schoolId === school.id;
            break;
          case 'instructor':
            const instructor = await prisma.instructor.findUnique({ 
              where: { id: Number(resourceId) } 
            });
            belongsToSchool = instructor?.schoolId === school.id;
            break;
          case 'student':
            const student = await prisma.student.findUnique({ 
              where: { id: Number(resourceId) } 
            });
            belongsToSchool = student?.schoolId === school.id;
            break;
        }

        if (!belongsToSchool) {
          res.status(403).json({ 
            message: 'Access denied: Resource does not belong to your school' 
          });
          return;
        }

        req.schoolId = school.id;
        return next();
      }

      // INSTRUCTOR: Verify resource belongs to their school
      if (role === 'INSTRUCTOR') {
        const instructor = await prisma.instructor.findUnique({ 
          where: { userId: Number(userId) },
          select: { schoolId: true, id: true }
        });
        
        if (!instructor) {
          res.status(404).json({ message: 'No instructor profile found' });
          return;
        }

        // Check if resource belongs to their school
        let belongsToSchool = false;
        
        switch (resourceType) {
          case 'school':
            belongsToSchool = Number(resourceId) === instructor.schoolId;
            break;
          case 'class':
            const classItem = await prisma.class.findUnique({ 
              where: { id: Number(resourceId) } 
            });
            belongsToSchool = classItem?.schoolId === instructor.schoolId;
            break;
          case 'instructor':
            // Instructors can only access their own profile
            belongsToSchool = Number(resourceId) === instructor.id;
            break;
          case 'student':
            // Instructors can access students in their classes
            const student = await prisma.student.findUnique({ 
              where: { id: Number(resourceId) },
              include: {
                user: {
                  include: {
                    reservations: {
                      include: {
                        class: true
                      }
                    }
                  }
                }
              }
            });
            
            // Check if student has reservations in instructor's classes
            const hasReservationInInstructorClass = student?.user.reservations.some(
              r => r.class.schoolId === instructor.schoolId
            );
            
            belongsToSchool = hasReservationInInstructorClass || false;
            break;
        }

        if (!belongsToSchool) {
          res.status(403).json({ 
            message: 'Access denied: Resource does not belong to your school' 
          });
          return;
        }

        req.schoolId = instructor.schoolId;
        return next();
      }

      // STUDENT: Can browse all schools and classes
      return next();
      
    } catch (err) {
      console.error('enforceSchoolAccess error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

/**
 * Enforce instructor-level access control
 * Ensures instructors can only access their own classes and related data
 */
export const enforceInstructorAccess = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { role, userId } = req;
    
    // ADMIN and SCHOOL_ADMIN can access all instructors' data
    if (role === 'ADMIN' || role === 'SCHOOL_ADMIN') {
      return next();
    }

    // INSTRUCTOR: Can only access their own data
    if (role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({ 
        where: { userId: Number(userId) },
        select: { id: true, schoolId: true }
      });
      
      if (!instructor) {
        res.status(404).json({ message: 'No instructor profile found' });
        return;
      }

      // Attach instructor info to request
      req.schoolId = instructor.schoolId;
      (req as any).instructorId = instructor.id;
      
      return next();
    }

    // Other roles cannot access instructor-specific data
    res.status(403).json({ message: 'Access denied: Instructor access required' });
    
  } catch (err) {
    console.error('enforceInstructorAccess error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Enforce student-level access control
 * Ensures students can only access their own data
 */
export const enforceStudentAccess = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { role, userId } = req;
    
    // ADMIN and SCHOOL_ADMIN can access all students' data
    if (role === 'ADMIN' || role === 'SCHOOL_ADMIN') {
      return next();
    }

    // INSTRUCTOR: Can access students in their classes
    if (role === 'INSTRUCTOR') {
      return next(); // Will be filtered in route handler
    }

    // STUDENT: Can only access their own data
    if (role === 'STUDENT') {
      const resourceUserId = req.params.userId || req.body.userId;
      
      if (resourceUserId && Number(resourceUserId) !== Number(userId)) {
        res.status(403).json({ 
          message: 'Access denied: You can only access your own data' 
        });
        return;
      }
      
      return next();
    }

    res.status(403).json({ message: 'Access denied' });
    
  } catch (err) {
    console.error('enforceStudentAccess error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Build where clause for multi-tenant queries
 * Returns appropriate filters based on user role and context
 */
export const buildMultiTenantWhere = async (
  req: AuthRequest,
  resourceType: 'class' | 'instructor' | 'student' | 'reservation' | 'payment'
): Promise<any> => {
  const { role, userId, schoolId } = req;
  const where: any = {};

  // ADMIN: No filters
  if (role === 'ADMIN') {
    return where;
  }

  // SCHOOL_ADMIN: Filter by school
  if (role === 'SCHOOL_ADMIN') {
    if (!schoolId) {
      throw new Error('School ID not found for SCHOOL_ADMIN');
    }

    switch (resourceType) {
      case 'class':
      case 'instructor':
      case 'student':
        where.schoolId = schoolId;
        break;
      case 'reservation':
        where.class = { schoolId };
        break;
      case 'payment':
        where.reservation = { class: { schoolId } };
        break;
    }

    return where;
  }

  // INSTRUCTOR: Filter by school and instructor
  if (role === 'INSTRUCTOR') {
    const instructor = await prisma.instructor.findUnique({ 
      where: { userId: Number(userId) },
      select: { id: true, schoolId: true }
    });

    if (!instructor) {
      throw new Error('Instructor profile not found');
    }

    switch (resourceType) {
      case 'class':
        // TODO: Filter by instructorId when schema is updated
        where.schoolId = instructor.schoolId;
        break;
      case 'instructor':
        where.id = instructor.id;
        break;
      case 'student':
        // Students who have reservations in instructor's classes
        where.user = {
          reservations: {
            some: {
              class: { schoolId: instructor.schoolId }
            }
          }
        };
        break;
      case 'reservation':
        where.class = { schoolId: instructor.schoolId };
        break;
      case 'payment':
        where.reservation = { 
          class: { schoolId: instructor.schoolId } 
        };
        break;
    }

    return where;
  }

  // STUDENT: Filter by user
  if (role === 'STUDENT') {
    switch (resourceType) {
      case 'class':
        // Students can see all classes
        break;
      case 'reservation':
        where.userId = userId;
        break;
      case 'payment':
        where.reservation = { userId };
        break;
      default:
        // Students cannot access instructors or other students directly
        throw new Error('Access denied');
    }

    return where;
  }

  return where;
};

export default {
  enforceSchoolAccess,
  enforceInstructorAccess,
  enforceStudentAccess,
  buildMultiTenantWhere
};
