import express from 'express';
import prisma from '../prisma';
import { emailService } from '../services/email.service';
import requireAuth, { AuthRequest, requireRole, optionalAuth } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { validateBody, validateParams } from '../middleware/validation';
import { createReservationSchema, updateReservationSchema, reservationIdSchema } from '../validations/reservations';
import resolveSchool from '../middleware/resolve-school';
import { buildMultiTenantWhere } from '../middleware/multi-tenant';
import { normalizeClassImages, normalizeSchoolImages } from '../utils/image-utils';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import storage from '../storage/storage';

const router = express.Router();

// POST /reservations - create reservation (supports guest checkout with optionalAuth)
router.post('/', optionalAuth, validateBody(createReservationSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const {
      classId,
      sessionId,
      date,
      time,
      participants,
      products,
      discountAmount,
      specialRequest,
      discountCodeId
    } = req.body;
    let finalUserId = userId;
    let newToken = null;
    let isNewUser = false;
    let generatedPassword = null;

    // Handle Guest Checkout
    if (!finalUserId) {
      // Must have guest details in participants array or body
      const guestParticipant = Array.isArray(participants) && participants.length > 0 ? participants[0] : null;
      if (!guestParticipant || !guestParticipant.email || !guestParticipant.name) {
        return res.status(400).json({ message: 'Guest details required (name and email)' });
      }

      const guestEmail = guestParticipant.email.toLowerCase().trim();

      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email: guestEmail } });

      if (existingUser) {
        // Option 1: Strict - Force Login
        return res.status(409).json({
          message: 'Ya existe una cuenta con este email. Por favor inicia sesión para continuar.',
          code: 'ACCOUNT_EXISTS'
        });
        // Option 2: Link (Insecure without verification) - SKIPPED
      } else {
        // Create new user
        generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const newUser = await prisma.user.create({
          data: {
            name: guestParticipant.name,
            email: guestEmail,
            password: hashedPassword,
            role: 'STUDENT',
          }
        });

        finalUserId = newUser.id;
        isNewUser = true;

        // Generate Token for auto-login
        const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
        newToken = jwt.sign(
          { userId: newUser.id, role: newUser.role },
          jwtSecret,
          { expiresIn: '7d' }
        );
      }
    }

    let requestedCount: number;
    if (Array.isArray(participants)) {
      requestedCount = participants.length;
    } else if (typeof participants === 'number') {
      requestedCount = participants;
    } else {
      requestedCount = 1;
    }

    const result = await prisma.$transaction(async (tx) => {
      let session;
      const classIdNum = Number(classId);

      // Determine if sessionId is numeric or virtual
      const isNumericSessionId = sessionId && !isNaN(Number(sessionId)) && !String(sessionId).startsWith('v_');
      const numericSessionId = isNumericSessionId ? Number(sessionId) : null;

      // 1. Fetch class product details
      const cls = await tx.class.findUnique({
        where: { id: classIdNum },
        include: {
          sessions: numericSessionId ? { where: { id: numericSessionId } } : undefined,
          school: true
        }
      });
      if (!cls) throw new Error('Class not found');

      // 2. Determine session data (explicit session or fallback to product)
      if (numericSessionId) {
        session = (cls as any).sessions?.[0];
        if (!session) throw new Error('Session not found');
      } else if (date && time) {
        // Fallback or search for session by date/time
        session = await tx.classSession.findFirst({
          where: { classId: classIdNum, date: new Date(date), time: String(time) }
        });
      }

      const capacity = session?.capacity ?? cls.defaultCapacity;
      const unitPrice = session?.price ?? cls.defaultPrice;
      const reservationDate = session?.date ?? (date ? new Date(date) : null);
      const reservationTime = session?.time ?? time;

      if (!reservationDate || !reservationTime) {
        throw new Error('No date or time specified for reservation');
      }

      // 3. Check for availability
      const count = await tx.reservation.count({
        where: {
          classId: classIdNum,
          status: { not: 'CANCELED' },
          date: reservationDate,
          time: reservationTime
        }
      });

      if (count + requestedCount > capacity) {
        return { ok: false, reason: 'Not enough spots available' };
      }

      // 3.5 Process Products (Calculate total and check validity)
      let productsTotal = 0;
      const productPurchasesData: any[] = [];
      const productUpdates: any[] = [];

      if (Array.isArray(products) && products.length > 0) {
        for (const item of products) {
          const product = await tx.product.findUnique({ where: { id: Number(item.id) } });
          const quantity = Number(item.quantity) || 1;

          if (!product) continue;
          if (!product.isActive) throw new Error(`Product ${product.name} is not available`);
          if (product.stock < quantity) throw new Error(`Not enough stock for ${product.name}`);

          productsTotal += product.price * quantity;
          productPurchasesData.push({
            productId: product.id,
            quantity: quantity,
            unitPrice: product.price,
            totalPrice: product.price * quantity
          });

          // Prepare stock update
          productUpdates.push(
            tx.product.update({
              where: { id: product.id },
              data: { stock: { decrement: quantity } }
            })
          );
        }
      }

      // 4. Calculate amount
      const classSubtotal = unitPrice * requestedCount;
      const originalAmount = classSubtotal + productsTotal;
      const finalDiscountAmount = discountAmount ? Number(discountAmount) : 0;
      // Ensure discount doesn't exceed class subtotal (usually products aren't discounted by class coupons)
      // But preserving existing logic structure:
      const finalAmount = Math.max(0, originalAmount - finalDiscountAmount);

      // 5. Create reservation
      const reservation = await tx.reservation.create({
        data: {
          user: { connect: { id: Number(finalUserId) } },
          class: { connect: { id: classIdNum } },
          specialRequest: specialRequest || null,
          participants: participants || null,
          status: 'PENDING',
          date: reservationDate,
          time: reservationTime,
          productPurchases: productPurchasesData.length > 0 ? {
            create: productPurchasesData
          } : undefined
        }
      });

      // 5.5 Execute stock updates
      await Promise.all(productUpdates);

      // 6. Create payment
      await tx.payment.create({
        data: {
          reservation: { connect: { id: reservation.id } },
          amount: finalAmount,
          originalAmount,
          status: 'UNPAID',
          discountCode: discountCodeId ? { connect: { id: Number(discountCodeId) } } : undefined,
          discountAmount: finalDiscountAmount > 0 ? finalDiscountAmount : undefined
        }
      });

      // 7. Return full details
      const fullReservation = await tx.reservation.findUnique({
        where: { id: reservation.id },
        include: {
          user: true,
          class: { include: { school: true } },
          payment: { include: { discountCode: true } },
          productPurchases: { include: { product: true } }
        }
      });

      return { ok: true, reservation: fullReservation };
    });

    if (!result.ok) return res.status(400).json({ message: result.reason });

    // Persist user profile data for future reservations
    try {
      const first = Array.isArray(participants) && participants.length > 0 ? participants[0] : null;
      if (first && finalUserId) {
        const profileData: any = {
          height: first.height ?? null,
          weight: first.weight ?? null,
          canSwim: first.canSwim ?? false,
          swimmingLevel: first.swimmingLevel ?? 'BEGINNER',
          injuries: first.injuries ?? ''
        };
        await storage.appendStorage(`profiles/${finalUserId}.json`, profileData);
      }
    } catch (e) {
      console.error('Error persisting profile data:', e);
    }

    // Email notification
    const r = result.reservation as any;
    if (r) {
      try {
        await emailService.sendReservationConfirmed(
          r.user.email,
          r.user.name,
          r.class.title,
          new Date(r.date).toLocaleDateString(),
          r.time,
          r.class.instructor || 'Instructor',
          r.class.school.name,
          r.class.school.location,
          r.class.duration,
          r.payment.amount
        );

        // Send Welcome Email if new user
        if (isNewUser && generatedPassword) {
          await emailService.sendWelcomeEmail(
            r.user.email,
            r.user.name,
            r.class.school?.name || 'Clase de Surf',
            generatedPassword
          );
          console.log(`Created guest user ${r.user.email} with password: ${generatedPassword}`);
        }

      } catch (e) {
        console.error('Email error:', e);
      }
    }

    res.status(201).json({
      ...result.reservation,
      token: newToken,     // Return token for auto-login
      isNewUser: isNewUser,
      generatedPassword: generatedPassword // Optional: Return to show in UI one-time
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

// GET /reservations
router.get('/', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  try {
    const where = await buildMultiTenantWhere(req, 'reservation');
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        class: { include: { school: { select: { id: true, name: true, location: true, logo: true, coverImage: true } } } },
        payment: { include: { discountCode: true } },
        productPurchases: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const normalizedReservations = reservations.map(res => {
      if (res.class?.school) {
        res.class.school = normalizeSchoolImages(res.class.school);
      }
      if (res.class) {
        res.class = normalizeClassImages(res.class);
      }
      return res;
    });

    res.json(normalizedReservations);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/all', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const all = await prisma.reservation.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        class: { include: { school: { select: { id: true, name: true, location: true } } } },
        payment: { include: { discountCode: true } },
        productPurchases: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', requireAuth, validateParams(reservationIdSchema), async (req: AuthRequest, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        class: { include: { school: true } },
        payment: { include: { discountCode: true } },
        productPurchases: { include: { product: true } }
      }
    });

    if (!reservation) return res.status(404).json({ message: 'Not found' });

    if (req.role !== 'ADMIN' && req.role !== 'SCHOOL_ADMIN' && reservation.userId !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Normalize images
    if (reservation.class) {
      reservation.class = normalizeClassImages(reservation.class);
      if (reservation.class.school) {
        reservation.class.school = normalizeSchoolImages(reservation.class.school);
      }
    }

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /reservations/:id
router.put('/:id', requireAuth, resolveSchool, validateParams(reservationIdSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as any;
    const { status, ...rest } = req.body;

    const existing = await prisma.reservation.findUnique({
      where: { id: Number(id) },
      include: { class: true }
    });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    // Permission check
    const isOwner = existing.userId === req.userId;
    const isAdmin = req.role === 'ADMIN';
    const isSchoolAdmin = req.role === 'SCHOOL_ADMIN';

    if (isSchoolAdmin && existing.class.schoolId !== req.schoolId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!isAdmin && !isSchoolAdmin && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Students can only cancel certain reservations
    if (!isAdmin && !isSchoolAdmin && isOwner) {
      // Only allow setting status to CANCELED
      if (status && status !== 'CANCELED') {
        return res.status(403).json({ message: 'Students can only cancel reservations' });
      }
      // Don't allow changing other fields
      if (Object.keys(rest).length > 0) {
        return res.status(403).json({ message: 'Students can only update status' });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.update({
        where: { id: Number(id) },
        data: { status: status ? status.toUpperCase() : undefined, ...rest },
        include: {
          user: true,
          class: { include: { school: true } },
          productPurchases: true
        }
      });

      // If status changed to CANCELED, restore stock
      if (status && status.toUpperCase() === 'CANCELED' && existing.status !== 'CANCELED') {
        for (const pp of (reservation as any).productPurchases || []) {
          await tx.product.update({
            where: { id: pp.productId },
            data: { stock: { increment: pp.quantity } }
          });
        }
      }

      return reservation;
    });

    if (updated.status === 'CANCELED') {
      try {
        await emailService.sendReservationCancelled(
          updated.user.email,
          updated.user.name,
          updated.class.title,
          new Date(updated.date || new Date()).toLocaleDateString(),
          updated.time || '',
          updated.class.school.name,
          updated.class.school.location
        );
      } catch (e) {
        console.error('Email error:', e);
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { reservationId: id } }),
      prisma.productPurchase.deleteMany({ where: { reservationId: id } }),
      prisma.reservation.delete({ where: { id } })
    ]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(`[DELETE /reservations/:id] Error: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
