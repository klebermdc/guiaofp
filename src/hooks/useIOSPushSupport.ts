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
    
    // Detect Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    
    // Check if running as standalone PWA (added to home screen)
    const isStandalone = 
      (window.navigator as any).standalone === true || // iOS Safari
      window.matchMedia('(display-mode: standalone)').matches;
    
    // Get Safari version
    let safariVersion: number | null = null;
    const versionMatch = ua.match(/Version\/(\d+)/);
    if (versionMatch) {
      safariVersion = parseInt(versionMatch[1], 10);
    }
    
    // iOS Safari 16.4+ supports Web Push, but ONLY when installed as PWA
    const supportsWebPush = 'PushManager' in window && 'serviceWorker' in navigator;
    
    // On iOS: can receive push only if Safari 16.4+ AND running as standalone PWA
    const canReceivePush = isIOS 
      ? (supportsWebPush && isStandalone && safariVersion !== null && safariVersion >= 16)
      : supportsWebPush;
    
    // Needs installation: iOS device that supports push but not installed as PWA
    const needsInstallation = isIOS && supportsWebPush && !isStandalone;
    
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
