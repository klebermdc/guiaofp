import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker
// IMPORTANT: no preview/editor session, disable SW to avoid reload loops and stale cache.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isPreviewOrEditorSession =
      window.location.hostname.includes('id-preview--') ||
      window.location.search.includes('__lovable_token=');

    if (import.meta.env.PROD && !isPreviewOrEditorSession) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          const RELOAD_FLAG = 'sw-reloaded';
          let reloading = false;

          const safeReload = () => {
            if (reloading) return;
            if (sessionStorage.getItem(RELOAD_FLAG) === '1') return;
            if (document.visibilityState !== 'visible') return;

            reloading = true;
            sessionStorage.setItem(RELOAD_FLAG, '1');
            window.location.reload();
          };

          navigator.serviceWorker.addEventListener('controllerchange', () => {
            setTimeout(safeReload, 100);
          });

          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'SW_ACTIVATED') {
              setTimeout(safeReload, 100);
            }
          });
        })
        .catch(() => {
          // SW registration failed silently
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
