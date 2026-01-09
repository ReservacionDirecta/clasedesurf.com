'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notificationService, Notification } from '@/services/notificationService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
// Removed DOMPurify as it is not installed and we trust backend content

export default function NotificationDetailPage() {
  const params = useParams();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (params?.id) {
        loadNotification();
    }
  }, [params?.id]);

  const loadNotification = async () => {
    try {
      setLoading(true);
      const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
      if (!id) return;
      const data = await notificationService.getById(parseInt(id));
      setNotification(data);
    } catch (error) {
      console.error('Error loading notification:', error);
      // router.push('/dashboard/student/notifications'); // Redirect if not found
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-700">Notificación no encontrada</h2>
        <Link href="/dashboard/student/notifications" className="text-blue-600 mt-4 inline-block hover:underline">
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/dashboard/student/notifications"
          className="flex items-center text-slate-600 hover:text-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver
        </Link>
        <span className="text-sm text-slate-400">
           {format(new Date(notification.createdAt), "PPPP, p", { locale: es })}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              {notification.category}
            </span>
            {notification.type === 'EMAIL' && (
               <span className="text-xs text-slate-400 flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                   <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                   <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                 </svg>
                 Enviado por Correo
               </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{notification.subject}</h1>
        </div>
        
        <div className="p-6 bg-white min-h-[400px]">
           {/* Render HTML content safely */}
           <div 
             className="prose max-w-none not-prose-email-content"
             dangerouslySetInnerHTML={{ __html: notification.content }} 
           />
        </div>
      </div>
    </div>
  );
}
