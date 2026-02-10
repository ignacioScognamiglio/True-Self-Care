var CACHE_NAME = "true-self-care-v1";
var APP_SHELL_URLS = [
  "/offline.html",
];

// Install: pre-cache app shell
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: hybrid caching strategy
self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip Convex API calls (network-only)
  if (url.hostname.includes("convex")) return;

  // Skip Clerk auth calls
  if (url.hostname.includes("clerk")) return;

  // App shell pages: stale-while-revalidate
  if (url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/")) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        var fetchPromise = fetch(event.request).then(function (response) {
          if (response.ok) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
        return cached || fetchPromise;
      }).catch(function () {
        return caches.match("/offline.html");
      })
    );
    return;
  }

  // Static assets: cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        return cached || fetch(event.request).then(function (response) {
          if (response.ok) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
});

// Push handler
self.addEventListener("push", function (event) {
  var data = event.data?.json() ?? {};

  var options = {
    body: data.body ?? "Tienes una nueva notificacion",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    tag: data.tag ?? "default",
    data: {
      url: data.actionUrl ?? "/dashboard",
    },
    actions: data.actions ?? [],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "True Self-Care", options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = event.notification.data?.url ?? "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
