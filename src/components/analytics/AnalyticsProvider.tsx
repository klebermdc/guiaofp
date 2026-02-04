/**
 * Analytics Provider - Componente para injetar scripts de tracking
 * 
 * CONFIGURAÇÃO:
 * 1. Defina os IDs no arquivo .env ou diretamente aqui
 * 2. Os scripts são carregados de forma assíncrona para não bloquear a página
 * 
 * IDs necessários:
 * - GA4_MEASUREMENT_ID: G-XXXXXXXXXX
 * - FB_PIXEL_ID: XXXXXXXXXXXXXXXX  
 * - GTM_CONTAINER_ID: GTM-XXXXXXX
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

// Configuração dos IDs de tracking
// IMPORTANTE: Substitua pelos seus IDs reais
const TRACKING_CONFIG = {
  GA4_MEASUREMENT_ID: '', // Ex: 'G-XXXXXXXXXX'
  FB_PIXEL_ID: '', // Ex: '1234567890123456'
  GTM_CONTAINER_ID: '', // Ex: 'GTM-XXXXXXX'
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

// Carrega o script do Google Tag Manager
const loadGTM = (containerId: string) => {
  if (!containerId || document.getElementById('gtm-script')) return;

  // GTM Script
  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${containerId}');
  `;
  document.head.appendChild(script);

  // GTM NoScript (fallback)
  const noscript = document.createElement('noscript');
  noscript.id = 'gtm-noscript';
  noscript.innerHTML = `
    <iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
  `;
  document.body.insertBefore(noscript, document.body.firstChild);
};

// Carrega o script do Google Analytics 4
const loadGA4 = (measurementId: string) => {
  if (!measurementId || document.getElementById('ga4-script')) return;

  // GA4 Script Tag
  const script1 = document.createElement('script');
  script1.id = 'ga4-script';
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // GA4 Config
  const script2 = document.createElement('script');
  script2.id = 'ga4-config';
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_path: window.location.pathname,
      send_page_view: false
    });
  `;
  document.head.appendChild(script2);
};

// Carrega o Facebook Pixel
const loadFBPixel = (pixelId: string) => {
  if (!pixelId || document.getElementById('fb-pixel-script')) return;

  const script = document.createElement('script');
  script.id = 'fb-pixel-script';
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
  `;
  document.head.appendChild(script);

  // NoScript fallback
  const noscript = document.createElement('noscript');
  noscript.id = 'fb-pixel-noscript';
  noscript.innerHTML = `
    <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
  `;
  document.body.appendChild(noscript);
};

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  // Carrega os scripts de tracking uma vez
  useEffect(() => {
    // Só carrega em produção ou se os IDs estiverem configurados
    const isProduction = import.meta.env.PROD;
    
    if (isProduction || TRACKING_CONFIG.GTM_CONTAINER_ID) {
      loadGTM(TRACKING_CONFIG.GTM_CONTAINER_ID);
    }
    
    if (isProduction || TRACKING_CONFIG.GA4_MEASUREMENT_ID) {
      loadGA4(TRACKING_CONFIG.GA4_MEASUREMENT_ID);
    }
    
    if (isProduction || TRACKING_CONFIG.FB_PIXEL_ID) {
      loadFBPixel(TRACKING_CONFIG.FB_PIXEL_ID);
    }
  }, []);

  // Tracking automático de page views em mudança de rota
  useEffect(() => {
    // Pequeno delay para garantir que o título da página foi atualizado
    const timeout = setTimeout(() => {
      trackPageView(location.pathname, document.title);
    }, 100);

    return () => clearTimeout(timeout);
  }, [location.pathname, trackPageView]);

  return <>{children}</>;
};

export default AnalyticsProvider;
