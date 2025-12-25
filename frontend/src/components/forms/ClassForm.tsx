'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Plus, X, Upload, Link as LinkIcon, List, Calendar, Clock, 
  MapPin, Users, DollarSign, Award, Image as ImageIcon,
  CheckCircle2, Info, Save, Trash2, ArrowLeft, ChevronRight
} from 'lucide-react';
import { MultiDatePicker } from '@/components/ui/MultiDatePicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { useSession } from 'next-auth/react';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface Beach {
  id: number;
  name: string;
  location?: string;
  description?: string;
}

interface ClassFormData {
  // Product data
  title: string;
  description: string;
  duration: number;
  capacity: number;
  price: number;
  level: string;
  instructor: string;
  studentDetails: string;
  images: string[];
  beachId?: number;
  schoolId?: number;
  
  // Schedule data (Inventory)
  scheduleType: 'single' | 'recurring' | 'dateRange' | 'specificDates';
  // Specific date/time for 'single'
  date: string;
  time: string;
  // Options for 'recurring'
  selectedDays: DayOfWeek[];
  times: string[]; // Array of times for recurring or range
  startDate: string;
  weeksCount: number;
  // Options for 'dateRange'
  dateRangeStart: string;
  dateRangeEnd: string;
  // Options for 'specificDates'
  specificDates: string[];
}

interface ClassFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const DAYS: { label: string; value: DayOfWeek }[] = [
  { label: 'Lun', value: 'monday' },
  { label: 'Mar', value: 'tuesday' },
  { label: 'Mié', value: 'wednesday' },
  { label: 'Jue', value: 'thursday' },
  { label: 'Vie', value: 'friday' },
  { label: 'Sáb', value: 'saturday' },
  { label: 'Dom', value: 'sunday' }
];

