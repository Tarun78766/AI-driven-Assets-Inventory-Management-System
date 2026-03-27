const authService = require("../../service-layer/services/AuthService");

/**
 * Controller to handle User Registration
 * This function is the entry point for the POST /api/auth/register route.
 * It extracts data from the request body, calls the service, and sends a response.
 */
const register = async (req, res) => {
  try {
    // Call the registerUser method from our AuthService and pass the request body (the form data)
    const user = await authService.registerUser(req.body);
    
    // Send a 201 Created status and the new user object back to the frontend
    res.status(201).json({ success: true, user });
  } catch (error) {
    // If anything fails (like a duplicate email), return a 400 Bad Request
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Controller to handle User Login
 * Entry point for POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    // Call the loginUser method, which returns the user object and a JWT token
    const { user, token } = await authService.loginUser(req.body);
    
    // Send a 200 OK status, the user object, and the token to the frontend
    res.status(200).json({ success: true, user, token });
  } catch (error) {
    // Send error if credentials do not match
    res.status(400).json({ success: false, message: error.message });
  }
};

// Export controllers to attach them to routes
module.exports = { register, login };
