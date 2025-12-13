'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notificationService, Notification } from '@/services/notificationService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if button is inside link
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getIconColor = (category: string) => {
    if (category.includes('CONFIRMED')) return 'bg-green-100 text-green-600';
    if (category.includes('CANCEL')) return 'bg-red-100 text-red-600';
    if (category.includes('CHANGED')) return 'bg-orange-100 text-orange-600';
    if (category.includes('PAYMENT')) return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'RESERVATION_CONFIRMED') return 'Reserva Confirmada';
    if (category === 'RESERVATION_CANCELLED') return 'Reserva Cancelada';
    if (category === 'RESERVATION_CHANGED') return 'Cambio de Reserva';
    if (category === 'PAYMENT_CONFIRMED') return 'Pago Exitoso';
    if (category === 'CHECKIN_REMINDER') return 'Recordatorio';
    if (category === 'WELCOME') return 'Bienvenida';
    if (category === 'PASSWORD_RESET') return 'Seguridad';
    return 'Notificación';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Notificaciones</h1>
        <button 
          onClick={loadNotifications}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Actualizar
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-slate-900">No tienes notificaciones</h3>
            <p className="text-slate-500">Te avisaremos cuando tengas novedades importantes.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Link 
              key={notification.id} 
              href={`/dashboard/student/notifications/${notification.id}`}
              className={`block bg-white p-4 rounded-xl border transition-all hover:shadow-md ${
                notification.isRead ? 'border-slate-100' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full shrink-0 ${getIconColor(notification.category)}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {getCategoryLabel(notification.category)}
                    </span>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                        {format(new Date(notification.createdAt), "d MMM, h:mm a", { locale: es })}
                    </span>
                  </div>
                  <h3 className={`text-base font-semibold mb-1 truncate ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notification.subject}
                  </h3>
                  <div className="flex items-center gap-2">
                     {!notification.isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                     )}
                     <span className="text-sm text-blue-600 font-medium">Ver detalles &rarr;</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
