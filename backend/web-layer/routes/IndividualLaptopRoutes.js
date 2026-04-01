const express = require("express");
const router = express.Router();

const individualLaptopController = require("../controllers/IndividualLaptopController");
const authMiddleware = require("../middlewares/AuthMiddleware");

/**
 * Individual Laptop Routes
 * (Mounted at /api/individual-laptops in app.js)
 */

// Protect all routes
router.use(authMiddleware);

// Route:  POST /api/individual-laptops
// Action: Register a specific Serial Number to a hardware model
router.post("/", individualLaptopController.addPhysicalLaptop);

// Route:  GET /api/individual-laptops
// Action: View the entire global pool of hardware (can append ?status=Available)
router.get("/", individualLaptopController.getAllPhysicalLaptops);

// Route:  GET /api/individual-laptops/:id
// Action: Fetch data on one specific hardware asset
router.get("/:id", individualLaptopController.getPhysicalLaptopById);

// Route:  PUT /api/individual-laptops/:id
// Action: Modify condition notes or mark a physical laptop as "Under Repair"
router.put("/:id", individualLaptopController.updatePhysicalLaptop);

// Route:  DELETE /api/individual-laptops/:id
// Action: Retire/decommission an old physical laptop that is no longer used
router.delete("/:id", individualLaptopController.removePhysicalLaptop);

module.exports = router;
