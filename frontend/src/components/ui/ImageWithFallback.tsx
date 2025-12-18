'use client'

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string
  fallbackComponent?: React.ReactNode
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  fallbackComponent,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const [imgSrc, setImgSrc] = useState(src)

  useEffect(() => {
    setImgSrc(src)
    setError(false)
  }, [src])

  if (error) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }
    // If fallbackSrc is provided, try to use it
    if (fallbackSrc) {
      return (
        <Image
          {...props}
          src={fallbackSrc}
          alt={alt}
          onError={() => setError(true)} // Prevent infinite loop if fallback also fails (though here we'd need another state or just giving up)
        />
      )
    }
    // Default fallback: A simple gray placeholder with initials or icon could be better, 
    // but here we render a generic colored div matching common card styles
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${props.className}`}>
        <svg
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        setError(true)
      }}
    />
  )
}
