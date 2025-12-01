'use client';

/**
 * Componente para cargar scripts de análisis y marketing condicionalmente
 * Solo se cargan si el usuario ha dado su consentimiento
 * 
 * Ejemplo de uso:
 * ```tsx
 * <AnalyticsScripts />
 * ```
 * 
 * Para usar, agrega este componente en tu layout.tsx después de los providers
 */

import { useCookieConsent } from '@/hooks/useCookieConsent';
import { useEffect } from 'react';
import Script from 'next/script';

// Configuración - Mover a variables de entorno en producción
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';

export default function AnalyticsScripts() {
  const canLoadAnalytics = useCookieConsent('analytics');
  const canLoadMarketing = useCookieConsent('marketing');

  // Google Analytics
  useEffect(() => {
    if (!canLoadAnalytics || !GA_MEASUREMENT_ID) return;

    // Inicializar gtag si no existe
    if (typeof window !== 'undefined' && !window.gtag) {
      if (!window.dataLayer) {
        window.dataLayer = [];
      }
      const dataLayer = window.dataLayer;
      const gtag = (...args: any[]) => {
        dataLayer.push(args);
      };
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, {
        anonymize_ip: true, // Anonimizar IPs para GDPR
      });
    }
  }, [canLoadAnalytics]);

  // Facebook Pixel
  useEffect(() => {
    if (!canLoadMarketing || !FACEBOOK_PIXEL_ID) return;

    if (typeof window !== 'undefined' && !window.fbq) {
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );
      
      // Esperar a que fbq esté disponible
      const fbqFn = window.fbq as ((...args: any[]) => void) | undefined;
      if (fbqFn) {
        fbqFn('init', FACEBOOK_PIXEL_ID);
        fbqFn('track', 'PageView');
      }
    }
  }, [canLoadMarketing]);

  return (
    <>
      {/* Google Analytics - Solo se carga si hay consentimiento */}
      {canLoadAnalytics && GA_MEASUREMENT_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel - Solo se carga si hay consentimiento */}
      {canLoadMarketing && FACEBOOK_PIXEL_ID && (
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FACEBOOK_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
    </>
  );
}

// Extender Window interface para TypeScript
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

