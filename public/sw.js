/**
 * Lacho Desk — Service Worker (Offline / PWA)
 * Estrategia: Cache-first para assets estáticos, Network-first para datos
 */
const CACHE_NAME = "lacho-desk-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/images/icons/vet.webp",
  "/images/icons/dev.webp",
  "/images/icons/influencer.webp",
  "/images/lacho-avatar-default.png",
  "/images/icon-192.png",
  "/images/icon-512.png",
];

// Install: pre-cachear assets críticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Si algún asset falla (ej. en dev), continuar sin él
      });
    })
  );
  self.skipWaiting();
});

// Activate: limpiar caches viejas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first con fallback a red
self.addEventListener("fetch", (event) => {
  // Solo interceptar GETs del mismo origen
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline fallback: devolver index.html para SPA routing
        if (event.request.mode === "navigate") {
          return caches.match("/index.html") || caches.match("/");
        }
      });
    })
  );
});
