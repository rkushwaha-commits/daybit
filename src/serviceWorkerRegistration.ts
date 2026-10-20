// Register Daybit Service Worker for PWA functionality
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; will be used when all tabs are closed
                  console.log('[Daybit PWA] New content is available; please refresh.');
                } else {
                  // Content is cached for offline use
                  console.log('[Daybit PWA] Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[Daybit PWA] Service worker registration failed:', error);
        });
    });
  }
}
