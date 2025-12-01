"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = __importStar(require("../middleware/auth"));
const validation_1 = require("../middleware/validation");
const payments_1 = require("../validations/payments");
const resolve_school_1 = __importDefault(require("../middleware/resolve-school"));
const PaymentService_1 = require("../services/payments/PaymentService");
const router = express_1.default.Router();
// POST /payments - create a payment record (requires auth)
router.post('/', auth_1.default, (0, validation_1.validateBody)(payments_1.createPaymentSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { reservationId, amount, paymentMethod, transactionId, voucherImage, voucherNotes, status, discountCodeId, discountAmount, originalAmount } = req.body;
        console.log('[POST /payments] Request body:', {
            reservationId,
            amount,
            paymentMethod,
            status,
            hasVoucherImage: !!voucherImage,
            voucherImageLength: voucherImage ? voucherImage.length : 0,
            hasVoucherNotes: !!voucherNotes
        });
        // Verify the reservation exists and belongs to user (or user is admin)
        const reservation = await prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: { user: true, class: true }
        });
        if (!reservation)
            return res.status(404).json({ message: 'Reservation not found' });
        // Check if user owns the reservation or is admin
        const user = await prisma_1.default.user.findUnique({ where: { id: Number(userId) } });
        if (!user)
            return res.status(401).json({ message: 'User not found' });
        if (reservation.userId !== Number(userId) && user.role !== 'ADMIN' && user.role !== 'SCHOOL_ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        // Check if payment already exists for this reservation
        const existingPayment = await prisma_1.default.payment.findUnique({ where: { reservationId } });
        if (existingPayment) {
            return res.status(400).json({ message: 'Payment already exists for this reservation' });
        }
        // Determine payment status - if cash, keep as PENDING, otherwise PENDING until verified
        // Ensure status is a valid PaymentStatus enum value
        const paymentStatus = (status && ['UNPAID', 'PENDING', 'PAID', 'REFUNDED'].includes(status))
            ? status
            : 'PENDING';
        // Truncate voucherImage if it's too long (PostgreSQL TEXT has a limit)
        // Base64 images can be very large, so we'll limit to 1MB of base64 data
        const MAX_VOUCHER_SIZE = 1000000; // 1MB in characters
        const truncatedVoucherImage = voucherImage && voucherImage.length > MAX_VOUCHER_SIZE
            ? voucherImage.substring(0, MAX_VOUCHER_SIZE)
            : voucherImage;
        console.log('[POST /payments] Creating payment with status:', paymentStatus);
        // Si hay un código de descuento, validar
        let discountCode = null;
        if (discountCodeId) {
            discountCode = await prisma_1.default.discountCode.findUnique({
                where: { id: Number(discountCodeId) }
            });
            if (!discountCode) {
                return res.status(400).json({ message: 'Código de descuento no encontrado' });
            }
            // Verificar que el código aún sea válido
            const now = new Date();
            if (!discountCode.isActive ||
                now < discountCode.validFrom ||
                now > discountCode.validTo ||
                (discountCode.maxUses !== null && discountCode.usedCount >= discountCode.maxUses)) {
                return res.status(400).json({ message: 'El código de descuento ya no es válido' });
            }
        }
        const payment = await prisma_1.default.$transaction(async (tx) => {
            // Crear el pago
            const paymentData = {
                reservation: { connect: { id: reservationId } },
                amount: originalAmount ? originalAmount - (discountAmount || 0) : amount,
                status: paymentStatus,
                paymentMethod: paymentMethod || 'manual',
                transactionId: transactionId || undefined,
                voucherImage: truncatedVoucherImage || undefined,
                voucherNotes: voucherNotes || undefined,
                paidAt: paymentStatus === 'PAID' ? new Date() : undefined,
            };
            // Solo agregar campos de descuento si existen
            if (discountCodeId) {
                paymentData.discountCodeId = Number(discountCodeId);
            }
            if (discountAmount) {
                paymentData.discountAmount = discountAmount;
            }
            if (originalAmount) {
                paymentData.originalAmount = originalAmount;
            }
            const newPayment = await tx.payment.create({
                data: paymentData,
                include: {
                    reservation: {
                        include: {
                            user: true,
                            class: true
                        }
                    }
                }
            });
            // Si hay código de descuento, incrementar el contador de usos
            if (discountCodeId && discountCode) {
                await tx.discountCode.update({
                    where: { id: Number(discountCodeId) },
                    data: {
                        usedCount: {
                            increment: 1
                        }
                    }
                });
            }
            return newPayment;
        });
        // Update reservation status only if payment is PAID
        if (paymentStatus === 'PAID') {
            await prisma_1.default.reservation.update({
                where: { id: reservationId },
                data: { status: 'PAID' }
            });
        }
        // Si el método de pago requiere un intent online, crearlo
        const paymentMethodEnum = paymentMethod;
        const requiresOnlineIntent = ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'MERCADOPAGO'].includes(paymentMethodEnum);
        if (requiresOnlineIntent) {
            try {
                // Intentar crear payment intent con el proveedor apropiado
                const provider = req.body.provider;
                const intent = await PaymentService_1.PaymentService.createPaymentIntent({
                    amount: payment.amount,
                    currency: 'PEN',
                    reservationId: payment.reservationId,
                    userId: Number(userId),
                    paymentMethod: paymentMethodEnum,
                    metadata: {
                        paymentId: payment.id.toString(),
                        reservationId: payment.reservationId.toString(),
                        discountCodeId: discountCodeId?.toString() || null
                    }
                }, provider);
                // Actualizar payment con el intent ID si existe
                if (intent.id && intent.id !== payment.id.toString()) {
                    await prisma_1.default.payment.update({
                        where: { id: payment.id },
                        data: { transactionId: intent.id }
                    });
                }
                // Retornar payment con intent info
                return res.status(201).json({
                    ...payment,
                    paymentIntent: intent
                });
            }
            catch (intentError) {
                // Si falla el intent, continuar con el pago manual
                console.warn('[POST /payments] Error creando payment intent, continuando con pago manual:', intentError);
            }
        }
        res.status(201).json(payment);
    }
    catch (err) {
        console.error('[POST /payments] Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[POST /payments] Error details:', {
            message: errorMessage,
            stack: err instanceof Error ? err.stack : undefined
        });
        res.status(500).json({
            message: 'Internal server error',
            error: errorMessage
        });
    }
});
// GET /payments - get payments (user gets their own, admin gets all)
router.get('/', auth_1.default, resolve_school_1.default, async (req, res) => {
    try {
        const userId = req.userId;
        const { reservationId } = req.query;
        const user = await prisma_1.default.user.findUnique({ where: { id: Number(userId) } });
        if (!user)
            return res.status(401).json({ message: 'User not found' });
        let whereClause = {};
        if (reservationId) {
            whereClause.reservationId = Number(reservationId);
            // If not admin, ensure they can only see permitted payments
            if (user.role === 'SCHOOL_ADMIN') {
                if (!req.schoolId)
                    return res.status(404).json({ message: 'No school found for this user' });
                whereClause.reservation = { class: { schoolId: Number(req.schoolId) } };
            }
            else if (user.role !== 'ADMIN') {
                whereClause.reservation = { userId: Number(userId) };
            }
        }
        else {
            // If not admin, only show allowed payments
            if (user.role === 'SCHOOL_ADMIN') {
                if (!req.schoolId)
                    return res.status(404).json({ message: 'No school found for this user' });
                whereClause.reservation = { class: { schoolId: Number(req.schoolId) } };
            }
            else if (user.role !== 'ADMIN') {
                whereClause.reservation = { userId: Number(userId) };
            }
        }
        const payments = await prisma_1.default.payment.findMany({
            where: whereClause,
            include: {
                reservation: {
                    include: {
                        user: true,
                        class: {
                            include: {
                                school: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payments);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// GET /payments/:id - get specific payment
router.get('/:id', auth_1.default, resolve_school_1.default, (0, validation_1.validateParams)(payments_1.paymentIdSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const user = await prisma_1.default.user.findUnique({ where: { id: Number(userId) } });
        if (!user)
            return res.status(401).json({ message: 'User not found' });
        const payment = await prisma_1.default.payment.findUnique({
            where: { id: Number(id) },
            include: {
                reservation: {
                    include: {
                        user: true,
                        class: {
                            include: {
                                school: true
                            }
                        }
                    }
                }
            }
        });
        if (!payment)
            return res.status(404).json({ message: 'Payment not found' });
        // Check access: ADMIN ok; SCHOOL_ADMIN must own the school; otherwise only owner user
        if (user.role === 'ADMIN') {
            return res.json(payment);
        }
        if (user.role === 'SCHOOL_ADMIN') {
            if (!req.schoolId)
                return res.status(404).json({ message: 'No school found for this user' });
            if (payment.reservation.class.schoolId !== req.schoolId) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            return res.json(payment);
        }
        if (payment.reservation.userId !== Number(userId)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.json(payment);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// PUT /payments/:id - update payment (user can update their own, admin and school_admin can update any)
router.put('/:id', auth_1.default, resolve_school_1.default, (0, validation_1.validateParams)(payments_1.paymentIdSchema), (0, validation_1.validateBody)(payments_1.updatePaymentSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const payment = await prisma_1.default.payment.findUnique({
            where: { id: Number(id) },
            include: { reservation: { include: { class: true } } }
        });
        if (!payment)
            return res.status(404).json({ message: 'Payment not found' });
        // Check permissions: user can update their own payment, admin/school_admin can update any
        const user = await prisma_1.default.user.findUnique({ where: { id: Number(req.userId) } });
        if (!user)
            return res.status(401).json({ message: 'User not found' });
        if (user.role === 'STUDENT') {
            // Students can only update their own payments
            if (payment.reservation.userId !== Number(req.userId)) {
                return res.status(403).json({ message: 'You can only update your own payments' });
            }
        }
        else if (user.role === 'SCHOOL_ADMIN') {
            // School admins can only update payments from their school
            // resolveSchool middleware should have set req.schoolId, but if not, try to resolve it
            let schoolId = req.schoolId;
            if (!schoolId) {
                const school = await prisma_1.default.school.findFirst({ where: { ownerId: Number(req.userId) } });
                if (!school) {
                    console.error(`[PUT /payments/:id] SCHOOL_ADMIN ${req.userId} has no associated school`);
                    return res.status(404).json({
                        message: 'No school found for this user. Please ensure your account is properly configured.'
                    });
                }
                schoolId = school.id;
                req.schoolId = schoolId; // Cache it for future use
            }
            // Verify the payment belongs to the school
            if (payment.reservation.class.schoolId !== schoolId) {
                console.error(`[PUT /payments/:id] Payment ${id} belongs to school ${payment.reservation.class.schoolId}, but user's school is ${schoolId}`);
                return res.status(403).json({ message: 'You can only update payments from your school' });
            }
        }
        else if (user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        // If status is being changed to PAID, set paidAt
        if (updateData.status === 'PAID' && payment.status !== 'PAID') {
            updateData.paidAt = new Date().toISOString();
        }
        // If status is being changed from PAID, clear paidAt
        if (updateData.status && updateData.status !== 'PAID' && payment.status === 'PAID') {
            updateData.paidAt = null;
        }
        const updatedPayment = await prisma_1.default.payment.update({
            where: { id: Number(id) },
            data: updateData,
            include: {
                reservation: {
                    include: {
                        user: true,
                        class: {
                            include: {
                                school: true
                            }
                        }
                    }
                }
            }
        });
        // Update reservation status based on payment status
        let reservationStatus = payment.reservation.status;
        if (updateData.status === 'PAID') {
            reservationStatus = 'PAID';
        }
        else if (updateData.status === 'REFUNDED') {
            reservationStatus = 'CANCELED';
        }
        else if (updateData.status === 'UNPAID' && payment.reservation.status === 'PAID') {
            reservationStatus = 'CONFIRMED';
        }
        await prisma_1.default.reservation.update({
            where: { id: payment.reservationId },
            data: { status: reservationStatus }
        });
        res.json(updatedPayment);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// DELETE /payments/:id - cancel/refund payment (admin only)
router.delete('/:id', auth_1.default, (0, auth_1.requireRole)(['ADMIN']), (0, validation_1.validateParams)(payments_1.paymentIdSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await prisma_1.default.payment.findUnique({
            where: { id: Number(id) },
            include: { reservation: true }
        });
        if (!payment)
            return res.status(404).json({ message: 'Payment not found' });
        // Update payment status to REFUNDED instead of deleting
        const updatedPayment = await prisma_1.default.payment.update({
            where: { id: Number(id) },
            data: {
                status: 'REFUNDED',
                updatedAt: new Date()
            }
        });
        // Update reservation status to CANCELED
        await prisma_1.default.reservation.update({
            where: { id: payment.reservationId },
            data: { status: 'CANCELED' }
        });
        res.json({ message: 'Payment refunded successfully', payment: updatedPayment });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// POST /payments/create-intent - Create payment intent for online payments
router.post('/create-intent', auth_1.default, (0, validation_1.validateBody)(payments_1.createPaymentSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { reservationId, amount, paymentMethod, provider } = req.body;
        if (!userId)
            return res.status(401).json({ message: 'User not authenticated' });
        // Verify reservation exists
        const reservation = await prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: { user: true, class: true }
        });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        // Check permissions
        const user = await prisma_1.default.user.findUnique({ where: { id: Number(userId) } });
        if (!user)
            return res.status(401).json({ message: 'User not found' });
        if (reservation.userId !== Number(userId) && user.role !== 'ADMIN' && user.role !== 'SCHOOL_ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        // Create payment intent using PaymentService
        const intent = await PaymentService_1.PaymentService.createPaymentIntent({
            amount,
            currency: 'PEN',
            reservationId,
            userId: Number(userId),
            paymentMethod: paymentMethod,
            metadata: {
                reservationId: reservationId.toString(),
                userId: userId.toString()
            }
        }, provider);
        res.json(intent);
    }
    catch (err) {
        console.error('[POST /payments/create-intent] Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ message: errorMessage });
    }
});
// GET /payments/providers - Get available payment providers
router.get('/providers', auth_1.default, async (req, res) => {
    try {
        const providers = PaymentService_1.PaymentService.getAvailableProviders();
        res.json(providers);
    }
    catch (err) {
        console.error('[GET /payments/providers] Error:', err);
        res.status(500).json({ message: 'Error fetching providers' });
    }
});
// POST /payments/webhook/:provider - Webhook handler for payment providers
router.post('/webhook/:provider', async (req, res) => {
    try {
        const { provider } = req.params;
        const providerEnum = provider.toUpperCase();
        // TODO: Implementar webhook handlers específicos
        // Por ahora, solo aceptamos el webhook pero no lo procesamos
        console.log(`[Webhook] Received webhook from ${provider}:`, req.body);
        // Retornar 200 para evitar reintentos
        res.status(200).json({ received: true });
    }
    catch (err) {
        console.error('[POST /payments/webhook] Error:', err);
        res.status(500).json({ message: 'Webhook processing error' });
    }
});
exports.default = router;
