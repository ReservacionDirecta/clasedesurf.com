'use client';

import { useState, useEffect } from 'react';
import {
  Star,
  Target,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';

interface StatsData {
  totalClasses: number;
  totalInstructors: number;
  totalStudents: number;
  monthlyRevenue: number;
  averageOccupancy: number;
  averageRating: number;
  weeklyClasses: number;
  pendingReservations: number;
  completedClasses: number;
  cancelledClasses: number;
  newStudentsThisMonth: number;
  topInstructor?: string;
  popularLevel?: string;
  peakHours?: string;
  revenueGrowth?: number;
  studentGrowth?: number;
  classGrowth?: number;
  levelDistribution?: {
    BEGINNER: number;
    INTERMEDIATE: number;
    ADVANCED: number;
  };
}

interface AdvancedStatsProps {
  stats: StatsData;
  timeframe: 'week' | 'month' | 'year';
  onTimeframeChange: (timeframe: 'week' | 'month' | 'year') => void;
}

export default function AdvancedStats({ stats, timeframe, onTimeframeChange }: AdvancedStatsProps) {
  const [animatedStats, setAnimatedStats] = useState<StatsData>(stats);

  useEffect(() => {
    // Animate numbers when stats change
    const timer = setTimeout(() => {
      setAnimatedStats(stats);
    }, 100);
    return () => clearTimeout(timer);
  }, [stats]);

  return (
    <div className="space-y-8">
      {/* Secondary Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Ocupación Promedio</h3>
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
                {animatedStats.averageOccupancy}%
              </span>
              <span className="text-xs sm:text-sm text-gray-500">Meta: 85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 sm:h-3 rounded-full transition-all duration-1000"
                style={{ width: `${animatedStats.averageOccupancy}%` }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Horario pico: {stats.peakHours || '-'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Rating Promedio</h3>
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl font-bold text-yellow-600">
                {animatedStats.averageRating}
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(animatedStats.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Basado en {stats.completedClasses} clases
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Reservas Pendientes</span>
              <span className="text-base sm:text-lg font-semibold text-orange-600">
                {animatedStats.pendingReservations}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Clases Esta Semana</span>
              <span className="text-base sm:text-lg font-semibold text-blue-600">
                {animatedStats.weeklyClasses}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Nuevos Estudiantes</span>
              <span className="text-base sm:text-lg font-semibold text-green-600">
                +{animatedStats.newStudentsThisMonth}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Insights de Rendimiento</h3>
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs sm:text-sm font-medium text-green-800 truncate">Top Instructor</span>
              </div>
              <span className="text-xs sm:text-sm text-green-700 font-semibold ml-2 flex-shrink-0">
                {stats.topInstructor || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs sm:text-sm font-medium text-blue-800 truncate">Nivel Popular</span>
              </div>
              <span className="text-xs sm:text-sm text-blue-700 font-semibold ml-2 flex-shrink-0">
                {stats.popularLevel || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs sm:text-sm font-medium text-purple-800 truncate">Cancelaciones</span>
              </div>
              <span className="text-xs sm:text-sm text-purple-700 font-semibold ml-2 flex-shrink-0">
                {((animatedStats.cancelledClasses / animatedStats.totalClasses) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Distribución</h3>
            <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Principiante</span>
                <span className="text-xs sm:text-sm font-semibold">
                  {stats.levelDistribution?.BEGINNER || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.levelDistribution?.BEGINNER || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Intermedio</span>
                <span className="text-xs sm:text-sm font-semibold">
                  {stats.levelDistribution?.INTERMEDIATE || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.levelDistribution?.INTERMEDIATE || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Avanzado</span>
                <span className="text-xs sm:text-sm font-semibold">
                  {stats.levelDistribution?.ADVANCED || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.levelDistribution?.ADVANCED || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}