// ═══════════════════════════════════════════
// BACKEND - Auth Routes
// File: backend/routes/auth.js (or authRoutes.js)
// Replace your existing routes file with this
// ═══════════════════════════════════════════

const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public routes (no authentication required)
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes (authentication required)
router.post("/logout", authMiddleware, authController.logout);
router.get("/verify", authMiddleware, authController.verifyToken);

module.exports = router;