'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Class } from '@/types';
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Calendar, Clock, DollarSign, Users, Award, User, FileText, AlignLeft, Layers, Info, Plus as PlusIcon, MapPin } from 'lucide-react';
import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import ImageLibrary from '@/components/images/ImageLibrary';

interface Instructor {
  id: number;
  name: string;
  userId: number;
}

interface SchoolOption {
  id: number;
  name: string;
}

interface BeachOption {
  id: number;
  name: string;
  location?: string;
}

interface ClassFormProps {
  classData?: Class;
  onSubmit: (data: Partial<Class>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  schools?: SchoolOption[]; // For Admin mode
  beaches?: BeachOption[];
}

export default function ClassForm({ classData, onSubmit, onCancel, isLoading, schools, beaches }: ClassFormProps) {
  const { data: session } = useSession();
  // Estados para recurrencia
  const [isRecurring, setIsRecurring] = useState(classData?.isRecurring || false);
  const [startDate, setStartDate] = useState(classData?.startDate ? new Date(classData.startDate).toISOString().slice(0, 10) : '');
  const [endDate, setEndDate] = useState(classData?.endDate ? new Date(classData.endDate).toISOString().slice(0, 10) : '');
  const [selectedDays, setSelectedDays] = useState<number[]>(
    classData?.recurrencePattern?.days || []
  );
  // Default to one time slot if existing class or empty
  const [timeSlots, setTimeSlots] = useState<string[]>(
    classData?.recurrencePattern?.times || ['09:00']
  );

  const [formData, setFormData] = useState({
    title: classData?.title || '',
    description: classData?.description || '',
    date: classData?.date ? new Date(classData.date).toISOString().slice(0, 16) : '',
    duration: classData?.duration || 120,
    capacity: classData?.capacity || 5,
    price: classData?.price || 0,
    level: classData?.level || 'BEGINNER',
    instructor: classData?.instructor || '',
    studentDetails: '',
    images: classData?.images || [],
    schoolId: classData?.schoolId || (schools && schools.length > 0 ? schools[0].id : ''),
    beachId: classData?.beachId || ''
  });

  // ... (priceInput state) ...
  const [priceInput, setPriceInput] = useState<string>(String(formData.price || ''));

  // ... (image states) ...
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);
  const [isManualInstructor, setIsManualInstructor] = useState(false);

