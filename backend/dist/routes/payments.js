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
const router = express_1.default.Router();
// POST /payments - create a payment record (requires auth)
router.post('/', auth_1.default, (0, validation_1.validateBody)(payments_1.createPaymentSchema), async (req, res) => {
    try {
        const userId = req.userId;
        const { reservationId, amount, paymentMethod, transactionId } = req.body;
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
        if (reservation.userId !== Number(userId) && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        // Check if payment already exists for this reservation
        const existingPayment = await prisma_1.default.payment.findUnique({ where: { reservationId } });
        if (existingPayment) {
            return res.status(400).json({ message: 'Payment already exists for this reservation' });
        }
        const payment = await prisma_1.default.payment.create({
            data: {
                reservation: { connect: { id: reservationId } },
                amount,
                status: 'PAID',
                paymentMethod: paymentMethod || 'manual',
                transactionId,
                paidAt: new Date()
            },
            include: {
                reservation: {
                    include: {
                        user: true,
                        class: true
                    }
                }
            }
        });
        // Update reservation status to PAID
        await prisma_1.default.reservation.update({
            where: { id: reservationId },
            data: { status: 'PAID' }
        });
        res.status(201).json(payment);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// GET /payments - get payments (user gets their own, admin gets all)
router.get('/', auth_1.default, async (req, res) => {
    try {
        const userId = req.userId;
        const { reservationId } = req.query;
        const user = await prisma_1.default.user.findUnique({ where: { id: Number(userId) } });
        if (!user)
            return res.status(401).json({ message: 'User not found' });
        let whereClause = {};
        if (reservationId) {
            whereClause.reservationId = Number(reservationId);
            // If not admin, ensure they can only see their own reservation's payments
            if (user.role !== 'ADMIN') {
                whereClause.reservation = { userId: Number(userId) };
            }
        }
        else {
            // If not admin, only show payments for user's reservations
            if (user.role !== 'ADMIN') {
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
router.get('/:id', auth_1.default, (0, validation_1.validateParams)(payments_1.paymentIdSchema), async (req, res) => {
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
        // Check if user owns the payment or is admin
        if (payment.reservation.userId !== Number(userId) && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.json(payment);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// PUT /payments/:id - update payment (admin and school_admin)
router.put('/:id', auth_1.default, (0, auth_1.requireRole)(['ADMIN', 'SCHOOL_ADMIN']), (0, validation_1.validateParams)(payments_1.paymentIdSchema), (0, validation_1.validateBody)(payments_1.updatePaymentSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const payment = await prisma_1.default.payment.findUnique({
            where: { id: Number(id) },
            include: { reservation: true }
        });
        if (!payment)
            return res.status(404).json({ message: 'Payment not found' });
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
exports.default = router;
