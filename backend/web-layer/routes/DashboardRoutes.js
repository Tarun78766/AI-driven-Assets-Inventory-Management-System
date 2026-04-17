const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const restrictTo = authMiddleware.restrictTo;
const dashboardController = require("../controllers/DashboardController");

router.use(authMiddleware);

router.get("/", restrictTo("admin", "manager"), dashboardController.getDashboard);

module.exports = router;