/**
 * Analytics Hook - Estrutura para GA4, Facebook Pixel e GTM
 * 
 * IMPORTANTE: Para ativar o tracking, adicione os IDs no index.html:
 * - GA4: G-XXXXXXXXXX
 * - Facebook Pixel: XXXXXXXXXXXXXXXX
 * - GTM: GTM-XXXXXXX
 */

import { useCallback, useEffect } from 'react';

// Tipos para eventos personalizados
interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  // Parâmetros extras para eventos específicos
  [key: string]: unknown;
}

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

// Verifica se o tracking está disponível
const isGtagAvailable = () => typeof window !== 'undefined' && typeof window.gtag === 'function';
const isFbqAvailable = () => typeof window !== 'undefined' && typeof window.fbq === 'function';
const isDataLayerAvailable = () => typeof window !== 'undefined' && Array.isArray(window.dataLayer);

export const useAnalytics = () => {
  /**
   * Evento genérico - envia para GA4, GTM e Facebook Pixel
   */
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const { action, category, label, value, ...customParams } = event;

    // Google Analytics 4
    if (isGtagAvailable()) {
      window.gtag?.('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...customParams,
      });
    }

    // Google Tag Manager (dataLayer)
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: action,
        eventCategory: category,
        eventLabel: label,
        eventValue: value,
        ...customParams,
      });
    }

    // Facebook Pixel (eventos customizados)
    if (isFbqAvailable()) {
      window.fbq?.('trackCustom', action, {
        category,
        label,
        value,
        ...customParams,
      });
    }

    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('[Analytics]', action, { category, label, value, ...customParams });
    }
  }, []);

  /**
   * Page View - automático ao montar componente
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

    // GTM
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: 'page_view',
        pagePath: path,
        pageTitle: title,
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
   * Scroll Depth - Profundidade de scroll
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
   * CTA Click - Cliques em botões de ação
   */
  const trackCTAClick = useCallback((ctaName: string, ctaLocation?: string) => {
    trackEvent({
      action: 'cta_click',
      category: 'CTA',
      label: ctaName,
      cta_location: ctaLocation,
    });

    // Facebook Pixel - evento padrão de Lead se for CTA de conversão
    if (isFbqAvailable()) {
      window.fbq?.('track', 'Lead', {
        content_name: ctaName,
        content_category: ctaLocation,
      });
    }
  }, [trackEvent]);

  /**
   * Plan View - Visualização de plano
   */
  const trackPlanView = useCallback((planId: string, planName: string, price: number) => {
    trackEvent({
      action: 'view_item',
      category: 'Ecommerce',
      label: planName,
      value: price,
      currency: 'BRL',
      items: [{
        item_id: planId,
        item_name: planName,
        price: price / 100,
      }],
    });

    // Facebook Pixel
    if (isFbqAvailable()) {
      window.fbq?.('track', 'ViewContent', {
        content_ids: [planId],
        content_name: planName,
        content_type: 'product',
        value: price / 100,
        currency: 'BRL',
      });
    }
  }, [trackEvent]);

  /**
   * Begin Checkout - Início do checkout
   */
  const trackBeginCheckout = useCallback((planId: string, planName: string, price: number, coupon?: string) => {
    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', 'begin_checkout', {
        currency: 'BRL',
        value: price / 100,
        coupon: coupon,
        items: [{
          item_id: planId,
          item_name: planName,
          price: price / 100,
          quantity: 1,
        }],
      });
    }

    // GTM
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'BRL',
          value: price / 100,
          coupon: coupon,
          items: [{
            item_id: planId,
            item_name: planName,
            price: price / 100,
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
        value: price / 100,
        currency: 'BRL',
        num_items: 1,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] BeginCheckout:', planName, price / 100);
    }
  }, []);

  /**
   * Add Payment Info - Adição de informações de pagamento
   */
  const trackAddPaymentInfo = useCallback((planId: string, planName: string, price: number, paymentMethod: string) => {
    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', 'add_payment_info', {
        currency: 'BRL',
        value: price / 100,
        payment_type: paymentMethod,
        items: [{
          item_id: planId,
          item_name: planName,
          price: price / 100,
          quantity: 1,
        }],
      });
    }

    // GTM
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: 'add_payment_info',
        ecommerce: {
          currency: 'BRL',
          value: price / 100,
          payment_type: paymentMethod,
          items: [{
            item_id: planId,
            item_name: planName,
            price: price / 100,
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
        value: price / 100,
        currency: 'BRL',
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] AddPaymentInfo:', paymentMethod);
    }
  }, []);

  /**
   * Purchase - Compra finalizada
   */
  const trackPurchase = useCallback((
    transactionId: string,
    planId: string,
    planName: string,
    price: number,
    paymentMethod: string
  ) => {
    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'BRL',
        value: price / 100,
        payment_type: paymentMethod,
        items: [{
          item_id: planId,
          item_name: planName,
          price: price / 100,
          quantity: 1,
        }],
      });
    }

    // GTM
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: transactionId,
          currency: 'BRL',
          value: price / 100,
          payment_type: paymentMethod,
          items: [{
            item_id: planId,
            item_name: planName,
            price: price / 100,
            quantity: 1,
          }],
        },
      });
    }

    // Facebook Pixel
    if (isFbqAvailable()) {
      window.fbq?.('track', 'Purchase', {
        content_ids: [planId],
        content_name: planName,
        content_type: 'product',
        value: price / 100,
        currency: 'BRL',
        num_items: 1,
      });
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics] Purchase:', transactionId, price / 100);
    }
  }, []);

  /**
   * Lead - Geração de lead (ex: signup, form submit)
   */
  const trackLead = useCallback((source: string, value?: number) => {
    trackEvent({
      action: 'generate_lead',
      category: 'Lead',
      label: source,
      value: value,
    });

    // Facebook Pixel
    if (isFbqAvailable()) {
      window.fbq?.('track', 'Lead', {
        content_name: source,
        value: value ? value / 100 : undefined,
        currency: 'BRL',
      });
    }
  }, [trackEvent]);

  /**
   * Sign Up - Registro de usuário
   */
  const trackSignUp = useCallback((method: string) => {
    // GA4
    if (isGtagAvailable()) {
      window.gtag?.('event', 'sign_up', {
        method: method,
      });
    }

    // GTM
    if (isDataLayerAvailable()) {
      window.dataLayer?.push({
        event: 'sign_up',
        method: method,
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

    // GTM
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
  };
};

/**
 * Hook para tracking automático de scroll depth
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
