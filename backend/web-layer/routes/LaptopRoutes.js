const express = require("express");
const router = express.Router();

// Import our Controller and Middleware
const laptopController = require("../controllers/LaptopController");
const authMiddleware = require("../middlewares/AuthMiddleware");

/**
 * Laptop Routes (Mounted at /api/laptops in app.js)
 * We use `router.use(authMiddleware)` to apply the authentication check
 * to ALL the routes in this file automatically. 
 * This means you must send a valid JWT to view or edit the inventory!
 */
router.use(authMiddleware);

// Route:  POST /api/laptops
// Action: Create a new laptop
router.post("/", laptopController.createLaptop);

// Route:  GET /api/laptops
// Action: Automatically retrieve a list of all laptops
router.get("/", laptopController.getAllLaptops);

// Route:  GET /api/laptops/:id
// Action: Retrieve a single laptop using a dynamic ID in the URL (e.g. /api/laptops/65b3c...)
router.get("/:id", laptopController.getLaptopById);

// Route:  PUT /api/laptops/:id
// Action: Send an update payload to completely/partially overwrite a laptop
router.put("/:id", laptopController.updateLaptop);

// Route:  DELETE /api/laptops/:id
// Action: Delete the specific laptop
router.delete("/:id", laptopController.deleteLaptop);

module.exports = router;