  // ... (other states) ...
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);

  // ... (useEffect for instructors) ...
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/instructors', { headers });
        if (response.ok) {
          const data = await response.json();
          const instructorList = Array.isArray(data)
            ? data.map((it: any) => ({
              id: it.id,
              name: it.user?.name ?? it.name ?? 'Instructor',
              userId: it.userId ?? it.user?.id
            }))
            : [];
          setInstructors(instructorList);
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        setLoadingInstructors(false);
      }
    };

    if (session) {
      fetchInstructors();
    }
  }, [session]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (schools && !formData.schoolId) newErrors.schoolId = 'Selecciona una escuela'; // Validate school if admin
    
    if (isRecurring) {
        if (!startDate) newErrors.startDate = 'Fecha inicio requerida';
        if (!endDate) newErrors.endDate = 'Fecha fin requerida';
        if (selectedDays.length === 0) newErrors.selectedDays = 'Selecciona al menos un día';
        if (timeSlots.length === 0) newErrors.timeSlots = 'Agrega al menos un horario';
    } else {
        if (!formData.date) newErrors.date = 'La fecha es requerida';
    }

    if (formData.duration < 30) newErrors.duration = 'La duración mínima es 30 minutos';
    if (formData.capacity < 1) newErrors.capacity = 'La capacidad debe ser al menos 1';
    if (formData.price < 0) newErrors.price = 'El precio no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Base data
    const submitData: any = {
      title: formData.title,
      description: formData.description || null,
      duration: Number(formData.duration),
      capacity: Number(formData.capacity),
      price: Number(formData.price),
      level: formData.level,
      instructor: formData.instructor || null,
      studentDetails: formData.studentDetails || null,
      images: formData.images.length > 0 ? formData.images : [],
      isRecurring,
      schoolId: schools ? Number(formData.schoolId) : undefined, // Send schoolId if in admin mode
      beachId: formData.beachId ? Number(formData.beachId) : null
    };

    if (isRecurring) {
        submitData.startDate = new Date(startDate).toISOString();
        submitData.endDate = new Date(endDate).toISOString();
        submitData.recurrencePattern = {
            days: selectedDays,
            times: timeSlots
        };
        // Set date to startDate for compatibility
        submitData.date = new Date(startDate).toISOString();
    } else {
        submitData.date = new Date(formData.date).toISOString();
    }

    await onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para agregar imagen por URL
  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      setImageError('Por favor ingresa una URL válida');
      return;
    }

    if (formData.images.length >= 5) {
      setImageError('Máximo 5 imágenes permitidas');
      return;
    }

    // Validar que sea una URL válida
    try {
      new URL(imageUrl);
    } catch {
      setImageError('URL inválida');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl.trim()]
    }));
    setImageUrl('');
    setImageError('');
  };

  // Función para subir archivo de imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setImageError('Solo se permiten archivos JPG, PNG o WebP');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('El archivo no debe superar 5MB');
      return;
    }

    if (formData.images.length >= 5) {
      setImageError('Máximo 5 imágenes permitidas');
      return;
    }

    setUploadingImage(true);
    setImageError('');

    try {
      // Subir imagen al servidor para obtener URL persistente
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('quality', '85');
      formDataUpload.append('width', '1200');

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formDataUpload
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al subir la imagen');
      }

      const result = await response.json();

      if (!result.success || !result.url) {
        throw new Error('No se recibió una URL válida del servidor');
      }

      // Usar la URL persistente del servidor
      const persistentUrl = result.url;

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, persistentUrl]
      }));

      // Limpiar el input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageError(error instanceof Error ? error.message : 'Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Función para eliminar imagen
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Función para seleccionar imagen de la biblioteca
  const handleSelectFromLibrary = (imageUrl: string) => {
    if (formData.images.length >= 5) {
      setImageError('Máximo 5 imágenes permitidas');
      return;
    }

    if (formData.images.includes(imageUrl)) {
      setImageError('Esta imagen ya está seleccionada');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
    setImageError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Información Básica */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Información Básica</h3>
        </div>
        
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
           {/* School Selector (Admin Only) */}
          {schools && schools.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Escuela <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="schoolId"
                  value={formData.schoolId}
                  onChange={handleChange}
                  className={`w-full pl-3 pr-10 py-2.5 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.schoolId ? 'border-red-300 focus:border-red-500' : 'border-gray-200'}`}
                  disabled={isLoading}
                >
                  <option value="">Selecciona una escuela</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              {errors.schoolId && <p className="text-red-500 text-xs flex items-center mt-1.5"><Info className="w-3 h-3 mr-1"/>{errors.schoolId}</p>}
            </div>
          )}

          {/* Beach Selector */}
          {beaches && beaches.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Playa / Ubicación
              </label>
              <div className="relative">
                <select
                  name="beachId"
                  value={formData.beachId}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  disabled={isLoading}
                >
                  <option value="">-- Selecciona una ubicación --</option>
                  {beaches.map(beach => (
                    <option key={beach.id} value={beach.id}>{beach.name} {beach.location ? `(${beach.location})` : ''}</option>
                  ))}
                </select>
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Título de la Clase <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Clase de Surf para Principiantes"
              className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-200'}`}
              disabled={isLoading}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1.5 flex items-center"><Info className="w-3 h-3 mr-1"/>{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe lo que aprenderán los alumnos..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* 2. Programación y Horario */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Programación</h3>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer group">
             <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isRecurring ? 'bg-purple-600' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform duration-300 ${isRecurring ? 'translate-x-4' : 'translate-x-0'}`}></div>
             </div>
             <input 
                type="checkbox" 
                checked={isRecurring} 
                onChange={(e) => setIsRecurring(e.target.checked)} 
                className="hidden" 
                disabled={isLoading}
             />
             <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors select-none">Clase Recurrente</span>
          </label>
        </div>

        <div className="p-5">
           {isRecurring ? (
            <div className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha Inicio <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)} 
                        className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${errors.startDate ? 'border-red-300' : 'border-gray-200'}`}
                        disabled={isLoading}
                      />
                      {errors.startDate && <p className="text-red-500 text-xs mt-1.5">{errors.startDate}</p>}
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha Fin <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)} 
                        className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${errors.endDate ? 'border-red-300' : 'border-gray-200'}`}
                        disabled={isLoading}
                       />
                       {errors.endDate && <p className="text-red-500 text-xs mt-1.5">{errors.endDate}</p>}
                   </div>
               </div>

               <div>
                 <label className="block text-xs font-semibold text-gray-600 mb-2">Días de la semana <span className="text-red-500">*</span></label>
                 <div className="flex gap-2 flex-wrap">
                     {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d, i) => (
                         <button 
                             type="button" 
                             key={i}
                             onClick={() => {
                                 if (selectedDays.includes(i)) setSelectedDays(selectedDays.filter(d => d !== i));
                                 else setSelectedDays([...selectedDays, i]);
                             }}
                             disabled={isLoading}
                             className={`
                               w-10 h-10 rounded-lg text-xs font-bold transition-all border
                               ${selectedDays.includes(i) 
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm scale-105' 
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-600'}
                             `}>
                             {d}
                         </button>
                     ))}
                 </div>
                 {errors.selectedDays && <p className="text-red-500 text-xs mt-1.5">{errors.selectedDays}</p>}
               </div>

               <div>
                   <label className="block text-xs font-semibold text-gray-600 mb-2">Horarios <span className="text-red-500">*</span></label>
                   <div className="flex flex-wrap gap-2">
                     {timeSlots.map((time, idx) => (
                       <div key={idx} className="flex items-center bg-purple-50 border border-purple-100 rounded-lg pl-3 pr-1 py-1 shadow-xs group hover:border-purple-300 transition-colors">
                           <input 
                             type="time" 
                             value={time} 
                             onChange={(e) => {
                               const newSlots = [...timeSlots];
                               newSlots[idx] = e.target.value;
                               setTimeSlots(newSlots);
                             }} 
                             className="bg-transparent border-none text-sm font-medium text-purple-700 focus:ring-0 p-0 w-18"
                             disabled={isLoading}
                           />
                           <button 
                               type="button" 
                               onClick={() => setTimeSlots(timeSlots.filter((_, i) => i !== idx))} 
                               className="ml-1 p-1 text-purple-400 hover:text-red-500 hover:bg-purple-100 rounded-md transition-colors"
                               disabled={isLoading}
                             >
                               <X className="w-3.5 h-3.5" />
                             </button>
                       </div>
                     ))}
                     <button 
                       type="button" 
                       onClick={() => setTimeSlots([...timeSlots, '09:00'])} 
                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-500 text-xs font-bold hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 transition-all"
                       disabled={isLoading}
                     >
                       <PlusIcon className="w-3.5 h-3.5" /> Agregar
                     </button>
                   </div>
                   {errors.timeSlots && <p className="text-red-500 text-xs mt-1.5">{errors.timeSlots}</p>}
               </div>
            </div>
           ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Fecha y Hora <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                   <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full pl-3 pr-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${errors.date ? 'border-red-300' : 'border-gray-200'
                      }`}
                    disabled={isLoading}
                  />
                  {/* <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/> */}
                </div>
                {errors.date && <p className="text-red-500 text-xs mt-1.5">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Duración (min) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      min="30"
                      step="15"
                      className={`w-full pl-3 pr-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${errors.duration ? 'border-red-300' : 'border-gray-200'}`}
                      disabled={isLoading}
                    />
                     <div className="absolute right-3 top-2.5 flex items-center gap-1 text-gray-400 pointer-events-none">
                        <Clock className="w-4 h-4" />
                     </div>
                </div>
                {errors.duration && <p className="text-red-500 text-xs mt-1.5">{errors.duration}</p>}
              </div>
            </div>
           )}
        </div>
      </div>

      {/* 3. Detalles de Capacidad y Precio */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
             <h3 className="text-sm font-semibold text-gray-900">Capacidad y Precio</h3>
         </div>
         <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
             {/* Level */}
             <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                 Nivel <span className="text-red-500">*</span>
               </label>
               <div className="relative">
                 <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full pl-9 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all appearance-none"
                    disabled={isLoading}
                  >
                    <option value="BEGINNER">Principiante</option>
                    <option value="INTERMEDIATE">Intermedio</option>
                    <option value="ADVANCED">Avanzado</option>
                  </select>
                  <Award className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
               </div>
             </div>

              {/* Capacity */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Capacidad Máx. <span className="text-red-500">*</span>
              </label>
               <div className="relative">
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full pl-9 px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all ${errors.capacity ? 'border-red-300' : 'border-gray-200'}`}
                    disabled={isLoading}
                  />
                   <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
               </div>
              {errors.capacity && <p className="text-red-500 text-xs mt-1.5">{errors.capacity}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Precio ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                 <input
                    type="number"
                    name="price"
                    value={priceInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPriceInput(value);
                      if (value !== '' && value !== '.') {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          setFormData(prev => ({ ...prev, price: numValue }));
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '.' || isNaN(parseFloat(value))) {
                        setPriceInput('0');
                        setFormData(prev => ({ ...prev, price: 0 }));
                      } else {
                        const numValue = parseFloat(value);
                        setPriceInput(String(numValue));
                        setFormData(prev => ({ ...prev, price: numValue }));
                      }
                    }}
                    min="0"
                    step="0.01"
                    className={`w-full pl-9 px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all ${errors.price ? 'border-red-300' : 'border-gray-200'}`}
                    disabled={isLoading}
                  />
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1.5">{errors.price}</p>}
            </div>
         </div>
      </div>

       {/* 4. Instructor y Detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Instructor Section */}
         <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Instructor</h3>
            </div>
            <div className="p-5 flex-1 flex flex-col">
               <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-600">Asignado a: <span className="text-red-500">*</span></label>
                   <button
                     type="button"
                     onClick={() => {
                       setIsManualInstructor(!isManualInstructor);
                       setFormData(prev => ({ ...prev, instructor: '' }));
                     }}
                     className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                   >
                     {isManualInstructor ? 'Volver a lista' : 'Entrada manual'}
                   </button>
               </div>
               
               <div className="relative">
                  {!isManualInstructor ? (
                    <select
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
                      disabled={isLoading || loadingInstructors}
                    >
                      <option value="">Selecciona un instructor</option>
                      {instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.name}>
                          {instructor.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                      <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      placeholder="Nombre del instructor..."
                      className="w-full pl-10 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      disabled={isLoading}
                    />
                  )}
                  <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
                     <User className="w-4 h-4" />
                  </div>
               </div>

                {loadingInstructors && !isManualInstructor && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 animate-pulse"><div className="w-2 h-2 rounded-full bg-gray-300"></div> Cargando lista...</p>
                )}
                {!loadingInstructors && instructors.length === 0 && !isManualInstructor && (
                  <div className="mt-3 p-2 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-100">
                    No hay instructores registrados. Usa la entrada manual.
                  </div>
                )}
            </div>
         </div>

         {/* Student Details Section */}
         <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <AlignLeft className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Notas</h3>
            </div>
            <div className="p-5 flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                   Detalles Adicionales
                </label>
                <textarea
                  name="studentDetails"
                  value={formData.studentDetails}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Información relevante para la clase o los estudiantes..."
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-[100px]"
                  disabled={isLoading}
                />
            </div>
         </div>
      </div>

       {/* 5. Multimedia */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-pink-100 text-pink-600 rounded-lg">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Galería de Imágenes</h3>
             </div>
             <span className="text-xs text-gray-500 font-medium bg-white px-2 py-0.5 rounded border border-gray-200">{formData.images.length}/5</span>
        </div>
        
        <div className="p-5 space-y-4">
             {/* Upload Area */}
             <div className="flex flex-col sm:flex-row gap-4">
                 <label className={`flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-pink-400 hover:bg-pink-50/30 transition-all group ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="p-3 bg-gray-50 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all mb-2">
                       <Upload className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-pink-600">
                      {uploadingImage ? 'Subiendo...' : 'Subir mis fotos'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG o WebP (max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isLoading || uploadingImage || formData.images.length >= 5}
                      className="hidden"
                    />
                 </label>
                 
                 <div className="flex-1 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setShowLibrary(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all group"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      Desde librería
                    </button>
                     
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2 focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-400 transition-all">
                       <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
                       <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setImageError('');
                          }}
                          onKeyPress={(e) => {
                             if (e.key === 'Enter') {
                               e.preventDefault();
                               handleAddImageUrl();
                             }
                          }}
                          placeholder="O pega una URL externa..."
                          className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 placeholder:text-gray-400"
                          disabled={isLoading || formData.images.length >= 5}
                        />
                        {imageUrl && (
                          <button 
                             type="button"
                             onClick={handleAddImageUrl}
                             className="text-xs font-bold text-pink-600 hover:bg-pink-50 px-2 py-1 rounded transition-colors"
                          >
                             OK
                          </button>
                        )}
                    </div>
                 </div>
             </div>

             {imageError && (
                 <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-1">
                    <X className="w-3 h-3" /> {imageError}
                 </div>
             )}

             {/* Gallery Grid */}
             {formData.images.length > 0 && (
                 <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-all">
                         <ImageWithFallback
                           src={img}
                           alt={`Class ${index}`}
                           fill
                           className="object-cover transition-transform duration-500 group-hover:scale-110"
                           fallbackSrc="/logoclasedesusrf.png"
                         />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                         <button
                           type="button"
                           onClick={() => handleRemoveImage(index)}
                           className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 transition-all hover:bg-white"
                         >
                           <X className="w-3 h-3" />
                         </button>
                      </div>
                    ))}
                 </div>
             )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 -mx-4 -mb-4 sm:mx-0 sm:mb-0 sm:bg-transparent">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 text-sm font-medium bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-sm flex items-center gap-2 transform active:scale-95"
        >
           {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {isLoading ? 'Guardando...' : classData ? 'Guardar Cambios' : 'Crear Clase'}
        </button>
      </div>

      {showLibrary && (
        <ImageLibrary
          onSelect={(url) => {
            handleSelectFromLibrary(url);
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
          selectedImages={formData.images}
          maxSelection={5}
        />
      )}
    </form>
  );
}
