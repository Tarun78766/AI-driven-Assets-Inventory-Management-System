const express = require("express");
const router = express.Router();

const assignmentController = require("../controllers/AssignmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const restrictTo = authMiddleware.restrictTo;

/**
 * Assignment Routes 
 * (Mounted securely at /api/assignments in app.js)
 */

// Everyone accessing `/api/assignments` MUST provide a valid JWT auth token
router.use(authMiddleware);

// Route:  GET /api/assignments/my (Must come before /:id otherwise express resolves "my" as an ID)
router.get("/my", restrictTo("employee"), assignmentController.getMyAssignments);

// Route:  POST /api/assignments
// Action: Hand out a laptop or software license to an employee
router.post("/", restrictTo("admin", "manager"), assignmentController.createAssignment);

// Route:  GET /api/assignments
// Action: View the entire log of who has what equipment
router.get("/", restrictTo("admin", "manager"), assignmentController.getAllAssignments);

// Route:  GET /api/assignments/:id
// Action: Look up a specific receipt 
router.get("/:id", restrictTo("admin", "manager"), assignmentController.getAssignmentById);

// Route:  PUT /api/assignments/return/:id
// Action: Employee returns the equipment (restores stock back into inventory!)
// Notice we used `/return/:id` to make the URL action very specific instead of a generic `/update`
router.put("/return/:id", restrictTo("admin", "manager"), assignmentController.returnAssignment);

module.exports = router;
