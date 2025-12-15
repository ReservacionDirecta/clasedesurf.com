'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  MapPinIcon, 
  CalendarIcon, 
  BarChartIcon, 
  LayersIcon, 
  SearchIcon,
  XIcon
} from 'lucide-react'
import { CustomMobileDatePicker } from '@/components/ui/CustomMobileDatePicker'

// --- Types ---
export interface FilterValues {
  date?: string
  level?: string
  type?: string
  locality?: string
}

interface AirbnbSearchBarProps {
  onFilterChange: (filters: FilterValues) => void
  onReset: () => void
}

// --- Configuration ---
const LOCATION_OPTIONS = [
  { value: 'Costa Verde', label: 'Costa Verde', subLabel: 'Miraflores, Barranco' },
  { value: 'Punta Hermosa', label: 'Punta Hermosa', subLabel: 'Playas del Sur' },
  { value: 'San Bartolo', label: 'San Bartolo', subLabel: 'Playas del Sur' }
]

const LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: 'Principiante', subLabel: 'Nunca he surfeado' },
  { value: 'INTERMEDIATE', label: 'Intermedio', subLabel: 'Ya tomo olas verdes' },
  { value: 'ADVANCED', label: 'Avanzado', subLabel: 'Quiero perfeccionar' }
]

const TYPE_OPTIONS = [
  { value: 'GROUP', label: 'Grupales', subLabel: 'Clases divertidas en grupo' },
  { value: 'PRIVATE', label: 'Personalizadas', subLabel: '1 a 1 con el instructor' },
  { value: 'INTENSIVE', label: 'Pro / Intensivo', subLabel: 'Entrenamiento técnico' }
]

