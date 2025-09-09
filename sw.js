const CACHE = 'life-os-v4';
const ASSETS = ['./','./index.html','./app.js','./manifest.webmanifest','./favicon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));

  return self.clients.claim();
});
self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then(res => res || fetch(request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(request, copy));
      return r;
    }).catch(()=>caches.match('./index.html')))
  );
});
