'use client'
import React, { useState } from 'react'
import { Search } from 'lucide-react'

// --- Types ---
export interface FilterValues {
  q?: string;
  // Keep legacy props optional for compatibility if needed elsewhere, 
  // but strictly we just use 'q' now for the main search.
  date?: string
  level?: string
  type?: string
  locality?: string
  participants?: string
}

interface AirbnbSearchBarProps {
  onFilterChange: (filters: FilterValues) => void
  onReset: () => void
}

export function AirbnbSearchBar({ onFilterChange }: AirbnbSearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    onFilterChange({ q: query })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      <form 
        onSubmit={handleSearch}
        className="relative flex items-center w-full bg-white rounded-full shadow-2xl border border-gray-200/50 p-2 transition-all hover:shadow-3xl focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-300"
      >
        <div className="pl-6 text-gray-400">
           <Search className="w-6 h-6" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Busca por clases, playas, escuelas o actividades..."
          className="flex-1 w-full h-14 bg-transparent border-none focus:ring-0 text-lg text-gray-800 placeholder:text-gray-400 px-4 leading-normal" // Increased height and text size
        />

        <button 
          type="submit"
          className="bg-[#0071EB] hover:bg-[#005bbd] text-white rounded-full h-12 px-8 font-bold text-base shadow-md transition-all active:scale-95"
        >
          Buscar
        </button>
      </form>
      
      {/* Quick Suggestions (Optional but good for UX) */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-gray-600 sm:text-gray-200">
         <span className="opacity-80">Popular:</span>
         <button type="button" onClick={() => { setQuery('Máncora'); onFilterChange({ q: 'Máncora' }); }} className="hover:text-white hover:underline transition-colors opacity-90">Máncora</button>
         <span className="opacity-50">•</span>
         <button type="button" onClick={() => { setQuery('Principiantes'); onFilterChange({ q: 'Principiante' }); }} className="hover:text-white hover:underline transition-colors opacity-90">Principiantes</button>
         <span className="opacity-50">•</span>
         <button type="button" onClick={() => { setQuery('Privada'); onFilterChange({ q: 'Privada' }); }} className="hover:text-white hover:underline transition-colors opacity-90">Clases Privadas</button>
      </div>
    </div>
  )
}
