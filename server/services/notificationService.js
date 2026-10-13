const Notification = require("../models/Notification");
const PushSubscription = require("../models/PushSubscription");
const webpush = require("web-push");

let vapidConfigured = false;
function configurePush() {
    if (vapidConfigured) return true;
    const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || "https://campusshare-web.onrender.com",
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
    vapidConfigured = true;
    return true;
}

async function createNotification(data) {
    const notification = await Notification.create(data);
    if (!configurePush()) return notification;

    try {
        const subscriptions = await PushSubscription.find({ userId: data.userId });
        const payload = JSON.stringify({
            title: "CampusShare",
            body: data.message,
            url: "/"
        });
        await Promise.allSettled(subscriptions.map(async (stored) => {
            try {
                await webpush.sendNotification({
                    endpoint: stored.endpoint,
                    keys: stored.keys,
                    expirationTime: stored.expirationTime
                }, payload);
            } catch (error) {
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await PushSubscription.deleteOne({ _id: stored._id });
                } else {
                    console.error("Push notification delivery failed:", error.message);
                }
            }
        }));
    } catch (error) {
        console.error("Could not load push subscriptions:", error.message);
    }
    return notification;
}

module.exports = { createNotification };
