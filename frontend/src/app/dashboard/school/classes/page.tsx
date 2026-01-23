'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { Plus, Calendar, Clock, Users, MapPin, Eye, Edit, Trash2, DollarSign, X, ListChecks, LayoutGrid, List, Copy } from 'lucide-react';
import { SchoolContextBanner } from '@/components/school/SchoolContextBanner';
import { useToast } from '@/contexts/ToastContext';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

interface Class {
  id: number;
  title: string;
  description: string;
  date?: string; // Made optional
  duration: number;
  capacity: number;
  enrolled?: number;
  price: number;
  level: string;
  location?: string;
  instructor: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
  availableSpots?: number;
  reservations?: any[];
  isRecurring?: boolean;
  type?: string;
  images?: string[];
  nextSession?: { date: string; time: string }; // Added nextSession
  paymentInfo?: {
    totalReservations: number;
    paidReservations: number;
    totalRevenue: number;
    occupancyRate: number;
  };
  createdAt?: string; // Add createdAt to interface
}

// Helper to get a valid date for sorting/grouping
const getClassDate = (cls: Class): Date => {
  if (cls.date) return new Date(cls.date);
  if (cls.nextSession?.date) return new Date(cls.nextSession.date);
  if (cls.createdAt) return new Date(cls.createdAt);
  return new Date(); // Fallback
};



interface School {
  id: number;
  name: string;
  location: string;
  description?: string;
}

