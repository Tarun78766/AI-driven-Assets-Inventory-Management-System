const express = require("express");
const router = express.Router();

// Import our Controller and the Authentication Middleware
const softwareController = require("../controllers/SoftwareController");
const authMiddleware = require("../middlewares/AuthMiddleware");

/**
 * Software Routes (Mounted at /api/software in app.js)
 * We use `router.use(authMiddleware)` to make sure every request
 * hitting these endpoints carries a valid JSON Web Token from a logged-in user.
 */
router.use(authMiddleware);

// Route:  POST /api/software
// Action: Create a new software record
router.post("/", softwareController.createSoftware);

// Route:  GET /api/software
// Action: Get all software records
router.get("/", softwareController.getAllSoftware);

// Route:  GET /api/software/:id
// Action: Get a single specific software record by database ID
router.get("/:id", softwareController.getSoftwareById);

// Route:  PUT /api/software/:id
// Action: Update existing software details
router.put("/:id", softwareController.updateSoftware);

// Route:  DELETE /api/software/:id
// Action: Wipe the software record completely
router.delete("/:id", softwareController.deleteSoftware);

module.exports = router;
