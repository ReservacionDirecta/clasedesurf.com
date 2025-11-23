/**
 * Utilidades para el manejo de cookies conforme a GDPR y CCPA/CPRA
 */

export type CookieCategory = 'essential' | 'analytics' | 'marketing' | 'functional';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  consentGiven: boolean;
  consentDate: string;
  version: string;
}

export interface CookieDefinition {
  name: string;
  category: CookieCategory;
  description: string;
  duration: string;
  provider: string;
}

// Definición de todas las cookies utilizadas en la aplicación
export const COOKIE_DEFINITIONS: CookieDefinition[] = [
  {
    name: 'next-auth.session-token',
    category: 'essential',
    description: 'Cookie de sesión para autenticación. Necesaria para mantener la sesión del usuario.',
    duration: 'Sesión',
    provider: 'NextAuth.js'
  },
  {
    name: 'cookie-consent',
    category: 'essential',
    description: 'Almacena las preferencias de consentimiento de cookies del usuario.',
    duration: '1 año',
    provider: 'Clase de Surf'
  },
  {
    name: '_ga',
    category: 'analytics',
    description: 'Cookie de Google Analytics para distinguir usuarios únicos.',
    duration: '2 años',
    provider: 'Google Analytics'
  },
  {
    name: '_gid',
    category: 'analytics',
    description: 'Cookie de Google Analytics para distinguir usuarios únicos.',
    duration: '24 horas',
    provider: 'Google Analytics'
  },
  {
    name: '_gat',
    category: 'analytics',
    description: 'Cookie de Google Analytics para limitar la tasa de solicitudes.',
    duration: '1 minuto',
    provider: 'Google Analytics'
  },
  {
    name: 'fbp',
    category: 'marketing',
    description: 'Cookie de Facebook Pixel para publicidad y remarketing.',
    duration: '90 días',
    provider: 'Facebook'
  },
  {
    name: 'fbc',
    category: 'marketing',
    description: 'Cookie de Facebook Pixel para rastrear conversiones.',
    duration: '90 días',
    provider: 'Facebook'
  }
];

// Valores por defecto de preferencias
export const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true, // Siempre activo, no se puede desactivar
  analytics: false,
  marketing: false,
  functional: false,
  consentGiven: false,
  consentDate: '',
  version: '1.0.0'
};

// Nombres de cookies por categoría
export const COOKIE_NAMES_BY_CATEGORY: Record<CookieCategory, string[]> = {
  essential: ['next-auth.session-token', 'cookie-consent'],
  analytics: ['_ga', '_gid', '_gat'],
  marketing: ['fbp', 'fbc'],
  functional: []
};

// Constantes
export const COOKIE_CONSENT_KEY = 'cookie-consent';
export const COOKIE_CONSENT_VERSION = '1.0.0';
export const COOKIE_EXPIRY_DAYS = 365;

/**
 * Lee las preferencias de cookies desde localStorage
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const preferences = JSON.parse(stored) as CookiePreferences;
    
    // Validar que tenga la estructura correcta
    if (!preferences || typeof preferences !== 'object') {
      return DEFAULT_PREFERENCES;
    }

    // Asegurar que essential siempre esté activo
    preferences.essential = true;

    return {
      ...DEFAULT_PREFERENCES,
      ...preferences
    };
  } catch (error) {
    console.error('Error al leer preferencias de cookies:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Guarda las preferencias de cookies en localStorage
 */
export function saveCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const preferencesToSave: CookiePreferences = {
      ...preferences,
      essential: true, // Siempre activo
      consentDate: new Date().toISOString(),
      version: COOKIE_CONSENT_VERSION
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferencesToSave));
    
    // También guardar en cookie para acceso del servidor
    setCookie(COOKIE_CONSENT_KEY, JSON.stringify(preferencesToSave), COOKIE_EXPIRY_DAYS);
  } catch (error) {
    console.error('Error al guardar preferencias de cookies:', error);
  }
}

/**
 * Verifica si el usuario ha dado su consentimiento
 */
export function hasConsent(): boolean {
  const preferences = getCookiePreferences();
  return preferences.consentGiven;
}

/**
 * Verifica si una categoría de cookies está permitida
 */
export function isCategoryAllowed(category: CookieCategory): boolean {
  const preferences = getCookiePreferences();
  
  // Essential siempre está permitido
  if (category === 'essential') {
    return true;
  }

  // Si no hay consentimiento, solo essential está permitido
  if (!preferences.consentGiven) {
    return false;
  }

  return preferences[category] || false;
}

/**
 * Elimina todas las cookies de una categoría específica
 */
export function removeCookiesByCategory(category: CookieCategory): void {
  if (typeof document === 'undefined') {
    return;
  }

  const cookieNames = COOKIE_NAMES_BY_CATEGORY[category] || [];
  
  cookieNames.forEach(cookieName => {
    // Eliminar cookie del dominio actual
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    
    // También intentar eliminar del dominio con punto (para subdominios)
    const domain = window.location.hostname;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
  });
}

/**
 * Elimina todas las cookies no esenciales
 */
export function removeAllNonEssentialCookies(): void {
  removeCookiesByCategory('analytics');
  removeCookiesByCategory('marketing');
  removeCookiesByCategory('functional');
}

/**
 * Establece una cookie
 */
export function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') {
    return;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
}

/**
 * Lee una cookie
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  
  return null;
}

/**
 * Elimina una cookie específica
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  
  // También intentar eliminar del dominio con punto
  const domain = window.location.hostname;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
}

/**
 * Obtiene información sobre cookies por categoría
 */
export function getCookiesByCategory(category: CookieCategory): CookieDefinition[] {
  return COOKIE_DEFINITIONS.filter(cookie => cookie.category === category);
}

/**
 * Obtiene todas las cookies activas del navegador
 */
export function getAllActiveCookies(): string[] {
  if (typeof document === 'undefined') {
    return [];
  }

  return document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]);
}

