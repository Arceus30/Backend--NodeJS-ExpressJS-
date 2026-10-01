import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { createAccessToken } from "../utils/token.js";
import { hashToken } from "../utils/tokenHash.js";

const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export async function register(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "User registered successfully",
            userId: user._id,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        // Short-lived JWT
        const accessToken = createAccessToken(user);

        // Long-lived opaque refresh token
        const refreshToken = crypto.randomBytes(64).toString("hex");

        const refreshTokenHash = hashToken(refreshToken);

        await RefreshToken.create({
            tokenHash: refreshTokenHash,
            userId: user._id,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
        });

        // Refresh token is kept in an HttpOnly cookie.
        // token stored in cookie recommendation: Browser-oriented application
        res.cookie("refreshToken", refreshToken, {
            // httpOnly: JavaScript running in the browser can't directly access that cookie.
            // Browser JavaScript --> cannot read HttpOnly cookie --> token cookie --> automatically sends applicable cookie --> Express server
            // This can reduce the impact of some token-stealing attacks involving injected JavaScript. It doesn't eliminate XSS, though.
            httpOnly: true,

            // For local HTTP development: "secure: false" is okay.
            // In production over HTTPS: "secure: true" means the browser should only send the cookie over a secure HTTPS connection.
            secure: false,

            // This is a browser cookie security setting that restricts when cookies are sent in cross-site contexts. It's an important part of the defense against CSRF.
            // Value	Behavior
            // Strict	Cookie is sent only in same-site requests
            // Lax	    Cookie is sent in same-site requests and some top-level cross-site navigations (commonly the default)
            // None	    Cookie is sent in cross-site requests too; requires Secure
            sameSite: "lax",

            // browser's cookie lifetime,
            // keep the jwt expiry and cookie maxAge aligned
            maxAge: REFRESH_TOKEN_EXPIRY,
        });

        return res.json({
            message: "Login successful",
            accessToken, // used by authorization header,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
}

export async function refresh(req, res) {
    try {
        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({
                message: "Refresh token required",
            });
        }

        const oldTokenHash = hashToken(oldRefreshToken);

        const storedToken = await RefreshToken.findOne({
            tokenHash: oldTokenHash,
        });

        if (!storedToken) {
            return res.status(401).json({
                message: "Invalid refresh token",
            });
        }

        // Detect reuse of an already-rotated token.
        if (storedToken.revokedAt) {
            return res.status(401).json({
                message: "Refresh token already used",
            });
        }

        if (storedToken.expiresAt < new Date()) {
            return res.status(401).json({
                message: "Refresh token expired",
            });
        }

        const user = await User.findById(storedToken.userId);

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists",
            });
        }

        // ------------------------------------------------
        // ROTATION
        // ------------------------------------------------

        // 1. Revoke old refresh token
        storedToken.revokedAt = new Date();

        await storedToken.save();

        // 2. Generate a completely new refresh token
        const newRefreshToken = crypto.randomBytes(64).toString("hex");

        const newRefreshTokenHash = hashToken(newRefreshToken);

        // 3. Store the hash of the new token
        await RefreshToken.create({
            tokenHash: newRefreshTokenHash,
            userId: user._id,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
        });

        // 4. Create a new access token
        const newAccessToken = createAccessToken(user);

        // 5. Replace cookie with new refresh token
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: REFRESH_TOKEN_EXPIRY,
        });

        return res.json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
}

// With the Authorization Header approach, the server doesn't automatically control where the client stores the token.
// Logging out generally means the client discards the token.
export async function logout(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            const tokenHash = hashToken(refreshToken);

            await RefreshToken.findOneAndUpdate(
                {
                    tokenHash,
                },
                {
                    revokedAt: new Date(),
                },
            );
        }

        res.clearCookie("refreshToken"); // deletes the cookie

        return res.json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
}
