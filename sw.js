const C = 'sayi-galaksisi-c400f2e2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
const A = 'sayi-galaksisi-audio-1';
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C && k !== A).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (/cloudfront[.]net[/]/.test(e.request.url)) {
    const rg = e.request.headers.get('range');
    if (rg) {
      /* byte-range of a shared audio file: cache each range under its own key as a plain 200 response */
      const key = e.request.url + '?range=' + encodeURIComponent(rg);
      e.respondWith(caches.open(A).then((c) => c.match(key).then((hit) => hit || fetch(e.request).then((r) => {
        if (r.status !== 206) return r;
        return r.arrayBuffer().then((ab) => { const res = new Response(ab, { status: 200, headers: { 'content-type': 'audio/mpeg' } }); c.put(key, res.clone()); return res; });
      }))));
      return;
    }
    e.respondWith(caches.open(A).then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))));
});
