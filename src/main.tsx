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
