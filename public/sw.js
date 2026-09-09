const CACHE = "hihong-recruit-v1";
const OFFLINE_URL = "/recruit/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL, "/recruit-manifest.webmanifest"])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (!request.url.includes("/recruit")) return;

  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || caches.match(OFFLINE_URL);
      }),
  );
});
