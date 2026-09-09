// HIHONG RECRUIT 서비스 워커.
// scope는 /recruit/ 로 등록되므로(src/components/recruit/PwaRegister.tsx 참고)
// 이 파일이 /sw.js 에 위치해 있어도 실제로는 /recruit/* 요청에만 관여한다.

const CACHE_NAME = "hihong-recruit-v1";
const OFFLINE_URL = "/recruit/offline";
const APP_SHELL = [OFFLINE_URL, "/recruit"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API 응답은 사용자별 민감정보를 포함할 수 있으므로 절대 캐시하지 않는다.
  if (url.pathname.startsWith("/api/")) return;

  // 페이지 이동(navigation): 네트워크 우선, 실패 시 캐시 → 오프라인 폴백 페이지.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(
          () =>
            caches.match(request).then((cached) => cached) ||
            caches.match(OFFLINE_URL)
        )
    );
    return;
  }

  // 정적 자원: 캐시 우선, 없으면 네트워크에서 가져와 채워둔다.
  if (url.pathname.startsWith("/recruit")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});
