import { useState, useEffect } from 'react';

interface IOSPushSupport {
  isIOS: boolean;
  isSafari: boolean;
  isStandalone: boolean; // Running as installed PWA
  canReceivePush: boolean;
  needsInstallation: boolean;
  safariVersion: number | null;
}

export function useIOSPushSupport(): IOSPushSupport {
  const [support, setSupport] = useState<IOSPushSupport>({
    isIOS: false,
    isSafari: false,
    isStandalone: false,
    canReceivePush: false,
    needsInstallation: false,
    safariVersion: null,
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    
    // Detect iOS (iPhone, iPad, iPod)
    const isIOS = /iPad|iPhone|iPod/.test(ua) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Detect Safari (not Chrome, not Firefox, etc.)
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
    
    // Check if running as standalone PWA (added to home screen)
    // On iOS, window.navigator.standalone is the most reliable check
    // NOTE: Avoid '(display-mode: fullscreen)' here — it can produce false positives in iOS Safari.
    const isStandalone =
      (window.navigator as any).standalone === true || // iOS PWA
      window.matchMedia('(display-mode: standalone)').matches;
    
    // Get Safari/WebKit version from iOS
    let safariVersion: number | null = null;
    const versionMatch = ua.match(/Version\/(\d+)\.(\d+)/);
    if (versionMatch) {
      const major = parseInt(versionMatch[1], 10);
      const minor = parseInt(versionMatch[2], 10);
      // Safari 16.4 is the minimum for Web Push
      safariVersion = major + (minor / 10);
    }
    
    // Check if browser supports Web Push API
    const supportsWebPush = 'PushManager' in window && 'serviceWorker' in navigator;
    
    // On iOS:
    // - Safari 16.4+ (iOS 16.4+) supports Web Push
    // - BUT it only works when the app is installed as a PWA (standalone mode)
    // - In regular Safari browser, PushManager may exist but won't work
    
    const meetsVersionRequirement = safariVersion !== null && safariVersion >= 16.4;
    
    // Can receive push if:
    // - Not iOS: just needs PushManager support
    // - iOS: needs Safari 16.4+, running as standalone PWA, and PushManager support
    const canReceivePush = isIOS 
      ? (supportsWebPush && isStandalone && meetsVersionRequirement)
      : supportsWebPush;
    
    // Needs installation: iOS device with compatible Safari version but not installed as PWA
    // We show this even if PushManager isn't available yet (it becomes available in standalone mode)
    const needsInstallation = isIOS && !isStandalone && meetsVersionRequirement;
    
    // Debug log for troubleshooting
    console.log('[iOS Push Support]', {
      isIOS,
      isSafari,
      isStandalone,
      safariVersion,
      supportsWebPush,
      canReceivePush,
      needsInstallation,
    });
    
    setSupport({
      isIOS,
      isSafari,
      isStandalone,
      canReceivePush,
      needsInstallation,
      safariVersion,
    });
  }, []);

  return support;
}
