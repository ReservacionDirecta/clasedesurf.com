'use client'

import { useState } from 'react'
import { formatDualCurrency, getCurrentExchangeRate } from '@/lib/currency'

interface PriceDisplayProps {
  usdPrice: number
  className?: string
  showBothCurrencies?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PriceDisplay({ 
  usdPrice, 
  className = '', 
  showBothCurrencies = true,
  size = 'md' 
}: PriceDisplayProps) {
  const [primaryCurrency, setPrimaryCurrency] = useState<'USD' | 'PEN'>('PEN')
  const prices = formatDualCurrency(usdPrice)
  const rate = getCurrentExchangeRate()

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  const secondarySizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const toggleCurrency = () => {
    setPrimaryCurrency(prev => prev === 'USD' ? 'PEN' : 'USD')
  }

  if (!showBothCurrencies) {
    return (
      <div className={className}>
        <span className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
          {primaryCurrency === 'USD' ? prices.usd : prices.pen}
        </span>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleCurrency}
          className="group cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors"
          title="Cambiar moneda"
        >
          <div className="flex items-center space-x-1">
            <span className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
              {primaryCurrency === 'USD' ? prices.usd : prices.pen}
            </span>
            <svg 
              className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </button>
      </div>
      
      <div className="flex items-center space-x-2 mt-1">
        <span className={`text-gray-600 ${secondarySizeClasses[size]}`}>
          {primaryCurrency === 'USD' ? prices.pen : prices.usd}
        </span>
        <span className="text-xs text-gray-400">
          (TC: S/ {rate.rate})
        </span>
      </div>
    </div>
  )
}

export function SimplePriceDisplay({ usdPrice, className = '' }: { usdPrice: number, className?: string }) {
  const prices = formatDualCurrency(usdPrice)
  
  return (
    <div className={className}>
      <div className="text-2xl font-bold text-gray-900">
        {prices.pen}
      </div>
      <div className="text-sm text-gray-600">
        {prices.usd}
      </div>
    </div>
  )
}