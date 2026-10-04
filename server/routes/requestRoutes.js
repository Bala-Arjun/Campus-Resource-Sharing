const express = require("express");
const Request = require("../models/Request");
const Resource = require("../models/Resource");
const Notification = require("../models/Notification");
const router = express.Router();

// Create a resource request
router.post("/", async (req, res) => {
    try {
        const {
            resourceId,
            requesterId,
            requesterName,
            requesterContact
        } = req.body;

        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        const request = new Request({
            resourceId: resource._id,
            resourceTitle: resource.title,
            resourceOwnerId: resource.ownerId,
            requesterId,
            requesterName,
            requesterContact
        });

        const savedRequest = await request.save();
        if (resource.ownerId) {
            await Notification.create({
                userId: resource.ownerId,
                message: `${requesterName} requested your resource "${resource.title}".`,
                type: "RESOURCE_REQUEST",
                relatedResourceId: resource._id,
                relatedRequestId: savedRequest._id
            });
        }

        res.status(201).json(savedRequest);
    } catch (error) {
        console.error("Request creation error:", error);

        res.status(400).json({
            message: "Failed to create request",
            error: error.message
        });
    }
});

// Get requests for resources owned by a specific user
router.get("/owner/:ownerId", async (req, res) => {
    try {
        const requests = await Request.find({
            resourceOwnerId: req.params.ownerId
        }).sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error("Failed to fetch owner requests:", error);

        res.status(500).json({
            message: "Failed to fetch owner requests"
        });
    }
});

// Get all requests
router.get("/", async (req, res) => {
    try {
        const requests = await Request.find()
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch requests"
        });
    }
});

// Update request status
// Update request status
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        if (!["Pending", "Accepted", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        request.status = status;

        const updatedRequest = await request.save();

        // Notify the student who made the request
        if (request.requesterId) {
            await Notification.create({
                userId: request.requesterId,
                message: `Your request for "${request.resourceTitle}" was ${status.toLowerCase()}.`,
                type: `REQUEST_${status.toUpperCase()}`,
                relatedResourceId: request.resourceId,
                relatedRequestId: request._id
            });
        }

        res.json(updatedRequest);
    } catch (error) {
        console.error("Failed to update request status:", error);

        res.status(500).json({
            message: "Failed to update request status"
        });
    }
});

module.exports = router;