// Only downloaded game data is cached. HTML and compiled JS/CSS keep the host's
// normal update behaviour, so a new deployment cannot be trapped in an old app.
const version = new URL(self.location.href).searchParams.get("v");
const cacheName = `bolat-assets-${version}`;
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith("bolat-assets-") && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith("/assets/")) return;
  if (/\.(?:js|css|map)$/.test(url.pathname)) return;
  event.respondWith((async () => {
    if (request.cache !== "reload") {
      const cached = await (await caches.open(cacheName)).match(request);
      if (cached) return cached;
    }
    return fetch(request);
  })());
});
