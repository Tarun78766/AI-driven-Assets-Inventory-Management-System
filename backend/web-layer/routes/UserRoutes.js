const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

// Both endpoints are strictly governed by Admin access limitations per instructions.
const authMiddleware = require("../middlewares/AuthMiddleware");

// All user management routes require standard authentication AND must be strictly 'admin' execution only
router.use(authMiddleware);
router.use(authMiddleware.restrictTo("admin"));

// Fetch full user roster cleanly mapped without passwords
router.get("/", userController.getAllUsers);

// Promote or demote users, explicitly blocking self-demotion internally at the controller layer
router.put("/:id/role", userController.updateUserRole);

module.exports = router;
