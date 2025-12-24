'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ClassForm } from '@/components/forms/ClassForm';

export default function NewClassPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Crear Nueva Clase</h1>
              <p className="text-slate-500 text-sm">Define el producto y genera el inventario de sesiones.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClassForm 
          onSuccess={() => router.push('/dashboard/school/classes')}
          onCancel={() => router.push('/dashboard/school/classes')}
        />
      </div>
    </div>
  );
}
