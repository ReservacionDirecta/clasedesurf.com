'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDualCurrency } from '@/lib/currency'

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
  images?: string[]  // Array de URLs de imágenes
  school?: School
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  classData: ClassData
  onSubmit: (bookingData: any) => void
}

export function BookingModal({ isOpen, onClose, classData, onSubmit }: BookingModalProps) {
  const { data: session } = useSession()
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
    specialRequest: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Pre-llenar datos del usuario logueado y su perfil
  useEffect(() => {
    if (session?.user && isOpen) {
      // Pre-llenar datos básicos de la sesión
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))

      // Si el usuario es estudiante, cargar su perfil completo
      if (session.user.role === 'STUDENT') {
        loadStudentProfile()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isOpen])

  const loadStudentProfile = async () => {
    try {
      setLoadingProfile(true)
      const token = (session as any)?.backendToken
      
      if (!token) {
        console.log('No token available to load profile')
        return
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        console.log('Failed to load profile, using session data only')
        return
      }

      const profile = await response.json()
      console.log('Profile loaded:', profile)

      // Pre-llenar campos con datos del perfil
      setFormData(prev => {
        const updated = {
          ...prev,
          name: profile.name || prev.name || session?.user?.name || '',
          email: profile.email || prev.email || session?.user?.email || '',
          age: profile.age ? profile.age.toString() : prev.age,
          height: profile.height ? profile.height.toString() : prev.height,
          weight: profile.weight ? profile.weight.toString() : prev.weight,
          canSwim: profile.canSwim !== undefined ? profile.canSwim : prev.canSwim,
          injuries: profile.injuries || prev.injuries,
          emergencyPhone: profile.phone || prev.emergencyPhone || ''
        }
        return updated
      })
    } catch (error) {
      console.error('Error loading student profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  if (!isOpen) return null

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!formData.email.trim()) newErrors.email = 'El email es requerido'
    if (!formData.email.includes('@')) newErrors.email = 'Email inválido'
    if (!formData.age || parseInt(formData.age) < 8) newErrors.age = 'La edad mínima es 8 años'
    if (!formData.height || parseInt(formData.height) < 100) newErrors.height = 'Altura requerida (mínimo 100cm)'
    if (!formData.weight || parseInt(formData.weight) < 20) newErrors.weight = 'Peso requerido (mínimo 20kg)'
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Contacto de emergencia requerido'
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Teléfono de emergencia requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const bookingData = {
      classId: classData.id,
      ...formData,
      totalAmount: classData.price * formData.participants
    }

    onSubmit(bookingData)
  }

  const totalPriceUSD = classData.price * formData.participants
  const totalPrices = formatDualCurrency(totalPriceUSD)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reservar Clase</h2>
              <p className="text-gray-600">{classData.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Class Images Gallery */}
          {classData.images && classData.images.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Imágenes de la Clase</h3>
              <div className={`grid gap-2 ${classData.images.length === 1 ? 'grid-cols-1' : classData.images.length === 2 ? 'grid-cols-2' : classData.images.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {classData.images.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imageUrl}
                      alt={`${classData.title} - Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Class Info Summary */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Fecha:</span>
                <p className="text-gray-900 capitalize">{formatDate(classData.date)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Horario:</span>
                <p className="text-gray-900">{formatTime(classData.startTime)} - {formatTime(classData.endTime)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ubicación:</span>
                <p className="text-gray-900">{classData.location || 'Por confirmar'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Instructor:</span>
                <p className="text-gray-900">{classData.instructorName || 'Por asignar'}</p>
              </div>
            </div>
          </div>

          {/* School Information */}
          {classData.school && (
            <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Información de la Escuela</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-indigo-900">{classData.school.name || 'Escuela de Surf'}</span>
                  {classData.school.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{classData.school.rating.toFixed(1)}</span>
                      {classData.school.totalReviews && (
                        <span className="text-sm text-gray-600">({classData.school.totalReviews} reseñas)</span>
                      )}
                    </div>
                  )}
                </div>
                {classData.school.location && (
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{classData.school.location}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-indigo-200">
                  {classData.school.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${classData.school.phone}`} className="hover:text-indigo-600 transition-colors">
                        {classData.school.phone}
                      </a>
                    </div>
                  )}
                  {classData.school.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${classData.school.email}`} className="hover:text-indigo-600 transition-colors truncate">
                        {classData.school.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={errors.name ? 'border-red-500' : ''}
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
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

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
                  className={errors.age ? 'border-red-500' : ''}
                />
                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
              </div>

              <div>
                <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de participantes
                </label>
                <select
                  id="participants"
                  name="participants"
                  value={formData.participants}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          {/* Physical Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Física</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Altura (cm) *
                </label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  min="100"
                  max="250"
                  value={formData.height}
                  onChange={handleInputChange}
                  className={errors.height ? 'border-red-500' : ''}
                />
                {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg) *
                </label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min="20"
                  max="200"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className={errors.weight ? 'border-red-500' : ''}
                />
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
              </div>
            </div>
          </div>

          {/* Swimming and Experience */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiencia y Habilidades</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  id="canSwim"
                  name="canSwim"
                  type="checkbox"
                  checked={formData.canSwim}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="BEGINNER">Principiante</option>
                  <option value="INTERMEDIATE">Intermedio</option>
                  <option value="ADVANCED">Avanzado</option>
                  <option value="EXPERT">Experto</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="hasSurfedBefore"
                  name="hasSurfedBefore"
                  type="checkbox"
                  checked={formData.hasSurfedBefore}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasSurfedBefore" className="text-sm font-medium text-gray-700">
                  He practicado surf antes
                </label>
              </div>
            </div>
          </div>

          {/* Health and Emergency */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salud y Contacto de Emergencia</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="injuries" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesiones o condiciones médicas relevantes
                </label>
                <textarea
                  id="injuries"
                  name="injuries"
                  rows={3}
                  value={formData.injuries}
                  onChange={handleInputChange}
                  placeholder="Describe cualquier lesión, condición médica o limitación que debamos conocer..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                    Contacto de emergencia *
                  </label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="text"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Nombre completo"
                    className={errors.emergencyContact ? 'border-red-500' : ''}
                  />
                  {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
                </div>

                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono de emergencia *
                  </label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    placeholder="+34 600 000 000"
                    className={errors.emergencyPhone ? 'border-red-500' : ''}
                  />
                  {errors.emergencyPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label htmlFor="specialRequest" className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios o requerimientos especiales
            </label>
            <textarea
              id="specialRequest"
              name="specialRequest"
              rows={3}
              value={formData.specialRequest}
              onChange={handleInputChange}
              placeholder="Cualquier información adicional que consideres importante..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-medium text-gray-900">Total a pagar:</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {totalPrices.pen}
                </div>
                <div className="text-lg text-gray-600">
                  {totalPrices.usd}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              ${classData.price} USD × {formData.participants} {formData.participants === 1 ? 'persona' : 'personas'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tipo de cambio: S/ 3.75 por USD (actualizado hoy)
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              Confirmar Reserva
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}