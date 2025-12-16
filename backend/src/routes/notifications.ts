import express from 'express';
import requireAuth, { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notification.service';
import { emailService } from '../services/email.service';

const router = express.Router();

// POST /notifications/test-email - Admin only endpoint to test email service
router.post('/test-email', requireAuth, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;

        // Get user to check if they're admin (you can adjust this check)
        const { email, type = 'welcome', name = 'Test User' } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        let result;

        switch (type) {
            case 'welcome':
                result = await emailService.sendWelcomeEmail(email, name, 'clasedesurf.com');
                break;
            case 'reservation_confirmed':
                result = await emailService.sendReservationConfirmed(
                    email,
                    name,
                    'Clase de Surf para Principiantes',
                    new Date().toLocaleDateString('es-PE'),
                    '10:00 AM',
                    'Carlos Instructor',
                    'clasedesurf.com',
                    'Playa Makaha, Miraflores',
                    120,
                    100
                );
                break;
            case 'reservation_cancelled':
                result = await emailService.sendReservationCancelled(
                    email,
                    name,
                    'Clase de Surf para Principiantes',
                    new Date().toLocaleDateString('es-PE'),
                    '10:00 AM',
                    'clasedesurf.com',
                    'Playa Makaha, Miraflores'
                );
                break;
            case 'payment':
                result = await emailService.sendPaymentConfirmation(
                    email,
                    name,
                    100,
                    'PEN',
                    'Clase de Surf - Principiantes',
                    'TEST-TXN-' + Date.now(),
                    'clasedesurf.com',
                    'Yape',
                    new Date().toLocaleDateString('es-PE')
                );
                break;
            case 'reminder':
                result = await emailService.sendCheckInReminder(
                    email,
                    name,
                    'Clase de Surf para Principiantes',
                    new Date(Date.now() + 86400000).toLocaleDateString('es-PE'),
                    '10:00 AM',
                    'clasedesurf.com',
                    'Playa Makaha, Miraflores'
                );
                break;
            default:
                return res.status(400).json({
                    message: 'Invalid email type. Valid types: welcome, reservation_confirmed, reservation_cancelled, payment, reminder'
                });
        }

        if (result.success) {
            res.json({
                success: true,
                message: `Test email (${type}) sent successfully to ${email}`,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send email',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ message: 'Internal server error', error: String(error) });
    }
});

// GET /notifications/all - Admin only endpoint to get ALL system notifications
router.get('/all', requireAuth, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;

        // Verify user is admin (we need to check their role)
        const prisma = require('../prisma').default;
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Pagination
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const notifications = await notificationService.getAllNotifications(limit, offset);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /notifications
router.get('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        // Pagination
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        // Filter by type/category if needed (not implemented in service yet, but good to have prepared)

        const notifications = await notificationService.getUserNotifications(Number(userId), limit, offset);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /notifications/unread-count
router.get('/unread-count', requireAuth, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const count = await notificationService.getUnreadCount(Number(userId));
        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /notifications/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const id = parseInt(req.params.id);

        // Check if user is admin to allow viewing any notification
        const prisma = require('../prisma').default;
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { role: true }
        });

        const isAdmin = user?.role === 'ADMIN';

        // Fetch notification - admins can view any, users only their own
        const notification = await notificationService.getById(id, isAdmin ? undefined : Number(userId));

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Include user info for admin view
        if (isAdmin && notification.userId) {
            const notificationUser = await prisma.user.findUnique({
                where: { id: notification.userId },
                select: { id: true, name: true, email: true }
            });
            (notification as any).user = notificationUser;
        }

        // Auto-mark as read when fetched (only for own notifications)
        if (!notification.isRead && notification.userId === Number(userId)) {
            await notificationService.markAsRead(id, Number(userId));
            notification.isRead = true;
        }

        res.json(notification);
    } catch (error) {
        console.error('Error fetching notification detail:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /notifications/:id/read
router.put('/:id/read', requireAuth, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const id = parseInt(req.params.id);

        const result = await notificationService.markAsRead(id, Number(userId));

        if (!result) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
