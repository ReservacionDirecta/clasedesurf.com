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

  // Determine if we should bypass Next.js image optimization
  // ui-avatars.com often returns 400 if optimized due to query params encoding
  const shouldBeUnoptimized = typeof src === 'string' && src.includes('ui-avatars.com');

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
      const isFallbackUnoptimized = fallbackSrc.includes('ui-avatars.com');
      return (
        <Image
          {...props}
          src={fallbackSrc}
          alt={alt}
          unoptimized={props.unoptimized || isFallbackUnoptimized}
          onError={() => setError(true)} 
        />
      )
    }
    // Default fallback
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${props.className || ''}`}>
        <svg
          className="h-12 w-12 opacity-20"
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
      unoptimized={props.unoptimized || shouldBeUnoptimized}
      onError={() => {
        setError(true)
      }}
    />
  )
}
