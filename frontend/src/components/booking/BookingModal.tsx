'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDualCurrency } from '@/lib/currency'
import { ChevronRight, ChevronLeft, Check, Tag, Sparkles, X, Loader2 } from 'lucide-react'
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
}

const STEPS = [
  { id: 1, name: 'Información Personal', icon: '👤' },
  { id: 2, name: 'Detalles', icon: '📋' },
  { id: 3, name: 'Emergencia', icon: '🆘' }
]

export function BookingModal({ isOpen, onClose, classData, onSubmit }: BookingModalProps) {
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
    participants: 1,
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
        name: session.user.name || '',
        email: session.user.email || ''
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
        emergencyPhone: profile.phone || prev.emergencyPhone || ''
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
      if (!formData.email.includes('@')) newErrors.email = 'Email inválido'
      if (!formData.age || parseInt(formData.age) < 8) newErrors.age = 'La edad mínima es 8 años'
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

    const bookingData = {
      classId: classData.id,
      ...formData,
      totalAmount: finalPricePEN,
      originalAmount: basePricePEN,
      discountCode: discountInfo?.valid ? formData.discountCode.toUpperCase() : null,
      discountCodeId: discountInfo?.valid ? discountInfo.discountCodeId : null,
      discountAmount: discountAmount
    }

    onSubmit(bookingData)
  }

  // Calcular precio base
  const basePricePEN = classData.price * formData.participants // Precio en PEN (moneda base)
  
  // Aplicar descuento si existe
  const finalPricePEN = discountInfo?.valid && typeof discountInfo.finalAmount === 'number'
    ? discountInfo.finalAmount 
    : basePricePEN
  
  const totalPrices = formatDualCurrency(finalPricePEN)
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
      return formData.name && formData.email && formData.age && parseInt(formData.age) >= 8
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Progress */}
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 min-w-0 pr-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reservar Clase</h2>
              <p className="text-sm text-gray-600 truncate">{classData.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 touch-target"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep === step.id
                      ? 'bg-blue-600 text-white scale-110'
                      : currentStep > step.id || isStepComplete(step.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {currentStep > step.id || isStepComplete(step.id) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${currentStep === step.id ? 'text-blue-600 font-semibold' : 'text-gray-600'
                    }`}>
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded transition-all ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`h-12 ${errors.name ? 'border-red-500' : touchedFields.has('name') && formData.name ? 'border-green-500' : ''}`}
                  placeholder="Tu nombre completo"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`h-12 ${errors.email ? 'border-red-500' : touchedFields.has('email') && formData.email.includes('@') ? 'border-green-500' : ''}`}
                  placeholder="tu@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Edad *
                  </label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="8"
                    max="100"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`h-12 ${errors.age ? 'border-red-500' : touchedFields.has('age') && parseInt(formData.age) >= 8 ? 'border-green-500' : ''}`}
                    placeholder="25"
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
                    Participantes
                  </label>
                  <select
                    id="participants"
                    name="participants"
                    value={formData.participants}
                    onChange={handleInputChange}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: Math.min(classData.availableSpots || 1, 5) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'persona' : 'personas'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Additional Details */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Detalles Adicionales</h3>
              <p className="text-sm text-gray-600 mb-4">Estos campos son opcionales pero nos ayudan a brindarte una mejor experiencia</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="h-12"
                    placeholder="170"
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="h-12"
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    id="canSwim"
                    name="canSwim"
                    type="checkbox"
                    checked={formData.canSwim}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="canSwim" className="text-sm font-medium text-gray-700">
                    Sé nadar
                  </label>
                </div>

                <div>
                  <label htmlFor="swimmingLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel de natación
                  </label>
                  <select
                    id="swimmingLevel"
                    name="swimmingLevel"
                    value={formData.swimmingLevel}
                    onChange={handleInputChange}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BEGINNER">Principiante</option>
                    <option value="INTERMEDIATE">Intermedio</option>
                    <option value="ADVANCED">Avanzado</option>
                    <option value="EXPERT">Experto</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="injuries" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesiones o condiciones médicas
                </label>
                <textarea
                  id="injuries"
                  name="injuries"
                  rows={3}
                  value={formData.injuries}
                  onChange={handleInputChange}
                  placeholder="Describe cualquier lesión o condición que debamos conocer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Emergency Contact */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto de Emergencia</h3>

              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  type="text"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className={`h-12 ${errors.emergencyContact ? 'border-red-500' : touchedFields.has('emergencyContact') && formData.emergencyContact ? 'border-green-500' : ''}`}
                  placeholder="Nombre del contacto de emergencia"
                />
                {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
              </div>

              <div>
                <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <Input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  className={`h-12 ${errors.emergencyPhone ? 'border-red-500' : touchedFields.has('emergencyPhone') && formData.emergencyPhone ? 'border-green-500' : ''}`}
                  placeholder="+51 999 999 999"
                />
                {errors.emergencyPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone}</p>}
              </div>

              {/* Discount Code */}
              <div>
                <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>Código de Descuento</span>
                    <span className="text-xs text-gray-500 font-normal">(Opcional)</span>
                  </div>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="discountCode"
                      name="discountCode"
                      type="text"
                      value={formData.discountCode}
                      onChange={(e) => {
                        setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })
                        setDiscountInfo(null)
                      }}
                      onBlur={handleValidateDiscount}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && formData.discountCode.trim()) {
                          e.preventDefault()
                          handleValidateDiscount()
                        }
                      }}
                      className={`h-12 flex-1 font-mono pr-10 transition-all ${
                        discountInfo?.valid 
                          ? 'border-green-500 bg-green-50 focus:ring-green-500' 
                          : discountInfo?.valid === false
                          ? 'border-red-500 bg-red-50 focus:ring-red-500'
                          : ''
                      }`}
                      placeholder="EJEMPLO2024"
                    />
                    {discountInfo?.valid && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 animate-pulse">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                    {discountInfo?.valid === false && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">
                        <X className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleValidateDiscount}
                    disabled={validatingDiscount || !formData.discountCode.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                  >
                    {validatingDiscount ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Validando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Aplicar</span>
                      </>
                    )}
                  </button>
                </div>
                {discountInfo && (
                  <div className={`mt-2 p-3 rounded-lg transition-all animate-fadeIn ${
                    discountInfo.valid 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm font-medium flex items-center gap-2 ${
                      discountInfo.valid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {discountInfo.valid ? (
                        <>
                          <Check className="w-4 h-4" />
                          {discountInfo.message}
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          {discountInfo.message}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200 mt-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span>💰</span>
                  <span>Resumen de Precio</span>
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal ({formData.participants} {formData.participants === 1 ? 'persona' : 'personas'}):</span>
                    <span className="text-gray-900 font-medium">{formatDualCurrency(basePricePEN).pen}</span>
                  </div>
                  {discountInfo?.valid && discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm bg-green-50 p-2 rounded-md border border-green-200 animate-fadeIn">
                      <span className="text-green-700 font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Descuento aplicado:
                      </span>
                      <span className="text-green-700 font-bold">-{formatDualCurrency(discountAmount).pen}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-blue-300">
                  <span className="text-lg font-semibold text-gray-900">Total a pagar:</span>
                  <div className="text-right">
                    <div className={`text-2xl font-bold transition-all ${
                      discountInfo?.valid && discountAmount > 0 
                        ? 'text-green-600 animate-pulse' 
                        : 'text-blue-600'
                    }`}>
                      {totalPrices.pen}
                    </div>
                    <div className="text-sm text-gray-600">
                      {totalPrices.usd}
                    </div>
                    {discountInfo?.valid && discountAmount > 0 && (
                      <div className="text-xs text-green-600 mt-1 font-medium">
                        ¡Ahorras {formatDualCurrency(discountAmount).pen}!
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Opciones de pago:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>💵</span>
                      <span>Efectivo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💳</span>
                      <span>Tarjeta</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📱</span>
                      <span>Yape/Plin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Sticky Footer with Navigation */}
        <div className="bg-white border-t border-gray-200 p-4 sm:p-6 sticky bottom-0 safe-area-bottom">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 h-12 touch-target"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Anterior
              </Button>
            )}

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white touch-target"
              >
                Siguiente
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white touch-target"
              >
                <Check className="w-5 h-5 mr-2" />
                Confirmar Reserva
              </Button>
            )}
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