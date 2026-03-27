const authService = require("../../service-layer/services/AuthService");

/**
 * Controller for Admin to add a new Manager.
 * Handles the POST /api/admin/add-manager route.
 */
const addManager = async (req, res) => {
  try {
    // We can reuse the existing `registerUser` service method from AuthService.
    // However, to be completely secure, we forcefully set the role to "Manager".
    // This ignores any malicious role manipulation from the frontend payload.
    const managerData = { ...req.body, role: "Manager" };
    
    // Create the manager in the database
    const manager = await authService.registerUser(managerData);
    
    // Return success response to the frontend
    res.status(201).json({ 
      success: true, 
      message: "Manager added successfully by Admin!", 
      user: manager 
    });
  } catch (error) {
    // Return error if creation fails (e.g., email already exists)
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { addManager };
