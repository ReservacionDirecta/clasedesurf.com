'use client';

import { useCookie } from '@/contexts/CookieContext';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CookieCategory, getCookiesByCategory, COOKIE_DEFINITIONS } from '@/lib/cookies';
import { Info, Check, X } from 'lucide-react';
import { useState } from 'react';

interface CategoryInfo {
  category: CookieCategory;
  title: string;
  description: string;
  required: boolean;
}

const CATEGORIES: CategoryInfo[] = [
  {
    category: 'essential',
    title: 'Cookies Esenciales',
    description: 'Estas cookies son necesarias para el funcionamiento básico del sitio web y no se pueden desactivar. Incluyen cookies de autenticación y seguridad.',
    required: true
  },
  {
    category: 'analytics',
    title: 'Cookies de Análisis',
    description: 'Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web recopilando y reportando información de forma anónima.',
    required: false
  },
  {
    category: 'marketing',
    title: 'Cookies de Marketing',
    description: 'Estas cookies se utilizan para hacer seguimiento de los visitantes a través de diferentes sitios web con la intención de mostrar anuncios relevantes.',
    required: false
  },
  {
    category: 'functional',
    title: 'Cookies Funcionales',
    description: 'Estas cookies permiten que el sitio web recuerde las elecciones que haces (como tu nombre de usuario, idioma o región) y proporcionan características mejoradas y más personales.',
    required: false
  }
];

export default function CookiePreferences() {
  const {
    preferences,
    updatePreferences,
    savePreferences,
    showPreferences,
    setShowPreferences
  } = useCookie();

  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleToggle = (category: CookieCategory) => {
    if (category === 'essential') return; // No se puede desactivar

    setLocalPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSave = () => {
    updatePreferences(localPreferences);
    savePreferences();
  };

  const handleAcceptAll = () => {
    setLocalPreferences({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      version: '1.0.0'
    });
    updatePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      version: '1.0.0'
    });
    savePreferences();
  };

  const handleRejectAll = () => {
    setLocalPreferences({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      version: '1.0.0'
    });
    updatePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      version: '1.0.0'
    });
    savePreferences();
  };

  return (
    <Modal
      isOpen={showPreferences}
      onClose={() => setShowPreferences(false)}
      title="Preferencias de Cookies"
      size="lg"
    >
      <div className="space-y-6">
        {/* Introducción */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 leading-relaxed">
                Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Puedes elegir qué tipos de cookies aceptar. 
                Las cookies esenciales son necesarias para el funcionamiento del sitio y no se pueden desactivar.
              </p>
              <a
                href="/privacy"
                className="text-blue-600 hover:text-blue-700 underline text-sm mt-2 inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Leer nuestra política de privacidad completa
              </a>
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="space-y-4">
          {CATEGORIES.map(({ category, title, description, required }) => {
            const isEnabled = localPreferences[category];
            const cookies = getCookiesByCategory(category);

            return (
              <div
                key={category}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                      {required && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Requerido
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{description}</p>

                    {/* Lista de cookies */}
                    {cookies.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Cookies utilizadas ({cookies.length}):
                        </p>
                        <ul className="space-y-1">
                          {cookies.map((cookie) => (
                            <li key={cookie.name} className="text-xs text-gray-600">
                              <span className="font-mono text-gray-800">{cookie.name}</span>
                              <span className="text-gray-500 ml-2">• {cookie.duration}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Toggle */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleToggle(category)}
                      disabled={required}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}
                        ${required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      `}
                      aria-label={`${isEnabled ? 'Desactivar' : 'Activar'} ${title}`}
                      aria-pressed={isEnabled}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Información sobre tus derechos
          </h4>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>
              <strong>GDPR (Europa):</strong> Tienes derecho a retirar tu consentimiento en cualquier momento.
            </li>
            <li>
              <strong>CCPA/CPRA (California):</strong> Tienes derecho a optar por no participar en la venta de información personal.
            </li>
            <li>
              Puedes cambiar tus preferencias en cualquier momento desde esta página.
            </li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="md"
            onClick={handleRejectAll}
            className="flex-1 sm:flex-none"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Rechazar todas
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowPreferences(false)}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            className="flex-1 sm:flex-none"
          >
            <Check className="w-4 h-4 mr-2 inline" />
            Guardar preferencias
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleAcceptAll}
            className="flex-1 sm:flex-none"
          >
            Aceptar todas
          </Button>
        </div>
      </div>
    </Modal>
  );
}