export default function ClassesManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateData, setDuplicateData] = useState({ date: '', time: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [groupBy, setGroupBy] = useState<'month' | 'name' | 'date'>('month');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Toggle group expansion
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupKey) 
        ? prev.filter(key => key !== groupKey)
        : [...prev, groupKey]
    );
  };

  // Generic helper to group classes
  const groupClasses = (classes: Class[], method: 'month' | 'name' | 'date') => {
    const groups: { [key: string]: Class[] } = {};
    classes.forEach(cls => {
        let key = '';
        if (method === 'month') {
          const date = getClassDate(cls);
          const dateKey = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
          key = dateKey.charAt(0).toUpperCase() + dateKey.slice(1);
        } else if (method === 'date') {
          const date = getClassDate(cls);
          const dateKey = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
           key = dateKey.charAt(0).toUpperCase() + dateKey.slice(1);
        } else {
          key = cls.title || 'Sin Título';
        }

        if (!groups[key]) groups[key] = [];
        groups[key].push(cls);
    });
    return groups;
  };

  // Helper to consolidate classes by Title within a group (useful for 'date' view)
  const consolidateClasses = (classes: Class[]) => {
      const clusters: { [key: string]: Class[] } = {};
      classes.forEach(cls => {
          // Cluster Key: Title + Date (YYYY-MM-DD)
          // Actually, if we are in 'date' view, the Date is already same. So just Title.
          // If we are in 'name' view, grouping by Date makes sense.
          // Let's make a universal cluster key: Title + Date(YMD).
          const d = getClassDate(cls);
          const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const key = `${cls.title}||${dateStr}`; 
          
          if (!clusters[key]) clusters[key] = [];
          clusters[key].push(cls);
      });
      return Object.values(clusters).sort((a,b) => getClassDate(a[0]).getTime() - getClassDate(b[0]).getTime());
  };

  const fetchClasses = useCallback(async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/classes', { headers });
      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, [session]);

  const fetchSchoolAndClasses = useCallback(async () => {
    try {
      setLoading(true);

      // Obtener información de la escuela
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const schoolResponse = await fetch('/api/schools/my-school', { headers });
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json();
        setSchool(schoolData);
      }

      // Obtener clases
      await fetchClasses();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchClasses, session]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchSchoolAndClasses();
  }, [fetchSchoolAndClasses, router, session, status]);

  const handleCreateClass = async (classData: Partial<Class>) => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...classData,
          schoolId: school?.id
        })
      });

      if (response.ok) {
        await fetchClasses();
        setShowCreateModal(false);
        showSuccess('¡Clase creada!', 'La clase se creó correctamente');
      } else {
        throw new Error('Error al crear la clase');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      showError('Error al crear', 'No se pudo crear la clase');
    }
  };

  const handleEditClass = async (classData: Partial<Class>) => {
    if (!selectedClass) return;

    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(classData)
      });

      if (response.ok) {
        await fetchClasses();
        setShowEditModal(false);
        setSelectedClass(null);
        showSuccess('¡Actualizada!', 'La clase se actualizó correctamente');
      } else {
        throw new Error('Error al actualizar la clase');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      showError('Error al actualizar', error instanceof Error ? error.message : 'No se pudo actualizar la clase');
    }
  };

  const handleDeleteClass = async (forceDelete = false) => {
    if (!selectedClass) return;

    // Confirmación adicional
    if (!forceDelete && !confirm(`¿Estás seguro de que deseas eliminar permanentemente la clase "${selectedClass.title}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = forceDelete 
        ? `/api/classes/${selectedClass.id}?force=true`
        : `/api/classes/${selectedClass.id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        await fetchClasses();
        setShowDeleteModal(false);
        setSelectedClass(null);
        showSuccess('Clase eliminada', 'La clase fue eliminada correctamente');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error al eliminar la clase' }));
        
        // Si hay reservas activas y se puede forzar eliminación
        if (errorData.canForceDelete && errorData.reservationsCount) {
          const confirmForce = confirm(
            `Esta clase tiene ${errorData.reservationsCount} reserva(s) activa(s).\n\n` +
            `¿Deseas FORZAR la eliminación? Esto:\n` +
            `• Eliminará todas las reservaciones\n` +
            `• Eliminará todos los pagos asociados\n\n` +
            `Esta acción NO SE PUEDE DESHACER.`
          );
          
          if (confirmForce) {
            await handleDeleteClass(true);
            return;
          }
        }
        
        let errorMessage = errorData.message || 'Error al eliminar la clase';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      showError('Error al eliminar', error instanceof Error ? error.message : 'Error al eliminar la clase');
    }
  };

  const handleDuplicateClass = async () => {
    if (!selectedClass || !duplicateData.date || !duplicateData.time) return;

    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // First, get full class details to make sure we have everything
      const classResponse = await fetch(`/api/classes/${selectedClass.id}`, { headers });
      if (!classResponse.ok) throw new Error('Error al obtener detalles de la clase');
      const fullClassData = await classResponse.json();

      // Create new class using duplicate data
      const response = await fetch('/api/classes/bulk-sessions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          classId: selectedClass.id,
          occurrences: [{
            date: duplicateData.date,
            time: duplicateData.time
          }]
        })
      });

      if (response.ok) {
        await fetchClasses();
        setShowDuplicateModal(false);
        setSelectedClass(null);
        setDuplicateData({ date: '', time: '' });
        showSuccess('¡Clase duplicada!', 'La nueva sesión se creó correctamente');
      } else {
        throw new Error('Error al duplicar la clase');
      }
    } catch (error) {
      console.error('Error duplicating class:', error);
      showError('Error al duplicar', error instanceof Error ? error.message : 'No se pudo duplicar la clase');
    }
  };

  const toggleSelectClass = (classId: number) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleBulkDelete = async (forceDelete = false) => {
    if (selectedClasses.length === 0) return;
    
    const confirmMessage = forceDelete 
      ? `⚠️ FORZAR eliminación de ${selectedClasses.length} clase(s).\n\nEsto eliminará todas las reservaciones y pagos asociados.\n\n¿Continuar?`
      : `¿Estás seguro de eliminar ${selectedClasses.length} clase(s)?\n\nEsta acción no se puede deshacer.`;
    if (!confirm(confirmMessage)) return;

    const token = (session as any)?.backendToken;
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let successCount = 0;
    let errorCount = 0;
    let hasReservationsCount = 0;
    const errors: string[] = [];

    for (const classId of selectedClasses) {
      try {
        const url = forceDelete 
          ? `/api/classes/${classId}?force=true`
          : `/api/classes/${classId}`;
        const response = await fetch(url, {
          method: 'DELETE',
          headers
        });
        if (response.ok) {
          successCount++;
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
          if (errorData.canForceDelete) {
            hasReservationsCount++;
          }
          errorCount++;
          errors.push(errorData.message || 'Error al eliminar');
        }
      } catch (error) {
        errorCount++;
        errors.push('Error de conexión');
      }
    }

    setSelectedClasses([]);
    await fetchClasses();

    if (successCount > 0 && errorCount === 0) {
      showSuccess('Clases eliminadas', `Se eliminaron ${successCount} clase(s) correctamente`);
    } else if (hasReservationsCount > 0 && !forceDelete) {
      // Ofrecer forzar eliminación
      const confirmForce = confirm(
        `Se eliminaron ${successCount} clase(s), pero ${hasReservationsCount} tiene(n) reservaciones activas.\n\n` +
        `¿Deseas forzar la eliminación de las clases con reservaciones?`
      );
      if (confirmForce) {
        // Re-seleccionar las clases que fallaron y reintentar con force
        showError('Info', 'Por favor, selecciona las clases a forzar y usa la función individual de eliminación.');
      }
    } else if (successCount > 0 && errorCount > 0) {
      showError('Eliminación parcial', `Se eliminaron ${successCount} clase(s), pero ${errorCount} fallaron`);
    } else {
      showError('Error al eliminar', errors[0] || 'No se pudieron eliminar las clases');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-teal-50 text-teal-700 border border-teal-200';
      case 'INTERMEDIATE':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'ADVANCED':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredClasses = useMemo(() => {
    return Array.isArray(classes)
      ? classes.filter((cls: Class) => {
        if (filter === 'all') return true;
        
        if (!cls.status) {
          const classDate = getClassDate(cls);
          const now = new Date();
          if (classDate < now) {
            return filter === 'completed';
          } else {
            return filter === 'upcoming';
          }
        }
        return cls.status === filter;
      })
      : [];
  }, [classes, filter]);

  const sortedClasses = useMemo(() => {
    return [...filteredClasses].sort((a, b) => getClassDate(a).getTime() - getClassDate(b).getTime());
  }, [filteredClasses]);

  const groupedClasses = useMemo(() => {
     return groupClasses(sortedClasses, groupBy);
  }, [sortedClasses, groupBy]);
  
  // Auto-expand all groups ONLY when switching to 'month' view, or initially.
  useEffect(() => {
    if (groupBy === 'month' || groupBy === 'date') {
       // Only update if not already matching to avoid loops if groupedClasses ref changes but content is same-ish
       // But better: rely on stable groupedClasses from useMemo above.
       setExpandedGroups(Object.keys(groupedClasses));
    } else {
       setExpandedGroups([]);
    }
  }, [groupBy, groupedClasses]); // Safe now because groupedClasses is stable via stable filteredClasses

  const totalRevenue = (classes || []).reduce((sum, cls) => sum + (cls.paymentInfo?.totalRevenue || 0), 0);
  const totalStudents = (classes || []).reduce((sum, cls) => sum + (cls.enrolled || 0), 0);
  const averageOccupancy = (classes || []).length > 0
    ? (classes || []).reduce((sum, cls) => sum + (cls.paymentInfo?.occupancyRate || 0), 0) / (classes || []).length
    : 0;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/school')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Volver al Dashboard
          </button>

          {/* School Context Banner */}
          <SchoolContextBanner school={school} loading={loading} />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Clases</h1>
              <p className="text-gray-600 mt-2">Administra las clases de {school?.name || 'tu escuela'}</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
              <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-0.5 mr-2">
                <button
                   onClick={() => setGroupBy('month')}
                   className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${groupBy === 'month' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Mes
                </button>
                <div className="w-px bg-gray-200 my-1 mx-0.5"></div>
                <button
                   onClick={() => setGroupBy('name')}
                   className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${groupBy === 'name' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Nombre
                </button>
                <div className="w-px bg-gray-200 my-1 mx-0.5"></div>
                <button
                   onClick={() => setGroupBy('date')}
                   className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${groupBy === 'date' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Fecha
                </button>
              </div>

              <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-0.5 mr-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Vista de lista"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Vista de cuadrícula"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
              {selectedClasses.length > 0 && (
                <button
                  onClick={() => handleBulkDelete()}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Eliminar ({selectedClasses.length})
                </button>
              )}
              <button
                onClick={() => router.push('/dashboard/school/classes/deleted')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Papelera
              </button>
              <button
                onClick={() => router.push('/dashboard/school/classes/new')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nueva Clase
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Clases</h3>
                <p className="text-3xl font-bold text-blue-600">{classes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Estudiantes</h3>
                <p className="text-3xl font-bold text-green-600">{totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Ingresos</h3>
                <p className="text-3xl font-bold text-yellow-600">S/. {totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Ocupación</h3>
                <p className="text-3xl font-bold text-purple-600">{averageOccupancy.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Todas ({(classes || []).length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'upcoming'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Próximas ({(classes || []).filter(c => c.status === 'upcoming').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Completadas ({(classes || []).filter(c => c.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Canceladas ({(classes || []).filter(c => c.status === 'cancelled').length})
            </button>
          </div>
        </div>



        <div className="space-y-8">
          {Object.entries(groupedClasses).map(([groupKey, groupClassesList]) => (
            <div key={groupKey} className="space-y-4">
              <div 
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors sticky top-0 z-10 border border-gray-200"
                onClick={() => toggleGroup(groupKey)}
              >
                <div className="flex items-center gap-3">
                   <div className={`p-1 rounded-full ${expandedGroups.includes(groupKey) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {expandedGroups.includes(groupKey) ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      ) : (
                        <svg className="w-5 h-5 transform -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      )}
                   </div>
                   <div>
                      <h2 className="text-lg font-bold text-gray-900">{groupKey}</h2>
                      <p className="text-sm text-gray-500">{groupClassesList.length} clases</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   {/* Optional: Add group summary stats here if needed */}
                </div>
              </div>
              
              {expandedGroups.includes(groupKey) && (
              <>
              {viewMode === 'list' ? (
                 <div className="bg-white rounded-lg shadow overflow-hidden animate-fadeIn">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                              <input
                                type="checkbox"
                                checked={groupClassesList.every(c => selectedClasses.includes(c.id))}
                                onChange={() => {
                                  const allSelected = groupClassesList.every(c => selectedClasses.includes(c.id));
                                  if (allSelected) {
                                    setSelectedClasses(prev => prev.filter(id => !groupClassesList.find(c => c.id === id)));
                                  } else {
                                    const newIds = groupClassesList.map(c => c.id).filter(id => !selectedClasses.includes(id));
                                    setSelectedClasses(prev => [...prev, ...newIds]);
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clase</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiantes</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Acciones</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {groupClassesList.map((cls) => (
                            <tr key={cls.id} className={`hover:bg-gray-50 ${selectedClasses.includes(cls.id) ? 'bg-blue-50' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedClasses.includes(cls.id)}
                                  onChange={() => toggleSelectClass(cls.id)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">

                                <div className="flex items-center gap-3">
                                  {/* Visual Calendar Date */}
                                  <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${
                                    cls.date ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                                    (cls.nextSession ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-500')
                                  }`}>
                                    <span className="text-[10px] font-bold uppercase leading-none">
                                      {cls.date ? new Date(cls.date).toLocaleDateString('es-ES', { month: 'short', timeZone: 'UTC' }).replace('.', '') : 
                                       cls.nextSession ? new Date(cls.nextSession.date).toLocaleDateString('es-ES', { month: 'short', timeZone: 'UTC' }).replace('.', '') : 'REC'}
                                    </span>
                                    <span className="text-lg font-bold leading-none mt-0.5">
                                      {cls.date ? new Date(cls.date).getUTCDate() : 
                                       cls.nextSession ? new Date(cls.nextSession.date).getUTCDate() : <Clock className="w-5 h-5" />}
                                    </span>
                                  </div>

                                  <div className="flex flex-col">
                                    <div className="text-sm font-bold text-gray-900 capitalize">
                                      {cls.date ? (
                                        new Date(cls.date).toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' })
                                      ) : cls.nextSession ? (
                                        new Date(cls.nextSession.date).toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' })
                                      ) : (
                                        'Recurrente'
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 H-3" />
                                      {cls.date ? (
                                        new Date(cls.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
                                      ) : cls.nextSession ? (
                                        cls.nextSession.time
                                      ) : (
                                        'Ver Horarios'
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{cls.title}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                   <span className="text-xs text-gray-500 flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
                                      {cls.instructor || 'Sin instructor'} 
                                   </span>
                                   <span className="text-xs text-gray-500 flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
                                      {cls.duration} min
                                   </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                  cls.status === 'upcoming' ? 'bg-green-50 text-green-700 border-green-200' :
                                  cls.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {cls.status === 'upcoming' ? 'Próxima' : cls.status === 'completed' ? 'Completada' : 'Cancelada'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">{cls.enrolled || 0}</span>
                                  <span className="text-gray-400">/ {cls.capacity}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5 max-w-[80px]">
                                   <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((cls.enrolled || 0) / cls.capacity) * 100)}%` }}></div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                S/. {cls.price}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => router.push(`/dashboard/school/classes/${cls.id}/reservations`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Reservas">
                                    <ListChecks className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => { setSelectedClass(cls); setShowEditModal(true); }} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => {
                                    setSelectedClass(cls);
                                    setShowDuplicateModal(true);
                                    if (cls.date) {
                                      const d = new Date(cls.date);
                                      setDuplicateData({
                                        date: d.toISOString().split('T')[0],
                                        time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
                                      });
                                    } else if (cls.nextSession) {
                                      setDuplicateData({
                                        date: cls.nextSession.date.split('T')[0],
                                        time: cls.nextSession.time
                                      });
                                    }
                                  }} className="text-purple-600 hover:text-purple-900" title="Duplicar">
                                    <Copy className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => { setSelectedClass(cls); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-900" title="Eliminar">
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                  {consolidateClasses(groupClassesList).map((cluster) => {
                    const primaryClass = cluster[0];
                    const allIds = cluster.map(c => c.id);
                    const isFullySelected = allIds.every(id => selectedClasses.includes(id));
                    
                    return (
                    <div 
                      key={primaryClass.id} 
                      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden ${
                         isFullySelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex gap-4">
                          {/* Image Thumbnail */}
                          <div className="shrink-0 relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <ImageWithFallback
                               src={primaryClass.images?.[0] || '/images/placeholder-class.jpg'} 
                               alt={primaryClass.title}
                               fill
                               className="object-cover"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                             <div className="flex items-start justify-between gap-2">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2" title={primaryClass.title}>{primaryClass.title}</h3>
                                <input
                                  type="checkbox"
                                  checked={isFullySelected}
                                  onChange={() => {
                                      if (isFullySelected) {
                                          setSelectedClasses(prev => prev.filter(id => !allIds.includes(id)));
                                      } else {
                                          // Add missing ones
                                          const missing = allIds.filter(id => !selectedClasses.includes(id));
                                          setSelectedClasses(prev => [...prev, ...missing]);
                                      }
                                  }}
                                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer shrink-0"
                                />
                             </div>
                             
                             <div className="flex flex-wrap gap-2 mt-2">
                                 {/* Show aggregated status or just counts */}
                                 <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                    {cluster.length} horario{cluster.length > 1 ? 's' : ''}
                                 </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(primaryClass.level)}`}>
                                  {primaryClass.level}
                                </span>
                             </div>
                          </div>
                        </div>

                        {/* Distinct Time/Date Section */}
                        <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                             <div className="flex items-start gap-3 mb-2">
                                {/* Visual Calendar Date on Card */}
                                <div className={`flex flex-col items-center justify-center w-10 h-10 rounded border shrink-0 ${
                                  primaryClass.date ? 'bg-white border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-400'
                                }`}>
                                  <span className="text-[9px] font-bold uppercase leading-none">
                                    {primaryClass.date ? new Date(primaryClass.date).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '') : 'REC'}
                                  </span>
                                  <span className="text-sm font-bold leading-none mt-0.5">
                                    {primaryClass.date ? new Date(primaryClass.date).getDate() : <Clock className="w-3 h-3" />}
                                  </span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                       {primaryClass.date ? new Date(primaryClass.date).toLocaleDateString('es-ES', { weekday: 'long' }) : 'Horarios'}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-gray-900 font-bold text-sm">
                                      {primaryClass.date ? new Date(primaryClass.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : 'Ver detalles'}
                                    </div>
                                </div>
                             </div>
                             
                             {/* Expanded Schedules List */}
                             <div className="space-y-2 mt-3">
                                {cluster.map(cls => (
                                    <div key={cls.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                                                <Clock className="w-3 h-3" />
                                                {cls.date ? new Date(cls.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                                            </div>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase ${getStatusColor(cls.status || 'upcoming')}`}>
                                                {cls.status === 'upcoming' ? 'Activa' : cls.status === 'completed' ? 'Comp' : 'Canc'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <div className="flex items-center text-xs text-gray-500">
                                                <Users className="w-3 h-3 mr-1" />
                                                {cls.enrolled}/{cls.capacity}
                                             </div>
                                             
                                             {/* Mini Actions */}
                                             <button 
                                                onClick={() => { setSelectedClass(cls); setShowEditModal(true); }}
                                                className="text-gray-400 hover:text-blue-600 ml-1"
                                                title="Editar"
                                             >
                                                <Edit className="w-3 h-3" />
                                             </button>
                                             <button 
                                                onClick={() => { 
                                                  setSelectedClass(cls); 
                                                  setShowDuplicateModal(true);
                                                  if (cls.date) {
                                                    const d = new Date(cls.date);
                                                    setDuplicateData({
                                                      date: d.toISOString().split('T')[0],
                                                      time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
                                                    });
                                                  } else if (cls.nextSession) {
                                                    setDuplicateData({
                                                      date: cls.nextSession.date.split('T')[0],
                                                      time: cls.nextSession.time
                                                    });
                                                  }
                                                }}
                                                className="text-gray-400 hover:text-purple-600 ml-1"
                                                title="Duplicar"
                                             >
                                                <Copy className="w-3 h-3" />
                                             </button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Additional Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
                           <div className="flex items-center gap-2">
                              {/* Aggregate stats if needed */}
                           </div>
                           <div className="flex items-center gap-2 justify-end font-medium text-gray-900">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span>S/. {primaryClass.price}</span>
                           </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                         <span className="text-xs text-gray-500">
                            ID: {allIds.join(', ')}
                         </span>
                         {/* Bulk actions for this cluster could go here */}
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
              </>
              )}
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clases</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Aún no tienes clases programadas'
                : `No tienes clases ${filter === 'upcoming' ? 'próximas' : filter === 'completed' ? 'completadas' : 'canceladas'}`}
            </p>
            <button
              onClick={() => router.push('/dashboard/school/classes/new')}
              className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Primera Clase
            </button>
          </div>
        )}

        {/* Modales - Simplificados por ahora */}
        {showCreateModal && null}

        {showEditModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Editar Clase</h3>
              <p className="text-gray-600 mb-4">Editando: {selectedClass.title}</p>
              {(selectedClass.reservations?.length ?? 0) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Esta clase tiene {selectedClass.reservations?.length ?? 0} reserva(s) activa(s).</strong>
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Solo podrás editar: nombre, descripción, foto y otros detalles que no afecten la fecha, precio u horario.
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedClass(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    router.push(`/dashboard/school/classes/${selectedClass.id}/edit`);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4" onClick={() => setShowDeleteModal(false)}>
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Eliminar Clase</h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedClass(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800 font-medium mb-2">⚠️ Esta acción es permanente</p>
                  <p className="text-xs text-red-700">
                    La clase &quot;{selectedClass.title}&quot; será eliminada permanentemente y no se podrá recuperar.
                  </p>
                </div>

                {(selectedClass.reservations?.length ?? 0) > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      Esta clase tiene {(selectedClass.reservations?.length ?? 0)} reserva(s) activa(s).
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Al eliminar la clase, las reservas asociadas también se verán afectadas.
                    </p>
                  </div>
                )}

                <p className="text-gray-700 text-sm">
                  ¿Estás seguro de que deseas eliminar esta clase?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedClass(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteClass()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {showDuplicateModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4" onClick={() => setShowDuplicateModal(false)}>
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Duplicar Clase</h3>
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setSelectedClass(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Se creará una nueva sesión de <span className="font-semibold text-gray-900">&quot;{selectedClass.title}&quot;</span> con los mismos detalles, pero en la fecha que elijas.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Fecha</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={duplicateData.date}
                        onChange={(e) => setDuplicateData({ ...duplicateData, date: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Hora</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="time"
                        value={duplicateData.time}
                        onChange={(e) => setDuplicateData({ ...duplicateData, time: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setSelectedClass(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDuplicateClass}
                  disabled={!duplicateData.date || !duplicateData.time}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}