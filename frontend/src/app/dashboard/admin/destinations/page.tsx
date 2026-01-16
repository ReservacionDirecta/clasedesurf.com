'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SurfConditions {
  waveHeight?: string
  wavePeriod?: string
  windSpeed?: string
  windDirection?: string
  tide?: 'low' | 'mid' | 'high'
  tideTime?: string
  waterTemp?: string
  rating?: number
  lastUpdated?: string
}

interface Beach {
  id: number
  name: string
  slug: string
  location?: string
  description?: string
  image?: string
  waveType?: string
  level?: string
  bestTime?: string
  entryTips?: string[]
  hazards?: string[]
  conditions?: SurfConditions
  isActive: boolean
  displayOrder: number
  count?: string
}

const LEVEL_OPTIONS = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles']

export default function DestinationsAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [beaches, setBeaches] = useState<Beach[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [editingBeach, setEditingBeach] = useState<Beach | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<Partial<Beach>>({
    name: '',
    location: '',
    description: '',
    image: '',
    waveType: '',
    level: 'Todos los niveles',
    bestTime: '',
    entryTips: [],
    hazards: [],
    conditions: {},
    isActive: true,
    displayOrder: 0,
    count: ''
  })
  
  const [newTip, setNewTip] = useState('')
  const [newHazard, setNewHazard] = useState('')

  const fetchBeaches = useCallback(async () => {
    try {
      const res = await fetch('/api/beaches')
      if (res.ok) {
        const data = await res.json()
        setBeaches(data)
      }
    } catch (err) {
      console.error('Error fetching beaches:', err)
      setError('Error al cargar los destinos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBeaches()
    }
  }, [status, fetchBeaches])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const openModal = (beach?: Beach) => {
    if (beach) {
      setEditingBeach(beach)
      setFormData({
        ...beach,
        entryTips: beach.entryTips || [],
        hazards: beach.hazards || [],
        conditions: beach.conditions || {}
      })
    } else {
      setEditingBeach(null)
      setFormData({
        name: '',
        location: '',
        description: '',
        image: '',
        waveType: '',
        level: 'Todos los niveles',
        bestTime: '',
        entryTips: [],
        hazards: [],
        conditions: {
          waveHeight: '',
          wavePeriod: '',
          windSpeed: '',
          windDirection: '',
          tide: 'mid',
          tideTime: '',
          waterTemp: '',
          rating: 3
        },
        isActive: true,
        displayOrder: beaches.length,
        count: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBeach(null)
    setNewTip('')
    setNewHazard('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = editingBeach 
        ? `/api/beaches/${editingBeach.id}` 
        : '/api/beaches'
      
      const method = editingBeach ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al guardar')
      }

      setSuccess(editingBeach ? 'Destino actualizado' : 'Destino creado')
      closeModal()
      fetchBeaches()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este destino?')) return
    
    try {
      const res = await fetch(`/api/beaches/${id}`, { method: 'DELETE' })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al eliminar')
      }
      
      setSuccess('Destino eliminado')
      fetchBeaches()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const addTip = () => {
    if (newTip.trim()) {
      setFormData(prev => ({
        ...prev,
        entryTips: [...(prev.entryTips || []), newTip.trim()]
      }))
      setNewTip('')
    }
  }

  const removeTip = (index: number) => {
    setFormData(prev => ({
      ...prev,
      entryTips: prev.entryTips?.filter((_, i) => i !== index)
    }))
  }

  const addHazard = () => {
    if (newHazard.trim()) {
      setFormData(prev => ({
        ...prev,
        hazards: [...(prev.hazards || []), newHazard.trim()]
      }))
      setNewHazard('')
    }
  }

  const removeHazard = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hazards: prev.hazards?.filter((_, i) => i !== index)
    }))
  }

  const updateCondition = (key: keyof SurfConditions, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [key]: value
      }
    }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Destinos / Playas</h1>
          <p className="text-gray-500 mt-1">Administra los destinos que se muestran en la página principal</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Destino
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
          {success}
        </div>
      )}

      {/* Beach Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beaches.map((beach) => (
          <div key={beach.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="relative h-40">
              {beach.image ? (
                <img src={beach.image} alt={beach.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${beach.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {beach.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => openModal(beach)}
                  className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(beach.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900">{beach.name}</h3>
              <p className="text-sm text-gray-500">{beach.location || 'Sin ubicación'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{beach.level || 'Sin nivel'}</span>
                <span className="text-xs text-gray-400">Orden: {beach.displayOrder}</span>
              </div>
            </div>
          </div>
        ))}

        {beaches.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No hay destinos registrados</p>
            <button onClick={() => openModal()} className="mt-4 text-blue-600 font-medium hover:underline">
              Agregar el primero
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal}>
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBeach ? 'Editar Destino' : 'Nuevo Destino'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Miraflores, Lima"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="mt-2 h-32 rounded-lg object-cover" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe la playa..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                  <select
                    value={formData.level || ''}
                    onChange={e => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {LEVEL_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta</label>
                  <input
                    type="text"
                    value={formData.count || ''}
                    onChange={e => setFormData(prev => ({ ...prev, count: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 25+ escuelas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                  <input
                    type="number"
                    value={formData.displayOrder || 0}
                    onChange={e => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Wave Info */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4">🌊 Información de Olas</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ola</label>
                    <textarea
                      value={formData.waveType || ''}
                      onChange={e => setFormData(prev => ({ ...prev, waveType: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Beach break con olas izquierdas y derechas..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mejor Época</label>
                    <input
                      type="text"
                      value={formData.bestTime || ''}
                      onChange={e => setFormData(prev => ({ ...prev, bestTime: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Marzo a Diciembre, mejor con marea media"
                    />
                  </div>
                </div>
              </div>

              {/* Entry Tips */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4">🏊 Cómo Ingresar al Mar</h3>
                <div className="space-y-2">
                  {formData.entryTips?.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="flex-1 text-sm">{tip}</span>
                      <button type="button" onClick={() => removeTip(i)} className="text-red-500 hover:text-red-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTip}
                      onChange={e => setNewTip(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTip())}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Agregar recomendación..."
                    />
                    <button type="button" onClick={addTip} className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Hazards */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4">⚠️ Precauciones</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.hazards?.map((hazard, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200">
                      {hazard}
                      <button type="button" onClick={() => removeHazard(i)} className="hover:text-amber-900">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHazard}
                    onChange={e => setNewHazard(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHazard())}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Corrientes laterales"
                  />
                  <button type="button" onClick={addHazard} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200">
                    Agregar
                  </button>
                </div>
              </div>

              {/* Conditions */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4">📊 Condiciones Actuales</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Altura Olas</label>
                    <input
                      type="text"
                      value={formData.conditions?.waveHeight || ''}
                      onChange={e => updateCondition('waveHeight', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="0.8 - 1.2m"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Período</label>
                    <input
                      type="text"
                      value={formData.conditions?.wavePeriod || ''}
                      onChange={e => updateCondition('wavePeriod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="14s"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Viento</label>
                    <input
                      type="text"
                      value={formData.conditions?.windSpeed || ''}
                      onChange={e => updateCondition('windSpeed', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="12 km/h"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Dir. Viento</label>
                    <input
                      type="text"
                      value={formData.conditions?.windDirection || ''}
                      onChange={e => updateCondition('windDirection', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="SSW"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Marea</label>
                    <select
                      value={formData.conditions?.tide || 'mid'}
                      onChange={e => updateCondition('tide', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="low">Baja</option>
                      <option value="mid">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Estado Marea</label>
                    <input
                      type="text"
                      value={formData.conditions?.tideTime || ''}
                      onChange={e => updateCondition('tideTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Subiendo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Temp. Agua</label>
                    <input
                      type="text"
                      value={formData.conditions?.waterTemp || ''}
                      onChange={e => updateCondition('waterTemp', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="18°C"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Calidad (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.conditions?.rating || 3}
                      onChange={e => updateCondition('rating', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="border-t pt-6 flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Destino Activo</label>
                  <p className="text-sm text-gray-500">Los destinos inactivos no se muestran en la página principal</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${formData.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Submit */}
              <div className="border-t pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {saving ? 'Guardando...' : (editingBeach ? 'Guardar Cambios' : 'Crear Destino')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
