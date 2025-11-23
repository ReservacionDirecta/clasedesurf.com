/**
 * Hook para verificar el consentimiento de cookies de forma condicional
 * Útil para cargar scripts de terceros solo cuando el usuario ha dado consentimiento
 */

import { useCookie } from '@/contexts/CookieContext';
import { CookieCategory } from '@/lib/cookies';
import { useEffect, useState } from 'react';

/**
 * Hook para verificar si una categoría de cookies está permitida
 * Útil para cargar scripts de terceros condicionalmente
 */
export function useCookieConsent(category: CookieCategory): boolean {
  const { isCategoryAllowed } = useCookie();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    setIsAllowed(isCategoryAllowed(category));
  }, [category, isCategoryAllowed]);

  return isAllowed;
}

/**
 * Hook para cargar scripts de terceros solo cuando hay consentimiento
 * 
 * @example
 * ```tsx
 * const canLoadAnalytics = useCookieConsent('analytics');
 * 
 * useEffect(() => {
 *   if (canLoadAnalytics) {
 *     // Cargar Google Analytics
 *   }
 * }, [canLoadAnalytics]);
 * ```
 */
export function useConditionalScript(
  category: CookieCategory,
  scriptLoader: () => void | (() => void)
): void {
  const canLoad = useCookieConsent(category);

  useEffect(() => {
    if (!canLoad) return;

    const cleanup = scriptLoader();
    
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [canLoad, scriptLoader]);
}

