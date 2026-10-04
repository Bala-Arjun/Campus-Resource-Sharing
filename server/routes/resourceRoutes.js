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

module.exports = router;