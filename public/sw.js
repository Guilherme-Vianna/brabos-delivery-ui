self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

function readPayload(event) {
  try {
    return event.data ? event.data.json() : {};
  } catch {
    return { notification: { title: "Brabos Delivery", body: event.data ? event.data.text() : "" } };
  }
}

self.addEventListener("push", (event) => {
  const payload = readPayload(event);
  const data = payload.data || {};
  const notification = payload.notification || {};
  const title = notification.title || data.title || "Brabos Delivery";
  const url = data.url || (payload.fcmOptions && payload.fcmOptions.link) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) client.postMessage({ type: "push", data });
      const focused = clients.some((client) => client.focused);
      if (focused) return undefined;
      return self.registration.showNotification(title, {
        body: notification.body || data.body || "",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: data.tag || undefined,
        renotify: Boolean(data.tag),
        data: { url },
      });
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (new URL(client.url).pathname === url && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
