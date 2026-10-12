const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        message: {
            type: String,
            required: true
        },

        type: {
            type: String,
            required: true
        },

        relatedResourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            required: false
        },

        relatedRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request",
            required: false
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Notification", notificationSchema);