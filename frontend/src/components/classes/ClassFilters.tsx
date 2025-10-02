'use client'

interface ClassFiltersProps {
  onFilterChange: (filters: FilterValues) => void
  onReset: () => void
}

export interface FilterValues {
  date?: string
  level?: string
  type?: string
  minPrice?: number
  maxPrice?: number
}

export function ClassFilters({ onFilterChange, onReset }: ClassFiltersProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ date: e.target.value || undefined })
  }

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ level: e.target.value || undefined })
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ type: e.target.value || undefined })
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    onFilterChange({ minPrice: value })
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    onFilterChange({ maxPrice: value })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filtrar Clases</h2>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Filter */}
        <div>
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha
          </label>
          <input
            id="date-filter"
            type="date"
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Level Filter */}
        <div>
          <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Nivel
          </label>
          <select
            id="level-filter"
            onChange={handleLevelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los niveles</option>
            <option value="BEGINNER">Principiante</option>
            <option value="INTERMEDIATE">Intermedio</option>
            <option value="ADVANCED">Avanzado</option>
            <option value="EXPERT">Experto</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            id="type-filter"
            onChange={handleTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="GROUP">Grupal</option>
            <option value="PRIVATE">Privada</option>
            <option value="SEMI_PRIVATE">Semi-privada</option>
            <option value="INTENSIVE">Intensivo</option>
            <option value="KIDS">Niños</option>
          </select>
        </div>

        {/* Min Price Filter */}
        <div>
          <label htmlFor="min-price-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Precio mínimo (USD)
          </label>
          <input
            id="min-price-filter"
            type="number"
            min="0"
            step="10"
            placeholder="0"
            onChange={handleMinPriceChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label htmlFor="max-price-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Precio máximo (USD)
          </label>
          <input
            id="max-price-filter"
            type="number"
            min="0"
            step="10"
            placeholder="1000"
            onChange={handleMaxPriceChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}
