const express = require("express");
const router = express.Router();

const adminController = require("../controllers/AdminController");
const authMiddleware = require("../middlewares/AuthMiddleware");
const adminMiddleware = require("../middlewares/AdminMiddleware");

/**
 * Route: POST /api/admin/add-manager
 * Protection Layers:
 *  1. authMiddleware: Confirms the user is logged in (Valid JWT).
 *  2. adminMiddleware: Confirms the logged-in user's role is "Admin".
 * Controller:
 *  3. adminController.addManager: Handles the actual creation.
 */
router.post(
  "/add-manager",
  authMiddleware,
  adminMiddleware,
  adminController.addManager
);

module.exports = router;
