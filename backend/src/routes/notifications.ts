import express from 'express';
import requireAuth, { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notification.service';

const router = express.Router();

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

        // Fetch notification ensuring it belongs to user
        const notification = await notificationService.getById(id, Number(userId));

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Auto-mark as read when fetched? optional but good UX
        if (!notification.isRead) {
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
