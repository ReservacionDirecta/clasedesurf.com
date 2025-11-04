'use client'

import Image from 'next/image'
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
  const { id, name, location, description, rating, totalReviews, website, instagram, facebook } = school
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
    <article className="group flex flex-col rounded-3xl bg-white shadow-xl ring-1 ring-gray-100 transition-transform duration-300 hover:-translate-y-2">
      <div className="relative h-48 w-full overflow-hidden rounded-t-3xl">
        {school.coverImage ? (
          <Image
            src={school.coverImage}
            alt={name}
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2EC4B6] via-[#5DE0D0] to-[#FF3366] text-white">
            <span className="text-3xl font-bold tracking-wide drop-shadow-lg">{getInitials(name)}</span>
          </div>
        )}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-2 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#011627]">
            <span className="rounded-full bg-[#2EC4B6]/20 px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#2EC4B6]">CERTIFICADA</span>
          </div>
          <div className="flex items-center gap-2 text-[#FF3366]">
            <span className="text-sm font-bold">{displayRating}</span>
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-semibold text-[#011627]">{name}</h3>
            <span className="rounded-full bg-[#E9FBF7] px-3 py-1 text-xs font-semibold text-[#2EC4B6]">{location || 'Perú'}</span>
          </div>
          <p className="text-sm text-[#46515F] leading-relaxed">{formattedDescription}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {renderStat('Rating', displayRating)}
          {renderStat('Experiencia', `${school.foundedYear ? `${new Date().getFullYear() - school.foundedYear}+ años` : '5+ años'}`)}
          {renderStat('Reseñas', displayReviews)}
        </div>

        {contactLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#F6F7F8] px-4 py-3">
            {contactLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href as string}
                className="text-xs font-semibold uppercase tracking-wide text-[#FF3366] hover:text-[#D12352]"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/schools/${id}`}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FF3366] to-[#D12352] px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:from-[#D12352] hover:to-[#FF3366]"
          >
            Ver escuela
          </Link>
          <Link
            href={`/classes?schoolId=${id}`}
            className="flex w-full items-center justify-center rounded-xl border-2 border-[#2EC4B6] px-4 py-3 text-sm font-bold text-[#011627] transition-transform duration-300 hover:-translate-y-1 hover:border-[#1BAA9C] hover:bg-[#E9FBF7]"
          >
            Ver clases
          </Link>
        </div>
      </div>
    </article>
  )
}

export default SchoolCard
