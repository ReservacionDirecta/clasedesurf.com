'use client';

import { useState } from 'react';
import {
  Calendar,
  Users,
  DollarSign,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  User,
  CreditCard
} from 'lucide-react';

interface ActivityItem {
  id: number;
  type: 'reservation' | 'payment' | 'class' | 'instructor' | 'student' | 'cancellation';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  user?: string;
  amount?: number;
  metadata?: {
    className?: string;
    instructorName?: string;
    studentCount?: number;
  };
}

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export default function RecentActivity({ activities, maxItems = 10 }: RecentActivityProps) {
  const [filter, setFilter] = useState<'all' | 'reservation' | 'payment' | 'class'>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'reservation':
        return status === 'success' ? CheckCircle : status === 'warning' ? AlertCircle : Calendar;
      case 'payment':
        return status === 'success' ? CheckCircle : status === 'error' ? XCircle : CreditCard;
      case 'class':
        return BookOpen;
      case 'instructor':
        return User;
      case 'student':
        return Users;
      case 'cancellation':
        return XCircle;
      default:
        return Info;
    }
  };

  const getActivityColor = (type: string, status?: string) => {
    if (status === 'success') return 'text-green-600 bg-green-100';
    if (status === 'warning') return 'text-yellow-600 bg-yellow-100';
    if (status === 'error') return 'text-red-600 bg-red-100';

    switch (type) {
      case 'reservation':
        return 'text-blue-600 bg-blue-100';
      case 'payment':
        return 'text-green-600 bg-green-100';
      case 'class':
        return 'text-purple-600 bg-purple-100';
      case 'instructor':
        return 'text-indigo-600 bg-indigo-100';
      case 'student':
        return 'text-cyan-600 bg-cyan-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  const filteredActivities = activities
    .filter(activity => filter === 'all' || activity.type === filter)
    .slice(0, isExpanded ? undefined : maxItems);

  const filterButtons: { key: 'all' | 'reservation' | 'payment' | 'class', label: string, count: number }[] = [
    { key: 'all', label: 'Todas', count: activities.length },
    { key: 'reservation', label: 'Reservas', count: activities.filter(a => a.type === 'reservation').length },
    { key: 'payment', label: 'Pagos', count: activities.filter(a => a.type === 'payment').length },
    { key: 'class', label: 'Clases', count: activities.filter(a => a.type === 'class').length },
  ];

  const currentFilteredCount = activities.filter(activity => filter === 'all' || activity.type === filter).length;

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Actividad Reciente</h3>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <span className="text-xs sm:text-sm text-gray-500">Tiempo real</span>
          </div>
        </div>

        {/* Filter Buttons - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {filterButtons.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${filter === key
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                }`}
            >
              <span className="hidden sm:inline">{label} ({count})</span>
              <span className="sm:hidden">{label.charAt(0)}{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-80 sm:max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No hay actividad reciente</h4>
            <p className="text-gray-500">Las actividades aparecerán aquí cuando ocurran.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type, activity.status);
              const colorClasses = getActivityColor(activity.type, activity.status);

              return (
                <div
                  key={activity.id}
                  className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-blue-50/30' : ''
                    }`}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className={`p-1.5 sm:p-2 rounded-full ${colorClasses} flex-shrink-0`}>
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 leading-tight">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                        {activity.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                          {activity.user && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate max-w-20 sm:max-w-none">{activity.user}</span>
                            </div>
                          )}

                          {activity.metadata?.className && (
                            <div className="flex items-center space-x-1">
                              <BookOpen className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate max-w-24 sm:max-w-none">{activity.metadata.className}</span>
                            </div>
                          )}

                          {activity.metadata?.studentCount && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3 flex-shrink-0" />
                              <span>{activity.metadata.studentCount}</span>
                            </div>
                          )}
                        </div>

                        {activity.amount && (
                          <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
                            <DollarSign className="w-3 h-3" />
                            <span>S/. {activity.amount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filteredActivities.length > 0 && (
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <span className="text-xs sm:text-sm text-gray-500">
              {filteredActivities.length} de {currentFilteredCount} actividades
            </span>
            {currentFilteredCount > maxItems && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium text-left sm:text-right"
              >
                {isExpanded ? 'Ver menos' : 'Ver todas'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}