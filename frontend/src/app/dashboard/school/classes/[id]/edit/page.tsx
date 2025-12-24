'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Edit2, Loader2, AlertCircle } from 'lucide-react';
import { ClassForm } from '@/components/forms/ClassForm';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params?.id as string;
  const { data: session, status } = useSession();
  
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClass = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/classes/${classId}`);
      if (!res.ok) throw new Error('No se pudo cargar la clase');
      const data = await res.json();
      setClassData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (status === 'authenticated' && classId) {
      fetchClass();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, classId, fetchClass, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-medium tracking-tight">Cargando detalles de la clase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error al cargar</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <div className="flex gap-4">
            <Link href="/dashboard/school/classes" className="flex-1">
              <Button variant="outline" className="w-full">Volver</Button>
            </Link>
            <Button onClick={fetchClass} className="flex-1 bg-indigo-600 text-white shadow-lg shadow-indigo-100">Reintentar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Edit2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">Editar Clase</h1>
              <p className="text-slate-500 text-sm truncate max-w-[200px] sm:max-w-none">
                Modificando: <span className="font-bold text-slate-700">{classData?.title}</span>
              </p>
            </div>
            <Link href={`/dashboard/school/classes/${classId}/reservations`}>
              <Button variant="secondary" size="sm" className="hidden sm:flex">Ver Reservas</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClassForm 
          initialData={classData}
          isEditing={true}
          onSuccess={() => router.push('/dashboard/school/classes')}
          onCancel={() => router.push('/dashboard/school/classes')}
        />
      </div>
    </div>
  );
}