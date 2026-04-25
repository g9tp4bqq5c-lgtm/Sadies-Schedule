const CACHE = "sadies-schedule-v8";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  // Firebase, Firebase SDK, Google Fonts: network only, never cache
  if (e.request.url.includes("firebaseio.com") ||
      e.request.url.includes("firebasedatabase.app") ||
      e.request.url.includes("googleapis.com") ||
      e.request.url.includes("gstatic.com")) {
    e.respondWith(fetch(e.request).catch(() => new Response("", { status: 503 })));
    return;
  }
  // App shell: network-first so updates are always visible,
  // fall back to cache only when offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
