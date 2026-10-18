/* Midwam Dashboard — service worker (v46). Network first, so the dashboard is always fresh online; the last copy opens offline. */
var CACHE = "midwam-app-v1";
self.addEventListener("install", function(e){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener("fetch", function(e){
  var req = e.request; if(req.method !== "GET") return;
  var url = new URL(req.url); if(url.origin !== self.location.origin) return;
  var nav = req.mode === "navigate", data = /\/team\.json$/.test(url.pathname), asset = /\/(icons\/[^/]+\.png|manifest\.webmanifest)$/.test(url.pathname);
  if(!(nav || data || asset)) return;
  var key = nav ? new Request(url.origin + url.pathname) : new Request(url.origin + url.pathname);
  e.respondWith(fetch(req).then(function(res){ if(res && res.ok){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(key, copy); }); } return res; })
    .catch(function(){ return caches.match(key).then(function(m){ return m || Response.error(); }); }));
});
