'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DiscountCode, School } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { Plus, Edit, Trash2, Search, X, Calendar, Percent, Hash, Building } from 'lucide-react';

interface DiscountCodeManagerProps {
    userRole: 'ADMIN' | 'SCHOOL_ADMIN';
}

export default function DiscountCodeManager({ userRole }: DiscountCodeManagerProps) {
    const { data: session } = useSession();
    const { showSuccess, showError } = useToast();

    const [codes, setCodes] = useState<DiscountCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [schools, setSchools] = useState<School[]>([]);
    const [loadingSchools, setLoadingSchools] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountPercentage: 0,
        validFrom: '',
        validTo: '',
        maxUses: '',
        isActive: true,
        schoolId: ''
    });

    useEffect(() => {
        fetchCodes();
        if (userRole === 'ADMIN') {
            fetchSchools();
        }
    }, [session, userRole]);

    const fetchCodes = async () => {
        try {
            const token = (session as any)?.backendToken;
            if (!token) {
                setLoading(false);
                return;
            }

            const headers: any = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch('/api/discount-codes', {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                setCodes(data);
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                showError(errorData.message || 'Error al cargar los códigos de descuento');
            }
        } catch (error) {
            console.error('Error fetching codes:', error);
            showError('Error al cargar los códigos de descuento');
        } finally {
            setLoading(false);
        }
    };

    const fetchSchools = async () => {
        try {
            setLoadingSchools(true);
            const token = (session as any)?.backendToken;
            if (!token) {
                console.warn('No token available for fetching schools');
                setLoadingSchools(false);
                return;
            }

            const headers: any = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch('/api/schools', {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Schools fetched:', data.length);
                setSchools(Array.isArray(data) ? data : []);
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                console.error('Error fetching schools:', errorData);
                showError('Error al cargar las escuelas');
                setSchools([]);
            }
        } catch (error) {
            console.error('Error fetching schools:', error);
            showError('Error al cargar las escuelas');
            setSchools([]);
        } finally {
            setLoadingSchools(false);
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
                maxUses: code.maxUses ? String(code.maxUses) : '',
                isActive: code.isActive,
                schoolId: code.schoolId ? String(code.schoolId) : ''
            });
        } else {
            setEditingCode(null);
            // Default dates: From now to 30 days later
            const now = new Date();
            const nextMonth = new Date();
            nextMonth.setDate(now.getDate() + 30);

            setFormData({
                code: '',
                description: '',
                discountPercentage: 0,
                validFrom: now.toISOString().slice(0, 16),
                validTo: nextMonth.toISOString().slice(0, 16),
                maxUses: '',
                isActive: true,
                schoolId: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = (session as any)?.backendToken;
            if (!token) {
                showError('No hay token de autenticación');
                setSaving(false);
                return;
            }

            // Convert datetime-local format to ISO datetime format
            const validFromISO = formData.validFrom ? new Date(formData.validFrom).toISOString() : '';
            const validToISO = formData.validTo ? new Date(formData.validTo).toISOString() : '';

            // Validate dates
            if (!validFromISO || !validToISO) {
                showError('Las fechas de validez son requeridas');
                setSaving(false);
                return;
            }

            const validFromDate = new Date(validFromISO);
            const validToDate = new Date(validToISO);
            
            if (validToDate <= validFromDate) {
                showError('La fecha de fin debe ser posterior a la fecha de inicio');
                setSaving(false);
                return;
            }

            const payload = {
                code: formData.code.trim().toUpperCase(),
                description: formData.description?.trim() || null,
                discountPercentage: Number(formData.discountPercentage),
                validFrom: validFromISO,
                validTo: validToISO,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
                maxUses: formData.maxUses && formData.maxUses.trim() !== '' ? Number(formData.maxUses) : null,
                schoolId: formData.schoolId && formData.schoolId.trim() !== '' ? Number(formData.schoolId) : null
            };

            // Validation
            if (userRole === 'SCHOOL_ADMIN' && payload.discountPercentage > 50) {
                showError('Como administrador de escuela, el descuento máximo es 50%');
                setSaving(false);
                return;
            }

            if (payload.discountPercentage < 0 || payload.discountPercentage > 100) {
                showError('El descuento debe estar entre 0% y 100%');
                setSaving(false);
                return;
            }

            if (!payload.code || payload.code.length < 3) {
                showError('El código debe tener al menos 3 caracteres');
                setSaving(false);
                return;
            }

            const url = editingCode
                ? `/api/discount-codes/${editingCode.id}`
                : '/api/discount-codes';

            const method = editingCode ? 'PUT' : 'POST';

            const headers: any = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            console.log('Sending payload:', payload);

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccess(editingCode ? 'Código actualizado correctamente' : 'Código creado correctamente');
                setIsModalOpen(false);
                fetchCodes();
            } else {
                console.error('Error response:', responseData);
                showError(responseData.message || 'Error al guardar el código');
            }
        } catch (error) {
            console.error('Error saving code:', error);
            showError('Error al guardar el código');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este código de descuento?')) return;

        try {
            const token = (session as any)?.backendToken;
            if (!token) return;

            const headers: any = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`/api/discount-codes/${id}`, {
                method: 'DELETE',
                headers
            });

            if (response.ok) {
                showSuccess('Código eliminado correctamente');
                fetchCodes();
            } else {
                showError('Error al eliminar el código');
            }
        } catch (error) {
            console.error('Error deleting code:', error);
            showError('Error al eliminar el código');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Códigos de Descuento</h2>
                    <p className="text-gray-500 text-sm">Gestiona los cupones y promociones</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Código
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-700">Código</th>
                                <th className="px-6 py-3 font-medium text-gray-700">Descuento</th>
                                <th className="px-6 py-3 font-medium text-gray-700">Validez</th>
                                <th className="px-6 py-3 font-medium text-gray-700">Usos</th>
                                <th className="px-6 py-3 font-medium text-gray-700">Estado</th>
                                {userRole === 'ADMIN' && (
                                    <th className="px-6 py-3 font-medium text-gray-700">Escuela</th>
                                )}
                                <th className="px-6 py-3 font-medium text-gray-700 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Cargando códigos...
                                    </td>
                                </tr>
                            ) : codes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No hay códigos de descuento creados.
                                    </td>
                                </tr>
                            ) : (
                                codes.map((code) => (
                                    <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold text-blue-600">{code.code}</div>
                                            {code.description && (
                                                <div className="text-xs text-gray-500 mt-0.5">{code.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {code.discountPercentage}% OFF
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="text-xs">
                                                <div>Desde: {new Date(code.validFrom).toLocaleDateString()}</div>
                                                <div>Hasta: {new Date(code.validTo).toLocaleDateString()}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {code.usedCount} / {code.maxUses || '∞'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${code.isActive
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {code.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        {userRole === 'ADMIN' && (
                                            <td className="px-6 py-4 text-gray-600">
                                                {code.school ? code.school.name : 'Global (Todas)'}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(code)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(code.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingCode ? 'Editar Código' : 'Nuevo Código'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Code & Percentage */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Código *
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                                            placeholder="VERANO2025"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descuento (%) *
                                    </label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            max={userRole === 'SCHOOL_ADMIN' ? "50" : "100"}
                                            value={formData.discountPercentage}
                                            onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {userRole === 'SCHOOL_ADMIN' && (
                                        <p className="text-xs text-gray-500 mt-1">Máximo 50% permitido</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Descuento especial de verano"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Válido Desde *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Válido Hasta *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.validTo}
                                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Limits & School */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Límite de Usos
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ilimitado"
                                    />
                                </div>

                                {userRole === 'ADMIN' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Escuela (Opcional)
                                        </label>
                                        <select
                                            value={formData.schoolId}
                                            onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            disabled={loadingSchools}
                                        >
                                            <option value="">Global (Todas)</option>
                                            {loadingSchools ? (
                                                <option disabled>Cargando escuelas...</option>
                                            ) : schools.length === 0 ? (
                                                <option disabled>No hay escuelas disponibles</option>
                                            ) : (
                                                schools.map(school => (
                                                    <option key={school.id} value={school.id}>
                                                        {school.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        {loadingSchools && (
                                            <p className="text-xs text-gray-500 mt-1">Cargando lista de escuelas...</p>
                                        )}
                                        {!loadingSchools && schools.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {schools.length} {schools.length === 1 ? 'escuela disponible' : 'escuelas disponibles'}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                    Código Activo
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end pt-4 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={saving}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : editingCode ? 'Actualizar' : 'Crear Código'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
