const express = require("express");
const router = express.Router();

const employeeAssetController = require("../controllers/EmployeeAssetController");
const authMiddleware = require("../middlewares/AuthMiddleware");
const restrictTo = authMiddleware.restrictTo;

router.use(authMiddleware);

router.get("/my", restrictTo("employee"), employeeAssetController.getMyAssets);

module.exports = router;
