import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker
// IMPORTANT: In dev/preview we DISABLE SW to avoid stale caches breaking the app after updates.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Auto-reload once when a new SW takes control (prevents users being stuck on stale JS on iOS/PWA).
          const RELOAD_FLAG = 'sw-reloaded';
          let reloading = false;
          const safeReload = () => {
            if (reloading) return;
            if (sessionStorage.getItem(RELOAD_FLAG) === '1') return;
            reloading = true;
            sessionStorage.setItem(RELOAD_FLAG, '1');
            window.location.reload();
          };

          navigator.serviceWorker.addEventListener('controllerchange', safeReload);

          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'SW_ACTIVATED') {
              safeReload();
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    } else {
      // Cleanup any previously-registered SW + caches in preview/dev.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ('caches' in window) {
        caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))));
      }
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