export function ClassForm({ initialData, isEditing = false, onSuccess, onCancel }: ClassFormProps) {
  const { data: session } = useSession();
  const { showSuccess, showError, showWarning } = useToast();
  
  const [formData, setFormData] = useState<ClassFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    duration: initialData?.duration || 120,
    capacity: initialData?.defaultCapacity || initialData?.capacity || 8,
    price: initialData?.defaultPrice || initialData?.price || 90,
    level: initialData?.level || 'BEGINNER',
    instructor: initialData?.instructor || '',
    studentDetails: initialData?.studentDetails || '',
    images: initialData?.images && initialData.images.length > 0 ? initialData.images : [''],
    beachId: initialData?.beachId || undefined,
    schoolId: initialData?.schoolId || undefined,
    scheduleType: initialData?.scheduleType || 'single',
    date: initialData?.date || '',
    time: initialData?.time || '',
    selectedDays: initialData?.selectedDays || [],
    times: initialData?.times || [''],
    startDate: initialData?.startDate || '',
    weeksCount: initialData?.weeksCount || 4,
    dateRangeStart: initialData?.dateRangeStart || '',
    dateRangeEnd: initialData?.dateRangeEnd || '',
    specificDates: initialData?.specificDates || []
  });

  const [priceInput, setPriceInput] = useState<string>(String(formData.price));
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [showAddBeachModal, setShowAddBeachModal] = useState(false);
  const [newBeachName, setNewBeachName] = useState('');
  const [newBeachLocation, setNewBeachLocation] = useState('');
  const [addingBeach, setAddingBeach] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const headers: any = {};
        const token = (session as any)?.backendToken;
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Fetch beaches
        const beachesRes = await fetch('/api/beaches', { headers });
        if (beachesRes.ok) setBeaches(await beachesRes.json());

        // Fetch schools if admin
        if (((session as any)?.user?.role === 'ADMIN')) {
          const schoolsRes = await fetch('/api/schools', { headers });
          if (schoolsRes.ok) setSchools(await schoolsRes.json());
        }
      } catch (err) {
        console.error('Error fetching initial form data:', err);
      }
    };
    if (session) fetchInitialData();
  }, [session]);

  const handleAddBeach = async () => {
    if (!newBeachName.trim()) {
      showError('Error', 'El nombre de la playa es requerido');
      return;
    }

    try {
      setAddingBeach(true);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/beaches', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: newBeachName.trim(), location: newBeachLocation.trim() })
      });

      if (!res.ok) throw new Error('Error al crear la playa');
      
      const newBeach = await res.json();
      setBeaches(prev => [...prev, newBeach]);
      setFormData(prev => ({ ...prev, beachId: newBeach.id }));
      setShowAddBeachModal(false);
      setNewBeachName('');
      setNewBeachLocation('');
      showSuccess('Éxito', 'Playa agregada con éxito');
    } catch (err: any) {
      showError('Error', err.message);
    } finally {
      setAddingBeach(false);
    }
  };

  const handleInputChange = (field: keyof ClassFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setImageError('Solo se permiten archivos JPG, PNG o WebP');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('El archivo no debe superar 5MB');
      return;
    }

    setUploadingImage(true);
    setImageError('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      // Image upload route usually doesn't need auth or handles it differently?
      // Assuming public upload for now, or cookie based. 
      // Safe to verify if it needs it, but usually Next.js proxy might handle it if session exists?
      // Let's assume it works as is for now based on other code.
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: uploadData
      });

      if (!response.ok) throw new Error('Error al subir la imagen');
      
      const result = await response.json();
      if (!result.success || !result.url) throw new Error('No se recibió una URL válida');

      setFormData(prev => {
        const newImages = [...prev.images];
        const emptyIndex = newImages.findIndex(img => !img.trim());
        if (emptyIndex >= 0) newImages[emptyIndex] = result.url;
        else newImages.push(result.url);
        return { ...prev, images: newImages };
      });
    } catch (error) {
      setImageError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const addImageField = () => {
    if (formData.images.length < 5) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    }
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index).length === 0 ? [''] : prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDayToggle = (day: DayOfWeek) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const generateOccurrences = () => {
    const occurrences: { date: string; time: string }[] = [];
    const validTimes = formData.times.filter(t => t.trim() !== '');

    if (formData.scheduleType === 'single') {
      if (formData.date && formData.time) {
        occurrences.push({ date: formData.date, time: formData.time });
      }
    } else if (formData.scheduleType === 'recurring') {
      if (!formData.startDate || formData.selectedDays.length === 0 || validTimes.length === 0) return [];
      
      const start = new Date(formData.startDate);
      // JS Date.getDay(): 0=Sun, 1=Mon, ..., 6=Sat
      const dayMap: Record<DayOfWeek, number> = { 
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6 
      };

      const limitDate = new Date(start);
      limitDate.setDate(limitDate.getDate() + (formData.weeksCount * 7));
      
      let currentDate = new Date(start);
      
      // Prevent infinite loops if weeksCount is huge, though UI limits it
      while (currentDate < limitDate) {
         const currentDayIndex = currentDate.getDay(); // 0-6
         // Find which DayOfWeek constant corresponds to this index
         const currentDayName = Object.keys(dayMap).find(key => dayMap[key as DayOfWeek] === currentDayIndex) as DayOfWeek;
         
         if (formData.selectedDays.includes(currentDayName)) {
            const dateStr = currentDate.toISOString().split('T')[0];
            validTimes.forEach(time => {
               // Add occurrence for each selected time on this day
               occurrences.push({ date: dateStr, time });
            });
         }
         // Advance one day
         currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (formData.scheduleType === 'dateRange') {
      if (!formData.dateRangeStart || !formData.dateRangeEnd || !formData.time) return [];
      const start = new Date(formData.dateRangeStart);
      const end = new Date(formData.dateRangeEnd);
      let curr = new Date(start);
      while (curr <= end) {
        occurrences.push({ date: curr.toISOString().split('T')[0], time: formData.time });
        curr.setDate(curr.getDate() + 1);
      }
    } else if (formData.scheduleType === 'specificDates') {
      if (!formData.time || formData.specificDates.length === 0) return [];
      formData.specificDates.forEach(d => {
        occurrences.push({ date: d, time: formData.time });
      });
    }

    return occurrences;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const validImages = formData.images.filter(img => img.trim() !== '');
      if (validImages.length === 0) {
        showWarning('Imagen requerida', 'Debes incluir al menos una imagen.');
        setSaving(false);
        return;
      }

      const occurrences = generateOccurrences();
      console.log('XXX Generated occurrences:', occurrences);
      console.log('XXX Current Form Data:', formData);
      
      const productData = {
        title: formData.title,
        description: formData.description,
        duration: Number(formData.duration) || 120,
        capacity: Number(formData.capacity) || 8,
        price: Number(formData.price) || 0,
        level: formData.level,
        instructor: formData.instructor,
        studentDetails: formData.studentDetails,
        images: validImages,
      };

      const beachId = formData.beachId ? Number(formData.beachId) : undefined;
      const schoolId = formData.schoolId ? Number(formData.schoolId) : undefined;

      let url = isEditing ? `/api/classes/${initialData.id}` : '/api/classes/bulk';
      let method = isEditing ? 'PUT' : 'POST';
      
      let body: any;
      if (isEditing) {
        body = {
          ...productData,
          beachId,
          schoolId
        };
      } else {
        if (!occurrences || occurrences.length === 0) {
          showError('Error', 'Debes seleccionar al menos una fecha para la clase.');
          setSaving(false);
          return;
        }

        body = {
          baseData: productData,
          beachId,
          schoolId,
          occurrences
        };
      }

      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error en la operación');
      }

      showSuccess(isEditing ? 'Clase actualizada' : 'Clase creada', 'Los cambios se han guardado con éxito.');
      onSuccess();
    } catch (err: any) {
      showError('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* ProgressBar/Steps indicator could go here */}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: DETALLES BASICOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <List className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">1. Detalles de la Clase</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Título de la Clase *</label>
              <Input 
                value={formData.title} 
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="Ej: Curso de Surf Pro"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Descripción</label>
              <textarea 
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[120px] p-4 text-sm"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Explica de qué trata la clase..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nivel</label>
                <select 
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 text-sm"
                  value={formData.level}
                  onChange={e => handleInputChange('level', e.target.value)}
                >
                  <option value="BEGINNER">Principiante</option>
                  <option value="INTERMEDIATE">Intermedio</option>
                  <option value="ADVANCED">Avanzado</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Instructor</label>
                <Input 
                  value={formData.instructor}
                  onChange={e => handleInputChange('instructor', e.target.value)}
                  placeholder="Nombre del instructor"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Requisitos para el Estudiante (opcional)</label>
              <textarea 
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px] p-4 text-sm"
                value={formData.studentDetails}
                onChange={e => handleInputChange('studentDetails', e.target.value)}
                placeholder="Ej: Traer protector solar, saber nadar, etc."
              />
            </div>
            
            <div className={`grid grid-cols-1 ${(session as any)?.user?.role === 'ADMIN' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-6`}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Duración (minutos)</label>
                <Input 
                  type="number"
                  value={formData.duration}
                  onChange={e => handleInputChange('duration', Number(e.target.value))}
                />
              </div>

              {(session as any)?.user?.role === 'ADMIN' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Escuela Responsable</label>
                  <select 
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 text-sm"
                    value={formData.schoolId || ''}
                    onChange={e => handleInputChange('schoolId', e.target.value ? Number(e.target.value) : undefined)}
                    required
                  >
                    <option value="">Selecciona una escuela</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Playa / Locación</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 text-sm"
                    value={formData.beachId || ''}
                    onChange={e => handleInputChange('beachId', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Selecciona una playa</option>
                    {beaches.map(beach => (
                      <option key={beach.id} value={beach.id}>{beach.name}</option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddBeachModal(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para agregar playa */}
        {showAddBeachModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Agregar Nueva Playa</h3>
                <button onClick={() => setShowAddBeachModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nombre de la Playa</label>
                  <Input value={newBeachName} onChange={e => setNewBeachName(e.target.value)} placeholder="Ej: Playa Makaha" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Ubicación (opcional)</label>
                  <Input value={newBeachLocation} onChange={e => setNewBeachLocation(e.target.value)} placeholder="Ej: Miraflores, Lima" />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddBeachModal(false)}>Cancelar</Button>
                  <Button className="flex-1 bg-indigo-600 text-white" onClick={handleAddBeach} disabled={addingBeach}>
                    {addingBeach ? 'Agregando...' : 'Guardar Playa'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: PRECIO Y CAPACIDAD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-slate-900">2. Precio y Capacidad Predeterminada</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Precio Base (PEN) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">S/</span>
                <input 
                  type="number"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm font-semibold"
                  value={priceInput}
                  onChange={e => {
                    setPriceInput(e.target.value);
                    if (!isNaN(parseFloat(e.target.value))) handleInputChange('price', parseFloat(e.target.value));
                  }}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Capacidad Máxima (Cupos)</label>
              <Input 
                type="number"
                value={formData.capacity}
                onChange={e => handleInputChange('capacity', Number(e.target.value))}
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: IMAGENES */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">3. Imágenes del Producto</h2>
          </div>
          <div className="p-6 space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-100 transition-colors mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Subir imagen</span>
                  <span className="text-xs text-slate-500 mt-1">JPG, PNG o WebP (Máx 5MB)</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
                
                <div className="flex flex-col gap-2">
                   <div className="flex-1 flex gap-2">
                     <Input 
                        placeholder="Pegar URL de imagen..." 
                        value={imageUrl} 
                        onChange={e => setImageUrl(e.target.value)}
                        className="text-xs"
                     />
                     <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => {
                          if (imageUrl) {
                            setFormData(prev => ({
                              ...prev,
                              images: [...prev.images.filter(img => img !== ''), imageUrl]
                            }));
                            setImageUrl('');
                          }
                        }}
                     >
                        <Plus className="w-4 h-4" />
                     </Button>
                   </div>
                   {imageError && <p className="text-xs text-red-500 font-medium">{imageError}</p>}
                </div>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {formData.images.map((img, idx) => img && (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={img} alt="Vista previa" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <button 
                      type="button"
                      onClick={() => removeImageField(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* SECTION 4: PROGRAMACION (INVENTORY) */}
        {!isEditing && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">4. Programación (Inventario)</h2>
            </div>
            
            <div className="p-6 space-y-8">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'single', label: 'Día Único', icon: CheckCircle2 },
                  { value: 'recurring', label: 'Recurrente Weekly', icon: Clock },
                  { value: 'dateRange', label: 'Rango de Fechas', icon: Calendar },
                  { value: 'specificDates', label: 'Fechas Específicas', icon: Award }
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('scheduleType', type.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      formData.scheduleType === type.value 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </button>
                ))}
              </div>

              {/* SINGLE */}
              {formData.scheduleType === 'single' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Fecha</label>
                    <Input type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Hora</label>
                    <Input type="time" value={formData.time} onChange={e => handleInputChange('time', e.target.value)} />
                  </div>
                </div>
              )}

              {/* RECURRING */}
              {formData.scheduleType === 'recurring' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Desde la Fecha</label>
                      <Input type="date" value={formData.startDate} onChange={e => handleInputChange('startDate', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Por cuantas semanas?</label>
                      <select 
                        className="w-full rounded-xl border-slate-200 p-2.5 text-sm"
                        value={formData.weeksCount}
                        onChange={e => handleInputChange('weeksCount', Number(e.target.value))}
                      >
                        {[1,2,3,4,8,12].map(w => <option key={w} value={w}>{w} semanas</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700">Días de la semana</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(day => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleDayToggle(day.value)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            formData.selectedDays.includes(day.value)
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700">Horarios</label>
                    <div className="flex flex-wrap gap-3">
                      {formData.times.map((t, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input type="time" value={t} onChange={e => {
                            const nt = [...formData.times]; nt[idx] = e.target.value; handleInputChange('times', nt);
                          }} className="w-32" />
                          <Button 
                            type="button" variant="outline" size="sm"
                            disabled={formData.times.length === 1}
                            onClick={() => handleInputChange('times', formData.times.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="secondary" onClick={() => handleInputChange('times', [...formData.times, ''])}>
                        <Plus className="w-4 h-4 mr-1" /> Más hora
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* DATE RANGE */}
              {formData.scheduleType === 'dateRange' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Fecha Inicio</label>
                      <Input type="date" value={formData.dateRangeStart} onChange={e => handleInputChange('dateRangeStart', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Fecha Fin</label>
                      <Input type="date" value={formData.dateRangeEnd} onChange={e => handleInputChange('dateRangeEnd', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Hora</label>
                      <Input type="time" value={formData.time} onChange={e => handleInputChange('time', e.target.value)} />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl flex gap-3 text-blue-700 text-sm italic">
                    <Info className="w-5 h-5 shrink-0" />
                    <span>Se creará una sesión para cada día calendario entre las fechas seleccionadas.</span>
                  </div>
                </div>
              )}

              {/* SPECIFIC DATES */}
              {formData.scheduleType === 'specificDates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Días específicos</label>
                    <MultiDatePicker 
                      selectedDates={formData.specificDates}
                      onChange={dates => handleInputChange('specificDates', dates)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Hora para estos días</label>
                      <Input type="time" value={formData.time} onChange={e => handleInputChange('time', e.target.value)} />
                    </div>
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                       <h4 className="text-sm font-bold text-indigo-900 mb-2">Resumen de selección</h4>
                       <p className="text-xs text-indigo-700">
                         {formData.specificDates.length > 0 
                           ? `Se crearán sesiones para ${formData.specificDates.length} días específicos a las ${formData.time || '--:--'}.`
                           : 'No has seleccionado ninguna fecha aún.'}
                       </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-4 pb-12">
           <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
             Cancelar
           </Button>
           <Button type="submit" className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100" disabled={saving}>
             {saving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto y Sesiones')}
             {!saving && <ChevronRight className="w-4 h-4 ml-2" />}
           </Button>
        </div>
      </form>
    </div>
  );
}
