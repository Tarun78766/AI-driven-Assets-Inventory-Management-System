const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

// Both endpoints are strictly governed by Admin access limitations per instructions.
const authMiddleware = require("../middlewares/AuthMiddleware");

// All user management routes require standard authentication
router.use(authMiddleware);

// Profile routes (Any authenticated user can access their own profile)
router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.put("/security/password", userController.updatePassword);

// Employees need to be able to fetch managers for assigning queries
router.get("/managers", userController.getManagers);

// The rest must be strictly 'admin' execution only
router.use(authMiddleware.restrictTo("admin"));

// Fetch full user roster cleanly mapped without passwords
router.get("/", userController.getAllUsers);

// Promote or demote users, explicitly blocking self-demotion internally at the controller layer
router.put("/:id/role", userController.updateUserRole);

module.exports = router;
