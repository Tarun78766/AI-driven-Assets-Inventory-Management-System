// ═══════════════════════════════════════════
// BACKEND - Auth Routes
// File: backend/routes/auth.js (or authRoutes.js)
// Replace your existing routes file with this
// ═══════════════════════════════════════════

const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const authMiddleware = require("../middlewares/AuthMiddleware");
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 */

// Public routes (no authentication required)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Protected routes (authentication required)
router.post("/logout", authMiddleware, authController.logout);
router.get("/verify", authMiddleware, authController.verifyToken);

module.exports = router;