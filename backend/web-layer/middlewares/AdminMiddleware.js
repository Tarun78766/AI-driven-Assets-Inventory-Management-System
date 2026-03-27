/**
 * Middleware to check if the authenticated user has the "Admin" role.
 * NOTE: This MUST be placed AFTER authMiddleware.js in the route configuration.
 */
const adminMiddleware = (req, res, next) => {
  // Our authMiddleware previously attached the decoded JWT payload to req.user
  if (req.user && req.user.role === "Admin") {
    // Proceed to the next step (the controller) if user is an Admin
    next(); 
  } else {
    // If user is not Admin (e.g., Employee or Manager), deny access
    res.status(403).json({
      success: false,
      message: "Access Denied: Admin privileges required."
    });
  }
};

module.exports = adminMiddleware;
