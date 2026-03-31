const express = require("express");
const router = express.Router();

// Import our Employee Controller and our Security Middleware
const employeeController = require("../controllers/EmployeeController");
const authMiddleware = require("../middlewares/AuthMiddleware");

/**
 * Employee Routes 
 * (Mounted securely at /api/employees in app.js)
 */

// 1. Lock down all routes. Anyone hitting /api/employees MUST send a valid JWT 
// token they got from logging in. Otherwise, the server will reject them.
router.use(authMiddleware);

// Route:  POST /api/employees
// Action: Save a newly hired employee to the system
router.post("/", employeeController.createEmployee);

// Route:  GET /api/employees
// Action: Send back the array of all employees
router.get("/", employeeController.getAllEmployees);

// Route:  GET /api/employees/:id
// Action: Fetch exactly one employee file based on their MongoDB ID
router.get("/:id", employeeController.getEmployeeById);

// Route:  PUT /api/employees/:id
// Action: Edit an existing employee's details (like promoting them or changing their location)
router.put("/:id", employeeController.updateEmployee);

// Route:  DELETE /api/employees/:id
// Action: Remove an employee completely
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;
