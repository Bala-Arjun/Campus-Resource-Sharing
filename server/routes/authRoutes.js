const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

// Google login
router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required"
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const googleId = payload.sub;
        const name = payload.name;
        const email = payload.email;
        const profilePicture = payload.picture;

        let user = await User.findOne({ googleId });

        if (!user) {
            user = await User.create({
                googleId,
                name,
                email,
                profilePicture
            });
        }

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error("Google login error:", error);

        res.status(401).json({
            message: "Google authentication failed"
        });
    }
});

module.exports = router;