// Ändere diese Versionsnummer (v2, v3, v4...), wenn du in Zukunft Updates machst!
const CACHE_NAME = 'taxi-rechner-v2'; 

// Liste der Dateien, die für den Offline-Betrieb gespeichert werden sollen
const ASSETS_TO_CACHE = [
  './',
  './index.html', // Wichtig: Wenn deine Datei auf GitHub "index-4.html" heißt, ändere das hier entsprechend!
  './manifest.json',
  './icon-192.png'
];

// Install-Event: Cachen der wichtigen Dateien beim ersten Aufruf
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App-Assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Erzwingt, dass der neue Service Worker sofort aktiv wird, ohne auf einen Neustart zu warten
  self.skipWaiting();
});

// Activate-Event: Alte Caches (z. B. v1) aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Lösche alten Cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Übernimmt sofort die Kontrolle über alle geöffneten Tabs der App
  self.clients.claim(); 
});

// Fetch-Event: Ressourcen aus dem Cache laden oder aus dem Netzwerk holen
self.addEventListener('fetch', (event) => {
  // Für API-Aufrufe (TomTom) den Cache komplett ignorieren
  if (event.request.url.includes('api.tomtom.com')) {
    return; // Läuft ganz normal über das Netzwerk ab
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Wenn die Datei im Cache liegt (z.B. index.html), lade sie von dort
      if (response) {
        return response;
      }
      // Ansonsten lade sie aus dem Internet
      return fetch(event.request);
    })
  );
});
