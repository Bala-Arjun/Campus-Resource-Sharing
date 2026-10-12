const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

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