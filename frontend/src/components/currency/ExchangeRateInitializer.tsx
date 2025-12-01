'use client'

import { useEffect } from 'react'
import { initializeExchangeRate } from '@/lib/currency'

/**
 * Componente que inicializa el tipo de cambio al cargar la aplicación
 * Debe montarse una vez en el layout principal
 */
export function ExchangeRateInitializer() {
  useEffect(() => {
    // Inicializar el tipo de cambio al cargar la aplicación
    initializeExchangeRate().catch((error) => {
      console.warn('Error al inicializar el tipo de cambio:', error)
      // No es crítico, se usará el valor por defecto
    })
  }, [])

  return null // Este componente no renderiza nada
}







