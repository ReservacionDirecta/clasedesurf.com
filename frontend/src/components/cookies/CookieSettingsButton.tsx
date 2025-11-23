'use client';

import { useCookie } from '@/contexts/CookieContext';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CookieSettingsButtonProps {
  variant?: 'button' | 'link';
  className?: string;
}

/**
 * Componente para abrir las preferencias de cookies desde cualquier lugar
 * Útil para agregar en el footer o navbar
 */
export default function CookieSettingsButton({ 
  variant = 'link',
  className = '' 
}: CookieSettingsButtonProps) {
  const { setShowPreferences } = useCookie();

  const handleClick = () => {
    setShowPreferences(true);
  };

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={className}
      >
        <Settings className="w-4 h-4 mr-2 inline" />
        Preferencias de Cookies
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`text-sm text-gray-600 hover:text-gray-900 underline transition-colors ${className}`}
      aria-label="Abrir preferencias de cookies"
    >
      <Settings className="w-3 h-3 inline mr-1" />
      Preferencias de Cookies
    </button>
  );
}

