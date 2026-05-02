const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/NotificationController");
const authMiddleware = require("../middlewares/AuthMiddleware");

router.use(authMiddleware);

router.get("/", notificationController.getNotifications);

module.exports = router;
