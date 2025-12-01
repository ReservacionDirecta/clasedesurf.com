// Sistema de conversión de monedas para Perú
// PEN (Soles Peruanos) como moneda base

export interface CurrencyRate {
  usd: number
  pen: number
  rate: number // 1 USD = rate PEN
  lastUpdated: Date
}

// Tipo de cambio por defecto (fallback si no se puede obtener de la API)
const DEFAULT_EXCHANGE_RATE = 3.75 // 1 USD = 3.75 PEN (aproximado)

// Cache del tipo de cambio (se actualiza diariamente)
let exchangeRateCache: CurrencyRate | null = null
let cacheDate: string | null = null

/**
 * Obtiene el tipo de cambio del día desde una API externa
 * Si falla, usa el valor por defecto
 */
async function fetchExchangeRate(): Promise<number> {
  try {
    // Intentar obtener desde una API gratuita de tipos de cambio
    // Opción 1: exchangerate-api.com (gratis, sin API key para USD a PEN)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate')
    }
    
    const data = await response.json()
    const penRate = data.rates?.PEN
    
    if (penRate && typeof penRate === 'number') {
      return penRate
    }
    
    throw new Error('Invalid exchange rate data')
  } catch (error) {
    console.warn('No se pudo obtener el tipo de cambio del día, usando valor por defecto:', error)
    return DEFAULT_EXCHANGE_RATE
  }
}

/**
 * Obtiene el tipo de cambio actual (con cache diario)
 */
export async function getCurrentExchangeRate(): Promise<CurrencyRate> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  
  // Si tenemos cache del día de hoy, retornarlo
  if (exchangeRateCache && cacheDate === today) {
    return exchangeRateCache
  }
  
  // Obtener nuevo tipo de cambio
  const rate = await fetchExchangeRate()
  
  exchangeRateCache = {
    usd: 1,
    pen: rate,
    rate: rate,
    lastUpdated: new Date()
  }
  
  cacheDate = today
  
  return exchangeRateCache
}

/**
 * Obtiene el tipo de cambio de forma síncrona (usa cache o valor por defecto)
 * Útil para componentes que no pueden ser async
 */
export function getCurrentExchangeRateSync(): CurrencyRate {
  if (exchangeRateCache) {
    return exchangeRateCache
  }
  
  // Si no hay cache, retornar valor por defecto
  return {
    usd: 1,
    pen: DEFAULT_EXCHANGE_RATE,
    rate: DEFAULT_EXCHANGE_RATE,
    lastUpdated: new Date()
  }
}

/**
 * Convierte PEN a USD
 */
export function convertPENtoUSD(penAmount: number): number {
  const rate = getCurrentExchangeRateSync()
  return Math.round((penAmount / rate.rate) * 100) / 100
}

/**
 * Convierte USD a PEN (función de compatibilidad)
 */
export function convertUSDtoPEN(usdAmount: number): number {
  const rate = getCurrentExchangeRateSync()
  return Math.round(usdAmount * rate.rate * 100) / 100
}

/**
 * Formatea una cantidad en la moneda especificada
 */
export function formatCurrency(amount: number, currency: 'USD' | 'PEN'): string {
  const formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  return formatter.format(amount)
}

/**
 * Formatea un precio en PEN mostrando también el equivalente en USD
 * @param penAmount - Precio en soles peruanos (moneda base)
 */
export function formatDualCurrency(penAmount: number): {
  usd: string
  pen: string
  penAmount: number
  usdAmount: number
} {
  const usdAmount = convertPENtoUSD(penAmount)
  
  return {
    usd: formatCurrency(usdAmount, 'USD'),
    pen: formatCurrency(penAmount, 'PEN'),
    penAmount: penAmount,
    usdAmount: usdAmount
  }
}

/**
 * Hook para obtener precios en ambas monedas (PEN como base)
 * @param penPrice - Precio en soles peruanos (moneda base)
 */
export function useDualCurrency(penPrice: number) {
  const rate = getCurrentExchangeRateSync()
  const usdPrice = convertPENtoUSD(penPrice)
  
  return {
    pen: {
      amount: penPrice,
      formatted: formatCurrency(penPrice, 'PEN')
    },
    usd: {
      amount: usdPrice,
      formatted: formatCurrency(usdPrice, 'USD')
    },
    rate: rate.rate,
    lastUpdated: rate.lastUpdated
  }
}

/**
 * Inicializa el tipo de cambio al cargar la aplicación
 * Debe llamarse en el cliente
 */
export async function initializeExchangeRate(): Promise<void> {
  if (typeof window !== 'undefined') {
    await getCurrentExchangeRate()
  }
}