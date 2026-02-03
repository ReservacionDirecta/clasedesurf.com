'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDualCurrency } from '@/lib/currency'
import { ChevronRight, ChevronLeft, Check, Tag, Sparkles, X, Loader2, ChevronDown, AlertCircle } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

interface School {
  id?: number | string
  name?: string
  location?: string
  phone?: string
  email?: string
  rating?: number
  totalReviews?: number
}

interface ClassData {
  id: string
  title: string
  description: string
  date: Date
  startTime: Date
  endTime: Date
  price: number
  currency: string
  level: string
  type: string
  location?: string
  instructorName?: string
  capacity: number
  availableSpots?: number
  images?: string[]
  school?: School
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  classData: ClassData
  onSubmit: (bookingData: any) => void
  initialParticipants?: number
  addons?: { id: number; name: string; price: number }[]
}


const STEPS = [
  { id: 1, name: 'Información Personal', icon: '👤' },
  { id: 2, name: 'Detalles', icon: '📋' },
  { id: 3, name: 'Emergencia', icon: '🆘' }
]

export function BookingModal({ isOpen, onClose, classData, onSubmit, initialParticipants = 1, addons = [] }: BookingModalProps) {
  const { data: session } = useSession()
  const { success, error: showError } = useNotifications()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    canSwim: false,
    swimmingLevel: 'BEGINNER',
    hasSurfedBefore: false,
    injuries: '',
    emergencyContact: '',
    emergencyPhone: '',
    participants: initialParticipants,
    specialRequest: '',
    discountCode: ''
  })
  
  const [discountInfo, setDiscountInfo] = useState<{
    valid: boolean;
    discountCodeId?: number;
    discountAmount?: number;
    finalAmount?: number;
    message?: string;
  } | null>(null)
  const [validatingDiscount, setValidatingDiscount] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const formRef = useRef<HTMLFormElement>(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Pre-fill user data
  useEffect(() => {
    if (session?.user && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || session.user.name || '',
        email: prev.email || session.user.email || ''
      }))

      if (session.user.role === 'STUDENT') {
        loadStudentProfile()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isOpen])

  // Reset step when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1)
      setTouchedFields(new Set())
    }
  }, [isOpen])

  const loadStudentProfile = async () => {
    try {
      setLoadingProfile(true)
      const token = (session as any)?.backendToken

      if (!token) return

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) return

      const profile = await response.json()

      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name || session?.user?.name || '',
        email: profile.email || prev.email || session?.user?.email || '',
        age: profile.age ? profile.age.toString() : prev.age,
        height: profile.height ? profile.height.toString() : prev.height,
        weight: profile.weight ? profile.weight.toString() : prev.weight,
        canSwim: profile.canSwim !== undefined ? profile.canSwim : prev.canSwim,
        injuries: profile.injuries || prev.injuries,
        emergencyContact: profile.emergencyContact || prev.emergencyContact || '',
        emergencyPhone: profile.emergencyPhone || profile.phone || prev.emergencyPhone || ''
      }))
    } catch (error) {
      console.error('Error loading student profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Si cambia el número de participantes, revalidar el descuento
    if (name === 'participants' && discountInfo?.valid) {
      setTimeout(() => handleValidateDiscount(), 100)
    }

    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(name))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'
      if (!formData.email.trim()) newErrors.email = 'El email es requerido'
      else if (!formData.email.includes('@')) newErrors.email = 'Email inválido'
      
      const ageNum = Number(formData.age)
      if (!formData.age || isNaN(ageNum) || ageNum < 8 || ageNum > 120) {
        newErrors.age = 'Ingresa una edad válida (mínimo 8 años)'
      }
    }

    if (step === 3) {
      if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Contacto de emergencia requerido'
      if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Teléfono de emergencia requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(prev => prev + 1)
        // Scroll to top of form
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all steps
    if (!validateStep(1) || !validateStep(3)) {
      // Go to first step with errors
      if (errors.name || errors.email || errors.age) {
        setCurrentStep(1)
      } else if (errors.emergencyContact || errors.emergencyPhone) {
        setCurrentStep(3)
      }
      return
    }

    // Build participants array with all profile data for persistence
    const participantsArray = Array.from({ length: formData.participants }, (_, i) => ({
      name: i === 0 ? formData.name : `Participante ${i + 1}`,
      email: i === 0 ? formData.email : undefined,
      age: i === 0 ? formData.age : undefined,
      height: i === 0 ? formData.height : undefined,
      weight: i === 0 ? formData.weight : undefined,
      canSwim: i === 0 ? formData.canSwim : undefined,
      swimmingLevel: i === 0 ? formData.swimmingLevel : undefined,
      hasSurfedBefore: i === 0 ? formData.hasSurfedBefore : undefined,
      injuries: i === 0 ? formData.injuries : undefined,
      emergencyContact: i === 0 ? formData.emergencyContact : undefined,
      emergencyPhone: i === 0 ? formData.emergencyPhone : undefined
    }))

    const bookingData = {
      classId: classData.id,
      participants: participantsArray,
      specialRequest: formData.specialRequest,
      totalAmount: finalPricePEN,
      originalAmount: basePricePEN,
      discountCode: discountInfo?.valid ? formData.discountCode.toUpperCase() : null,
      discountCodeId: discountInfo?.valid ? discountInfo.discountCodeId : null,
      discountAmount: discountAmount,
      products: addons.map(a => ({ id: a.id, quantity: 1 }))
    }


    onSubmit(bookingData)
  }

  // Calcular precio base
  const basePricePEN = classData.price * formData.participants // Precio en PEN (moneda base)
  
  // Aplicar descuento si existe
  const finalPricePEN = discountInfo?.valid && typeof discountInfo.finalAmount === 'number'
    ? discountInfo.finalAmount 
    : basePricePEN

  const addonsTotal = addons.reduce((sum, item) => sum + item.price, 0)
  const totalWithAddons = (finalPricePEN || 0) + addonsTotal
  
  const totalPrices = formatDualCurrency(totalWithAddons)
  const discountAmount = discountInfo?.valid && discountInfo.discountAmount 
    ? discountInfo.discountAmount 
    : 0

  // Validar código de descuento
  const handleValidateDiscount = async () => {
    if (!formData.discountCode.trim()) {
      setDiscountInfo(null)
      return
    }

    setValidatingDiscount(true)
    try {
      const res = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.discountCode.toUpperCase(),
          amount: basePricePEN,
          classId: classData.id
        })
      })

      const data = await res.json()
      
      if (data.valid) {
        setDiscountInfo({
          valid: true,
          discountCodeId: data.discountCodeId,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount,
          message: `Descuento de ${data.discountCode.discountPercentage}% aplicado`
        })
        success(`¡Código "${data.discountCode.code}" aplicado! Ahorras ${formatDualCurrency(data.discountAmount).pen}`)
      } else {
        setDiscountInfo({
          valid: false,
          message: data.message || 'Código de descuento inválido'
        })
        showError(data.message || 'Código de descuento inválido')
      }
    } catch (err) {
      console.error('Error validating discount code:', err)
      setDiscountInfo({
        valid: false,
        message: 'Error al validar el código de descuento'
      })
      showError('Error al validar el código de descuento. Por favor, intenta de nuevo.')
    } finally {
      setValidatingDiscount(false)
    }
  }

  const isStepComplete = (step: number) => {
    if (step === 1) {
      const ageNum = Number(formData.age)
      return formData.name && formData.email && formData.age && !isNaN(ageNum) && ageNum >= 8
    }
    if (step === 2) {
      return true // Optional fields
    }
    if (step === 3) {
      return formData.emergencyContact && formData.emergencyPhone
    }
    return false
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full h-[92dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-xl flex flex-col transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header with Progress */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-5 shrink-0 rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Reservar Clase</h2>
              <p className="text-sm text-blue-100 truncate">{classData.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 text-white/80 hover:text-white active:scale-95"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps - More compact */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep > step.id ? 'bg-white text-blue-600' : 
                  currentStep === step.id ? 'bg-white text-blue-600 ring-2 ring-white/50' : 
                  'bg-blue-500/50 text-white/70'
                }`}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded ${currentStep > step.id ? 'bg-white' : 'bg-blue-500/50'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content - Tighter padding */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="mb-2">
                 <h3 className="text-base font-bold text-slate-900">Cuéntanos sobre ti</h3>
                 <p className="text-slate-500 text-xs">Necesitamos tus datos para asegurar tu lugar.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`h-12 px-4 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.name ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Ej. Juan Pérez"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`h-12 px-4 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="juan@ejemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="age" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Edad <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="8"
                      max="100"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`h-12 px-4 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.age ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                      placeholder="25"
                    />
                    {errors.age && <p className="text-red-500 text-xs mt-1 font-medium">{errors.age}</p>}
                  </div>

                  <div>
                    <label htmlFor="participants" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Participantes
                    </label>
                    <div className="relative">
                        <select
                          id="participants"
                          name="participants"
                          value={formData.participants}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none font-medium text-slate-900 cursor-pointer hover:bg-slate-100"
                        >
                          {Array.from({ length: Math.min(classData.availableSpots || 1, 10) }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 0 ? 'persona' : 'personas'}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Additional Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
               <div className="space-y-1 mb-6">
                 <h3 className="text-lg font-bold text-slate-900">Personaliza tu experiencia</h3>
                 <p className="text-slate-500 text-sm">Ayúdanos a preparar el equipo adecuado para ti.</p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="height" className="block text-sm font-bold text-slate-700 mb-2">
                    Altura (cm)
                  </label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    min="100"
                    max="250"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="h-14 px-4 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base"
                    placeholder="170"
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-bold text-slate-700 mb-2">
                    Peso (kg)
                  </label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min="20"
                    max="200"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="h-14 px-4 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base"
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setFormData(prev => ({...prev, canSwim: !prev.canSwim}))}>
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${formData.canSwim ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                        {formData.canSwim && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="font-bold text-slate-700">Sé nadar</span>
                 </div>

                <div>
                  <label htmlFor="swimmingLevel" className="block text-sm font-bold text-slate-700 mb-2">
                    Nivel de experiencia
                  </label>
                   <div className="relative">
                      <select
                        id="swimmingLevel"
                        name="swimmingLevel"
                        value={formData.swimmingLevel}
                        onChange={handleInputChange}
                        className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none font-medium text-slate-900 cursor-pointer"
                      >
                        <option value="BEGINNER">Principiante (Primera vez)</option>
                        <option value="INTERMEDIATE">Intermedio (Algunas veces)</option>
                        <option value="ADVANCED">Avanzado (Consistente)</option>
                        <option value="EXPERT">Experto</option>
                      </select>
                       <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                   </div>
                </div>
              </div>

              <div>
                <label htmlFor="injuries" className="block text-sm font-bold text-slate-700 mb-2">
                  ¿Alguna lesión o condición médica?
                </label>
                <textarea
                  id="injuries"
                  name="injuries"
                  rows={3}
                  value={formData.injuries}
                  onChange={handleInputChange}
                  placeholder="Ej. Lesión antigua en hombro derecho..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-base resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Emergency Contact & Payment */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn pb-2">
              <div className="mb-2">
                 <h3 className="text-base font-bold text-slate-900">Contacto de Emergencia</h3>
                 <p className="text-slate-500 text-xs">Por seguridad, necesitamos un contacto adicional.</p>
              </div>
              
              {/* Emergency fields in 2-column grid for better space usage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="emergencyContact" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="text"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className={`h-12 px-4 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.emergencyContact ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Nombre del contacto"
                  />
                  {errors.emergencyContact && <p className="text-red-500 text-xs mt-1 font-medium">{errors.emergencyContact}</p>}
                </div>

                <div>
                  <label htmlFor="emergencyPhone" className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className={`h-12 px-4 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.emergencyPhone ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="+51 999 999 999"
                  />
                  {errors.emergencyPhone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.emergencyPhone}</p>}
                </div>
              </div>

                 {/* Discount Code */}
                 <div className="pt-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Código de Descuento</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                         <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <Input
                           value={formData.discountCode}
                           onChange={(e) => {
                             setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })
                             setDiscountInfo(null)
                           }}
                           onBlur={handleValidateDiscount}
                           onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleValidateDiscount();
                                }
                           }}
                           className={`h-12 pl-10 uppercase font-mono tracking-wider rounded-xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 ${discountInfo?.valid ? 'border-green-500 bg-green-50/30 text-green-700' : ''}`}
                           placeholder="CODIGO2026"
                         />
                         {validatingDiscount && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />}
                      </div>
                      <Button
                        type="button"
                        onClick={handleValidateDiscount}
                        disabled={!formData.discountCode || validatingDiscount}
                        variant="ghost"
                        className="h-12 px-4 font-bold text-blue-600 hover:bg-blue-50"
                      >
                        Aplicar
                      </Button>
                    </div>
                    {discountInfo && (
                        <div className={`mt-2 text-xs font-bold flex items-center gap-1.5 animate-fadeIn ${discountInfo.valid ? 'text-green-600' : 'text-red-500'}`}>
                            {discountInfo.valid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {discountInfo.message}
                        </div>
                    )}
                 </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Resumen de Orden</h4>
                
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>Subtotal ({formData.participants} {formData.participants === 1 ? 'persona' : 'personas'})</span>
                      <span className="font-semibold text-slate-900">{formatDualCurrency(basePricePEN).pen}</span>
                   </div>
                   
                   {addons.length > 0 && (
                       <div className="flex justify-between items-start text-sm text-slate-600">
                          <span>Adicionales ({addons.length})</span>
                          <span className="font-semibold text-slate-900">+{formatDualCurrency(addonsTotal).pen}</span>
                       </div>
                   )}

                   {discountInfo?.valid && discountAmount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
                         <span className="flex items-center gap-1.5 font-bold"><Sparkles className="w-3 h-3" /> Descuento</span>
                         <span className="font-bold">-{formatDualCurrency(discountAmount).pen}</span>
                      </div>
                   )}

                   <div className="h-px bg-slate-200 my-2"></div>

                   <div className="flex justify-between items-end">
                      <div>
                         <span className="text-base font-bold text-slate-900">Total a Pagar</span>
                         <p className="text-xs text-slate-500 font-medium">Incluye impuestos y tasas</p>
                      </div>
                      <div className="text-right">
                         <div className="text-2xl font-black text-slate-900 leading-none">{totalPrices.pen}</div>
                         <div className="text-sm font-medium text-slate-500 mt-1">{totalPrices.usd}</div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Sticky Footer */}
        <div className="bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 sm:p-6 shrink-0 safe-area-bottom">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="h-14 w-14 flex items-center justify-center rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            
            <Button
              type="button" // Controlled by onClick logic, simpler than form submit
              onClick={currentStep < STEPS.length ? handleNext : (e) => handleSubmit(e as any)}
              className="flex-1 h-14 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {currentStep < STEPS.length ? (
                 <>Siguiente <ChevronRight className="w-5 h-5 opacity-60" /></> 
              ) : (
                 <>Confirmar Reserva <Check className="w-5 h-5 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
        
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 1rem);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}