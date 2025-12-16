'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notificationService, Notification } from '@/services/notificationService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function AdminNotificationDetailPage({ params }: { params: { id: string } }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadNotification();
  }, [params.id]);

  const loadNotification = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getById(parseInt(params.id));
      setNotification(data);
    } catch (err) {
      console.error('Error loading notification:', err);
      setError('No se pudo cargar la notificación');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'RESERVATION_CONFIRMED': 'Reserva Confirmada',
      'RESERVATION_CANCELLED': 'Reserva Cancelada',
      'RESERVATION_CHANGED': 'Cambio de Reserva',
      'PAYMENT_CONFIRMED': 'Pago Exitoso',
      'CHECKIN_REMINDER': 'Recordatorio',
      'WELCOME': 'Bienvenida',
      'PASSWORD_RESET': 'Seguridad'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('CONFIRMED') || category === 'WELCOME') return 'bg-green-100 text-green-800 border-green-200';
    if (category.includes('CANCEL')) return 'bg-red-100 text-red-800 border-red-200';
    if (category.includes('CHANGED')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (category.includes('PAYMENT')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (category.includes('REMINDER')) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'EMAIL') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
          <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
        </svg>
      );
    }
    if (type === 'WHATSAPP') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z" clipRule="evenodd" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Notificación no encontrada</h2>
        <p className="text-gray-500 mb-4">{error || 'La notificación que buscas no existe o no tienes acceso.'}</p>
        <Link href="/dashboard/admin/notifications" className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/admin/notifications"
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-all shadow-sm group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver
        </Link>
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${getCategoryColor(notification.category)}`}>
          {getCategoryLabel(notification.category)}
        </span>
      </div>

      {/* Notification Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 bg-gradient-to-r from-slate-50 to-purple-50/30 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${notification.type === 'EMAIL' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                {getTypeIcon(notification.type)}
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {notification.type === 'EMAIL' ? 'Correo Electrónico' : notification.type === 'WHATSAPP' ? 'WhatsApp' : 'Sistema'}
                </span>
                <h1 className="text-xl font-bold text-slate-800">{notification.subject}</h1>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Enviado</span>
              <span className="text-sm font-medium text-slate-600">
                {format(new Date(notification.createdAt), "d MMM yyyy", { locale: es })}
              </span>
              <span className="text-xs text-slate-400 block">
                {format(new Date(notification.createdAt), "h:mm a", { locale: es })}
              </span>
            </div>
          </div>
        </div>

        {/* Recipient Info */}
        {notification.user && (
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Para:</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {(notification.user.name || notification.user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">{notification.user.name || 'Sin nombre'}</span>
                    <span className="text-slate-400 mx-2">•</span>
                    <span className="text-slate-500">{notification.user.email}</span>
                  </div>
                </div>
              </div>
              {notification.isRead && (
                <span className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Leído
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metadata Section */}
        {notification.metadata && Object.keys(notification.metadata).length > 0 && (
          <div className="px-6 py-4 bg-amber-50/50 border-b border-amber-100">
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-amber-700 hover:text-amber-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 transition-transform group-open:rotate-90">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                Datos adicionales del correo
              </summary>
              <div className="mt-3 pl-6 grid grid-cols-2 gap-3">
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-amber-600 font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-amber-800 ml-2">{String(value)}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Email Content Preview */}
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <h3 className="font-semibold text-slate-700">Vista previa del correo</h3>
          </div>
          
          {/* Email Preview Container */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <span className="text-xs text-slate-500 ml-2">Contenido del email</span>
            </div>
            <div className="p-4 max-h-[600px] overflow-auto bg-white">
              {/* Render HTML email content */}
              <div 
                className="prose prose-sm max-w-none"
                style={{ all: 'initial', fontFamily: 'Arial, sans-serif' }}
                dangerouslySetInnerHTML={{ __html: notification.content }} 
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>ID: {notification.id}</span>
          <span>
            Fecha completa: {format(new Date(notification.createdAt), "PPPP 'a las' p", { locale: es })}
          </span>
        </div>
      </div>
    </div>
  );
}
