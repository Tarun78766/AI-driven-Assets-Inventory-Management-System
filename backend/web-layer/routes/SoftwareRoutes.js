const express = require("express");
const router = express.Router();
const SoftwareController = require("../controllers/SoftwareController");

// Middlewares
const authMiddleware = require("../middlewares/AuthMiddleware");

// Custom restrictTo middleware for this module
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to perform this action.",
      });
    }
    next();
  };
};

// All software routes require authentication and manager/admin role
router.use(authMiddleware);
router.use(restrictTo("admin", "manager"));

// Order is crucial here. /tracked MUST come before /:id
router.get("/tracked", SoftwareController.getTrackedSoftware);
router.get("/", SoftwareController.getAllSoftwares);
router.post("/", SoftwareController.createSoftware);
router.put("/:id", SoftwareController.updateSoftware);
router.delete("/:id", SoftwareController.deleteSoftware);

module.exports = router;
