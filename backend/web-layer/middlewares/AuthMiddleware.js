const jwt = require("jsonwebtoken");

/**
 * Middleware to protect routes that require authentication.
 * Middlewares execute between receiving the request and hitting the controller logic.
 */
const authMiddleware = (req, res, next) => {
  // Get the token from the Authorization header (sent as "Bearer <token>")
  const tokenHeader = req.headers.authorization;

  // Check if the header exists and is formatted correctly
  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided or invalid format",
    });
  }
  
  try {
    // Extract strictly the token part (splitting "Bearer <token>" by space)
    const token = tokenHeader.split(" ")[1];
    
    // Verify the token using our secret key to ensure it hasn't been tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded user payload (id, role) to the request object.
    // This allows the next controller to know WHO is making the request (e.g. req.user.id)
    req.user = decoded;
    
    // Proceed to the next middleware or the actual route controller
    next();
  } catch (error) {
    // If verification fails (expired or fake token)
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;