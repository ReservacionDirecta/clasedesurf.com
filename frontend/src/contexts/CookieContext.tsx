'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  CookiePreferences,
  getCookiePreferences,
  saveCookiePreferences,
  hasConsent,
  isCategoryAllowed,
  removeCookiesByCategory,
  removeAllNonEssentialCookies,
  DEFAULT_PREFERENCES,
  CookieCategory
} from '@/lib/cookies';

interface CookieContextType {
  preferences: CookiePreferences;
  hasConsent: boolean;
  isCategoryAllowed: (category: CookieCategory) => boolean;
  updatePreferences: (preferences: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: () => void;
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export const useCookie = () => {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookie must be used within a CookieProvider');
  }
  return context;
};

interface CookieProviderProps {
  children: ReactNode;
}

export const CookieProvider: React.FC<CookieProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar preferencias al montar
  useEffect(() => {
    const savedPreferences = getCookiePreferences();
    setPreferences(savedPreferences);
    
    // Mostrar banner solo si no hay consentimiento
    if (!savedPreferences.consentGiven) {
      setShowBanner(true);
    }
    
    setIsInitialized(true);
  }, []);

  // Aplicar preferencias cuando cambian
  useEffect(() => {
    if (!isInitialized) return;

    // Si se rechazan todas las cookies no esenciales, eliminarlas
    if (preferences.consentGiven) {
      if (!preferences.analytics) {
        removeCookiesByCategory('analytics');
      }
      if (!preferences.marketing) {
        removeCookiesByCategory('marketing');
      }
      if (!preferences.functional) {
        removeCookiesByCategory('functional');
      }
    } else {
      // Si no hay consentimiento, eliminar todas las no esenciales
      removeAllNonEssentialCookies();
    }
  }, [preferences, isInitialized]);

  const updatePreferences = useCallback((newPreferences: Partial<CookiePreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  }, []);

  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    setPreferences(allAccepted);
    saveCookiePreferences(allAccepted);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const rejectAll = useCallback(() => {
    const allRejected: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    setPreferences(allRejected);
    saveCookiePreferences(allRejected);
    removeAllNonEssentialCookies();
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const savePreferences = useCallback(() => {
    const preferencesToSave: CookiePreferences = {
      ...preferences,
      consentGiven: true,
      consentDate: new Date().toISOString()
    };
    
    setPreferences(preferencesToSave);
    saveCookiePreferences(preferencesToSave);
    setShowBanner(false);
    setShowPreferences(false);
  }, [preferences]);

  const checkCategoryAllowed = useCallback((category: CookieCategory): boolean => {
    return isCategoryAllowed(category);
  }, []);

  return (
    <CookieContext.Provider
      value={{
        preferences,
        hasConsent: hasConsent(),
        isCategoryAllowed: checkCategoryAllowed,
        updatePreferences,
        acceptAll,
        rejectAll,
        savePreferences,
        showBanner,
        setShowBanner,
        showPreferences,
        setShowPreferences
      }}
    >
      {children}
    </CookieContext.Provider>
  );
};

