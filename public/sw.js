// Service Worker for Push Notifications
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
      // Fallback for text data
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
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-multipass-confirmation') {
    event.waitUntil(syncMultipassConfirmation());
  }
});

async function syncMultipassConfirmation() {
  // Placeholder for offline sync logic
  console.log('Syncing multipass confirmation...');
}
