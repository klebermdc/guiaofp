/**
 * Analytics Hook - Estrutura completa para tracking igual WordPress
 * 
 * Suporta:
 * - GA4 (client-side e via sGTM)
 * - Facebook Pixel + CAPI (via dataLayer para sGTM)
 * - Google Tag Manager (Web + Server)
 * - Enhanced Conversions (user data hasheado)
 * - E-commerce completo (view_item, begin_checkout, purchase)
 * 
 * Os eventos são enviados para o dataLayer e processados pelo GTM/sGTM
 */

import { useCallback, useEffect } from 'react';

// User data for enhanced conversions
interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Generic analytics event
interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

// E-commerce item (GA4 spec completo)
interface EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_category2?: string;
  item_brand?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  coupon?: string;
  discount?: number;
}

// Full buyer data for dataLayer
export interface BuyerData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  cpf?: string;
}

// Build enriched e-commerce item with full product data
const buildEcommerceItem = (
  planId: string,
  planName: string,
  priceValue: number,
  coupon?: string,
  discount?: number
): EcommerceItem => ({
  item_id: planId,
  item_name: planName,
  item_category: 'Plano de Viagem',
  item_category2: planId === 'premium' ? 'Com Guia' : 'Self-Service',
  item_brand: 'Orlando Fast Pass',
  item_variant: planId,
  price: priceValue,
  quantity: 1,
  ...(coupon ? { coupon } : {}),
  ...(discount ? { discount: discount / 100 } : {}),
});

// Build buyer user_data block for dataLayer (GA4 Enhanced Conversions + CAPI)
const buildBuyerData = (buyer?: BuyerData) => {
  if (!buyer) return undefined;
  return {
    email: buyer.email,
    phone_number: buyer.phone,
    first_name: buyer.first_name,
    last_name: buyer.last_name,
    address: {
      city: buyer.city,
      region: buyer.state,
      country: buyer.country || 'BR',
      postal_code: buyer.postal_code,
    },
  };
};

// Declare global types for tracking scripts
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

// Check availability
const isGtagAvailable = () => typeof window !== 'undefined' && typeof window.gtag === 'function';
const isFbqAvailable = () => typeof window !== 'undefined' && typeof window.fbq === 'function';
const isDataLayerAvailable = () => typeof window !== 'undefined' && Array.isArray(window.dataLayer);

// Simple hash function for enhanced conversions (SHA-256 in production via sGTM)
const hashForDataLayer = (value: string): string => {
  if (!value) return '';
  const normalized = value.toLowerCase().trim();
  return normalized;
};

/**
 * Stape-compatible helpers
 * These replicate what WordPress plugins (GTM4WP / Stape Plugin) do automatically
 */

// Generate unique event_id for CAPI deduplication (same as Stape plugin)
const generateEventId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate or retrieve a persistent transaction_id for the current checkout session
// This ensures begin_checkout, add_payment_info, and purchase all share the same ID
let _checkoutTransactionId: string | null = null;

const getCheckoutTransactionId = (): string => {
  if (!_checkoutTransactionId) {
    _checkoutTransactionId = generateEventId();
  }
  return _checkoutTransactionId;
};

const resetCheckoutTransactionId = () => {
  _checkoutTransactionId = null;
};

// Get Facebook browser cookie (_fbp) - set by Facebook Pixel
const getFbp = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/_fbp=([^;]+)/);
  return match ? match[1] : null;
};

// Get Facebook click ID cookie (_fbc) - set from fbclid URL parameter
const getFbc = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/_fbc=([^;]+)/);
  if (match) return match[1];
  // Fallback: build from URL fbclid parameter
  const url = new URL(window.location.href);
  const fbclid = url.searchParams.get('fbclid');
  if (fbclid) {
    return `fb.1.${Date.now()}.${fbclid}`;
  }
  return null;
};

// Get GA client_id from _ga cookie
const getGaClientId = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/_ga=GA\d+\.\d+\.(.+)/);
  return match ? match[1] : null;
};

// Build Stape-compatible context data (equivalent to what the WP plugin sends)
const getStapeContext = () => ({
  page_location: window.location.href,
  page_path: window.location.pathname,
  page_title: document.title,
  page_referrer: document.referrer || undefined,
  user_agent: navigator.userAgent,
  language: navigator.language,
  screen_resolution: `${screen.width}x${screen.height}`,
  fbp: getFbp(),
  fbc: getFbc(),
  client_id: getGaClientId(),
  event_id: generateEventId(),
});

