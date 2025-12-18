'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react'
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav'
import SchoolCard from '@/components/schools/school-card'
import type { School } from '@/types'

const fallbackSchools: School[] = [
  {
    id: 1,
    name: 'Pacific Riders Academy',
    location: 'Miraflores, Lima',
    description: 'Programa integral para todos los niveles con enfoque en seguridad y progresión técnica.',
    coverImage: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1600&auto=format&fit=crop',
    rating: 4.9,
    totalReviews: 128,
    foundedYear: 2015,
    website: 'https://pacificriders.pe',
    instagram: 'https://instagram.com/pacificriders'
  },
  {
    id: 2,
    name: 'Olas del Sur Escuela',
    location: 'Punta Hermosa, Lima',
    description: 'Instructores certificados ISA, clases privadas y grupales con equipamiento premium.',
    coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop',
    rating: 4.8,
    totalReviews: 94,
    foundedYear: 2012,
    website: 'https://olasdelsur.pe',
    instagram: 'https://instagram.com/olasdelsur',
    facebook: 'https://facebook.com/olasdelsur'
  },
  {
    id: 3,
    name: 'North Shore Surf Club',
    location: 'Máncora, Piura',
    description: 'Clínicas avanzadas, campamentos para surfistas intermedios y trips personalizados.',
    coverImage: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1600&auto=format&fit=crop',
    rating: 4.7,
    totalReviews: 76,
    foundedYear: 2010,
    website: 'https://northshore.pe'
  }
]

const normalizeSchool = (school: School): School => ({
  ...school,
  rating: typeof school.rating === 'number' ? school.rating : 4.8,
  totalReviews: typeof school.totalReviews === 'number' ? school.totalReviews : 50,
  foundedYear: school.foundedYear ?? 2014
})

const filterSchools = (schools: School[], searchTerm: string, selectedLocation: string) => {
  const normalizedTerm = searchTerm.trim().toLowerCase()

  return schools.filter((school) => {
    if (selectedLocation !== 'all' && school.location !== selectedLocation) {
      return false
    }

    if (!normalizedTerm) {
      return true
    }

    const haystack = [school.name, school.location, school.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedTerm)
  })
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/schools')

        if (!response.ok) {
          throw new Error('No se pudieron cargar las escuelas')
        }

        const data = (await response.json()) as School[]
        const normalized = data.map(normalizeSchool)

        setSchools(normalized)
        setFilteredSchools(filterSchools(normalized, searchTerm, selectedLocation))
      } catch (err) {
        console.error('Error fetching schools:', err)
        const normalizedFallback = fallbackSchools.map(normalizeSchool)
        setSchools(normalizedFallback)
        setFilteredSchools(filterSchools(normalizedFallback, searchTerm, selectedLocation))
        setError('Mostrando escuelas destacadas mientras verificamos la conexión al backend.')
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setFilteredSchools(filterSchools(schools, searchTerm, selectedLocation))
  }, [schools, searchTerm, selectedLocation])

  const locations = useMemo(() => {
    const unique = new Set<string>()
    schools.forEach((school) => {
      if (school.location) {
        unique.add(school.location)
      }
    })
    return Array.from(unique)
  }, [schools])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(event.target.value)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
        {/* Hero Section */}
        <header className="relative overflow-hidden bg-[#011627] py-20 sm:py-24 lg:py-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-[#2EC4B6] backdrop-blur-sm mb-6 border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2EC4B6] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2EC4B6]"></span>
                </span>
                Escuelas Verificadas
              </div>
              
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Descubre las mejores<br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#2EC4B6] to-[#5DE0D0]">
                  escuelas de surf
                </span>
              </h1>
              
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Conecta con academias certificadas, instructores expertos y la comunidad que necesitas para llevar tu surf al siguiente nivel.
              </p>
            </div>
          </div>
        </header>

        {/* Search & Filter Section */}
        <section className="relative -mt-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl">
            <div className="rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Buscar escuela, ubicación o instructor..."
                    className="block w-full rounded-xl border-0 bg-gray-50 py-4 pl-11 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#2EC4B6] sm:text-sm sm:leading-6 transition-all"
                  />
                </div>

                <div className="relative md:w-72">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <select
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    className="block w-full appearance-none rounded-xl border-0 bg-gray-50 py-4 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-[#2EC4B6] sm:text-sm sm:leading-6 transition-all cursor-pointer"
                  >
                    <option value="all">Todas las ubicaciones</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {error && (
            <div className="mx-auto mb-8 max-w-4xl rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                  <div className="animate-pulse space-y-4">
                    <div className="h-48 rounded-2xl bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-2/3 rounded bg-gray-200" />
                      <div className="h-4 w-1/2 rounded bg-gray-200" />
                    </div>
                    <div className="h-20 rounded-xl bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="mx-auto max-w-2xl text-center py-16">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">No se encontraron escuelas</h3>
              <p className="mt-2 text-gray-500">
                No hay resultados para tu búsqueda. Intenta con otros términos o ubicación.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedLocation('all')
                }}
                className="mt-6 inline-flex items-center rounded-xl bg-[#011627] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#FF3366] transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSchools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          )}
        </main>
      <MobileBottomNav />
    </div>
  )
}
