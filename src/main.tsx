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

          // Only reload on SW update if the page is actively being viewed
          // This prevents reload when switching back to the tab
          const RELOAD_FLAG = 'sw-reloaded';
          let reloading = false;
          
          const safeReload = () => {
            // Don't reload if already reloading or already reloaded this session
            if (reloading) return;
            if (sessionStorage.getItem(RELOAD_FLAG) === '1') return;
            
            // Only reload if document is visible - prevents reload on tab switch
            if (document.visibilityState !== 'visible') {
              console.log('[SW] Skipping reload - tab not visible');
              return;
            }
            
            reloading = true;
            sessionStorage.setItem(RELOAD_FLAG, '1');
            window.location.reload();
          };

          // Only listen for genuine SW updates, not every controller change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Small delay to ensure this is a real update, not a tab switch
            setTimeout(safeReload, 100);
          });

          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'SW_ACTIVATED') {
              setTimeout(safeReload, 100);
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
