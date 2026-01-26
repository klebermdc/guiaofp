// Service Worker for Push Notifications & Asset Caching
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Assets to precache on install
const PRECACHE_ASSETS = [
  '/logo-192.png',
  '/logo-512.png',
  '/apple-touch-icon.png',
  '/manifest.json'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('static-') || 
                   name.startsWith('images-') || 
                   name.startsWith('api-');
          })
          .filter((name) => {
            return name !== STATIC_CACHE && 
                   name !== IMAGE_CACHE && 
                   name !== API_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // Image caching - Cache First strategy
  if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 30 * 24 * 60 * 60 * 1000)); // 30 days
    return;
  }

  // Static assets (JS, CSS, fonts) - Stale While Revalidate
  if (isStaticAsset(request)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // API requests - Network First with short cache
  if (isApiRequest(request)) {
    event.respondWith(networkFirst(request, API_CACHE, 5 * 60 * 1000)); // 5 min
    return;
  }
});

// Helper functions to identify request types
function isImageRequest(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(url.pathname)
  );
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)(\?.*)?$/i.test(url.pathname);
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/rest/') || 
         url.pathname.includes('/functions/') ||
         url.hostname.includes('supabase');
}

// Cache First - Best for images and rarely changing assets
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // Check if cache is still valid
    const cachedDate = cached.headers.get('sw-cache-date');
    if (cachedDate && (Date.now() - parseInt(cachedDate)) < maxAge) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Clone and add cache timestamp
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', Date.now().toString());
      
      const body = await responseToCache.blob();
      const cachedResponse = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      });
      
      cache.put(request, cachedResponse);
    }
    return response;
  } catch (error) {
    // Return cached even if expired when offline
    if (cached) return cached;
    throw error;
  }
}

// Stale While Revalidate - Best for static assets
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// Network First - Best for API requests
async function networkFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('sw-cache-date', Date.now().toString());
      
      const body = await response.clone().blob();
      const cachedResponse = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
      
      cache.put(request, cachedResponse);
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      const cachedDate = cached.headers.get('sw-cache-date');
      if (cachedDate && (Date.now() - parseInt(cachedDate)) < maxAge) {
        return cached;
      }
    }
    throw error;
  }
}

// Push notification handling
self.addEventListener('push', function(event) {
  const options = {
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    vibrate: [100, 50, 100],
    requireInteraction: true,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || '';
      options.data = data.data || {};
      options.tag = data.tag || 'default';
      options.actions = data.actions || [];
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'OFP Planejador', options)
      );
    } catch (e) {
      options.body = event.data.text();
      event.waitUntil(
        self.registration.showNotification('OFP Planejador', options)
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-multipass-confirmation') {
    event.waitUntil(syncMultipassConfirmation());
  }
});

async function syncMultipassConfirmation() {
  console.log('Syncing multipass confirmation...');
}
