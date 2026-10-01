// --------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// --------------------------------------------------
// This middleware will protect routes that require the user to be logged in.
// Example:
// GET /tasks will first pass through: requireAuth
// If the user is logged in: continue to the route
// If not: redirect to /login
function requireAuth(req, res, next) {
    // Passport adds req.isAuthenticated() to the request.
    // It returns true when Passport has restored an authenticated user.
    if (req.isAuthenticated()) {
        // User is logged in. Continue to the next middleware/route.
        return next();
    }

    // User isn't logged in.
    return res.redirect("/login");
}

module.exports = requireAuth;
