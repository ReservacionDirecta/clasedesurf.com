import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export const SearchIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

export const LocationIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export const SurferIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2M21 9V7L15 1H9V3H7.5C7.1 3 6.7 3.1 6.4 3.2L4 4.2C3.4 4.4 3 5 3 5.6V6C3 6.6 3.4 7 4 7H5.2L6.2 16.8C6.3 17.4 6.8 17.8 7.4 17.8H8.6C9.2 17.8 9.7 17.4 9.8 16.8L10.8 7H15V9C15 9.6 15.4 10 16 10S17 9.6 17 10V9H21M19 12H5C4.4 12 4 12.4 4 13S4.4 14 5 14H19C19.6 14 20 13.6 20 13S19.6 12 19 12Z"/>
  </svg>
)

export const CalendarIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

export const StarIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

export const MoneyIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export const ShieldIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

export const LightningIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

export const TrophyIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M7 3V1H17V3H20C20.55 3 21 3.45 21 4S20.55 5 20 5H19V8C19 10.76 16.76 13 14 13H13V16.5L16 17.5V19.5L12 18.5L8 19.5V17.5L11 16.5V13H10C7.24 13 5 10.76 5 8V5H4C3.45 5 3 4.55 3 4S3.45 3 4 3H7M7 5V8C7 9.66 8.34 11 10 11H14C15.66 11 17 9.66 17 8V5H7Z" />
  </svg>
)

export const WaveIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M2 12C2 12 4 10 6 12C8 14 10 10 12 12C14 14 16 10 18 12C20 14 22 12 22 12V20H2V12Z" />
    <path d="M2 8C2 8 4 6 6 8C8 10 10 6 12 8C14 10 16 6 18 8C20 10 22 8 22 8V16H2V8Z" opacity="0.6" />
  </svg>
)

export const CheckIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export const LockIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

export const EquipmentIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M12 2L13.09 8.26L22 9L16 14L18 22L12 19L6 22L8 14L2 9L10.91 8.26L12 2Z" opacity="0.3" />
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M17 7H7V9H17V7M17 11H7V13H17V11M14 15H7V17H14V15Z" />
  </svg>
)

export const GroupIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C18.7 14 24 15.3 24 18V20H8V18C8 15.3 13.3 14 16 14M8 4C10.2 4 12 5.8 12 8S10.2 12 8 12 4 10.2 4 8 5.8 4 8 4M8 14C10.7 14 16 15.3 16 18V20H0V18C0 15.3 5.3 14 8 14Z" />
  </svg>
)

export const TrashIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)