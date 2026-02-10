self.addEventListener("push", function (event) {
  const data = event.data?.json() ?? {};

  const options = {
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

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      for (const client of clientList) {
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
