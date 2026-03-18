/**
 * Analytics Provider
 * 
 * GTM is loaded via Stape Custom Loader in index.html.
 * GA4 and FB Pixel are managed as tags INSIDE GTM.
 * 
 * This provider:
 * 1. Fetches tracking_config from DB (for context/flags)
 * 2. Tracks page views via dataLayer (consumed by GTM tags)
 * 3. Exposes config context for other components
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

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const location = useLocation();
  const { trackPageView } = useAnalytics();
  const [config, setConfig] = useState<TrackingConfig | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Fetch tracking config from database
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
