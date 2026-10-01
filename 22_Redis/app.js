const express = require("express");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const app = express();
const redisRoutes = require("./routes/redisRoutes");
const productRoutes = require("./routes/productRoutes");
const { rateLimiter } = require("./middleware/rateLimiter");
const redisClient = require("./redis/config");
const { sessionAuth } = require("./middleware/sessionAuth");
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Redis + Node.js");
});

app.use("/redis", redisRoutes);
app.use("/product", productRoutes);

app.get("/limited", rateLimiter(), (req, res) => {
    res.json({ message: "Request Allowed" });
});

app.post("/login", async (req, res, next) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: "username is required" });
        }
        const sessionId = crypto.randomBytes(32).toString("base64url");
        const sessionKey = `session:${sessionId}`;
        const sessionData = {
            userId: "101",
            username,
        };

        await redisClient
            .multi()
            .hSet(sessionKey, sessionData) // Stores sessionData as a Redis hash under sessionKey.
            .expire(sessionKey, 1800)
            .exec();

        res.cookie("sid", sessionId, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1800 * 1000,
        });
        res.json({
            message: "Login successful",
        });
    } catch (error) {}
});

app.get("/me", sessionAuth, (req, res) => {
    res.json({
        sessionId: req.sessionId,
        user: {
            id: req.session.userId,
            username: req.session.username,
        },
    });
});

app.post("/logout", async (req, res, next) => {
    try {
        const sessionId = req.cookies.sid;

        if (sessionId) {
            await redisClient.del(`session:${sessionId}`);
        }

        res.clearCookie("sid");
        res.json({
            message: "Logout successful",
        });
    } catch (error) {
        next(error);
    }
});

module.exports = app;
