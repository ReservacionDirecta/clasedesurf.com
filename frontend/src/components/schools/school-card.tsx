'use client'

import Image from 'next/image'
import ImageWithFallback from '@/components/ui/ImageWithFallback'
import Link from 'next/link'
import { type School } from '@/types'

interface SchoolCardProps {
  readonly school: School
}

const formatDescription = (description?: string) => {
  if (!description) {
    return 'Escuela certificada con instructores expertos.'
  }

  if (description.length <= 120) {
    return description
  }

  return `${description.slice(0, 117)}...`
}

const getInitials = (name: string) => {
  if (!name) return 'SC'
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase())
  return initials.join('')
}

const renderStat = (label: string, value: string) => (
  <div className="flex flex-col items-center rounded-xl bg-white/70 px-3 py-2 shadow-sm">
    <span className="text-sm font-semibold text-[#011627]">{value}</span>
    <span className="text-xs text-[#46515F]">{label}</span>
  </div>
)

const SchoolCard = ({ school }: SchoolCardProps) => {
  const { id, name, location, description, rating, totalReviews, website, instagram, facebook, logo } = school
  const formattedDescription = formatDescription(description)
  const hasRating = typeof rating === 'number'
  const displayRating = hasRating ? rating.toFixed(1) : '4.8'
  const displayReviews = hasRating && totalReviews ? `${totalReviews}+ reseñas` : 'Reseñas verificadas'
  const contactLinks = [
    { href: website, label: 'Sitio web' },
    { href: instagram, label: 'Instagram' },
    { href: facebook, label: 'Facebook' }
  ].filter((item) => Boolean(item.href))

  return (
    <Link href={`/schools/${id}`} className="block">
      <article className="group flex flex-col rounded-3xl bg-white shadow-xl ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
        <div className="relative h-48 w-full overflow-hidden rounded-t-3xl">
          {school.coverImage ? (
            <ImageWithFallback
              src={school.coverImage}
              alt={name}
              fill
              sizes="(min-width: 1024px) 400px, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority
              fallbackComponent={
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#2EC4B6] via-[#5DE0D0] to-[#FF3366] text-white">
                  <span className="text-3xl font-bold tracking-wide drop-shadow-lg">{getInitials(name)}</span>
                </div>
              }
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#2EC4B6] via-[#5DE0D0] to-[#FF3366] text-white">
              <span className="text-3xl font-bold tracking-wide drop-shadow-lg">{getInitials(name)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-60" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
             <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#011627] backdrop-blur-md shadow-sm">
              <svg className="h-3.5 w-3.5 text-[#FF3366] fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {displayRating}
            </span>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col px-6 pb-6 pt-12">
          {/* Logo Overlay */}
          <div className="absolute -top-10 left-6 h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
            {logo ? (
              <ImageWithFallback
                src={logo}
                alt={`${name} logo`}
                fill
                className="object-cover"
                fallbackComponent={
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[#011627] font-bold text-xl">
                    {getInitials(name)}
                  </div>
                }
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[#011627] font-bold text-xl">
                {getInitials(name)}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-[#011627] leading-tight group-hover:text-[#FF3366] transition-colors">
                  {name}
                </h3>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#46515F]">
                <svg className="h-4 w-4 text-[#2EC4B6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {location || 'Perú'}
              </div>
            </div>

            <p className="text-sm text-[#46515F] leading-relaxed line-clamp-2">{formattedDescription}</p>

            <div className="my-2 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E9FBF7] text-[#2EC4B6]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20v-6M6 20V10M18 20V4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase text-gray-400">Experiencia</span>
                  <span className="text-xs font-bold text-[#011627]">
                    {school.foundedYear ? `${new Date().getFullYear() - school.foundedYear} años` : '5+ años'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0F3] text-[#FF3366]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase text-gray-400">Comunidad</span>
                  <span className="text-xs font-bold text-[#011627]">
                    {totalReviews ? `${totalReviews}+` : 'Creciendo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-2">
              <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#2EC4B6] to-[#5DE0D0] px-4 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 group-hover:shadow-xl">
                Ver perfil completo
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <Link
                href={`/classes?schoolId=${id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#011627] px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-[#FF3366] hover:shadow-lg hover:-translate-y-0.5"
              >
                Ver clases disponibles
              </Link>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default SchoolCard
