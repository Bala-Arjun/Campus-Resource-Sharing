const notificationRoutes = require("./routes/notificationRoutes");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const Request = require("./models/Request");
const Notification = require("./models/Notification");
const { createNotification } = require("./services/notificationService");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/resources", resourceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
        runBorrowReminders();
        setInterval(runBorrowReminders, 60 * 1000);
    })
    .catch((error) => {
        console.error("MongoDB connection failed:");
        console.error(error.message);
    });

async function runBorrowReminders() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
        const dueSoon = await Request.find({
            status: "Accepted",
            dueAt: { $gt: now, $lte: tomorrow },
            dueReminderSent: false,
            requesterId: { $ne: null }
        });

        for (const request of dueSoon) {
            await createNotification({
                userId: request.requesterId,
                message: `Reminder: "${request.resourceTitle}" is due back by ${request.dueAt.toLocaleString()}.`,
                type: "BORROW_DUE_SOON",
                relatedResourceId: request.resourceId,
                relatedRequestId: request._id
            });
            request.dueReminderSent = true;
            await request.save();
        }

        const overdue = await Request.find({
            status: "Accepted",
            dueAt: { $lte: now },
            overdueReminderSent: false,
            requesterId: { $ne: null }
        });

        for (const request of overdue) {
            await createNotification({
                userId: request.requesterId,
                message: `"${request.resourceTitle}" is past its return time. Please return it or contact the owner.`,
                type: "BORROW_OVERDUE",
                relatedResourceId: request.resourceId,
                relatedRequestId: request._id
            });
            request.overdueReminderSent = true;
            await request.save();
        }
    } catch (error) {
        console.error("Failed to send borrow reminders:", error.message);
    }
}

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Campus Resource Sharing API is running!"
    });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
