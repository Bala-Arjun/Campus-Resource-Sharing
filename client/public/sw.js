self.addEventListener("push", (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { body: event.data?.text() || "You have a new CampusShare update." };
    }

    event.waitUntil(self.registration.showNotification(data.title || "CampusShare", {
        body: data.body || "You have a new update.",
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        data: { url: data.url || "/" }
    }));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
    event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
        const existing = windows.find((client) => client.url.startsWith(self.location.origin));
        if (existing) return existing.focus();
        return self.clients.openWindow(target);
    }));
});
