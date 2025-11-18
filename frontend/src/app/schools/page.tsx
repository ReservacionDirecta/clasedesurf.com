'use client'

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
    <div className="min-h-screen bg-[#F6F7F8] pb-16">
        <header className="bg-gradient-to-br from-[#011627] via-[#072F46] to-[#0F4C5C] py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center text-white">
              <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#5DE0D0]">
                Escuelas verificadas
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                Encuentra la escuela perfecta para tu progresión
              </h1>
              <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#E1EDF5]">
                Conoce academias certificadas que ofrecen experiencias guiadas, coaches expertos y acompañamiento personalizado.
              </p>
            </div>
          </div>
        </header>

        <section className="relative -mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-100">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#CBD5E1] bg-[#F6F7F8] px-4 py-3">
                  <svg className="h-5 w-5 text-[#2EC4B6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Buscar por nombre, ciudad o especialidad"
                    className="w-full bg-transparent text-sm font-medium text-[#011627] placeholder:text-[#7B8896] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:w-64">
                  <label htmlFor="location-filter" className="text-xs font-semibold uppercase tracking-wide text-[#46515F]">
                    Filtrar por ciudad
                  </label>
                  <select
                    id="location-filter"
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    className="w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm font-semibold text-[#011627] focus:border-[#2EC4B6] focus:outline-none focus:ring-2 focus:ring-[#9DE6DC]"
                  >
                    <option value="all">Todas las ubicaciones</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-yellow-200 bg-yellow-50 px-6 py-4 text-center text-sm text-yellow-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-3xl bg-white p-6 shadow-lg">
                  <div className="mb-6 h-40 rounded-2xl bg-gray-200" />
                  <div className="mb-3 h-4 rounded bg-gray-200" />
                  <div className="mb-3 h-4 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-[#CBD5E1] bg-white px-8 py-16 text-center shadow-xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E9FBF7] text-[#2EC4B6]">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 7l9-4 9 4-9 4-9-4Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 12l9 4 9-4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 17l9 4 9-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-[#011627]">No encontramos escuelas con ese criterio</h2>
              <p className="mt-2 text-sm text-[#46515F]">
                Ajusta los filtros o explora nuestras escuelas destacadas para descubrir la comunidad surfista perfecta para ti.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
