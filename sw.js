/* Service Worker — عالم مريم
   يخزّن الصفحة الأساسية مؤقتًا لتشغيل التطبيق بلا إنترنت.
   ملاحظة: هذا التخزين المؤقت للواجهة فقط؛ بيانات مريم نفسها
   محفوظة بشكل منفصل ودائم داخل localStorage الخاص بالجهاز. */

var CACHE_NAME = "mariam-life-os-v4";
var CORE_ASSETS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        CORE_ASSETS.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(function (cached) {
      var network = fetch(request)
        .then(function (response) {
          if (response && response.status === 200 && response.type === "basic") {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(request, clone); });
          }
          return response;
        })
        .catch(function () { return cached; });
      return cached || network;
    })
  );
});
