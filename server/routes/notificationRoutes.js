const express = require("express");
const Notification = require("../models/Notification");
const PushSubscription = require("../models/PushSubscription");

const router = express.Router();

router.get("/push/vapid-public-key", (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
});

router.post("/push/subscribe", async (req, res) => {
    try {
        const { userId, subscription } = req.body;
        if (!userId || !/^[a-f\d]{24}$/i.test(userId) || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return res.status(400).json({ message: "A valid user and push subscription are required" });
        }
        await PushSubscription.findOneAndUpdate(
            { endpoint: subscription.endpoint },
            { userId, endpoint: subscription.endpoint, keys: subscription.keys, expirationTime: subscription.expirationTime || null },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(201).json({ message: "Push notifications enabled" });
    } catch (error) {
        console.error("Failed to save push subscription:", error);
        res.status(500).json({ message: "Failed to enable push notifications" });
    }
});

router.delete("/push/subscribe", async (req, res) => {
    try {
        const { userId, endpoint } = req.body;
        if (!userId || !endpoint) return res.status(400).json({ message: "User and endpoint are required" });
        await PushSubscription.deleteOne({ userId, endpoint });
        res.json({ message: "Push notifications disabled" });
    } catch (error) {
        console.error("Failed to remove push subscription:", error);
        res.status(500).json({ message: "Failed to disable push notifications" });
    }
});

// Get notifications for a user
router.get("/:userId", async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.params.userId
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);

        res.status(500).json({
            message: "Failed to fetch notifications"
        });
    }
});

// Mark one notification as read
router.patch("/:id/read", async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json(notification);
    } catch (error) {
        console.error("Failed to mark notification as read:", error);

        res.status(500).json({
            message: "Failed to mark notification as read"
        });
    }
});

// Mark all notifications as read for a user
router.patch("/user/:userId/read-all", async (req, res) => {
    try {
        await Notification.updateMany(
            {
                userId: req.params.userId,
                isRead: false
            },
            {
                isRead: true
            }
        );

        res.json({
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Failed to mark notifications as read:", error);

        res.status(500).json({
            message: "Failed to mark notifications as read"
        });
    }
});

module.exports = router;
