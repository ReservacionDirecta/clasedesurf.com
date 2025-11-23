'use client';

import { useCookie } from '@/contexts/CookieContext';
import { Button } from '@/components/ui/Button';
import { Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const { showBanner, setShowBanner, acceptAll, rejectAll, setShowPreferences } = useCookie();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showBanner) {
      // Pequeño delay para animación
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [showBanner]);

  if (!showBanner) return null;

  const handleAcceptAll = () => {
    acceptAll();
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setIsVisible(false);
  };

  const handleCustomize = () => {
    setShowPreferences(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t-2 border-gray-200 shadow-2xl transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Contenido */}
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3
                  id="cookie-banner-title"
                  className="text-base sm:text-lg font-semibold text-gray-900 mb-1"
                >
                  Uso de Cookies
                </h3>
                <p
                  id="cookie-banner-description"
                  className="text-sm sm:text-base text-gray-600 leading-relaxed"
                >
                  Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido. 
                  Al hacer clic en "Aceptar todas", aceptas nuestro uso de cookies. Puedes gestionar tus preferencias en cualquier momento.
                  <a
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-700 underline ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Más información
                  </a>
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors p-1 touch-target"
                aria-label="Cerrar banner de cookies"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={handleRejectAll}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Rechazar todas
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleCustomize}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              Personalizar
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Aceptar todas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

