const express = require("express");
const router = express.Router();

const individualLaptopController = require("../controllers/IndividualLaptopController");
const authMiddleware = require("../middlewares/authMiddleware");
const restrictTo = authMiddleware.restrictTo;

/**
 * Individual Laptop Routes
 * (Mounted at /api/individual-laptops in app.js)
 */

// Protect all routes
router.use(authMiddleware);

// Route:  POST /api/individual-laptops
// Action: Register a specific Serial Number to a hardware model
router.post("/", restrictTo("admin"), individualLaptopController.addPhysicalLaptop);

// Route:  GET /api/individual-laptops
// Action: View the entire global pool of hardware (can append ?status=Available)
router.get("/", restrictTo("admin", "manager"), individualLaptopController.getAllPhysicalLaptops);

// Route:  GET /api/individual-laptops/:id
// Action: Fetch data on one specific hardware asset
router.get("/:id", restrictTo("admin", "manager"), individualLaptopController.getPhysicalLaptopById);

// Route:  PUT /api/individual-laptops/:id
// Action: Modify condition notes or mark a physical laptop as "Under Repair"
router.put("/:id", restrictTo("admin", "manager"), individualLaptopController.updatePhysicalLaptop);

// Route:  DELETE /api/individual-laptops/:id
// Action: Retire/decommission an old physical laptop that is no longer used
router.delete("/:id", restrictTo("admin"), individualLaptopController.removePhysicalLaptop);

module.exports = router;
