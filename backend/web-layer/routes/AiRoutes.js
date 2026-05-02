const express = require("express");
const router = express.Router();
const aiController = require("../controllers/AiController");
const authMiddleware = require("../middlewares/AuthMiddleware");

// Secure routes - only admins/managers should run AI analysis or view high-risk reports
router.use(authMiddleware);
router.use(authMiddleware.restrictTo("admin", "manager"));

router.post("/predict-failure/:assetId", aiController.predictFailure);
router.get("/high-risk-laptops", aiController.getHighRiskLaptops);
router.get("/brand-failure-analysis", aiController.getBrandFailureAnalysis);

module.exports = router;
