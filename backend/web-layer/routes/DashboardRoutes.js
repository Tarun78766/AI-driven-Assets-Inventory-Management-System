const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/DashboardController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * Dashboard Routes
 * (Mounted at /api/dashboard in app.js)
 */

router.use(authMiddleware);

// GET /api/dashboard
router.get("/", dashboardController.getDashboardData);


module.exports = router;
