const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        type: {
            type: String,
            required: true
        },

        owner: {
            type: String,
            required: true
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },

        ownerEmail: {
            type: String,
            required: false
        },

        isAvailable: {
            type: Boolean,
            default: true
        },

        contact: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Resource", resourceSchema);
