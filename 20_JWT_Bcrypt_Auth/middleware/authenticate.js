import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    // reads authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    // seperate bearer and token
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Invalid authorization header",
        });
    }

    // verify jwt
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // attach the user to req
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}
