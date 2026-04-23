importScripts('./version.js');
var CACHE_NAME = '90slab-' + self.APP_VERSION;
var ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  // Do NOT auto-skipWaiting — we want the update toast in the page to drive it.
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Always go to network for Firebase/Firestore requests
  if (url.hostname.indexOf('firebaseio.com') !== -1 ||
      url.hostname.indexOf('firestore.googleapis.com') !== -1) {
    return;
  }

  // Cache-first for Google Fonts (CSS + font files)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          return response;
        });
      })
    );
    return;
  }

  // Let Firebase SDK scripts through to network (gstatic.com hosts them)
  if (url.hostname.indexOf('gstatic.com') !== -1 ||
      url.hostname.indexOf('googleapis.com') !== -1 ||
      url.hostname.indexOf('firebase') !== -1) {
    return;
  }

  // Never cache sw.js or version.js — they drive the update machinery
  if (url.pathname.endsWith('/sw.js') || url.pathname.endsWith('/version.js')) {
    return;
  }

  // Network-first for HTML (so updates are picked up quickly)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache-first for other assets (CSS, images, JS)
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        return response;
      });
    })
  );
});
