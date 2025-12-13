import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Configure axios instance with credentials
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

import { getSession } from 'next-auth/react';

// Add request interceptor to include token
api.interceptors.request.use(async (config) => {
    const session = await getSession();
    const token = (session as any)?.backendToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Notification {
    id: number;
    type: 'EMAIL' | 'WHATSAPP' | 'SYSTEM';
    category: string;
    subject: string;
    content: string;
    metadata: any;
    isRead: boolean;
    createdAt: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export const notificationService = {
    async getAll(limit = 20, offset = 0): Promise<Notification[]> {
        const response = await api.get(`/notifications?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    async getById(id: number): Promise<Notification> {
        const response = await api.get(`/notifications/${id}`);
        return response.data;
    },

    async getUnreadCount(): Promise<number> {
        try {
            const response = await api.get('/notifications/unread-count');
            return response.data.count;
        } catch (err) {
            return 0;
        }
    },

    async markAsRead(id: number): Promise<Notification> {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    }
};
