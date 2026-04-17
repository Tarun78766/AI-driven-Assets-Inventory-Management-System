const express = require("express");
const router = express.Router();

const ReportController = require("../controllers/ReportController");
const authMiddleware = require("../middlewares/AuthMiddleware");
const restrictTo = authMiddleware.restrictTo;

router.use(authMiddleware);
router.use(restrictTo("admin", "manager"));

router.get("/", ReportController.getReports);

module.exports = router;
