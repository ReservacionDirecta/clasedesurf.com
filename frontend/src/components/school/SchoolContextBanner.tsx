'use client';

import { Building2, MapPin, Info } from 'lucide-react';
import { SchoolContext } from '@/lib/school-context';

interface SchoolContextBannerProps {
  school: SchoolContext | null;
  loading?: boolean;
}

/**
 * Visual banner that shows the current school context
 * Helps users understand they're viewing data scoped to their school
 */
export const SchoolContextBanner: React.FC<SchoolContextBannerProps> = ({ 
  school, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-blue-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-blue-100 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">No se encontró escuela</h3>
            <p className="text-sm text-yellow-700 mt-1">
              No hay una escuela asociada a tu cuenta. Contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-blue-900 text-lg truncate">
              {school.name}
            </h3>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Tu escuela
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{school.location}</span>
          </div>
          {school.description && (
            <p className="text-sm text-blue-600 mt-2 line-clamp-2">
              {school.description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-600 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Estás viendo datos exclusivos de tu escuela. Otros administradores no pueden ver esta información.
        </p>
      </div>
    </div>
  );
};

export default SchoolContextBanner;
