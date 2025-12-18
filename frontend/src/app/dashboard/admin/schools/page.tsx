"use client";

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import {
  Plus,
  Search,
  School as SchoolIcon,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  Upload,
  X,
  Image as ImageIcon,
  Building2,
  Calendar,
  Users,
  Star,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

interface School {
  id: number;
  name: string;
  location: string;
  description?: string;
  phone?: string;
  email?: string;
  logo?: string;
  coverImage?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  foundedYear?: number;
  rating?: number;
  totalReviews?: number;
  _count?: {
    classes: number;
    instructors: number;
    students: number;
  };
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function AdminSchoolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    phone: '',
    email: '',
    logo: '',
    coverImage: '',
    website: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    foundedYear: ''
  });

  // Image upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    fetchSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schools, searchQuery, activeTab]);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/schools', { headers });
      if (!res.ok) throw new Error('Failed to fetch schools');
      const data = await res.json();
      setSchools(data);
    } catch (err) {
      console.error(err);
      showError('Error', 'No se pudieron cargar las escuelas');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...schools];

    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(s => s.status === 'APPROVED' || !s.status);
    } else {
      filtered = filtered.filter(s => s.status === 'PENDING');
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(query) ||
        school.location.toLowerCase().includes(query) ||
        school.description?.toLowerCase().includes(query)
      );
    }

    setFilteredSchools(filtered);
  };

  const handleUpdateStatus = async (schoolId: number, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/schools/${schoolId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      showSuccess('Estado actualizado', `La escuela ha sido ${newStatus === 'APPROVED' ? 'aprobada' : 'rechazada'}`);
      await fetchSchools();
    } catch (err) {
      console.error(err);
      showError('Error', 'No se pudo actualizar el estado');
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'coverImage') => {
    if (!file.type.startsWith('image/')) {
      showError('Error', 'Solo se permiten archivos de imagen');
      return;
    }

    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingCover;
    setUploading(true);

    try {
      const token = (session as any)?.backendToken;
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'schools');

      const res = await fetch('/api/images/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formDataUpload
      });

      if (!res.ok) throw new Error('Error en la subida');

      const data = await res.json();
      setFormData(prev => ({ ...prev, [type]: data.url }));
      showSuccess('Imagen subida', 'La imagen se ha subido correctamente');
    } catch (error) {
      console.error('Upload error:', error);
      showError('Error', 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const createData: any = {
        name: formData.name,
        location: formData.location,
        description: formData.description || null,
        phone: formData.phone || null,
        email: formData.email || null,
        logo: formData.logo || null,
        coverImage: formData.coverImage || null,
        website: formData.website || null,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        whatsapp: formData.whatsapp || null,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null
      };

      const res = await fetch('/api/schools', {
        method: 'POST',
        headers,
        body: JSON.stringify(createData)
      });

      if (!res.ok) throw new Error('Failed to create school');

      await fetchSchools();
      resetForm();
      setShowCreateModal(false);
      showSuccess('¡Escuela creada!', 'La escuela se creó correctamente');
    } catch (err) {
      console.error(err);
      showError('Error al crear', 'No se pudo crear la escuela');
    }
  };

  const handleEditSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;

    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const updateData: any = {
        name: formData.name,
        location: formData.location,
        description: formData.description || null,
        phone: formData.phone || null,
        email: formData.email || null,
        logo: formData.logo || null,
        coverImage: formData.coverImage || null,
        website: formData.website || null,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        whatsapp: formData.whatsapp || null,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null
      };

      const res = await fetch(`/api/schools/${selectedSchool.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to update school');

      await fetchSchools();
      resetForm();
      setShowEditModal(false);
      setSelectedSchool(null);
      showSuccess('¡Escuela actualizada!', 'Los cambios se guardaron correctamente');
    } catch (err) {
      console.error(err);
      showError('Error al actualizar', 'No se pudo actualizar la escuela');
    }
  };

  const handleDeleteSchool = async () => {
    if (!selectedSchool) return;

    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/schools/${selectedSchool.id}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || 'No se pudo eliminar la escuela');
      }

      await fetchSchools();
      setShowDeleteModal(false);
      setSelectedSchool(null);
      showSuccess('¡Escuela eliminada!', 'La escuela fue eliminada correctamente');
    } catch (err: any) {
      console.error('Error deleting school:', err);
      showError('Error al eliminar', err.message || 'No se pudo eliminar la escuela');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      description: '',
      phone: '',
      email: '',
      logo: '',
      coverImage: '',
      website: '',
      instagram: '',
      facebook: '',
      whatsapp: '',
      foundedYear: ''
    });
  };

  const openEditModal = (school: School) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      location: school.location,
      description: school.description || '',
      phone: school.phone || '',
      email: school.email || '',
      logo: school.logo || '',
      coverImage: school.coverImage || '',
      website: school.website || '',
      instagram: school.instagram || '',
      facebook: school.facebook || '',
      whatsapp: school.whatsapp || '',
      foundedYear: school.foundedYear?.toString() || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (school: School) => {
    setSelectedSchool(school);
    setShowDeleteModal(true);
  };

  const renderImageUploadSection = (type: 'logo' | 'coverImage') => {
    const isLogo = type === 'logo';
    const uploading = isLogo ? uploadingLogo : uploadingCover;
    const currentImage = formData[type];
    const label = isLogo ? 'Logo de la Escuela' : 'Imagen de Portada';
    const aspectClass = isLogo ? 'aspect-square' : 'aspect-video';

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        
        {currentImage ? (
          <div className={`relative ${aspectClass} w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200`}>
            <ImageWithFallback
              src={currentImage}
              alt={label}
              fill
              className="object-cover"
              fallbackComponent={
                <div className="flex w-full h-full items-center justify-center bg-gray-100 text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              }
            />
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, [type]: '' }))}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className={`${aspectClass} w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50`}>
            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click para subir {isLogo ? 'logo' : 'portada'}</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, type);
                }}
                disabled={uploading}
              />
            </label>
          </div>
        )}
      </div>
    );
  };

  const renderForm = (isEdit: boolean) => (
    <form onSubmit={isEdit ? handleEditSchool : handleCreateSchool} className="space-y-6">
      {/* Images Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderImageUploadSection('logo')}
        {renderImageUploadSection('coverImage')}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Social Media & Web */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año de Fundación</label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.foundedYear}
            onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
          <input
            type="text"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            placeholder="@usuario"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
          <input
            type="text"
            value={formData.facebook}
            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
            placeholder="URL de Facebook"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
          <input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            placeholder="+51 999 999 999"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => {
            resetForm();
            isEdit ? setShowEditModal(false) : setShowCreateModal(false);
          }}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isEdit ? 'Guardar Cambios' : 'Crear Escuela'}
        </button>
      </div>
    </form>
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando escuelas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Escuelas</h1>
              <p className="text-gray-600 mt-2">Administra todas las escuelas del sistema</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Escuela
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                activeTab === 'active'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Escuelas Activas
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                activeTab === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Solicitudes Pendientes
              {schools.filter(s => s.status === 'PENDING').length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                  {schools.filter(s => s.status === 'PENDING').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, ubicación o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.length > 0 ? (
            filteredSchools.map((school) => (
              <div key={school.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {/* Cover Image */}
                <div className="relative h-48 bg-linear-to-br from-blue-500 to-blue-600">
                  {school.coverImage ? (
                    <ImageWithFallback
                      src={school.coverImage}
                      alt={school.name}
                      fill
                      className="object-cover"
                      fallbackComponent={
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-white/30" />
                        </div>
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                </div>

                {/* Logo */}
                <div className="relative px-6 -mt-12">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                    {school.logo ? (
                      <ImageWithFallback
                        src={school.logo}
                        alt={`${school.name} logo`}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                        fallbackComponent={
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <SchoolIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <SchoolIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{school.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {school.location}
                  </div>

                  {school.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{school.description}</p>
                  )}

                  {/* Stats */}
                  {school._count && (
                    <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{school._count.classes || 0}</div>
                        <div className="text-xs text-gray-500">Clases</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{school._count.instructors || 0}</div>
                        <div className="text-xs text-gray-500">Instructores</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{school._count.students || 0}</div>
                        <div className="text-xs text-gray-500">Estudiantes</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {/* Actions */}
                  <div className="flex gap-2">
                    {activeTab === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(school.id, 'APPROVED')}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(school.id, 'REJECTED')}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/schools/${school.id}`}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Perfil
                        </Link>
                        <button
                          onClick={() => openEditModal(school)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => openDeleteModal(school)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <SchoolIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {activeTab === 'active' 
                  ? 'No se encontraron escuelas activas' 
                  : 'No hay solicitudes pendientes'}
              </p>
              {activeTab === 'active' && (
                <p className="text-gray-500 mt-2">Crea tu primera escuela para comenzar</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Crear Nueva Escuela</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {renderForm(false)}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSchool && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Editar Escuela</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {renderForm(true)}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedSchool && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar la escuela <strong>"{selectedSchool.name}"</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteSchool}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
