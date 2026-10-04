const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
    {
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            required: true
        },

        resourceTitle: {
            type: String,
            required: true
        },

        resourceOwnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },

        requesterName: {
            type: String,
            required: true
        },

        requesterContact: {
            type: String,
            required: true
        },

        status: {
            type: String,
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Request", requestSchema);