export const useAnalytics = () => {
  /**
   * Set user data for enhanced conversions
   * This data is sent with conversion events for better attribution
   */
  const setUserData = useCallback((userData: UserData) => {
    // dataLayer only — GTM handles Enhanced Conversions + FB Advanced Matching
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: 'set_user_data',
        user_data: {
          email: userData.email,
          phone: userData.phone,
          first_name: userData.firstName,
          last_name: userData.lastName,
          city: userData.city,
          state: userData.state,
          country: userData.country || 'BR',
          postal_code: userData.postalCode,
        },
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] User data set for enhanced conversions');
    }
  }, []);

  /**
   * Generic event - sends to GA4, GTM dataLayer, and Facebook
   */
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const { action, category, label, value, ...customParams } = event;

    // All events go through dataLayer only — GTM handles GA4 + FB Pixel tags
    if (isDataLayerAvailable()) {
      const ctx = getStapeContext();
      window.dataLayer?.push({
        event: action,
        event_id: ctx.event_id,
        eventCategory: category,
        eventLabel: label,
        eventValue: value,
        ...customParams,
        page_location: ctx.page_location,
        user_agent: ctx.user_agent,
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        client_id: ctx.client_id,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics]', action, { category, label, value, ...customParams });
    }
  }, []);

  /**
   * Page View
   */
  const trackPageView = useCallback((pagePath?: string, pageTitle?: string) => {
    const path = pagePath || window.location.pathname;
    const title = pageTitle || document.title;

    // dataLayer only — GTM handles GA4 page_view + FB PageView tags
    if (isDataLayerAvailable()) {
      const ctx = getStapeContext();
      window.dataLayer?.push({
        event: 'page_view',
        event_id: ctx.event_id,
        page_path: path,
        page_title: title,
        page_location: ctx.page_location,
        page_referrer: ctx.page_referrer,
        user_agent: ctx.user_agent,
        language: ctx.language,
        screen_resolution: ctx.screen_resolution,
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        client_id: ctx.client_id,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] PageView:', path);
    }
  }, []);

  /**
   * Scroll Depth
   */
  const trackScrollDepth = useCallback((percentage: number) => {
    trackEvent({
      action: 'scroll_depth',
      category: 'Engagement',
      label: `${percentage}%`,
      value: percentage,
    });
  }, [trackEvent]);

  /**
   * CTA Click
   */
  const trackCTAClick = useCallback((ctaName: string, ctaLocation?: string) => {
    trackEvent({
      action: 'cta_click',
      category: 'CTA',
      label: ctaName,
      cta_location: ctaLocation,
    });
    // FB Lead event is handled by GTM tag triggered on cta_click event
  }, [trackEvent]);

  /**
   * View Item (E-commerce)
   */
  const trackPlanView = useCallback((planId: string, planName: string, price: number, buyer?: BuyerData) => {
    const priceValue = price / 100;
    const item = buildEcommerceItem(planId, planName, priceValue);

    // dataLayer only — GTM handles GA4 view_item + FB ViewContent tags
    if (isDataLayerAvailable()) {
      const ctx = getStapeContext();
      window.dataLayer?.push({ ecommerce: null });
      window.dataLayer?.push({
        event: 'view_item',
        event_id: ctx.event_id,
        ecommerce: {
          currency: 'BRL',
          value: priceValue,
          items: [item],
        },
        user_data: buildBuyerData(buyer),
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        client_id: ctx.client_id,
        page_location: ctx.page_location,
        user_agent: ctx.user_agent,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] ViewItem:', planName, priceValue);
    }
  }, []);

  /**
   * Begin Checkout
   */
  const trackBeginCheckout = useCallback((planId: string, planName: string, price: number, coupon?: string, buyer?: BuyerData) => {
    const priceValue = price / 100;
    const item = buildEcommerceItem(planId, planName, priceValue, coupon);
    const txId = getCheckoutTransactionId();

    // dataLayer only — GTM handles GA4 begin_checkout + FB InitiateCheckout tags
    if (isDataLayerAvailable()) {
      const ctx = getStapeContext();
      window.dataLayer?.push({ ecommerce: null });
      window.dataLayer?.push({
        event: 'begin_checkout',
        event_id: ctx.event_id,
        ecommerce: {
          transaction_id: txId,
          currency: 'BRL',
          value: priceValue,
          coupon: coupon,
          items: [item],
        },
        user_data: buildBuyerData(buyer),
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        client_id: ctx.client_id,
        page_location: ctx.page_location,
        user_agent: ctx.user_agent,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] BeginCheckout:', planName, priceValue);
    }
  }, []);

  /**
   * Add Payment Info
   */
  const trackAddPaymentInfo = useCallback((planId: string, planName: string, price: number, paymentMethod: string, coupon?: string, buyer?: BuyerData) => {
    const priceValue = price / 100;
    const item = buildEcommerceItem(planId, planName, priceValue, coupon);
    const txId = getCheckoutTransactionId();

    // dataLayer only — GTM handles GA4 add_payment_info + FB AddPaymentInfo tags
    if (isDataLayerAvailable()) {
      const ctx = getStapeContext();
      window.dataLayer?.push({ ecommerce: null });
      window.dataLayer?.push({
        event: 'add_payment_info',
        event_id: ctx.event_id,
        ecommerce: {
          transaction_id: txId,
          currency: 'BRL',
          value: priceValue,
          payment_type: paymentMethod,
          coupon: coupon,
          items: [item],
        },
        user_data: buildBuyerData(buyer),
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        client_id: ctx.client_id,
        page_location: ctx.page_location,
        user_agent: ctx.user_agent,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] AddPaymentInfo:', paymentMethod);
    }
  }, []);

  /**
   * Purchase - Main conversion event
   * This is the most important event for CAPI and Enhanced Conversions
   */
  const trackPurchase = useCallback((
    transactionId: string,
    planId: string,
    planName: string,
    price: number,
    paymentMethod: string,
    coupon?: string,
    buyer?: BuyerData
  ) => {
    const priceValue = price / 100;
    const item = buildEcommerceItem(planId, planName, priceValue, coupon);
    const buyerDataBlock = buildBuyerData(buyer);

    // dataLayer only — GTM handles GA4 purchase + FB Purchase + Enhanced Conversions
    if (isDataLayerAvailable()) {
      const ctx = getStapeContext();
      window.dataLayer?.push({ ecommerce: null });
      window.dataLayer?.push({
        event: 'purchase',
        event_id: ctx.event_id,
        ecommerce: {
          transaction_id: transactionId,
          currency: 'BRL',
          value: priceValue,
          payment_type: paymentMethod,
          coupon: coupon,
          items: [item],
        },
        user_data: buyerDataBlock,
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        client_id: ctx.client_id,
        page_location: ctx.page_location,
        user_agent: ctx.user_agent,
      });
    }

    // Reset checkout transaction ID after successful purchase
    resetCheckoutTransactionId();

    if (import.meta.env.DEV) {
      console.log('[Analytics] Purchase:', transactionId, priceValue);
    }
  }, []);

  /**
   * Lead Generation
   */
  const trackLead = useCallback((source: string, value?: number, userData?: UserData) => {
    const leadValue = value ? value / 100 : undefined;

    trackEvent({
      action: 'generate_lead',
      category: 'Lead',
      label: source,
      value: leadValue,
    });

    // Push user data for CAPI with Stape context
    if (isDataLayerAvailable() && userData) {
      const ctx = getStapeContext();
      window.dataLayer?.push({
        event: 'lead',
        event_id: ctx.event_id,
        lead_source: source,
        lead_value: leadValue,
        user_data: {
          email: userData.email,
          phone: userData.phone,
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        client_id: ctx.client_id,
      });
    }

    // Facebook Pixel
    if (isFbqAvailable()) {
      window.fbq?.('track', 'Lead', {
        content_name: source,
        value: leadValue,
        currency: 'BRL',
      });
    }
  }, [trackEvent]);

  /**
   * Sign Up
   */
  const trackSignUp = useCallback((method: string, userData?: UserData) => {
    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', 'sign_up', {
        method: method,
      });
    }

    // GTM dataLayer
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: 'sign_up',
        method: method,
        user_data: userData ? {
          email: userData.email,
          phone: userData.phone,
        } : undefined,
      });
    }

    // Facebook Pixel
    if (isFbqAvailable()) {
      window.fbq?.('track', 'CompleteRegistration', {
        content_name: method,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] SignUp:', method);
    }
  }, []);

  /**
   * Login
   */
  const trackLogin = useCallback((method: string) => {
    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', 'login', {
        method: method,
      });
    }

    // GTM dataLayer
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: 'login',
        method: method,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] Login:', method);
    }
  }, []);

  /**
   * Form Submit (for CAPI)
   */
  const trackFormSubmit = useCallback((formName: string, userData?: UserData) => {
    // GTM dataLayer with user data for CAPI
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: 'form_submit',
        form_name: formName,
        user_data: userData ? {
          email: userData.email,
          phone: userData.phone,
          first_name: userData.firstName,
          last_name: userData.lastName,
        } : undefined,
      });
    }

    // Facebook Lead
    if (isFbqAvailable()) {
      window.fbq?.('track', 'Lead', {
        content_name: formName,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] FormSubmit:', formName);
    }
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackScrollDepth,
    trackCTAClick,
    trackPlanView,
    trackBeginCheckout,
    trackAddPaymentInfo,
    trackPurchase,
    trackLead,
    trackSignUp,
    trackLogin,
    trackFormSubmit,
    setUserData,
  };
};

/**
 * Hook for automatic scroll depth tracking
 */
export const useScrollTracking = () => {
  const { trackScrollDepth } = useAnalytics();

  useEffect(() => {
    const thresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = new Set<number>();

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const percentage = Math.round((scrolled / scrollHeight) * 100);

      thresholds.forEach((threshold) => {
        if (percentage >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          trackScrollDepth(threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);
};

export default useAnalytics;