/**
 * Analytics Provider - Componente para injetar scripts de tracking
 * 
 * Suporta:
 * - GTM Web (como ponte para sGTM)
 * - Server GTM (Stape/Cloudflare)
 * - GA4 (client-side)
 * - Facebook Pixel (client-side)
 * - Enhanced Conversions
 * - First-Party Collection
 * 
 * Os IDs são carregados dinamicamente do banco de dados (tracking_config)
 * e podem ser configurados pelo painel admin em Dados & Analytics > Tracking (LP)
 */

import { useEffect, useState, createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';

interface TrackingConfig {
  ga4_measurement_id: string;
  fb_pixel_id: string;
  gtm_container_id: string;
  sgtm_url: string;
  sgtm_container_id: string;
  fb_access_token: string;
  fb_test_event_code: string;
  enhanced_conversions: boolean;
  first_party_collection: boolean;
}

interface AnalyticsContextValue {
  config: TrackingConfig | null;
  isLoaded: boolean;
  isSgtmEnabled: boolean;
  isCapiEnabled: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  config: null,
  isLoaded: false,
  isSgtmEnabled: false,
  isCapiEnabled: false,
});

export const useAnalyticsConfig = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

// Initialize dataLayer
const initDataLayer = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
  }
};

// Load GTM with optional sGTM transport URL and custom loader path
const loadGTM = (containerId: string, sgtmUrl?: string, customLoaderPath?: string) => {
  if (!containerId || document.getElementById('gtm-script')) return;

  initDataLayer();

  // GTM Script - with optional sGTM URL for server-side transport
  const script = document.createElement('script');
  script.id = 'gtm-script';
  
  if (sgtmUrl) {
    // Use sGTM as transport layer, with optional custom loader path (Stape proxy)
    const sgtmHost = sgtmUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const loaderPrefix = customLoaderPath ? `${customLoaderPath}/` : '';
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://${sgtmHost}/${loaderPrefix}gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${containerId}');
    `;
  } else {
    // Standard GTM
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${containerId}');
    `;
  }
  document.head.appendChild(script);

  // GTM NoScript fallback removed — dynamically created <noscript> elements
  // render their children as visible DOM nodes (JS is obviously running),
  // which caused a visible black rectangle on mobile.
};

// Load GA4 with optional sGTM transport
const loadGA4 = (measurementId: string, sgtmUrl?: string, enhancedConversions?: boolean) => {
  if (!measurementId || document.getElementById('ga4-script')) return;

  initDataLayer();

  // GA4 Script Tag - use sGTM URL if available
  const script1 = document.createElement('script');
  script1.id = 'ga4-script';
  script1.async = true;
  
  if (sgtmUrl) {
    const sgtmHost = sgtmUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    script1.src = `https://${sgtmHost}/gtag/js?id=${measurementId}`;
  } else {
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  }
  document.head.appendChild(script1);

  // GA4 Config with enhanced options
  const script2 = document.createElement('script');
  script2.id = 'ga4-config';
  
  const configOptions: Record<string, unknown> = {
    page_path: window.location.pathname,
    send_page_view: false,
  };

  // Add sGTM transport URL
  if (sgtmUrl) {
    configOptions.transport_url = sgtmUrl;
    configOptions.first_party_collection = true;
  }

  // Enable enhanced conversions if configured
  if (enhancedConversions) {
    configOptions.allow_enhanced_conversions = true;
  }

  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', ${JSON.stringify(configOptions)});
  `;
  document.head.appendChild(script2);
};

// Load Facebook Pixel
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

  // FB Pixel NoScript fallback removed — dynamically created <noscript> elements
  // render their children as visible DOM nodes, causing a white rectangle on mobile.
};

// Push sGTM config to dataLayer for server-side processing
const pushSgtmConfig = (config: TrackingConfig) => {
  if (!window.dataLayer) return;

  // Push configuration for sGTM tags to use
  window.dataLayer.push({
    event: 'sgtm_config',
    sgtm: {
      url: config.sgtm_url,
      containerId: config.sgtm_container_id,
      fbAccessToken: config.fb_access_token ? '***' : null, // Don't expose token client-side
      fbTestEventCode: config.fb_test_event_code,
      enhancedConversions: config.enhanced_conversions,
      firstPartyCollection: config.first_party_collection,
    },
  });
};

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const location = useLocation();
  const { trackPageView } = useAnalytics();
  const [config, setConfig] = useState<TrackingConfig | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Fetch tracking config from database and load scripts
  useEffect(() => {
    const loadTrackingConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('tracking_config')
          .select('config_key, config_value, is_active');

        if (error) {
          console.error('Failed to load tracking config:', error);
          setConfigLoaded(true);
          return;
        }

        const trackingConfig: TrackingConfig = {
          ga4_measurement_id: '',
          fb_pixel_id: '',
          gtm_container_id: '',
          sgtm_url: '',
          sgtm_container_id: '',
          fb_access_token: '',
          fb_test_event_code: '',
          enhanced_conversions: false,
          first_party_collection: false,
        };

        data?.forEach((item) => {
          if (item.is_active && item.config_value) {
            const key = item.config_key;
            switch (key) {
              case 'enhanced_conversions':
              case 'first_party_collection':
                trackingConfig[key] = item.config_value === 'true';
                break;
              case 'ga4_measurement_id':
              case 'fb_pixel_id':
              case 'gtm_container_id':
              case 'sgtm_url':
              case 'sgtm_container_id':
              case 'fb_access_token':
              case 'fb_test_event_code':
                trackingConfig[key] = item.config_value;
                break;
            }
          }
        });

        setConfig(trackingConfig);

        // Determine sGTM URL to use
        const sgtmUrl = trackingConfig.sgtm_url || undefined;

        // Load GTM (with sGTM transport if configured)
        if (trackingConfig.gtm_container_id) {
          loadGTM(trackingConfig.gtm_container_id, sgtmUrl, trackingConfig.sgtm_container_id || undefined);
        }

        // Load GA4 (with sGTM transport if configured)
        if (trackingConfig.ga4_measurement_id) {
          loadGA4(
            trackingConfig.ga4_measurement_id, 
            sgtmUrl,
            trackingConfig.enhanced_conversions
          );
        }

        // Load Facebook Pixel (client-side, CAPI handled by sGTM)
        if (trackingConfig.fb_pixel_id) {
          loadFBPixel(trackingConfig.fb_pixel_id);
        }

        // Push sGTM config to dataLayer
        if (sgtmUrl && trackingConfig.sgtm_container_id) {
          pushSgtmConfig(trackingConfig);
        }

        setConfigLoaded(true);
      } catch (err) {
        console.error('Error loading tracking config:', err);
        setConfigLoaded(true);
      }
    };

    loadTrackingConfig();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!configLoaded) return;

    const timeout = setTimeout(() => {
      trackPageView(location.pathname, document.title);
    }, 100);

    return () => clearTimeout(timeout);
  }, [location.pathname, trackPageView, configLoaded]);

  const contextValue: AnalyticsContextValue = {
    config,
    isLoaded: configLoaded,
    isSgtmEnabled: Boolean(config?.sgtm_url && config?.sgtm_container_id),
    isCapiEnabled: Boolean(config?.fb_access_token),
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;