import prisma from '../prisma';
import { NotificationType } from '@prisma/client';

export class NotificationService {
    private static instance: NotificationService;

    private constructor() { }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    async create(data: {
        userId: number;
        type: NotificationType;
        category: string;
        subject: string;
        content: string;
        metadata?: any;
    }) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    category: data.category,
                    subject: data.subject,
                    content: data.content,
                    metadata: data.metadata || {},
                    isRead: false
                }
            });
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            // We don't want to throw here to avoid failing the main action (e.g. email sending)
            return null;
        }
    }

    async getUserNotifications(userId: number, limit = 50, offset = 0) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });
    }

    async getById(id: number, userId: number | undefined) {
        const where: any = { id };
        if (userId) {
            where.userId = userId;
        }
        return prisma.notification.findFirst({ where });
    }

    async getAllNotifications(limit = 100, offset = 0) {
        return prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async markAsRead(id: number, userId: number) {
        // Ensure user owns the notification
        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });

        if (!notification) return null;

        return prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
    }

    async getUnreadCount(userId: number) {
        return prisma.notification.count({
            where: { userId, isRead: false }
        });
    }
}

export const notificationService = NotificationService.getInstance();
