'use client';

import { useSession } from 'next-auth/react';
import { Shield, Users, Building, AlertCircle } from 'lucide-react';

interface InstructorPermissionsProps {
  schoolName?: string;
  totalInstructors: number;
}

export default function InstructorPermissions({ schoolName, totalInstructors }: InstructorPermissionsProps) {
  const { data: session } = useSession();
  
  if (!session?.user) return null;

  const isAdmin = session.user.role === 'ADMIN';
  const isSchoolAdmin = session.user.role === 'SCHOOL_ADMIN';

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isAdmin ? (
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          ) : (
            <Building className="w-5 h-5 text-blue-600 mt-0.5" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            {isAdmin ? 'Permisos de Administrador' : 'Permisos de Administrador de Escuela'}
          </h3>
          
          <div className="text-sm text-blue-800 space-y-1">
            {isAdmin ? (
              <>
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Puedes gestionar instructores de todas las escuelas ({totalInstructors} total)
                </p>
                <p>• Crear, editar y eliminar cualquier instructor</p>
                <p>• Asignar instructores a cualquier escuela</p>
                <p>• Ver estadísticas globales del sistema</p>
              </>
            ) : (
              <>
                <p className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Solo puedes gestionar instructores de tu escuela: <strong>{schoolName}</strong>
                </p>
                <p>• Crear instructores que se asignarán automáticamente a tu escuela</p>
                <p>• Editar y eliminar solo instructores de tu escuela</p>
                <p>• Ver estadísticas específicas de tu escuela ({totalInstructors} instructores)</p>
              </>
            )}
          </div>
          
          {isSchoolAdmin && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <p>Los instructores que crees serán asignados automáticamente a tu escuela. No podrás ver ni gestionar instructores de otras escuelas.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}