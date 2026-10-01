import express from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authenticateCookie } from "../middleware/authenticateCookie.js";
import { requireRole } from "../middleware/authorize.js";

const router = express.Router();

router.get("/profile", authenticate, (req, res) => {
    res.json({
        message: "Protected profile",
        user: req.user,
    });
});

router.get("/admin", authenticate, requireRole("admin"), (req, res) => {
    res.json({
        message: "Welcome to the admin area",
        user: req.user,
    });
});

router.get("/cookie-profile", authenticateCookie, (req, res) => {
    res.json({
        message: "Cookie protected profile",
        user: req.user,
    });
});

export default router;
