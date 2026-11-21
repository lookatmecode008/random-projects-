
const CACHE_NAME = "attapp-v1";

const APP_FILES = [
  "./index.html",
  "./record.html",
  "./styles.css",
  "./scripts.js",
  "./employees.csv",
  "./Logo Zoom(1).png",
  "./Logo Zoom.png"
];

// Install: save the application files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
  );

  self.skipWaiting();
});

// Activate: remove outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// Fetch: serve cached files when offline
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  // Keep navigation working offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, copy));

          return response;
        })
        .catch(async () => {
          return await caches.match(request)
            || await caches.match("./index.html");
        })
    );

    return;
  }

  // Fetch fresh employee data when possible
  if (request.url.endsWith("/employees.csv")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, copy));

          return response;
        })
        .catch(() => caches.match(request))
    );

    return;
  }

  // Other application files: cache first
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(request);
      })
  );
});
