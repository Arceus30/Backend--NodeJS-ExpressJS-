import jwt from "jsonwebtoken";

// Don't put sensitive secrets in the JWT payload.
// JWT payloads aren't encrypted by default.
// With a signed JWT: JWT --> jwt.verify() --> signature valid? --> expiration valid? --> trusted payload
// recommendation: API / mobile / service-to-service scenarios
// Claims inside an already-issued JWT don't automatically change when the database changes.

// we split authentication into two credentials:
// ACCESS TOKEN                                                 REFRESH TOKEN
// Short-lived (shorter lifetime limits the damage window.)     Longer-Lived
// Used for API requests                                        Used to obtain a new access token

// With rotation, we don't keep Refresh Token A valid forever. Each refresh operation replaces the previous refresh token.

// For a simple access token: "JWT  -->  jwt.verify()" can be enough.
// For refresh-token rotation, the server needs to know things such as:
//      Is this refresh token still valid?
//      Has it already been rotated?
//      Was it revoked?
//      Which user/session does it belong to?

// For a browser application, a strong pattern is:
// Access token --> memory / appropriate client storage
// Refresh token --> HttpOnly Secure cookie
export function createAccessToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m", // if token is sent via cookie, keep the jwt expiry and cookie maxAge aligned
        },
    );
}
