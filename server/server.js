const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
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

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:");
        console.error(error.message);
    });

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