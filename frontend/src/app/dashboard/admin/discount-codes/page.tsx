'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Percent, Tag, CheckCircle, XCircle, Sparkles, AlertCircle, Info, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { useNotifications } from '@/hooks/useNotifications';
import { useConfirm } from '@/hooks/useConfirm';

interface DiscountCode {
  id: number;
  code: string;
  description?: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  maxUses?: number;
  usedCount: number;
  schoolId?: number;
  school?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminDiscountCodesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { success, error: showError, info } = useNotifications();
  const { confirm, ConfirmDialog } = useConfirm();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercentage: 10,
    validFrom: '',
    validTo: '',
    isActive: true,
    maxUses: '',
    schoolId: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    fetchCodes();
  }, [session, status, router]);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/discount-codes', { headers });
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      } else {
        setError('Error al cargar los códigos de descuento');
      }
    } catch (err) {
      console.error('Error fetching discount codes:', err);
      setError('Error al cargar los códigos de descuento');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (code?: DiscountCode) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        description: code.description || '',
        discountPercentage: code.discountPercentage,
        validFrom: new Date(code.validFrom).toISOString().slice(0, 16),
        validTo: new Date(code.validTo).toISOString().slice(0, 16),
        isActive: code.isActive,
        maxUses: code.maxUses?.toString() || '',
        schoolId: code.schoolId?.toString() || '',
      });
    } else {
      setEditingCode(null);
      setFormData({
        code: '',
        description: '',
        discountPercentage: 10,
        validFrom: '',
        validTo: '',
        isActive: true,
        maxUses: '',
        schoolId: '',
      });
    }
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCode(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload: any = {
        code: formData.code,
        description: formData.description || null,
        discountPercentage: Number(formData.discountPercentage),
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
        isActive: formData.isActive,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        schoolId: formData.schoolId ? Number(formData.schoolId) : null,
      };

      const url = editingCode 
        ? `/api/discount-codes/${editingCode.id}`
        : '/api/discount-codes';
      
      const method = editingCode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        handleCloseModal();
        fetchCodes();
        success(editingCode ? 'Código de descuento actualizado exitosamente' : 'Código de descuento creado exitosamente');
      } else {
        const errorData = await res.json();
        const errorMessage = errorData.message || 'Error al guardar el código de descuento';
        setError(errorMessage);
        showError(errorMessage);
      }
    } catch (err) {
      console.error('Error saving discount code:', err);
      setError('Error al guardar el código de descuento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const code = codes.find(c => c.id === id);
    const confirmed = await confirm({
      title: 'Eliminar código de descuento',
      message: `¿Estás seguro de que deseas eliminar el código "${code?.code}"? Esta acción no se puede deshacer.`,
      variant: 'danger'
    });
    
    if (!confirmed) {
      return;
    }

    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/discount-codes/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        fetchCodes();
        success(`Código "${code?.code}" eliminado exitosamente`);
      } else {
        const errorData = await res.json();
        const errorMessage = errorData.message || 'Error al eliminar el código de descuento';
        showError(errorMessage);
      }
    } catch (err) {
      console.error('Error deleting discount code:', err);
      showError('Error al eliminar el código de descuento');
    }
  };

  const isCodeValid = (code: DiscountCode) => {
    const now = new Date();
    const validFrom = new Date(code.validFrom);
    const validTo = new Date(code.validTo);
    return code.isActive && now >= validFrom && now <= validTo && 
           (code.maxUses === null || code.maxUses === undefined || code.usedCount < code.maxUses);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Códigos de Descuento</h1>
            <p className="text-gray-600 mt-1">Gestiona los códigos de descuento de la plataforma</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 sm:mt-0 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Nuevo Código
          </button>
        </div>

        {error && !showModal && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validez</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Escuela</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No hay códigos de descuento. Crea uno nuevo para comenzar.
                    </td>
                  </tr>
                ) : (
                  codes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-mono font-semibold text-gray-900">{code.code}</span>
                        </div>
                        {code.description && (
                          <div className="text-sm text-gray-500 mt-1">{code.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="font-semibold text-gray-900">{code.discountPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                          <div>
                            <div>{new Date(code.validFrom).toLocaleDateString('es-PE')}</div>
                            <div className="text-xs">hasta {new Date(code.validTo).toLocaleDateString('es-PE')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            code.maxUses !== null && code.maxUses !== undefined && code.usedCount >= code.maxUses 
                              ? 'text-red-600' 
                              : code.maxUses !== null && code.maxUses !== undefined && code.usedCount >= (code.maxUses * 0.8)
                              ? 'text-yellow-600'
                              : 'text-gray-700'
                          }`}>
                            {code.usedCount} / {code.maxUses ?? '∞'}
                          </span>
                          {code.maxUses !== null && code.maxUses !== undefined && (
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  code.usedCount >= code.maxUses 
                                    ? 'bg-red-500' 
                                    : code.usedCount >= (code.maxUses * 0.8)
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((code.usedCount / code.maxUses) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {code.school ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {code.school.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Global
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isCodeValid(code) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            {!code.isActive ? 'Inactivo' : new Date() < new Date(code.validFrom) ? 'Pendiente' : 'Expirado'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(code)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(code.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {editingCode ? 'Editar Código de Descuento' : 'Nuevo Código de Descuento'}
                </h2>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      pattern="[A-Z0-9_-]+"
                      placeholder="EJEMPLO2024"
                    />
                    <p className="text-xs text-gray-500 mt-1">Solo letras, números, guiones y guiones bajos</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Descripción del código de descuento"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Porcentaje de Descuento (%) *
                      </label>
                      <input
                        type="number"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usos Máximos
                      </label>
                      <input
                        type="number"
                        value={formData.maxUses}
                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        placeholder="Ilimitado (dejar vacío)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Válido Desde *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Válido Hasta *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.validTo}
                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID de Escuela (opcional)
                    </label>
                    <input
                      type="number"
                      value={formData.schoolId}
                      onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dejar vacío para código global"
                    />
                    <p className="text-xs text-gray-500 mt-1">Dejar vacío para crear un código global (válido para todas las escuelas)</p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Código activo
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : editingCode ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {ConfirmDialog}
      </div>
    </div>
  );
}

