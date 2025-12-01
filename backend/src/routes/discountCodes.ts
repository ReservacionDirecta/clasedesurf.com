import express from 'express';
import prisma from '../prisma';
import { validateBody, validateParams } from '../middleware/validation';
import {
  createDiscountCodeSchema,
  updateDiscountCodeSchema,
  validateDiscountCodeSchema,
  discountCodeIdSchema
} from '../validations/discountCodes';
import requireAuth, { AuthRequest, requireRole } from '../middleware/auth';
import { buildMultiTenantWhere } from '../middleware/multi-tenant';

const router = express.Router();

// Helper function to get school for SCHOOL_ADMIN
async function getSchoolForUser(userId: number, role: string): Promise<{ id: number } | null> {
  if (role === 'SCHOOL_ADMIN') {
    const school = await prisma.school.findFirst({
      where: { ownerId: userId },
      select: { id: true }
    });
    return school;
  }
  return null;
}

// GET /discount-codes - List discount codes (filtered by role)
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Build where clause based on role
    const where: any = {};

    if (user.role === 'ADMIN') {
      // Admin can see all codes (global and school-specific)
      // No additional filter needed
    } else if (user.role === 'SCHOOL_ADMIN') {
      // School admin can only see codes for their school
      const school = await getSchoolForUser(Number(userId), user.role);
      if (school) {
        where.schoolId = school.id;
      } else {
        return res.status(403).json({ message: 'School not found' });
      }
    } else {
      // Other roles cannot access discount codes
      return res.status(403).json({ message: 'Forbidden' });
    }

    const codes = await prisma.discountCode.findMany({
      where,
      include: {
        school: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(codes);
  } catch (err: any) {
    console.error('Error fetching discount codes:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /discount-codes/:id - Get a specific discount code
router.get('/:id', requireAuth, validateParams(discountCodeIdSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const { id } = req.params as any;

    const code = await prisma.discountCode.findUnique({
      where: { id: Number(id) },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          }
        },
        payments: {
          select: {
            id: true,
            reservation: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!code) {
      return res.status(404).json({ message: 'Discount code not found' });
    }

    // Check permissions
    if (user.role === 'SCHOOL_ADMIN' && code.schoolId) {
      const school = await getSchoolForUser(Number(userId), user.role);
      if (!school || school.id !== code.schoolId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(code);
  } catch (err: any) {
    console.error('Error fetching discount code:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /discount-codes - Create a new discount code
router.post('/', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), validateBody(createDiscountCodeSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const { code, description, discountPercentage, validFrom, validTo, isActive, maxUses, schoolId } = req.body;

    // Validate that validTo is after validFrom
    const validFromDate = new Date(validFrom);
    const validToDate = new Date(validTo);
    if (validToDate <= validFromDate) {
      return res.status(400).json({ message: 'validTo must be after validFrom' });
    }

    // Validate discount percentage based on role
    if (user.role === 'SCHOOL_ADMIN' && discountPercentage > 50) {
      return res.status(400).json({ message: 'School admins can only create discounts up to 50%' });
    }
    if (discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ message: 'Discount percentage must be between 0 and 100' });
    }

    // Check if code already exists
    const existingCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCode) {
      return res.status(400).json({ message: 'Discount code already exists' });
    }

    // School admins can only create codes for their school
    let finalSchoolId = schoolId;
    if (user.role === 'SCHOOL_ADMIN') {
      const school = await getSchoolForUser(Number(userId), user.role);
      if (!school) {
        return res.status(403).json({ message: 'School not found' });
      }
      finalSchoolId = school.id;
    } else if (user.role === 'ADMIN' && !schoolId) {
      // Admin can create global codes (schoolId = null)
      finalSchoolId = null;
    }

    const discountCode = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        discountPercentage,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        isActive: isActive !== undefined ? isActive : true,
        maxUses: maxUses || null,
        usedCount: 0,
        schoolId: finalSchoolId
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    res.status(201).json(discountCode);
  } catch (err: any) {
    console.error('Error creating discount code:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Discount code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /discount-codes/:id - Update a discount code
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), validateParams(discountCodeIdSchema), validateBody(updateDiscountCodeSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const { id } = req.params as any;
    const existingCode = await prisma.discountCode.findUnique({
      where: { id: Number(id) }
    });

    if (!existingCode) {
      return res.status(404).json({ message: 'Discount code not found' });
    }

    // Check permissions
    if (user.role === 'SCHOOL_ADMIN') {
      const school = await getSchoolForUser(Number(userId), user.role);
      if (!school || existingCode.schoolId !== school.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    // Check if code is being changed and if new code already exists
    if (req.body.code && req.body.code.toUpperCase() !== existingCode.code) {
      const codeExists = await prisma.discountCode.findUnique({
        where: { code: req.body.code.toUpperCase() }
      });
      if (codeExists) {
        return res.status(400).json({ message: 'Discount code already exists' });
      }
    }

    // Validate dates if being updated
    if (req.body.validFrom !== undefined && req.body.validTo !== undefined) {
      const validFromDate = new Date(req.body.validFrom);
      const validToDate = new Date(req.body.validTo);
      if (validToDate <= validFromDate) {
        return res.status(400).json({ message: 'validTo must be after validFrom' });
      }
    } else if (req.body.validFrom !== undefined) {
      // If only validFrom is updated, check against existing validTo
      const validFromDate = new Date(req.body.validFrom);
      if (validFromDate >= existingCode.validTo) {
        return res.status(400).json({ message: 'validFrom must be before existing validTo' });
      }
    } else if (req.body.validTo !== undefined) {
      // If only validTo is updated, check against existing validFrom
      const validToDate = new Date(req.body.validTo);
      if (validToDate <= existingCode.validFrom) {
        return res.status(400).json({ message: 'validTo must be after existing validFrom' });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (req.body.code !== undefined) updateData.code = req.body.code.toUpperCase();
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.discountPercentage !== undefined) {
      const percentage = req.body.discountPercentage;

      // Validate percentage based on role
      if (user.role === 'SCHOOL_ADMIN' && percentage > 50) {
        return res.status(400).json({ message: 'School admins can only create discounts up to 50%' });
      }
      if (percentage < 0 || percentage > 100) {
        return res.status(400).json({ message: 'Discount percentage must be between 0 and 100' });
      }

      updateData.discountPercentage = percentage;
    }
    if (req.body.validFrom !== undefined) updateData.validFrom = new Date(req.body.validFrom);
    if (req.body.validTo !== undefined) updateData.validTo = new Date(req.body.validTo);
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    if (req.body.maxUses !== undefined) updateData.maxUses = req.body.maxUses;

    // Only admin can change schoolId
    if (req.body.schoolId !== undefined && user.role === 'ADMIN') {
      updateData.schoolId = req.body.schoolId;
    }

    const updatedCode = await prisma.discountCode.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        school: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    res.json(updatedCode);
  } catch (err: any) {
    console.error('Error updating discount code:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Discount code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /discount-codes/:id - Delete a discount code
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), validateParams(discountCodeIdSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const { id } = req.params as any;
    const existingCode = await prisma.discountCode.findUnique({
      where: { id: Number(id) }
    });

    if (!existingCode) {
      return res.status(404).json({ message: 'Discount code not found' });
    }

    // Check permissions
    if (user.role === 'SCHOOL_ADMIN') {
      const school = await getSchoolForUser(Number(userId), user.role);
      if (!school || existingCode.schoolId !== school.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    await prisma.discountCode.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Discount code deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting discount code:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /discount-codes/validate - Validate and calculate discount for a code
router.post('/validate', validateBody(validateDiscountCodeSchema), async (req, res) => {
  try {
    const { code, amount, classId } = req.body;

    // Find the discount code
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!discountCode) {
      return res.status(404).json({
        valid: false,
        message: 'Código de descuento no encontrado'
      });
    }

    // Check if code is active
    if (!discountCode.isActive) {
      return res.status(400).json({
        valid: false,
        message: 'Este código de descuento no está activo'
      });
    }

    // Check validity dates
    const now = new Date();
    if (now < discountCode.validFrom) {
      return res.status(400).json({
        valid: false,
        message: 'Este código de descuento aún no es válido'
      });
    }

    if (now > discountCode.validTo) {
      return res.status(400).json({
        valid: false,
        message: 'Este código de descuento ha expirado'
      });
    }

    // Check max uses
    if (discountCode.maxUses !== null && discountCode.usedCount >= discountCode.maxUses) {
      return res.status(400).json({
        valid: false,
        message: 'Este código de descuento ha alcanzado su límite de usos'
      });
    }

    // If classId is provided, check if code is school-specific and matches
    if (classId && discountCode.schoolId) {
      const classData = await prisma.class.findUnique({
        where: { id: Number(classId) },
        select: { schoolId: true }
      });

      if (!classData || classData.schoolId !== discountCode.schoolId) {
        return res.status(400).json({
          valid: false,
          message: 'Este código de descuento no es válido para esta clase'
        });
      }
    }

    // Calculate discount
    const discountAmount = (amount * discountCode.discountPercentage) / 100;
    const finalAmount = amount - discountAmount;

    res.json({
      valid: true,
      discountCode: {
        id: discountCode.id,
        code: discountCode.code,
        description: discountCode.description,
        discountPercentage: discountCode.discountPercentage,
      },
      discountCodeId: discountCode.id,
      originalAmount: amount,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
    });
  } catch (err: any) {
    console.error('Error validating discount code:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

