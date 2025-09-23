// Sistema de conversión de monedas para Perú
// USD a PEN (Soles Peruanos)

export interface CurrencyRate {
  usd: number
  pen: number
  rate: number
  lastUpdated: Date
}

// Tipo de cambio simulado (en producción vendría de una API)
const MOCK_EXCHANGE_RATE = 3.75 // 1 USD = 3.75 PEN (aproximado)

export function getCurrentExchangeRate(): CurrencyRate {
  return {
    usd: 1,
    pen: MOCK_EXCHANGE_RATE,
    rate: MOCK_EXCHANGE_RATE,
    lastUpdated: new Date()
  }
}

export function convertUSDtoPEN(usdAmount: number): number {
  const rate = getCurrentExchangeRate()
  return Math.round(usdAmount * rate.rate * 100) / 100
}

export function convertPENtoUSD(penAmount: number): number {
  const rate = getCurrentExchangeRate()
  return Math.round((penAmount / rate.rate) * 100) / 100
}

export function formatCurrency(amount: number, currency: 'USD' | 'PEN'): string {
  const formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  return formatter.format(amount)
}

export function formatDualCurrency(usdAmount: number): {
  usd: string
  pen: string
  penAmount: number
} {
  const penAmount = convertUSDtoPEN(usdAmount)
  
  return {
    usd: formatCurrency(usdAmount, 'USD'),
    pen: formatCurrency(penAmount, 'PEN'),
    penAmount: penAmount
  }
}

// Hook para obtener precios en ambas monedas
export function useDualCurrency(usdPrice: number) {
  const rate = getCurrentExchangeRate()
  const penPrice = convertUSDtoPEN(usdPrice)
  
  return {
    usd: {
      amount: usdPrice,
      formatted: formatCurrency(usdPrice, 'USD')
    },
    pen: {
      amount: penPrice,
      formatted: formatCurrency(penPrice, 'PEN')
    },
    rate: rate.rate,
    lastUpdated: rate.lastUpdated
  }
}