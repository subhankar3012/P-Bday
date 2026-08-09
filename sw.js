/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SERVICE WORKER — Offline Caching & PWA Support
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const CACHE_NAME = 'moonlight-bday-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/base/variables.css',
  './css/base/base.css',
  './css/layout/layout.css',
  './css/layout/media.css',
  './css/components/components.css',
  './css/pages/pages.css',
  './css/animations/animations.css',
  './js/core/app.js',
  './js/core/StateManager.js',
  './js/managers/AudioManager.js',
  './js/managers/VideoManager.js',
  './js/managers/PopupManager.js',
  './js/managers/NavigationManager.js',
  './js/managers/PageManager.js',
  './js/managers/AssetManager.js',
  './js/managers/StorageManager.js',
  './js/pages/EntrancePage.js',
  './js/pages/MemoryLane.js',
  './js/pages/BalloonGame.js',
  './js/pages/ColorQuiz.js',
  './js/pages/CakeCeremony.js',
  './js/pages/LetterPage.js',
  './js/pages/FinalAdventure.js',
  './js/components/ScratchCard.js',
  './js/components/CertificateCard.js',
  './js/components/Credits.js',
  './js/components/GalleryModal.js',
  './js/components/PlaylistModal.js',
  './js/components/WishesModal.js',
  './js/components/SurpriseModal.js',
  './js/components/DisclaimerModal.js',
  './js/components/VideoModal.js',
  './js/components/ParticleSystem.js',
  './js/utils/dom.js',
  './js/utils/haptics.js',
  './js/utils/formatters.js',
  './config/app.config.js',
  './config/assets.config.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
