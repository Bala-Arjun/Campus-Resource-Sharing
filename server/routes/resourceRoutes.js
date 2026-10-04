const express = require("express");
const Resource = require("../models/Resource");

const router = express.Router();

// Get all resources
router.get("/", async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch resources"
        });
    }
});

// Get resources shared by a specific user
router.get("/owner/:ownerId", async (req, res) => {
    try {
        const resources = await Resource.find({
            ownerId: req.params.ownerId
        }).sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        console.error("Failed to fetch owner's resources:", error);

        res.status(500).json({
            message: "Failed to fetch owner's resources"
        });
    }
});

// Add a new resource
router.post("/", async (req, res) => {
    try {
        const resource = new Resource(req.body);

        const savedResource = await resource.save();

        res.status(201).json(savedResource);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create resource",
            error: error.message
        });
    }
});

// Search resources
router.get("/search", async (req, res) => {
    try {
        const query = req.query.q;

        const resources = await Resource.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]
        });

        res.json(resources);
    } catch (error) {
        res.status(500).json({
            message: "Search failed"
        });
    }
});

// Delete a resource
// Delete a resource
router.delete("/:id", async (req, res) => {
    try {
        const { ownerId } = req.body;

        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        if (
            !ownerId ||
            !resource.ownerId ||
            resource.ownerId.toString() !== ownerId.toString()
        ) {
            return res.status(403).json({
                message: "You can only delete your own resources"
            });
        }

        await Resource.findByIdAndDelete(req.params.id);

        res.json({
            message: "Resource deleted successfully"
        });
    } catch (error) {
        console.error("Delete resource error:", error);

        res.status(500).json({
            message: "Failed to delete resource"
        });
    }
});
module.exports = router;