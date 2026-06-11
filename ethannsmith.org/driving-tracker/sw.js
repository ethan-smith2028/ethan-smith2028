const CACHE_NAME = "gps-tracker-v2";

const FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json"
];

self.addEventListener("install", (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES);
        })
    );
});

self.addEventListener("activate", (event) => {

    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
});

self.addEventListener("fetch", (event) => {

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});