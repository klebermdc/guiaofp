/**
 * isNativeApp — true when the app is running inside a Capacitor native
 * container (Android/iOS), false in a regular browser.
 *
 * Used to bypass web-only checks like Cloudflare Turnstile, whose widget
 * won't validate from a Capacitor WebView origin (`https://localhost`).
 */
import { Capacitor } from '@capacitor/core';

export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
