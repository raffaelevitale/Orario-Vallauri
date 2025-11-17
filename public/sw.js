// Service Worker per PWA Orario Vallauri
const STATIC_CACHE = "orario-static-v1";
const DYNAMIC_CACHE = "orario-dynamic-v1";

// File da cachare immediatamente
const STATIC_ASSETS = [
  "/",
  "/orario",
  "/orario/setup",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Installazione del Service Worker
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[Service Worker] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error("[Service Worker] Failed to cache:", err);
      });
    })
  );
  self.skipWaiting();
});

// Attivazione del Service Worker
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategia di fetch: Network First, poi Cache
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests (POST, PUT, DELETE, etc.)
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone la risposta perché può essere usata solo una volta
        const responseClone = response.clone();

        // Salva in cache solo le risposte OK e GET requests
        if (response.status === 200 && request.method === "GET") {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone).catch((err) => {
              console.warn(
                "[Service Worker] Failed to cache:",
                request.url,
                err
              );
            });
          });
        }

        return response;
      })
      .catch(() => {
        // Se la rete fallisce, prova dalla cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Fallback per le pagine HTML
          if (request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/orario");
          }
        });
      })
  );
});

// Gestione dei messaggi
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Background Sync (opzionale)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-schedules") {
    event.waitUntil(syncSchedules());
  }
});

async function syncSchedules() {
  try {
    // Sincronizza gli orari quando c'è connessione
    console.log("[Service Worker] Syncing schedules...");
    // Implementa qui la logica di sync se necessario
  } catch (error) {
    console.error("[Service Worker] Sync failed:", error);
  }
}
