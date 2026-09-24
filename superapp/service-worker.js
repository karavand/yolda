const CACHE_NAME = "yolda-web-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/css/tokens.css",
  "./assets/css/main.css",
  "./assets/css/responsive.css",
  "./assets/js/config.js",
  "./assets/js/api.js",
  "./assets/js/data.js",
  "./assets/js/recommender.js",
  "./assets/js/pages.js",
  "./assets/js/app.js",
  "./assets/icons/yld-ui-categories.webp",
  "./assets/icons/yld-ui-cart.webp",
  "./assets/icons/yld-ui-orders.webp",
  "./assets/icons/yld-ui-notifications.webp",
  "./assets/icons/yld-profile-personal-info.webp",
  "./assets/icons/yld-discover-recommended.webp",
  "./assets/icons/yld-map-location-off.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const request = event.request;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", clone));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
      return cached || network;
    })
  );
});
