import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export interface AirbnbSearchBarProps {
  onFilterChange: (filters: FilterValues) => void
  onReset: () => void
  classes?: any[] // List of classes for typeahead
}

export function AirbnbSearchBar({ onFilterChange, classes = [] }: AirbnbSearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    onFilterChange({ q: query })
    setShowSuggestions(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)

    if (val.length > 2) {
      const qLower = val.toLowerCase()
      const matches = classes.filter(c => 
        c.title.toLowerCase().includes(qLower) ||
        c.location?.toLowerCase().includes(qLower) ||
        c.school?.name.toLowerCase().includes(qLower)
      ).slice(0, 5) // Top 5 results
      setSuggestions(matches)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSelectSuggestion = (classId: string) => {
    router.push(`/classes/${classId}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 relative z-50">
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
          onChange={handleInputChange}
          onFocus={() => { if (query.length > 2) setShowSuggestions(true) }}
          onBlur={() => { setTimeout(() => setShowSuggestions(false), 200) }} // Delay to allow click
          onKeyDown={handleKeyDown}
          placeholder="Busca por clases, playas, escuelas o actividades..."
          className="flex-1 w-full h-14 bg-transparent border-none focus:ring-0 text-lg text-gray-800 placeholder:text-gray-400 px-4 leading-normal" 
        />

        <button 
          type="submit"
          className="bg-[#0071EB] hover:bg-[#005bbd] text-white rounded-full h-12 px-8 font-bold text-base shadow-md transition-all active:scale-95"
        >
          Buscar
        </button>
      </form>

      {/* Typeahead Results Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            <h3 className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Resultados Instantáneos</h3>
            {suggestions.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleSelectSuggestion(item.id)}
                className="px-6 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-4 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-12 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                  {item.classImage && (
                    <img src={item.classImage} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                
                {/* Text Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#011627] truncate">{item.title}</h4>
                  <p className="text-sm text-gray-500 truncate">{item.location} • {item.school?.name}</p>
                </div>

                 {/* Price */}
                <div className="text-right">
                   <span className="block font-bold text-[#0071EB]">S/ {item.price}</span>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2 pb-1 px-2">
               <button 
                 onMouseDown={handleSearch} // MouseDown fires before Blur
                 className="w-full py-2 text-center text-sm font-medium text-gray-500 hover:text-[#0071EB] transition-colors"
               >
                 Ver todos los resultados para "{query}"
               </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Suggestions (Optional but good for UX) */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-gray-600 sm:text-gray-200">
         <span className="opacity-80">Popular:</span>
         <button type="button" onClick={() => { setQuery('Máncora'); onFilterChange({ q: 'Máncora' }); }} className="hover:text-white hover:underline transition-colors opacity-90">Máncora</button>
         <span className="opacity-50">•</span>
         <button type="button" onClick={() => { setQuery('Principiantes'); onFilterChange({ q: 'Principiantes' }); }} className="hover:text-white hover:underline transition-colors opacity-90">Principiantes</button>
         <span className="opacity-50">•</span>
         <button type="button" onClick={() => { setQuery('Privada'); onFilterChange({ q: 'Privada' }); }} className="hover:text-white hover:underline transition-colors opacity-90">Clases Privadas</button>
      </div>
    </div>
  )
}
