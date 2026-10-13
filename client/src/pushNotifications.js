import api from "./api";

function decodeVapidKey(base64Key) {
    const padding = "=".repeat((4 - base64Key.length % 4) % 4);
    const base64 = (base64Key + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export async function enablePushNotifications(userId) {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        throw new Error("Push notifications are not supported by this browser.");
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("Allow notifications in your browser settings to enable reminders.");

    const registration = await navigator.serviceWorker.register("/sw.js");
    const { data } = await api.get("/notifications/push/vapid-public-key");
    const publicKey = data.publicKey;
    if (!publicKey) throw new Error("Push notifications are not configured on the server yet.");

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: decodeVapidKey(publicKey)
        });
    }
    await api.post("/notifications/push/subscribe", { userId, subscription });
    return subscription;
}

export async function disablePushNotifications(userId) {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration("/");
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;
    try {
        await api.delete("/notifications/push/subscribe", {
            data: { userId, endpoint: subscription.endpoint }
        });
    } finally {
        await subscription.unsubscribe();
    }
}

export async function getPushSubscription() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
    const registration = await navigator.serviceWorker.getRegistration("/");
    return registration?.pushManager.getSubscription() || null;
}
