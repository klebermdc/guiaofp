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

// E-commerce item
interface EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}

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
  // Normalize: lowercase, trim
  const normalized = value.toLowerCase().trim();
  // In production, sGTM will hash this properly with SHA-256
  // For client-side, we just send the normalized value and let sGTM handle hashing
  return normalized;
};

export const useAnalytics = () => {
  /**
   * Set user data for enhanced conversions
   * This data is sent with conversion events for better attribution
   */
  const setUserData = useCallback((userData: UserData) => {
    // GA4 Enhanced Conversions
    if (isGtagAvailable()) {
      window.gtag?.('set', 'user_data', {
        email: userData.email ? hashForDataLayer(userData.email) : undefined,
        phone_number: userData.phone ? hashForDataLayer(userData.phone) : undefined,
        address: {
          first_name: userData.firstName ? hashForDataLayer(userData.firstName) : undefined,
          last_name: userData.lastName ? hashForDataLayer(userData.lastName) : undefined,
          city: userData.city,
          region: userData.state,
          country: userData.country || 'BR',
          postal_code: userData.postalCode,
        },
      });
    }

    // Push to dataLayer for sGTM to process
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

    // Facebook Advanced Matching
    if (isFbqAvailable() && userData.email) {
      window.fbq?.('init', '', {
        em: hashForDataLayer(userData.email),
        ph: userData.phone ? hashForDataLayer(userData.phone) : undefined,
        fn: userData.firstName ? hashForDataLayer(userData.firstName) : undefined,
        ln: userData.lastName ? hashForDataLayer(userData.lastName) : undefined,
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

    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...customParams,
      });
    }

    // GTM dataLayer (for sGTM processing)
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: action,
        eventCategory: category,
        eventLabel: label,
        eventValue: value,
        ...customParams,
      });
    }

    // Facebook Pixel (custom events)
    if (isFbqAvailable()) {
      window.fbq?.('trackCustom', action, {
        category,
        label,
        value,
        ...customParams,
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

    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', 'page_view', {
        page_path: path,
        page_title: title,
        page_location: window.location.href,
      });
    }

    // GTM dataLayer
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: 'page_view',
        pagePath: path,
        pageTitle: title,
        pageLocation: window.location.href,
      });
    }

    // Facebook Pixel
    if (isFbqAvailable()) {
      window.fbq?.('track', 'PageView');
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

    // Facebook Lead event
    if (isFbqAvailable()) {
      window.fbq?.('track', 'Lead', {
        content_name: ctaName,
        content_category: ctaLocation,
      });
    }
  }, [trackEvent]);

  /**
   * View Item (E-commerce)
   */
  const trackPlanView = useCallback((planId: string, planName: string, price: number) => {
    const priceValue = price / 100;

    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', 'view_item', {
        currency: 'BRL',
        value: priceValue,
        items: [{
          item_id: planId,
          item_name: planName,
          price: priceValue,
          quantity: 1,
        }],
      });
    }

    // GTM dataLayer (GA4 e-commerce format)
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({ ecommerce: null }); // Clear previous
      window.dataLayer?.push({
        event: 'view_item',
        ecommerce: {
          currency: 'BRL',
          value: priceValue,
          items: [{
            item_id: planId,
            item_name: planName,
            price: priceValue,
            quantity: 1,
          }],
        },
      });
    }

    // Facebook Pixel
    if (isFbqAvailable()) {
      window.fbq?.('track', 'ViewContent', {
        content_ids: [planId],
        content_name: planName,
        content_type: 'product',
        value: priceValue,
        currency: 'BRL',
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] ViewItem:', planName, priceValue);
    }
  }, []);

  /**
   * Begin Checkout
   */
  const trackBeginCheckout = useCallback((planId: string, planName: string, price: number, coupon?: string) => {
    const priceValue = price / 100;

    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', 'begin_checkout', {
        currency: 'BRL',
        value: priceValue,
        coupon: coupon,
        items: [{
          item_id: planId,
          item_name: planName,
          price: priceValue,
          quantity: 1,
        }],
      });
    }

    // GTM dataLayer
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({ ecommerce: null });
      window.dataLayer?.push({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'BRL',
          value: priceValue,
          coupon: coupon,
          items: [{
            item_id: planId,
            item_name: planName,
            price: priceValue,
            quantity: 1,
          }],
        },
      });
    }

    // Facebook Pixel
    if (isFbqAvailable()) {
      window.fbq?.('track', 'InitiateCheckout', {
        content_ids: [planId],
        content_name: planName,
        content_type: 'product',
        value: priceValue,
        currency: 'BRL',
        num_items: 1,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] BeginCheckout:', planName, priceValue);
    }
  }, []);

  /**
   * Add Payment Info
   */
  const trackAddPaymentInfo = useCallback((planId: string, planName: string, price: number, paymentMethod: string) => {
    const priceValue = price / 100;

    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', 'add_payment_info', {
        currency: 'BRL',
        value: priceValue,
        payment_type: paymentMethod,
        items: [{
          item_id: planId,
          item_name: planName,
          price: priceValue,
          quantity: 1,
        }],
      });
    }

    // GTM dataLayer
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({ ecommerce: null });
      window.dataLayer?.push({
        event: 'add_payment_info',
        ecommerce: {
          currency: 'BRL',
          value: priceValue,
          payment_type: paymentMethod,
          items: [{
            item_id: planId,
            item_name: planName,
            price: priceValue,
            quantity: 1,
          }],
        },
      });
    }

    // Facebook Pixel
    if (isFbqAvailable()) {
      window.fbq?.('track', 'AddPaymentInfo', {
        content_ids: [planId],
        content_name: planName,
        value: priceValue,
        currency: 'BRL',
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
    userData?: UserData
  ) => {
    const priceValue = price / 100;

    // Set user data for enhanced conversions if provided
    if (userData?.email) {
      // GA4 Enhanced Conversions
      if (isGtagAvailable()) {
        window.gtag?.('set', 'user_data', {
          email: hashForDataLayer(userData.email),
          phone_number: userData.phone ? hashForDataLayer(userData.phone) : undefined,
          address: {
            first_name: userData.firstName ? hashForDataLayer(userData.firstName) : undefined,
            last_name: userData.lastName ? hashForDataLayer(userData.lastName) : undefined,
          },
        });
      }
    }

    // GA4 Purchase
    if (isGtagAvailable()) {
      window.gtag?.('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'BRL',
        value: priceValue,
        payment_type: paymentMethod,
        items: [{
          item_id: planId,
          item_name: planName,
          price: priceValue,
          quantity: 1,
        }],
      });
    }

    // GTM dataLayer (for sGTM to process and send to CAPI)
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({ ecommerce: null });
      window.dataLayer?.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: transactionId,
          currency: 'BRL',
          value: priceValue,
          payment_type: paymentMethod,
          items: [{
            item_id: planId,
            item_name: planName,
            price: priceValue,
            quantity: 1,
          }],
        },
        // User data for CAPI (sGTM will hash and send)
        user_data: userData ? {
          email: userData.email,
          phone: userData.phone,
          first_name: userData.firstName,
          last_name: userData.lastName,
        } : undefined,
      });
    }

    // Facebook Pixel (client-side)
    if (isFbqAvailable()) {
      window.fbq?.('track', 'Purchase', {
        content_ids: [planId],
        content_name: planName,
        content_type: 'product',
        value: priceValue,
        currency: 'BRL',
        num_items: 1,
      });
    }

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

    // Push user data for CAPI
    if (isDataLayerAvailable() && userData) {
      window.dataLayer?.push({
        event: 'lead',
        lead_source: source,
        lead_value: leadValue,
        user_data: {
          email: userData.email,
          phone: userData.phone,
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
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