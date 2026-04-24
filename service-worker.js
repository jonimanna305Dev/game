self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("xo-cache").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./main.js",
        "./manifest.json",
        "./icon.png"
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => {
      return res || fetch(event.request);
    })
  );
});