export function AirbnbSearchBar({ onFilterChange, onReset }: AirbnbSearchBarProps) {
  const [filters, setFilters] = useState<FilterValues>({})
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  
  // Refs for click-outside detection on desktop
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDesktopDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (field: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [field]: value || undefined }
    setFilters(newFilters)
  }

  const handleSearch = () => {
    onFilterChange(filters)
    setActiveDesktopDropdown(null)
  }

  const handleReset = () => {
    setFilters({})
    onReset()
    setActiveDesktopDropdown(null)
  }

  // Helper to get labels
  const getLabel = (options: typeof LOCATION_OPTIONS, value?: string) => 
    options.find(o => o.value === value)?.label

  // Helper to format date preventing timezone issues
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    // Create a date object that respects the string's day, irrespective of timezones.
    // We append T12:00:00 to ensure we are in the middle of the day.
    const date = new Date(`${dateStr}T12:00:00`) 
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  // --- Render Components ---

  // 1. Mobile Filter Card
  const MobileFilterCard = ({ 
    icon: Icon, 
    label, 
    value, 
    placeholder,
    type = 'select',
    options = [],
    field,
    minDate
  }: { 
    icon: any, 
    label: string, 
    value?: string, 
    placeholder: string,
    type?: 'select' | 'date',
    options?: typeof LOCATION_OPTIONS,
    field: keyof FilterValues,
    minDate?: string
  }) => (
    <div 
      className={`relative bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-4 overflow-hidden group active:scale-[0.99] transition-transform ${
        value ? 'border-[#FF3366] ring-1 ring-[#FF3366]/20' : 'border-gray-100'
      }`}
      onClick={() => {
        if (type === 'date') {
          setIsDatePickerOpen(true)
        }
      }}
    >
      {/* Icon Area */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
        ${value ? 'bg-[#FF3366] text-white' : 'bg-gray-100 text-gray-400'}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>

      {/* Text Area */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className={`text-base font-semibold truncate ${value ? 'text-gray-900' : 'text-gray-500'}`}>
          {type === 'select' 
            ? (getLabel(options, value) || placeholder)
            : (value ? formatDate(value) : placeholder)
          }
        </span>
      </div>

      {/* Inputs Overlay */}
      {type === 'select' ? (
        <select
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          value={value || ''}
          onChange={(e) => handleChange(field, e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label} - {opt.subLabel}
            </option>
          ))}
        </select>
      ) : (
        // For Date, we use the div's onClick to open the custom picker. 
        <div className="absolute inset-0 z-10 cursor-pointer" /> 
      )}
    </div>
  )

  // 2. Desktop Wrapper
  return (
    <>
      <div ref={containerRef} className="w-full max-w-7xl mx-auto">
        
        {/* === MOBILE LAYOUT (Variable < 640px) === */}
        <div className="flex flex-col gap-3 sm:hidden">
          <MobileFilterCard 
            icon={MapPinIcon}
            label="¿Dónde?" 
            placeholder="Cualquier ubicación"
            field="locality"
            value={filters.locality}
            options={LOCATION_OPTIONS}
          />
          
          <MobileFilterCard 
            icon={CalendarIcon}
            label="¿Cuándo?" 
            placeholder="Cualquier fecha"
            type="date"
            field="date"
            value={filters.date}
            minDate={new Date().toISOString().split('T')[0]}
          />

          <div className="flex gap-3">
             <div className="flex-1">
                <MobileFilterCard 
                  icon={BarChartIcon}
                  label="Nivel" 
                  placeholder="Todos"
                  field="level"
                  value={filters.level}
                  options={LEVEL_OPTIONS}
                />
             </div>
             <div className="flex-1">
                <MobileFilterCard 
                  icon={LayersIcon}
                  label="Tipo" 
                  placeholder="Todos"
                  field="type"
                  value={filters.type}
                  options={TYPE_OPTIONS}
                />
             </div>
          </div>

          <button 
            onClick={handleSearch}
            className="w-full mt-2 bg-linear-to-r from-[#FF3366] to-[#D12352] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#FF3366]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <SearchIcon size={20} />
            Buscar Clases
          </button>
          
          {(filters.date || filters.level || filters.locality || filters.type) && (
            <button 
              onClick={handleReset}
              className="text-sm text-gray-500 font-medium py-2 flex items-center justify-center gap-1"
            >
              <XIcon size={14} />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* === DESKTOP LAYOUT (Hidden on Mobile) === */}
        <div className="hidden sm:block">
           <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 p-1 relative z-20">
              
              {/* Location */}
              <div 
                className={`flex-1 relative px-6 py-3 rounded-full hover:bg-gray-100 cursor-pointer transition-colors ${activeDesktopDropdown === 'locality' ? 'bg-white shadow-lg z-30' : ''}`}
                onClick={() => setActiveDesktopDropdown(activeDesktopDropdown === 'locality' ? null : 'locality')}
              >
                 <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">¿Dónde?</div>
                 <div className={`text-sm truncate ${filters.locality ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {getLabel(LOCATION_OPTIONS, filters.locality) || 'Explorar destinos'}
                 </div>
                 
                 {/* Desktop Dropdown: Location */}
                 {activeDesktopDropdown === 'locality' && (
                   <div className="absolute top-[120%] left-0 w-[300px] bg-white rounded-3xl shadow-xl border border-gray-100 p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="space-y-1">
                        <div 
                           onClick={(e) => { e.stopPropagation(); handleChange('locality', ''); setActiveDesktopDropdown(null); }}
                           className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                        >
                           <div className="font-semibold text-gray-900">Cualquier destino</div>
                        </div>
                        {LOCATION_OPTIONS.map(opt => (
                           <div 
                              key={opt.value}
                              onClick={(e) => { e.stopPropagation(); handleChange('locality', opt.value); setActiveDesktopDropdown(null); }}
                              className={`p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors ${filters.locality === opt.value ? 'bg-[#E9FBF7]' : ''}`}
                           >
                              <div className="font-semibold text-gray-900">{opt.label}</div>
                              <div className="text-xs text-gray-500">{opt.subLabel}</div>
                           </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>

              <div className="w-px h-8 bg-gray-200 my-auto" />

              {/* Date */}
              <div 
                className="flex-1 relative px-6 py-3 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => setActiveDesktopDropdown(activeDesktopDropdown === 'date' ? null : 'date')}
              >
                 <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">¿Cuándo?</div>
                 <div className={`text-sm truncate ${filters.date ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {filters.date 
                      ? formatDate(filters.date)
                      : 'Agrega fechas'
                    }
                 </div>

                 {/* Desktop Dropdown: Date */}
                 {activeDesktopDropdown === 'date' && (
                    <div className="absolute top-[120%] left-1/2 -translate-x-1/2 w-[320px] bg-white rounded-3xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                       <CustomMobileDatePicker
                          isOpen={true}
                          onClose={() => setActiveDesktopDropdown(null)}
                          value={filters.date}
                          onChange={(date) => { handleChange('date', date); setActiveDesktopDropdown(null); }}
                          minDate={new Date().toISOString().split('T')[0]}
                          inline={true}
                       />
                    </div>
                 )}
              </div>

              <div className="w-px h-8 bg-gray-200 my-auto" />

              {/* Level */}
              <div 
                 className="flex-1 relative px-6 py-3 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
                 onClick={() => setActiveDesktopDropdown(activeDesktopDropdown === 'level' ? null : 'level')}
              >
                 <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">Nivel</div>
                 <div className={`text-sm truncate ${filters.level ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {getLabel(LEVEL_OPTIONS, filters.level) || 'Cualquiera'}
                 </div>

                  {activeDesktopDropdown === 'level' && (
                   <div className="absolute top-[120%] left-1/2 -translate-x-1/2 w-[300px] bg-white rounded-3xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="space-y-1">
                        <div onClick={(e) => { e.stopPropagation(); handleChange('level', ''); setActiveDesktopDropdown(null); }} className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer"><div className="font-semibold">Cualquiera</div></div>
                        {LEVEL_OPTIONS.map(opt => (
                           <div key={opt.value} onClick={(e) => { e.stopPropagation(); handleChange('level', opt.value); setActiveDesktopDropdown(null); }} className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer">
                              <div className="font-semibold text-gray-900">{opt.label}</div>
                              <div className="text-xs text-gray-500">{opt.subLabel}</div>
                           </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>

              <div className="w-px h-8 bg-gray-200 my-auto" />

              {/* Type */}
              <div 
                 className="flex-1 relative px-6 py-3 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
                 onClick={() => setActiveDesktopDropdown(activeDesktopDropdown === 'type' ? null : 'type')}
              >
                 <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">Tipo</div>
                 <div className={`text-sm truncate ${filters.type ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {getLabel(TYPE_OPTIONS, filters.type) || 'Cualquiera'}
                 </div>

                 {activeDesktopDropdown === 'type' && (
                   <div className="absolute top-[120%] left-1/2 -translate-x-1/2 w-[300px] bg-white rounded-3xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="space-y-1">
                        <div onClick={(e) => { e.stopPropagation(); handleChange('type', ''); setActiveDesktopDropdown(null); }} className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer"><div className="font-semibold">Cualquiera</div></div>
                        {TYPE_OPTIONS.map(opt => (
                           <div key={opt.value} onClick={(e) => { e.stopPropagation(); handleChange('type', opt.value); setActiveDesktopDropdown(null); }} className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer">
                              <div className="font-semibold text-gray-900">{opt.label}</div>
                              <div className="text-xs text-gray-500">{opt.subLabel}</div>
                           </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>

              {/* Search Button (Desktop) & Clear */}
              <div className="pl-2 pr-2 flex items-center gap-2">
                 {(filters.date || filters.level || filters.locality || filters.type) && (
                    <button 
                       onClick={(e) => { e.stopPropagation(); handleReset(); }}
                       className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                       title="Limpiar filtros"
                    >
                       <XIcon size={16} />
                    </button>
                 )}
                 <button 
                    onClick={handleSearch}
                    className="bg-linear-to-r from-[#FF3366] to-[#D12352] hover:bg-[#D12352] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg active:scale-95 transition-all"
                 >
                    <SearchIcon size={20} strokeWidth={3} />
                 </button>
              </div>

           </div>
        </div>

      </div>

      {/* Custom Mobile Date Picker Modal */}
      <CustomMobileDatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        value={filters.date}
        onChange={(date) => handleChange('date', date)}
        minDate={new Date().toISOString().split('T')[0]}
      />
    </>
  )
}
